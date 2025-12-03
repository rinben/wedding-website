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
from datetime import timedelta, datetime
from sqlalchemy.exc import IntegrityError
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

    # Store URL of image
    image_url = db.Column(db.String(500), nullable=True)

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

def scrape_product_info(url):
    """
    Attempts to scrape the price and the main product image URL from a given external URL.

    Returns:
        A dictionary: {"price": float, "image_url": str}
    """
    import json # Ensure json is imported locally for schema processing
    try:
        headers = {
            # Using a standard User-Agent is a necessary security measure to avoid being blocked by anti-bot systems
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status() # Raises an HTTPError if the status is 4xx or 5xx

        soup = BeautifulSoup(response.content, 'html.parser')
        price = None
        image_url = None
        schema_script = soup.find('script', type='application/ld+json')

        # --- 1. Attempt to Scrape Price and Image from Schema Markup (Best Source) ---
        if schema_script:
            try:
                data = json.loads(schema_script.string)
                if isinstance(data, list):
                    # Sometimes the schema is wrapped in a list, we try the first element
                    data = data[0]

                # Price from Schema
                if 'offers' in data:
                    if 'price' in data['offers']:
                        price = float(data['offers']['price'])
                elif 'price' in data:
                    price = float(data['price'])

                # Image URL from Schema
                if 'image' in data:
                    # Schema image can be a string or a list of strings
                    if isinstance(data['image'], str):
                         image_url = data['image']
                    elif isinstance(data['image'], list) and data['image']:
                        image_url = data['image'][0]

            except (json.JSONDecodeError, ValueError, TypeError):
                # We fail silently here to try less reliable scraping methods
                pass

        # --- 2. Fallback: Scrape Price and Image from OpenGraph Meta Tags (Standard Source) ---

        # Price from OpenGraph (only if price hasn't been found)
        if price is None:
            og_price_tag = soup.find('meta', property='product:price:amount') or soup.find('meta', property='og:price:amount')
            if og_price_tag and og_price_tag.get('content'):
                try:
                    # Clean and convert the price string to a float
                    price = float(og_price_tag['content'].replace('$', '').replace(',', '').strip())
                except ValueError:
                    pass

        # Image URL from OpenGraph (only if image_url hasn't been found)
        if image_url is None:
            og_image_tag = soup.find('meta', property='og:image')
            if og_image_tag and og_image_tag.get('content'):
                image_url = og_image_tag['content']

        # We skip the brittle "common price classes" check (point 1.3) as it can easily return bad data.

        # Return both pieces of information, even if one or both are None
        return {"price": price, "image_url": image_url}

    except requests.exceptions.RequestException as e:
        # Catch network or timeout errors
        print(f"Error fetching URL {url}: {e}")
        return {"price": None, "image_url": None}
    except Exception as e:
        # Catch any other unexpected Python errors during processing
        print(f"Error during scraping process from {url}: {e}")
        return {"price": None, "image_url": None}


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

@app.route('/api/registry/claim/<int:item_id>', methods=['POST'])
@cross_origin()
def claim_registry_item(item_id):
    """
    Public endpoint to claim a single unit of a registry item.
    Increments the claimed quantity and logs the attempt.
    """
    try:
        item = db.session.get(RegistryItem, item_id)
        if not item:
            return jsonify(message="Registry item not found"), 404

        # 1. Check if item is already fulfilled
        if item.status == 'FULFILLED' or item.quantity_claimed >= item.quantity_needed:
            return jsonify(message="This item is already claimed or fulfilled."), 409

        # 2. Update item quantity and status
        item.quantity_claimed += 1

        # Check if the item is now fully claimed
        if item.quantity_claimed >= item.quantity_needed:
            item.status = 'FULFILLED'
        else:
            item.status = 'CLAIMED'

        item.last_claimed = datetime.utcnow()

        # 3. Log the claim attempt for audit/security (rate limiting)
        # Get IP address - robust method for Vercel/proxies
        ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)

        new_log = ClaimLog(
            item_id=item.id,
            ip_address=ip_address
        )
        db.session.add(new_log)
        db.session.commit()

        return jsonify(message=f"Successfully claimed 1 unit of {item.name}.",
                       status=item.status,
                       quantity_claimed=item.quantity_claimed), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error processing claim for item {item_id}: {e}")
        return jsonify(message="An unexpected error occurred while claiming the item."), 500

@app.route('/api/admin/price-lookup', methods=['POST'])
@jwt_required()
@cross_origin()
def admin_price_lookup():
    """Securely scrapes the price AND image URL from a given URL."""
    data = request.json
    url = data.get('url')
    if not url:
        return jsonify({"msg": "URL is required"}), 400

    # Use the combined scraping function
    info = scrape_product_info(url)

    if info['price'] is not None or info['image_url'] is not None:
        return jsonify({
            "price": info['price'],
            "image_url": info['image_url'], # <--- NEW FIELD
            "msg": f"Price found: ${info['price'] or 'N/A'}. Image URL scraped."
        }), 200
    else:
        return jsonify({"msg": "Could not determine price or image from the provided URL. Manual entry required."}), 404

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

@app.route('/api/admin/registry/<int:item_id>/status', methods=['PUT'])
@jwt_required()
@cross_origin()
def update_registry_item_status(item_id):
    """Allows admin to manually change item status (e.g., mark as FULFILLED or re-list)."""
    try:
        item = db.session.get(RegistryItem, item_id)
        if not item:
            return jsonify(message="Registry item not found"), 404

        data = request.json
        new_status = data.get('status')

        if new_status not in ['AVAILABLE', 'CLAIMED', 'FULFILLED']:
            return jsonify(message="Invalid status provided"), 400

        # CRITICAL FIX: If relisting, reset the quantity claimed
        if new_status == 'AVAILABLE':
            item.quantity_claimed = 0

        item.status = new_status
        db.session.commit()

        return jsonify(serialize_registry_item(item)), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating registry item status: {e}")
        return jsonify(message="An error occurred while updating the item status"), 500

@app.route('/api/admin/registry/<int:item_id>', methods=['DELETE'])
@jwt_required()
@cross_origin()
def delete_registry_item(item_id):
    """Allows admin to delete a registry item. Requires JWT authentication."""
    try:
        item = db.session.get(RegistryItem, item_id)
        if not item:
            return jsonify(message="Registry item not found"), 404

        # Optionally, delete related ClaimLog entries first to avoid foreign key issues
        ClaimLog.query.filter_by(item_id=item_id).delete()

        db.session.delete(item)
        db.session.commit()

        return jsonify(message="Registry item deleted successfully"), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error deleting registry item: {e}")
        return jsonify(message="An error occurred while deleting the item"), 500

@app.route('/api/admin/registry/<int:item_id>', methods=['PUT'])
@jwt_required()
@cross_origin()
def update_registry_item(item_id):
    """Allows admin to update all fields of a registry item."""
    try:
        item = db.session.get(RegistryItem, item_id)
        if not item:
            return jsonify(message="Registry item not found"), 404

        data = request.json

        item.name = data.get('name', item.name)
        item.link = data.get('link', item.link)
        item.image_url = data.get('image_url', item.image_url)
        item.price = data.get('price', item.price)
        item.quantity_needed = data.get('quantityNeeded', item.quantity_needed)
        item.quantity_claimed = data.get('quantityClaimed', item.quantity_claimed)
        item.status = data.get('status', item.status)

        db.session.commit()

        return jsonify(serialize_registry_item(item)), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating registry item {item_id}: {e}")
        return jsonify(message="An error occurred while updating the registry item"), 500

if __name__ == '__main__':
    app.run(debug=(not is_production))
