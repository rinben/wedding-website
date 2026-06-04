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
from sqlalchemy import text  # <--- New import for DB migration

import io
import csv
import chardet

# --- APP CONFIGURATION ---
app = Flask(__name__, instance_relative_config=True)

try:
    os.makedirs(app.instance_path)
except OSError:
    pass

app.config["FLASK_ENV"] = os.environ.get("FLASK_ENV", "development")
is_production = app.config["FLASK_ENV"] == "production"

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, "instance", "wedding.db")
database_uri = os.environ.get("DATABASE_URL", f"sqlite:///{db_path}")

app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["JWT_SECRET_KEY"] = os.environ.get(
    "JWT_SECRET_KEY", "a-safe-development-key"
)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = (
    timedelta(minutes=60) if is_production else False
)

CORS(app, resources={r"/api/*": {"origins": "*"}})
db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)


# --- MODELS ---
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
    welcome_party = db.Column(db.Boolean, default=False)  # <--- New Column
    dietary_restrictions = db.Column(db.Text, default="")


class RegistryItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    link = db.Column(db.String(300), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity_needed = db.Column(db.Integer, default=1)
    quantity_claimed = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default="AVAILABLE")
    last_claimed = db.Column(db.DateTime)
    image_url = db.Column(db.String(500), nullable=True)


class ClaimLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("registry_item.id"), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    ip_address = db.Column(db.String(45))


# --- HELPERS ---
def serialize_guest(guest):
    return {
        "id": guest.id,
        "first_name": guest.first_name,
        "last_name": guest.last_name,
        "party_id": guest.party_id,
        "attending": guest.attending,
        "welcome_party": getattr(guest, "welcome_party", False),
        "dietary_restrictions": guest.dietary_restrictions,
    }


def serialize_registry_item(item):
    return {
        "id": item.id,
        "name": item.name,
        "link": item.link,
        "price": item.price,
        "quantityNeeded": item.quantity_needed,
        "quantityClaimed": item.quantity_claimed,
        "status": item.status,
        "lastClaimed": item.last_claimed.isoformat() if item.last_claimed else None,
        "image_url": item.image_url,
    }


def scrape_product_info(url):
    import json
    import re

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")
        price = None
        image_url = None

        def clean_and_secure_url(raw_url):
            if raw_url:
                return raw_url.replace("http://", "https://")
            return None

        schema_script = soup.find("script", type="application/ld+json")
        if schema_script:
            try:
                data = json.loads(schema_script.string)
                if isinstance(data, list) and data:
                    data = data[0]
                if "offers" in data and "price" in data["offers"]:
                    price = float(data["offers"]["price"])
                elif "price" in data:
                    price = float(data["price"])
                if "image" in data:
                    raw_img = None
                    if isinstance(data["image"], str):
                        raw_img = data["image"]
                    elif isinstance(data["image"], list) and data["image"]:
                        raw_img = data["image"][0]
                    if raw_img:
                        image_url = clean_and_secure_url(raw_img)
            except:
                pass

        if price is None:
            og_price_tag = soup.find(
                "meta", property="product:price:amount"
            ) or soup.find("meta", property="og:price:amount")
            if og_price_tag and og_price_tag.get("content"):
                try:
                    price = float(
                        og_price_tag["content"]
                        .replace("$", "")
                        .replace(",", "")
                        .strip()
                    )
                except ValueError:
                    pass
        if image_url is None:
            og_image_tag = soup.find("meta", property="og:image")
            if og_image_tag and og_image_tag.get("content"):
                image_url = clean_and_secure_url(og_image_tag["content"])
        if price is None:
            price_match = re.search(r"\$(\d+[\.,]\d{2})", response.text)
            if price_match:
                try:
                    price = float(price_match.group(1).replace(",", "").strip())
                except ValueError:
                    pass
        return {"price": price, "image_url": image_url}
    except:
        return {"price": None, "image_url": None}


# --- ROUTES ---
@app.route("/")
@cross_origin()
def home():
    return jsonify(message="Welcome to the wedding website backend!")


@app.route("/api/register", methods=["POST"])
@cross_origin()
def register():
    data = request.get_json()
    username = data.get("username", None)
    password = data.get("password", None)
    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 409
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201


@app.route("/api/login", methods=["POST"])
@cross_origin()
def login():
    data = request.get_json()
    username = data.get("username", None)
    password = data.get("password", None)
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    else:
        return jsonify({"msg": "Invalid username or password"}), 401


@app.route("/api/guests", methods=["GET"])
@jwt_required()
@cross_origin()
def get_all_guests():
    try:
        guests = db.session.execute(db.select(Guest)).scalars().all()
        return jsonify([serialize_guest(g) for g in guests])
    except Exception as e:
        return jsonify({"msg": "An internal server error occurred"}), 500


@app.route("/api/guests/<int:guest_id>", methods=["PUT", "PATCH"])
@jwt_required()
@cross_origin()
def update_guest(guest_id):
    try:
        guest = db.session.get(Guest, guest_id)
        if not guest:
            return jsonify(message="Guest not found"), 404
        data = request.json
        guest.first_name = data.get("first_name", guest.first_name)
        guest.last_name = data.get("last_name", guest.last_name)
        guest.party_id = data.get("party_id", guest.party_id)

        attending_data = data.get("attending")
        if attending_data is not None:
            if isinstance(attending_data, str):
                guest.attending = attending_data.lower() == "true"
            else:
                guest.attending = bool(attending_data)

        welcome_data = data.get("welcome_party")
        if welcome_data is not None:
            if isinstance(welcome_data, str):
                guest.welcome_party = welcome_data.lower() == "true"
            else:
                guest.welcome_party = bool(welcome_data)

        guest.dietary_restrictions = data.get(
            "dietary_restrictions", guest.dietary_restrictions
        )
        db.session.commit()
        return jsonify(serialize_guest(guest))
    except Exception as e:
        db.session.rollback()
        return jsonify(message="An error occurred while updating the guest"), 500


@app.route("/api/guests/<int:guest_id>", methods=["DELETE"])
@jwt_required()
@cross_origin()
def delete_guest(guest_id):
    guest = db.session.get(Guest, guest_id)
    if not guest:
        return jsonify(message="Guest not found"), 404
    db.session.delete(guest)
    db.session.commit()
    return jsonify(message="Guest deleted successfully"), 200


@app.route("/api/guests", methods=["POST"])
@jwt_required()
@cross_origin()
def add_guest():
    data = request.json
    new_guest = Guest(
        first_name=data.get("first_name"),
        last_name=data.get("last_name"),
        party_id=data.get("party_id"),
        attending=data.get("attending", False),
        welcome_party=data.get("welcome_party", False),
        dietary_restrictions=data.get("dietary_restrictions", ""),
    )
    db.session.add(new_guest)
    db.session.commit()
    return jsonify(serialize_guest(new_guest)), 201


@app.route("/api/guests/mass-delete", methods=["DELETE"])
@jwt_required()
@cross_origin()
def mass_delete_guests():
    guest_ids = request.json.get("ids", [])
    if not guest_ids:
        return jsonify(message="No guest IDs provided"), 400
    guests_to_delete = (
        db.session.execute(db.select(Guest).filter(Guest.id.in_(guest_ids)))
        .scalars()
        .all()
    )
    for guest in guests_to_delete:
        db.session.delete(guest)
    db.session.commit()
    return jsonify(message=f"Deleted {len(guests_to_delete)} guests successfully"), 200


@app.route("/api/search-guest", methods=["GET"])
@cross_origin()
def search_guest():
    query = request.args.get("name", "").strip()
    if not query:
        return jsonify([])
    search_terms = query.split()
    if len(search_terms) == 2:
        first_name = search_terms[0]
        last_name = search_terms[1]
        guests = (
            db.session.execute(
                db.select(Guest).filter(
                    db.and_(
                        Guest.first_name.ilike(f"%{first_name}%"),
                        Guest.last_name.ilike(f"%{last_name}%"),
                    )
                )
            )
            .scalars()
            .all()
        )
    else:
        guests = (
            db.session.execute(
                db.select(Guest).filter(
                    db.or_(
                        Guest.first_name.ilike(f"%{query}%"),
                        Guest.last_name.ilike(f"%{query}%"),
                    )
                )
            )
            .scalars()
            .all()
        )
    return jsonify([serialize_guest(g) for g in guests])


@app.route("/api/party-members", methods=["GET"])
@cross_origin()
def get_party_members():
    party_id = request.args.get("party_id", "")
    if not party_id:
        return jsonify([])
    guests = (
        db.session.execute(db.select(Guest).filter_by(party_id=party_id))
        .scalars()
        .all()
    )
    return jsonify([serialize_guest(g) for g in guests])


@app.route("/api/party/update-id", methods=["PUT"])
@jwt_required()
@cross_origin()
def update_party_id():
    data = request.json
    old_party_id = data.get("old_party_id")
    new_party_id = data.get("new_party_id")
    if not old_party_id or not new_party_id:
        return jsonify(message="Missing old_party_id or new_party_id"), 400
    guests_to_update = (
        db.session.execute(db.select(Guest).filter_by(party_id=old_party_id))
        .scalars()
        .all()
    )
    for guest in guests_to_update:
        guest.party_id = new_party_id
    db.session.commit()
    return jsonify(message=f"Updated party ID for {len(guests_to_update)} guests"), 200


@app.route("/api/export-guests", methods=["GET"])
@jwt_required()
@cross_origin()
def export_guests():
    guests = db.session.execute(db.select(Guest)).scalars().all()
    if not guests:
        return jsonify(message="No guests to export"), 404
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "ID",
            "First Name",
            "Last Name",
            "Party ID",
            "Attending",
            "Welcome Party",
            "Dietary Restrictions",
        ]
    )
    for guest in guests:
        writer.writerow(
            [
                guest.id,
                guest.first_name,
                guest.last_name,
                guest.party_id,
                "Yes" if guest.attending else "No",
                "Yes" if getattr(guest, "welcome_party", False) else "No",
                guest.dietary_restrictions,
            ]
        )
    csv_file = io.BytesIO(output.getvalue().encode())
    csv_file.seek(0)
    return send_file(
        csv_file,
        mimetype="text/csv",
        as_attachment=True,
        download_name="guest_list.csv",
    )


@app.route("/api/public-rsvp/<int:guest_id>", methods=["PUT"])
@cross_origin()
def public_rsvp_update(guest_id):
    guest = db.session.get(Guest, guest_id)
    if not guest:
        return jsonify(message="Guest not found"), 404
    data = request.json

    attending_data = data.get("attending")
    if attending_data is not None:
        if isinstance(attending_data, str):
            guest.attending = attending_data.lower() == "true"
        else:
            guest.attending = bool(attending_data)

    welcome_data = data.get("welcome_party")
    if welcome_data is not None:
        if isinstance(welcome_data, str):
            guest.welcome_party = welcome_data.lower() == "true"
        else:
            guest.welcome_party = bool(welcome_data)

    guest.dietary_restrictions = data.get(
        "dietary_restrictions", guest.dietary_restrictions
    )
    db.session.commit()
    return jsonify(
        message=f"Updated RSVP for {guest.first_name} {guest.last_name}"
    ), 200


@app.route("/api/import-guests", methods=["POST"])
@jwt_required()
@cross_origin()
def import_guests():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    raw_data = file.read()
    file_encoding = chardet.detect(raw_data)["encoding"]
    if file_encoding is None:
        file_encoding = "utf-8"
    stream = io.StringIO(raw_data.decode(file_encoding))
    reader = csv.reader(stream)
    next(reader, None)
    imported_count = 0
    try:
        for row in reader:
            if len(row) >= 4:
                first_name = row[1]
                last_name = row[2]
                party_id = row[3]
                attending = (
                    row[4].lower() == "yes" if len(row) > 4 and row[4] else False
                )
                welcome_party = (
                    row[5].lower() == "yes" if len(row) > 5 and row[5] else False
                )
                dietary_restrictions = row[6] if len(row) > 6 and row[6] else ""
                new_guest = Guest(
                    first_name=first_name,
                    last_name=last_name,
                    party_id=party_id,
                    attending=attending,
                    welcome_party=welcome_party,
                    dietary_restrictions=dietary_restrictions,
                )
                db.session.add(new_guest)
                imported_count += 1
        db.session.commit()
        return jsonify(message=f"Successfully imported {imported_count} guests"), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An error occurred during import: {e}"}), 500


@app.route("/api/registry", methods=["GET"])
def get_registry_items():
    items = db.session.execute(db.select(RegistryItem)).scalars()
    return jsonify([serialize_registry_item(item) for item in items])


@app.route("/api/registry/claim/<int:item_id>", methods=["POST"])
@cross_origin()
def claim_registry_item(item_id):
    try:
        item = db.session.get(RegistryItem, item_id)
        if not item:
            return jsonify(message="Registry item not found"), 404
        if item.status == "FULFILLED" or item.quantity_claimed >= item.quantity_needed:
            return jsonify(message="This item is already claimed or fulfilled."), 409
        item.quantity_claimed += 1
        if item.quantity_claimed >= item.quantity_needed:
            item.status = "FULFILLED"
        else:
            item.status = "CLAIMED"
        item.last_claimed = datetime.utcnow()
        ip_address = request.headers.get("X-Forwarded-For", request.remote_addr)
        new_log = ClaimLog(item_id=item.id, ip_address=ip_address)
        db.session.add(new_log)
        db.session.commit()
        return jsonify(
            message=f"Successfully claimed 1 unit of {item.name}.",
            status=item.status,
            quantity_claimed=item.quantity_claimed,
        ), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(
            message="An unexpected error occurred while claiming the item."
        ), 500


@app.route("/api/admin/price-lookup", methods=["POST"])
@jwt_required()
@cross_origin()
def admin_price_lookup():
    data = request.json
    url = data.get("url")
    if not url:
        return jsonify({"msg": "URL is required"}), 400
    info = scrape_product_info(url)
    if info["price"] is not None or info["image_url"] is not None:
        return jsonify(
            {
                "price": info["price"],
                "image_url": info["image_url"],
                "msg": f"Price found: ${info['price'] or 'N/A'}. Image URL scraped.",
            }
        ), 200
    else:
        return jsonify(
            {
                "msg": "Could not determine price or image from the provided URL. Manual entry required."
            }
        ), 404


@app.route("/api/admin/registry", methods=["POST"])
@jwt_required()
@cross_origin()
def add_registry_item():
    try:
        data = request.json
        if not all(key in data for key in ["name", "link", "price", "quantityNeeded"]):
            return jsonify(
                {"msg": "Missing required fields (name, link, price, quantityNeeded)"}
            ), 400
        new_item = RegistryItem(
            name=data["name"],
            link=data["link"],
            price=data["price"],
            quantity_needed=data["quantityNeeded"],
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify(serialize_registry_item(new_item)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify(
            message="An internal server error occurred while adding the item"
        ), 500


@app.route("/api/admin/registry/<int:item_id>/status", methods=["PUT"])
@jwt_required()
@cross_origin()
def update_registry_item_status(item_id):
    try:
        item = db.session.get(RegistryItem, item_id)
        if not item:
            return jsonify(message="Registry item not found"), 404
        data = request.json
        new_status = data.get("status")
        if new_status not in ["AVAILABLE", "CLAIMED", "FULFILLED"]:
            return jsonify(message="Invalid status provided"), 400
        if new_status == "AVAILABLE":
            item.quantity_claimed = 0
        item.status = new_status
        db.session.commit()
        return jsonify(serialize_registry_item(item)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(message="An error occurred while updating the item status"), 500


@app.route("/api/admin/registry/<int:item_id>", methods=["DELETE"])
@jwt_required()
@cross_origin()
def delete_registry_item(item_id):
    try:
        item = db.session.get(RegistryItem, item_id)
        if not item:
            return jsonify(message="Registry item not found"), 404
        ClaimLog.query.filter_by(item_id=item_id).delete()
        db.session.delete(item)
        db.session.commit()
        return jsonify(message="Registry item deleted successfully"), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(message="An error occurred while deleting the item"), 500


@app.route("/api/admin/registry/<int:item_id>", methods=["PUT"])
@jwt_required()
@cross_origin()
def update_registry_item(item_id):
    try:
        item = db.session.get(RegistryItem, item_id)
        if not item:
            return jsonify(message="Registry item not found"), 404
        data = request.json
        item.name = data.get("name", item.name)
        item.link = data.get("link", item.link)
        item.image_url = data.get("image_url", item.image_url)
        item.price = data.get("price", item.price)
        item.quantity_needed = data.get("quantityNeeded", item.quantity_needed)
        item.quantity_claimed = data.get("quantityClaimed", item.quantity_claimed)
        item.status = data.get("status", item.status)
        db.session.commit()
        return jsonify(serialize_registry_item(item)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(
            message="An error occurred while updating the registry item"
        ), 500


if __name__ == "__main__":
    app.run(debug=(not is_production))
