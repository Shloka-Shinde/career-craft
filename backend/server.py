from flask import Flask, jsonify
import pickle
import pandas as pd
from flask_cors import CORS  # Enable CORS for React

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

# Load SARIMA predictions
with open('/Users/ishamadlani/Documents/career-craft-2/backend/data/sarima_predictions.pkl', 'rb') as file:


    sarima_data = pickle.load(file)

# Load the DataFrame from the pickle file
with open('/Users/ishamadlani/Documents/career-craft-2/backend/data/df_filtered.pkl', 'rb') as file:


    df = pickle.load(file)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Returns a list of available job categories."""
    return jsonify({"categories": list(sarima_data.keys())})

@app.route('/api/forecast/<category>', methods=['GET'])
def get_forecast(category):
    """Returns SARIMA forecast data for a specific category."""
    if category not in sarima_data:
        return jsonify({"error": "Category not found"}), 404
    
    forecast_data = sarima_data[category]

    if isinstance(forecast_data, pd.DataFrame):
        forecast_data['date'] = forecast_data['date'].astype(str)  # Convert dates to strings
        response = forecast_data.to_dict(orient="records")  # Convert DataFrame to JSON
        return jsonify(response)
    
    return jsonify({"error": "Invalid forecast data"}), 500

@app.route('/api/data/<category>', methods=['GET'])
def get_data(category):
    """Returns the DataFrame data for a specific category from the pickle file."""
    if category not in df['category'].values:
        return jsonify({"error": "Category not found in additional data"}), 404
    
    category_data = df[df['category'] == category]
    response = category_data.to_dict(orient="records")
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)