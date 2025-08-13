from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# Configure the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wedding.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

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

@app.route('/')
def home():
    return jsonify(message="Welcome to the wedding website backend!")

@app.route('/api/rsvp', methods=['POST'])
def rsvp():
    try:
        data = request.json
        main_guest_data = data.get('mainGuest', {})
        additional_guests_data = data.get('additionalGuests', [])

        # Create a new Rsvp object from the main guest data
        new_rsvp = Rsvp(
            name=main_guest_data.get('name'),
            attending=main_guest_data.get('attending'),
            plus_one=main_guest_data.get('plusOne'),
            dietary_restrictions=main_guest_data.get('dietaryRestrictions')
        )

        # Add additional guests if they exist
        for guest_info in additional_guests_data:
            new_guest = AdditionalGuest(
                guest_name=guest_info.get('guestName'),
                guest_dietary_restrictions=guest_info.get('guestDietaryRestrictions')
            )
            new_rsvp.additional_guests.append(new_guest)

        # Add the new RSVP and guests to the database session
        db.session.add(new_rsvp)
        db.session.commit()

        return jsonify(message="Thank you for your RSVP!"), 201

    except Exception as e:
        print("Database error:", e)
        db.session.rollback() # Rollback the session on error
        return jsonify(message="An error occurred while saving your RSVP."), 500

if __name__ == '__main__':
    app.run(debug=True)
