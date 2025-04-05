# Sahayak - AI-Powered Digital Assistant

Sahayak is an AI-powered digital assistant designed to bridge the digital divide for senior citizens and children. It provides personalized assistance in the user's preferred language across various domains including general queries, religious information, health guidance, and information about government schemes.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Usage Guide](#usage-guide)
- [Contributors](#contributors)
- [License](#license)

## Project Overview

Sahayak aims to create an inclusive digital experience for users who may find traditional digital interfaces challenging. The application provides:

- Personalized AI responses based on user profiles
- Support in multiple Indian languages
- Text-to-speech capabilities for better accessibility
- Health assistance including prescription analysis
- Information about government schemes beneficial for senior citizens

## Features

### User Authentication
- Secure sign-up and login via Firebase
- User profile storing preferences and personal information

### Multiple Assistance Modes
- **General Mode**: Everyday conversation and assistance
- **Religious Mode**: Religious and spiritual guidance based on user's faith
- **Health Mode**: Medical advice and prescription analysis
- **Government Schemes**: Information on beneficial schemes for senior citizens

### Accessibility Features
- Text-to-speech conversion for all AI responses
- User-friendly interface with larger text and clear UI elements
- Responsive design for all device types

### Health Module
- Upload and analyze medical prescriptions
- Store and track medication schedules
- Personalized health advice

## Tech Stack

### Frontend
- **Next.js** (v15.2.4): React framework for server-rendered applications
- **React** (v19.0.0): UI component library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Firebase**: Authentication services
- **Web APIs**: For media recording functionality

### Backend
- **Flask**: Python web framework
- **MongoDB**: Database for user profiles and health data
- **Firebase Admin**: For authentication verification
- **OpenAI API**: GPT-4o for generating responses
- **Cloudinary**: Cloud storage for images and audio files
- **OpenAI TTS**: Text-to-speech conversion

## Project Structure

```
sahayak/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # Reusable UI components
│   │   └── firebase/       # Firebase configuration
│   ├── utils/              # Utility functions and middleware
│   └── public/             # Static assets
│
├── backend/                # Flask backend application
│   ├── main.py             # Main Flask application
│   ├── mongoConfig.py      # MongoDB configuration
│   ├── config.py           # App configuration and API clients
│   └── firebase-admin-sdk.json  # Firebase admin credentials
```

## Setup Instructions

### Prerequisites
- Node.js (v18.x or higher)
- Python (v3.8 or higher)
- MongoDB
- Firebase account
- OpenAI API key
- Cloudinary account

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with required environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_BACKEND=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
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

4. Create a `.env` file with required environment variables:
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

## Environment Variables

### Frontend Variables
- Firebase configuration
- Backend API URL

### Backend Variables
- MongoDB connection string
- OpenAI API key
- Cloudinary credentials
- Firebase Admin SDK path

## Usage Guide

1. **Registration & Login**:
   - Create an account with your email and password
   - Complete your profile with personal details

2. **Select Assistance Mode**:
   - Choose from General, Religious, Health, or Government Schemes modes

3. **Conversational Interface**:
   - Type questions or statements in any supported language
   - Listen to responses using the audio playback feature

4. **Health Module**:
   - Upload prescriptions or medical reports
   - Get AI analysis and medication reminders

## Contributors

- [Your Name]
- [Contributor Names]

## License

This project is licensed under the [LICENSE NAME] - see the LICENSE file for details. 