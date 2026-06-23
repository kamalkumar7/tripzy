from flask import Flask, jsonify, request
from flask_cors import CORS
from workflow import TravelPlanWorkflow
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Initialize workflow
workflow = TravelPlanWorkflow()

@app.route('/', methods=['GET'])
def hello():    
    return jsonify({'message': 'Tripzy API - AI-powered Travel Planning', 'status': 'running'})

@app.route('/api/plan', methods=['POST'])
def plan_trip():
    """
    Main endpoint to create a complete travel plan
    
    Request body:
    {
        "user_input": "I want to go to Paris for 5 days with a budget of 3000"
    }
    
    Returns:
    {
        "travel_details": {...},
        "places": [...],
        "restaurants": [...],
        "hotels": [...],
        "itinerary": [...],
        "budget_breakdown": {...}
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'user_input' not in data:
            return jsonify({'error': 'Missing user_input in request body'}), 400
        
        user_input = data['user_input']
        
        if not user_input or len(user_input.strip()) == 0:
            return jsonify({'error': 'user_input cannot be empty'}), 400
        
        # Run the workflow
        result = workflow.plan_travel(user_input)
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Error in /api/plan: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'API is running',
        'version': '0.1.0'
    }), 200

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(debug=debug_mode, port=port, host='0.0.0.0')