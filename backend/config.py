import os
from dotenv import load_dotenv
from google import genai
from google.genai.types import Tool, GoogleSearch

load_dotenv()

from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API"))

from google import genai

gclient = genai.Client(api_key=os.getenv("GEMINI_API"))

model_id = "gemini-2.0-flash"

google_search_tool = Tool(
    google_search = GoogleSearch()
)