# server/app.py
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required

import io
import csv

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wedding.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['JWT_SECRET_KEY'] = 'your-super-secret-key' # Change this to a real, secure secret key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False # For simplicity, we won't expire tokens

db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

class Rsvp(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    attending = db.Column(db.String(10), nullable=False)
    plus_one = db.Column(db.Integer, default=0)
    dietary_restrictions = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    additional_guests = db.relationship('AdditionalGuest', backref='rsvp', lazy=True)

class AdditionalGuest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    guest_name = db.Column(db.String(100), nullable=False)
    guest_dietary_restrictions = db.Column(db.Text)
    rsvp_id = db.Column(db.Integer, db.ForeignKey('rsvp.id'), nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

class Guest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    party_id = db.Column(db.String(100), nullable=False)
    attending = db.Column(db.Boolean, default=False)
    dietary_restrictions = db.Column(db.Text, default='')

def serialize_guest(guest):
    return {
        'id': guest.id,
        'first_name': guest.first_name,
        'last_name': guest.last_name,
        'party_id': guest.party_id,
        'attending': guest.attending,
        'dietary_restrictions': guest.dietary_restrictions,
    }

def serialize_rsvp(rsvp):
    return {
        'id': rsvp.id,
        'name': rsvp.name,
        'attending': rsvp.attending,
        'plusOne': rsvp.plus_one,
        'dietaryRestrictions': rsvp.dietary_restrictions,
        'createdAt': rsvp.created_at.isoformat() if rsvp.created_at else None,
        'additionalGuests': [serialize_guest(g) for g in rsvp.additional_guests],
    }

@app.route('/')
def home():
    return jsonify(message="Welcome to the wedding website backend!")

@app.route('/api/rsvp', methods=['POST'])
def rsvp():
    try:
        data = request.json
        main_guest_data = data.get('mainGuest', {})
        additional_guests_data = data.get('additionalGuests', [])

        new_rsvp = Rsvp(
            name=main_guest_data.get('name'),
            attending=main_guest_data.get('attending'),
            plus_one=main_guest_data.get('plusOne'),
            dietary_restrictions=main_guest_data.get('dietaryRestrictions')
        )

        for guest_info in additional_guests_data:
            new_guest = AdditionalGuest(
                guest_name=guest_info.get('guestName'),
                guest_dietary_restrictions=guest_info.get('guestDietaryRestrictions')
            )
            new_rsvp.additional_guests.append(new_guest)

        db.session.add(new_rsvp)
        db.session.commit()

        return jsonify(message="Thank you for your RSVP!"), 201

    except Exception as e:
        print("Database error:", e)
        db.session.rollback()
        return jsonify(message="An error occurred while saving your RSVP."), 500

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', None)
    password = data.get('password', None)

    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', None)
    password = data.get('password', None)

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        from flask_jwt_extended import create_access_token
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    else:
        return jsonify({"msg": "Invalid username or password"}), 401

@app.route('/api/rsvps', methods=['GET'])
@jwt_required()
def get_rsvps():
    rsvps = db.session.execute(db.select(Rsvp)).scalars()
    return jsonify([serialize_rsvp(rsvp) for rsvp in rsvps])

@app.route('/api/search-guest', methods=['GET'])
def search_guest():
    query = request.args.get('name', '').strip()
    if not query:
        return jsonify([])

    search_terms = query.split()

    if len(search_terms) == 2:
        first_name = search_terms[0]
        last_name = search_terms[1]
        guests = db.session.execute(
            db.select(Guest).filter(
                db.and_(
                    Guest.first_name.ilike(f'%{first_name}%'),
                    Guest.last_name.ilike(f'%{last_name}%')
                )
            )
        ).scalars().all()
    else:
        guests = db.session.execute(
            db.select(Guest).filter(
                db.or_(
                    Guest.first_name.ilike(f'%{query}%'),
                    Guest.last_name.ilike(f'%{query}%')
                )
            )
        ).scalars().all()

    return jsonify([serialize_guest(g) for g in guests])

@app.route('/api/party-members', methods=['GET'])
def get_party_members():
    party_id = request.args.get('party_id', '')
    if not party_id:
        return jsonify([])

    guests = db.session.execute(
        db.select(Guest).filter_by(party_id=party_id)
    ).scalars().all()

    return jsonify([serialize_guest(g) for g in guests])

@app.route('/api/guests', methods=['GET'])
@jwt_required()
def get_all_guests():
    guests = db.session.execute(db.select(Guest)).scalars().all()
    return jsonify([serialize_guest(g) for g in guests])

@app.route('/api/guests/<int:guest_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_guest(guest_id):
    guest = db.session.get(Guest, guest_id)
    if not guest:
        return jsonify(message="Guest not found"), 404

    data = request.json
    guest.first_name = data.get('first_name', guest.first_name)
    guest.last_name = data.get('last_name', guest.last_name)
    guest.party_id = data.get('party_id', guest.party_id)
    guest.attending = data.get('attending', guest.attending)
    guest.dietary_restrictions = data.get('dietary_restrictions', guest.dietary_restrictions)

    db.session.commit()
    return jsonify(serialize_guest(guest))

@app.route('/api/guests/<int:guest_id>', methods=['DELETE'])
@jwt_required()
def delete_guest(guest_id):
    guest = db.session.get(Guest, guest_id)
    if not guest:
        return jsonify(message="Guest not found"), 404

    db.session.delete(guest)
    db.session.commit()
    return jsonify(message="Guest deleted successfully"), 200

@app.route('/api/guests', methods=['POST'])
@jwt_required()
def add_guest():
    data = request.json
    new_guest = Guest(
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        party_id=data.get('party_id'),
        attending=data.get('attending', False),
        dietary_restrictions=data.get('dietary_restrictions', '')
    )
    db.session.add(new_guest)
    db.session.commit()
    return jsonify(serialize_guest(new_guest)), 201

@app.route('/api/export-guests', methods=['GET'])
@jwt_required()
def export_guests():
    guests = db.session.execute(db.select(Guest)).scalars().all()
    if not guests:
        return jsonify(message="No guests to export"), 404

    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow(['ID', 'First Name', 'Last Name', 'Party ID', 'Attending', 'Dietary Restrictions'])

    # Write data
    for guest in guests:
        writer.writerow([
            guest.id,
            guest.first_name,
            guest.last_name,
            guest.party_id,
            'Yes' if guest.attending else 'No',
            guest.dietary_restrictions
        ])

    csv_file = io.BytesIO(output.getvalue().encode())
    csv_file.seek(0)

    return send_file(
        csv_file,
        mimetype='text/csv',
        as_attachment=True,
        download_name='guest_list.csv'
    )

@app.route('/api/guests/mass-delete', methods=['DELETE'])
@jwt_required()
def mass_delete_guests():
    guest_ids = request.json.get('ids', [])
    if not guest_ids:
        return jsonify(message="No guest IDs provided"), 400

    guests_to_delete = db.session.execute(
        db.select(Guest).filter(Guest.id.in_(guest_ids))
    ).scalars().all()

    for guest in guests_to_delete:
        db.session.delete(guest)

    db.session.commit()
    return jsonify(message=f"Deleted {len(guests_to_delete)} guests successfully"), 200

if __name__ == '__main__':
    app.run(debug=True)
