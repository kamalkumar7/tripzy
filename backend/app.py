from flask import Flask, jsonify, request
from helpers import Helper

app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello():    
    return jsonify({'message': 'Hello, World!'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)