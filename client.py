from flask import Flask, request, jsonify, render_template, send_from_directory
import asyncio
import os
import shelve
from dotenv import load_dotenv

# Import necessary components
from mcp import ClientSession, StdioServerParameters
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from langchain_mcp_adapters.client import MultiServerMCPClient

load_dotenv()

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "static/generated"  # Folder to store images & audio

# Ensure the upload folder exists
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# Initialize AI model
model = ChatGroq(model="qwen-2.5-32b")

# Chat history functions using shelve
def load_chat_history():
    with shelve.open("chat_history") as db:
        return db.get("messages", [])

def save_chat_history(messages):
    with shelve.open("chat_history") as db:
        db["messages"] = messages

def delete_chat_history():
    with shelve.open("chat_history") as db:
        if "messages" in db:
            del db["messages"]

# Function to generate image and audio (mock implementation)

# Asynchronous function to process user input
async def process_user_input(user_input):
    messages = load_chat_history()
    messages.append({"role": "user", "content": user_input})

    formatted_messages = "\n".join(
        [f"{m['role'].capitalize()}: {m['content']}" for m in messages]
    )

    async with MultiServerMCPClient({
        "Image_generator": {
            "command": r"D:\mcp_02\.venv\Scripts\python.exe",
            "args": [r"server\Image_generator.py"],
            "transport": "stdio",
        },
        "voices": {
            "command": r"D:\mcp_02\.venv\Scripts\python.exe",
            "args": [r"server\voices.py"],
            "transport": "stdio",
        },
        "Games": {
            "command": r"D:\mcp_02\.venv\Scripts\python.exe",
            "args": [r"server\games.py"],
            "transport": "stdio",
        }
    }) as client:
        agent = create_react_agent(model, client.get_tools())
        agent_response = await agent.ainvoke({"messages": formatted_messages})
        response_text = agent_response['messages'][-1].content

        messages.append({"role": "assistant", "content": response_text})
        save_chat_history(messages)

        # Generate media for the response
        image_path, audio_path = await generate_media(user_input)

        return response_text, image_path, audio_path

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    user_input = data.get("message", "")

    try:
        response_text, image_path, audio_path = asyncio.run(process_user_input(user_input))
        
        # Get the latest generated image dynamically
        image_files = sorted(os.listdir("images"), key=lambda x: os.path.getctime(os.path.join("images", x)))
        latest_image = image_files[-1] if image_files else None

        return jsonify({
            'text': response_text,
            'image_url': f"/images/{latest_image}" if latest_image else "",
            'audio_url': f"/static/generated/{os.path.basename(audio_path)}"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete_history', methods=['POST'])
def delete_history():
    delete_chat_history()
    return jsonify({'status': 'Chat history deleted'})

if __name__ == '__main__':
    app.run(debug=True)
