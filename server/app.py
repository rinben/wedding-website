import os
import requests
from bs4 import BeautifulSoup
from werkzeug.wrappers import Request, Response
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from datetime import timedelta
from werkzeug.datastructures import FileStorage

import io
import csv
import chardet # Used for character encoding detection in CSV import

# --- APP CONFIGURATION ---
# Initialize the Flask app. `instance_relative_config=True` makes paths relative to the instance folder.
app = Flask(__name__, instance_relative_config=True)

# Create the instance folder if it doesn't exist, which is needed for SQLite.
try:
    os.makedirs(app.instance_path)
except OSError:
    pass

# Determine the environment (production or development) from an environment variable.
app.config['FLASK_ENV'] = os.environ.get('FLASK_ENV', 'development')
is_production = app.config['FLASK_ENV'] == 'production'

# --- DATABASE CONFIGURATION ---
# Set the base directory for local paths
basedir = os.path.abspath(os.path.dirname(__file__))
# Construct the full path to the local SQLite database file
db_path = os.path.join(basedir, 'instance', 'wedding.db')
# Get the database URI from the environment variable, or fall back to the local SQLite path.
database_uri = os.environ.get('DATABASE_URL', f'sqlite:///{db_path}')

app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- JWT Configuration
# Get the JWT secret key from the environment, with a safe fallback for local dev.
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'a-safe-development-key')
# Set token expiration: 60 minutes in production, no expiration in development.
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=60) if is_production else False

# --- EXTENSION INITIALIZATION ---
CORS(app, resources={r"/api/*": {"origins": "*"}})
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# --- DATABASE MODELS ---
# Defines the User table for admin login
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

# Defines the Guest table for RSVP data
class Guest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    party_id = db.Column(db.String(100), nullable=False)
    attending = db.Column(db.Boolean, default=False)
    dietary_restrictions = db.Column(db.Text, default='')

# New Model for Registry Items
class RegistryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    link = db.Column(db.String(300), nullable=False) # Link to external retailer
    price = db.Column(db.Float, nullable=False)
    quantity_needed = db.Column(db.Integer, default=1)
    quantity_claimed = db.Column(db.Integer, default=0)

    # Status can be 'AVAILABLE', 'CLAIMED', 'FULFILLED'
    status = db.Column(db.String(20), default='AVAILABLE')

    # Audit trail for when the item was last claimed
    last_claimed = db.Column(db.DateTime)

# New Model for Security/Audit Log of Claims
class ClaimLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('registry_item.id'), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    # Storing IP is for potential rate limiting/spam detection
    ip_address = db.Column(db.String(45))

# ----HELPER FUNCTIONS-----

# Helper function to convert a Guest object to a dictionary
def serialize_guest(guest):
    return {
        'id': guest.id,
        'first_name': guest.first_name,
        'last_name': guest.last_name,
        'party_id': guest.party_id,
        'attending': guest.attending,
        'dietary_restrictions': guest.dietary_restrictions,
    }

# New Helper function to serialize RegistryItem objects
def serialize_registry_item(item):
    return {
        'id': item.id,
        'name': item.name,
        'link': item.link,
        'price': item.price,
        'quantityNeeded': item.quantity_needed,
        'quantityClaimed': item.quantity_claimed,
        'status': item.status,
        'lastClaimed': item.last_claimed.isoformat() if item.last_claimed else None,
        # We don't need to serialize the full ClaimLog here, just the item data.
    }

def scrape_price_from_url(url):
    """Attempts to scrape a price from a given URL."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # **CRITICAL:** Web scraping requires site-specific selectors.
        # We will use general selectors common on e-commerce sites (OpenGraph, Schema Markup, etc.).

        # 1. Look for Schema Markup (JSON-LD)
        schema_script = soup.find('script', type='application/ld+json')
        if schema_script:
            import json
            try:
                data = json.loads(schema_script.string)
                if isinstance(data, list):
                    data = data[0] # Try the first element if it's a list

                # Look for properties like 'offers' or 'price'
                if 'offers' in data and 'price' in data['offers']:
                    return float(data['offers']['price'])
                if 'price' in data:
                    return float(data['price'])
            except json.JSONDecodeError:
                pass # Ignore if JSON is invalid

        # 2. Look for OpenGraph Meta Tags (for general product info)
        og_price_tag = soup.find('meta', property='product:price:amount') or soup.find('meta', property='og:price:amount')
        if og_price_tag and og_price_tag.get('content'):
            return float(og_price_tag['content'].replace('$', '').replace(',', ''))

        # 3. Look for common price classes (Last resort, highly site-dependent)
        price_elements = soup.find_all(lambda tag: tag.name in ['span', 'div'] and ('price' in tag.get('class', []) or 'sale' in tag.get('class', [])))
        for elem in price_elements:
            text = elem.get_text(strip=True)
            if '$' in text:
                # Clean and return the first reasonable price found
                return float(text.replace('$', '').replace(',', '').strip())

        return None # Price not found

    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None
    except Exception as e:
        print(f"Error scraping price from {url}: {e}")
        return None


# --- API ROUTES ---
@app.route('/')
@cross_origin()
def home():
    """Root route for the API, returns a welcome message."""
    return jsonify(message="Welcome to the wedding website backend!")

@app.route('/api/register', methods=['POST'])
@cross_origin()
def register():
    """Registers a new admin user. Only used for initial setup."""
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
    """Authenticates a user and returns a JWT access token."""
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
    """Fetches all guest data. Requires JWT authentication."""
    try:
        guests = db.session.execute(db.select(Guest)).scalars().all()
        return jsonify([serialize_guest(g) for g in guests])
    except Exception as e:
        print(f"An error occurred while fetching guests: {e}")
        return jsonify({"msg": "An internal server error occurred"}), 500

@app.route('/api/guests/<int:guest_id>', methods=['PUT', 'PATCH'])
@jwt_required()
@cross_origin()
def update_guest(guest_id):
    """Updates a single guest's information. Requires JWT authentication."""
    try:
        guest = db.session.get(Guest, guest_id)
        if not guest:
            return jsonify(message="Guest not found"), 404

        data = request.json
        guest.first_name = data.get('first_name', guest.first_name)
        guest.last_name = data.get('last_name', guest.last_name)
        guest.party_id = data.get('party_id', guest.party_id)

        attending_data = data.get('attending')
        if attending_data is not None:
            if isinstance(attending_data, str):
                guest.attending = attending_data.lower() == 'true'
            else:
                guest.attending = bool(attending_data)

        guest.dietary_restrictions = data.get('dietary_restrictions', guest.dietary_restrictions)

        db.session.commit()
        return jsonify(serialize_guest(guest))
    except Exception as e:
        db.session.rollback()
        print(f"Error updating guest {guest_id}: {e}")
        return jsonify(message="An error occurred while updating the guest"), 500

@app.route('/api/guests/<int:guest_id>', methods=['DELETE'])
@jwt_required()
@cross_origin()
def delete_guest(guest_id):
    """Deletes a guest by ID. Requires JWT authentication."""
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
    """Adds a new guest to the database. Requires JWT authentication."""
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
    """Deletes multiple guests by a list of IDs. Requires JWT authentication."""
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
    """Searches for guests by name for the public RSVP form."""
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
    """Fetches all members of a party for the public RSVP form."""
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
    """Updates the party ID for a group of guests. Requires JWT authentication."""
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
    """Exports the entire guest list to a CSV file. Requires JWT authentication."""
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
    """Publicly updates a guest's RSVP status. No authentication required."""
    guest = db.session.get(Guest, guest_id)
    if not guest:
        return jsonify(message="Guest not found"), 404

    data = request.json
    attending_data = data.get('attending')
    if attending_data is not None:
        if isinstance(attending_data, str):
            guest.attending = attending_data.lower() == 'true'
        else:
            guest.attending = bool(attending_data)

    guest.dietary_restrictions = data.get('dietary_restrictions', guest.dietary_restrictions)

    db.session.commit()
    return jsonify(message=f"Updated RSVP for {guest.first_name} {guest.last_name}"), 200

@app.route('/api/import-guests', methods=['POST'])
@jwt_required()
@cross_origin()
def import_guests():
    """Imports guests from a CSV file. Requires JWT authentication."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # We need to detect the encoding to handle different CSV files
    raw_data = file.read()
    file_encoding = chardet.detect(raw_data)['encoding']
    if file_encoding is None:
        file_encoding = 'utf-8' # Default to utf-8 if detection fails

    stream = io.StringIO(raw_data.decode(file_encoding))
    reader = csv.reader(stream)

    # Skip header row
    next(reader, None)

    imported_count = 0
    try:
        for row in reader:
            if len(row) >= 4:
                first_name = row[1]
                last_name = row[2]
                party_id = row[3]
                attending = row[4].lower() == 'yes' if len(row) > 4 and row[4] else False
                dietary_restrictions = row[5] if len(row) > 5 and row[5] else ''

                new_guest = Guest(
                    first_name=first_name,
                    last_name=last_name,
                    party_id=party_id,
                    attending=attending,
                    dietary_restrictions=dietary_restrictions
                )
                db.session.add(new_guest)
                imported_count += 1
        db.session.commit()
        return jsonify(message=f"Successfully imported {imported_count} guests"), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error during guest import: {e}")
        return jsonify({"error": f"An error occurred during import: {e}"}), 500


@app.route('/api/registry', methods=['GET'])
def get_registry_items():
    # Only select items that are not fully claimed
    # We can filter later, but for now, let's get all of them
    items = db.session.execute(db.select(RegistryItem)).scalars()
    return jsonify([serialize_registry_item(item) for item in items])

@app.route('/api/admin/price-lookup', methods=['POST'])
@jwt_required()
@cross_origin()
def admin_price_lookup():
    """Securely scrapes the price from a given URL."""
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"msg": "URL is required"}), 400

    price = scrape_price_from_url(url)

    if price is not None:
        return jsonify({"price": price, "msg": f"Price found: ${price}"}), 200
    else:
        return jsonify({"msg": "Could not determine price from the provided URL. Manual entry required."}), 404

@app.route('/api/admin/registry', methods=['POST'])
@jwt_required()
@cross_origin()
def add_registry_item():
    """Securely adds a new registry item to the database."""
    try:
        data = request.json

        # Validate required fields
        if not all(key in data for key in ['name', 'link', 'price', 'quantityNeeded']):
            return jsonify({"msg": "Missing required fields (name, link, price, quantityNeeded)"}), 400

        # Create a new RegistryItem object
        new_item = RegistryItem(
            name=data['name'],
            link=data['link'],
            price=data['price'],
            quantity_needed=data['quantityNeeded'],
            # quantity_claimed defaults to 0 and status defaults to 'AVAILABLE'
        )

        db.session.add(new_item)
        db.session.commit()

        return jsonify(serialize_registry_item(new_item)), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error adding registry item: {e}")
        return jsonify(message="An internal server error occurred while adding the item"), 500

if __name__ == '__main__':
    app.run(debug=(not is_production))
