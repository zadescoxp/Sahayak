# Sahayak Backend

The backend of Sahayak is built with Flask and integrates with OpenAI, Firebase, and MongoDB to provide a robust API for the AI-powered digital assistant.

## Features

- **User Authentication**: Firebase-based authentication verification
- **Multiple AI Modes**: Different endpoints for various assistance modes
- **Text-to-Speech Conversion**: Convert AI responses to speech
- **Health Document Analysis**: Process and analyze uploaded medical documents
- **User Data Management**: Store and retrieve user preferences and health data

## Tech Stack

- **Flask**: Python web framework
- **Firebase Admin**: For authentication verification
- **MongoDB**: Database for user information and health data
- **OpenAI API**: GPT-4o for AI responses
- **OpenAI TTS**: For text-to-speech conversion
- **Cloudinary**: Cloud storage for images and audio files

## Project Structure

```
backend/
├── main.py                # Main Flask application with all routes
├── mongoConfig.py         # MongoDB connection configuration
├── config.py              # Application configuration and API clients
└── firebase-admin-sdk.json # Firebase admin credentials
```

## API Endpoints

### Authentication
- **POST /store_user**: Store user profile information
- **POST /get_user**: Retrieve user profile information

### Assistance Modes
- **POST /mode/general**: General conversation mode
- **POST /mode/religion**: Religious guidance mode
- **POST /mode/schemes**: Government schemes information mode

### Health Module
- **POST /mode/health/analyze**: Analyze uploaded health documents
- **POST /mode/health/chat**: Chat about health concerns

### Utilities
- **POST /text-to-speech**: Convert text to speech

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- MongoDB
- Firebase account
- OpenAI API key
- Cloudinary account

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   git clone https://github.com/your-username/sahayak.git
   cd sahayak/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install flask flask-cors firebase-admin pymongo python-dotenv openai cloudinary
   ```

4. Create a `.env` file with the following environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. Place your Firebase Admin SDK JSON file in the backend directory and ensure it's named `firebase-admin-sdk.json`

6. Start the backend server:
   ```bash
   python main.py
   ```

7. The server will start on http://localhost:5000 by default

## API Usage Examples

### User Authentication

```python
# Store user data
import requests

response = requests.post(
    "http://localhost:5000/store_user",
    headers={
        "Authorization": f"Bearer {id_token}",
        "Content-Type": "application/json"
    },
    json={
        "name": "User Name",
        "age": 65,
        "gender": "Male",
        "state": "Maharashtra",
        "language": "Hindi",
        "religion": "Hinduism"
    }
)
```

### General Conversation

```python
# Get response from general mode
response = requests.post(
    "http://localhost:5000/mode/general",
    headers={
        "Authorization": f"Bearer {id_token}",
        "Content-Type": "application/json"
    },
    json={"input": "Tell me about the weather today"}
)
```

### Text-to-Speech Conversion

```python
# Convert text to speech
response = requests.post(
    "http://localhost:5000/text-to-speech",
    headers={
        "Authorization": f"Bearer {id_token}",
        "Content-Type": "application/json"
    },
    json={"text": "This is a sample text to be converted to speech"}
)
```

## Error Handling

The API implements comprehensive error handling:

- 400: Bad Request (missing parameters or invalid data)
- 401: Unauthorized (authentication issues)
- 404: Not Found (resource not available)
- 500: Internal Server Error (server-side issues)

## Security

- All endpoints are protected with Firebase authentication
- User data is segregated in MongoDB
- Sensitive data is not exposed in responses

## Development

To run the server in debug mode:

```bash
flask --app main run --debug
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 