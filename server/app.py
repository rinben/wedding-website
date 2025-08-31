# server/app.py
import os
from werkzeug.wrappers import Request, Response
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token

import io
import csv

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://ben-and-sara.com"}})

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wedding.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['JWT_SECRET_KEY'] = 'your-super-secret-key' # Change this to a real, secure secret key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False # For simplicity, we won't expire tokens

db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

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

@app.route('/')
@cross_origin()
def home():
    return jsonify(message="Welcome to the wedding website backend!")

@app.route('/api/register', methods=['POST'])
@cross_origin()
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
@cross_origin()
def login():
    data = request.get_json()
    username = data.get('username', None)
    password = data.get('password', None)

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    else:
        return jsonify({"msg": "Invalid username or password"}), 401

@app.route('/api/guests', methods=['GET'])
@jwt_required()
@cross_origin()
def get_all_guests():
    guests = db.session.execute(db.select(Guest)).scalars().all()
    return jsonify([serialize_guest(g) for g in guests])

@app.route('/api/guests/<int:guest_id>', methods=['PUT', 'PATCH'])
@jwt_required()
@cross_origin()
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
@cross_origin()
def delete_guest(guest_id):
    guest = db.session.get(Guest, guest_id)
    if not guest:
        return jsonify(message="Guest not found"), 404

    db.session.delete(guest)
    db.session.commit()
    return jsonify(message="Guest deleted successfully"), 200

@app.route('/api/guests', methods=['POST'])
@jwt_required()
@cross_origin()
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

@app.route('/api/guests/mass-delete', methods=['DELETE'])
@jwt_required()
@cross_origin()
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

@app.route('/api/search-guest', methods=['GET'])
@cross_origin()
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
@cross_origin()
def get_party_members():
    party_id = request.args.get('party_id', '')
    if not party_id:
        return jsonify([])

    guests = db.session.execute(
        db.select(Guest).filter_by(party_id=party_id)
    ).scalars().all()

    return jsonify([serialize_guest(g) for g in guests])

@app.route('/api/party/update-id', methods=['PUT'])
@jwt_required()
@cross_origin()
def update_party_id():
    data = request.json
    old_party_id = data.get('old_party_id')
    new_party_id = data.get('new_party_id')

    if not old_party_id or not new_party_id:
        return jsonify(message="Missing old_party_id or new_party_id"), 400

    guests_to_update = db.session.execute(
        db.select(Guest).filter_by(party_id=old_party_id)
    ).scalars().all()

    for guest in guests_to_update:
        guest.party_id = new_party_id

    db.session.commit()
    return jsonify(message=f"Updated party ID for {len(guests_to_update)} guests"), 200

@app.route('/api/export-guests', methods=['GET'])
@jwt_required()
@cross_origin()
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

@app.route('/api/public-rsvp/<int:guest_id>', methods=['PUT'])
@cross_origin()
def public_rsvp_update(guest_id):
    guest = db.session.get(Guest, guest_id)
    if not guest:
        return jsonify(message="Guest not found"), 404

    data = request.json
    guest.attending = data.get('attending', guest.attending)
    guest.dietary_restrictions = data.get('dietary_restrictions', guest.dietary_restrictions)

    db.session.commit()
    return jsonify(message=f"Updated RSVP for {guest.first_name} {guest.last_name}"), 200

if __name__ == '__main__':
    app.run(debug=True)
