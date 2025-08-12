# server/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify(message="Welcome to the wedding website backend!")

@app.route('/api/rsvp', methods=['POST'])
def rsvp():
    # Get the JSON data sent from the frontend
    data = request.json
    print("Received RSVP data:", data)

    # In a later step, we'll add code here to save the data to a database.

    # Send a response back to the frontend
    return jsonify(message="Thank you for your RSVP!"), 201

if __name__ == '__main__':
    app.run(debug=True)
