from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth
from mongoConfig import users_collection
from bson import ObjectId
from config import client, model_id, gclient, google_search_tool
from google.genai.types import GenerateContentConfig
import os
import cloudinary
import cloudinary.uploader
from datetime import datetime

app = Flask(__name__)
CORS(app)
cred = credentials.Certificate("firebase-admin-sdk.json")
firebase_admin.initialize_app(cred)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

# MongoDB collection for health data
health_collection = users_collection.db.health

from functools import wraps


def verify_firebase_token(func):
    @wraps(func)  # ✅ preserves function name and metadata
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return (
                jsonify(
                    {
                        "error": "Unauthorized",
                        "details": "Missing or invalid Authorization header",
                    }
                ),
                401,
            )

        id_token = auth_header.split(" ")[1]

        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token
            return func(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": "Unauthorized", "details": str(e)}), 401

    return wrapper


@app.route("/store_user", methods=["POST"])
@verify_firebase_token
def store_user():
    try:
        # Get data from request body
        data = request.get_json()
        user_email = request.user["email"]
        user_uid = request.user["uid"]

        print(user_email, user_uid, data)
        # Store all data
        user_data = {
            "uid": user_uid,
            "email": user_email,
            **data,  # Spread all incoming data fields
        }

        # Save to database
        users_collection.update_one({"uid": user_uid}, {"$set": user_data}, upsert=True)

        return jsonify({"message": f"User data stored successfully."}), 200

    except KeyError as e:
        return jsonify({"error": "Missing required user data", "details": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": "Invalid request data", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/get_user", methods=["POST"])
@verify_firebase_token
def get_user():
    try:
        user_uid = request.user["uid"]
        user_data = users_collection.find_one({"uid": user_uid})

        if not user_data:
            return jsonify({"error": "User not found"}), 404

        # Convert ObjectId to string
        user_data["_id"] = str(user_data["_id"])

        return jsonify(user_data), 200

    except KeyError as e:
        return jsonify({"error": "Missing required user data", "details": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": "Invalid request data", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/mode/general", methods=["POST"])
@verify_firebase_token
def set_general_mode():
    try:
        data = request.get_json()
        user_uid = request.user["uid"]
        user_data = users_collection.find_one({"uid": user_uid})
        response = client.responses.create(
            model="gpt-4o",
            instructions=f"""Your user's name is {user_data['name']}, he is {user_data['age']} years old {user_data['gender']}. He is from {user_data['state']}, India and speaks {user_data['language']}. He is a polite person so treat everyone with kindness and be straight to the point. Try to communicate with them in their native language""",
            input=data["input"],
        )
        return jsonify({"response": response.output_text}), 200
    except KeyError as e:
        return jsonify({"error": "Missing required user data", "details": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": "Invalid request data", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/mode/religion", methods=["POST"])
@verify_firebase_token
def set_religion_mode():
    try:
        data = request.get_json()
        user_uid = request.user["uid"]
        user_data = users_collection.find_one({"uid": user_uid})
        response = client.responses.create(
            model="gpt-4o",
            instructions=f"""Your user's name is {user_data['name']}, he is {user_data['age']} years old {user_data['gender']}. He is from {user_data['state']}, India and speaks {user_data['language']}. He strongly believes in {user_data["religion"]} and he is a great devotee
        Your role is to engage the user in spiritual conversations and provide him with answers related to his religion. You need to answer as an intellectual being try to not hurt anyone's sentiment and believes. Try to communicate with them in their native language""",
            input=data["input"],
        )
        return jsonify({"response": response.output_text}), 200
    except KeyError as e:
        return jsonify({"error": "Missing required user data", "details": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": "Invalid request data", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/mode/schemes", methods=["POST"])
@verify_firebase_token
def set_scheme_mode():
    try:
        data = request.get_json()
        user_uid = request.user["uid"]
        user_data = users_collection.find_one({"uid": user_uid})

        # response = gclient.models.generate_content(
        #     model=model_id,
        #     contents=f"""Your user's name is {user_data['name']}, he is {user_data['age']} years old {user_data['gender']}. He is from {user_data['state']}, India and speaks {user_data['language']}. He strongly believes in {user_data["religion"]} and he is a great devotee
        # Your role is to provide the user with latest goverment schemes in India which can be beneficial for the user. Keep in mind that the user is a senior citizen so tell him/her about beneficial offers as well. You need to answer as an smart adviser. Try to communicate with them in their native language. Also provide links of trusrted government sites for schemes.""",
        #     config=GenerateContentConfig(
        #         tools=[google_search_tool],
        #         response_modalities=["TEXT"],
        #     )
        # )

        response = client.responses.create(
            model="gpt-4o",
            instructions=f"""Your user's name is {user_data['name']}, he is {user_data['age']} years old {user_data['gender']}. He is from {user_data['state']}, India and speaks {user_data['language']}. He strongly believes in {user_data["religion"]} and he is a great devotee
        Your role is to provide the user with latest goverment schemes in India which can be beneficial for the user. Keep in mind that the user is a senior citizen so tell him/her about beneficial offers as well. You need to answer as an smart adviser. Try to communicate with them in their native language. Also provide links of trusrted government sites for schemes.""",
            input=data["input"],
        )
        return jsonify({"response": response.output_text}), 200
    except KeyError as e:
        return jsonify({"error": "Missing required user data", "details": str(e)}), 400
    except ValueError as e:
        return jsonify({"error": "Invalid request data", "details": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/mode/health/analyze", methods=["POST"])
@verify_firebase_token
def analyze_health():
    try:
        data = request.get_json()
        if 'image' not in data:
            return jsonify({"error": "No image provided"}), 400

        base64_image = data['image']
        user_uid = request.user["uid"]
        user_data = users_collection.find_one({"uid": user_uid})

        # Upload base64 image to Cloudinary
        upload_result = cloudinary.uploader.upload(base64_image)
        image_url = upload_result['secure_url']

        # Analyze image with GPT
        response = client.responses.create(
            model="gpt-4o-mini",
            input=image_url
        )

        # Store health data in MongoDB
        health_data = {
            "userId": user_uid,
            "imageUrl": image_url,
            "analysis": response.output_text,
            "createdAt": datetime.now(),
            "medicines": [],
            "tips": []
        }
        health_collection.insert_one(health_data)

        return jsonify({
            "success": True,
            "data": {
                "analysis": response.output_text,
                "imageUrl": image_url
            }
        }), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/mode/health/chat", methods=["POST"])
@verify_firebase_token
def health_chat():
    try:
        data = request.get_json()
        user_uid = request.user["uid"]
        user_data = users_collection.find_one({"uid": user_uid})
        
        # Get latest health analysis
        latest_health = health_collection.find_one(
            {"userId": user_uid},
            sort=[("createdAt", -1)]
        )

        if not latest_health:
            return jsonify({
                "error": "Please analyze your health condition first"
            }), 400

        response = client.responses.create(
            model="gpt-4",
            instructions=f"""You are a health assistant for {user_data['name']}, a {user_data['age']} year old {user_data['gender']} from {user_data['state']}, India.
            Their latest health analysis is: {latest_health['analysis']}
            
            Your role is to:
            1. Remind them about their medicines and health tips
            2. Answer health-related questions
            3. Provide personalized health advice
            4. Track their health progress
            
            Always respond in {user_data['language']} language and be empathetic.""",
            input=data["input"]
        )

        return jsonify({
            "success": True,
            "response": response.output_text
        }), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/text-to-speech", methods=["POST"])
@verify_firebase_token
def text_to_speech():
    try:
        data = request.get_json()
        if 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text']
        
        # Convert text to speech
        speech_response = client.audio.speech.create(
            model="gpt-4o-mini-tts",
            voice="coral",
            input=text,
            response_format="mp3"
        )

        # Upload speech response to Cloudinary
        speech_upload = cloudinary.uploader.upload(
            speech_response.content,
            resource_type="video"
        )
        speech_url = speech_upload['secure_url']

        return jsonify({
            "success": True,
            "audioUrl": speech_url
        }), 200

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
