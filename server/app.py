# server/app.py
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This enables Cross-Origin Resource Sharing

@app.route('/')
def home():
    return jsonify(message="Welcome to the wedding website backend!")

if __name__ == '__main__':
    app.run(debug=True)
