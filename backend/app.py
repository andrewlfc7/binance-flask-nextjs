


from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import requests
import orjson
import time
import logging
import os

# Initialize the Flask app
app = Flask(__name__)

# Load server IP from environment variable or use default
server_ip = os.getenv("SERVER_IP", "http://127.0.0.1")

# Configure CORS to allow requests from the specified server IP
CORS(app, resources={
    r"/*": {
        "origins": [server_ip, "http://127.0.0.1"],  # Allow server IP and localhost for testing
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize SocketIO with the Flask app
socketio = SocketIO(
    app,
    cors_allowed_origins=[server_ip, "http://127.0.0.1"],  # Allow server IP and localhost for testing
    async_mode='threading',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Use app context to hold kline data instead of a global variable
app.cleaned_data = []

def fetch_kline_data():
    url = 'https://api.binance.us/api/v3/klines'
    symbol = 'BTCUSDC'
    interval = '1m'
    
    while True:
        try:
            # Fetch kline data from Binance API
            response = requests.get(url, params={'symbol': symbol, 'interval': interval, 'limit': 250})
            response.raise_for_status()  # Check for HTTP errors
            data = orjson.loads(response.content)

            # Clean and store the data in app context
            app.cleaned_data = [
                [entry[0], entry[1], entry[2], entry[3], entry[4]]
                for entry in data
            ]
            logging.info(f"Fetched data length: {len(app.cleaned_data)}")

            # Emit the cleaned data to connected clients
            socketio.emit('kline_data', app.cleaned_data, namespace='/')
            time.sleep(60)  # Wait for 60 seconds before fetching again

        except requests.exceptions.RequestException as req_err:
            logging.error(f"Request error: {req_err}")
            time.sleep(60)  # Wait before retrying in case of request error
        except orjson.JSONDecodeError as json_err:
            logging.error(f"JSON error: {json_err}")
            time.sleep(60)  # Wait before retrying in case of JSON error
        except Exception as e:
            logging.error(f"Unexpected error: {e}")
            time.sleep(60)  # Wait before retrying in case of an unexpected error

@app.route('/')
def index():
    return "Flask backend is running."

@socketio.on('connect')
def handle_connect():
    try:
        logging.info("Client connected")
        if app.cleaned_data:  # Emit current data to the new client
            socketio.emit('kline_data', app.cleaned_data)
    except Exception as e:
        logging.error(f"Error during client connection: {e}")

@socketio.on('disconnect')
def handle_disconnect():
    logging.info('Client disconnected')

if __name__ == '__main__':
    # Start fetching kline data in the background
    socketio.start_background_task(target=fetch_kline_data)
    # Run the Flask app with SocketIO
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
