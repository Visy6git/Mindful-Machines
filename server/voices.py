from mcp.server.fastmcp import FastMCP
from deepgram import DeepgramClient, SpeakOptions
import os
from dotenv import load_dotenv
load_dotenv()
mcp = FastMCP("voices")

TTS_FOLDER = 'tts_uploads'
os.makedirs(TTS_FOLDER, exist_ok=True)

@mcp.tool()
def male_voice(input:str) :
    SPEAK_OPTIONS = {"text": input} 

    deepgram = DeepgramClient()
    options = SpeakOptions(
    model="aura-orpheus-en",
        )

        # STEP 3: Call the save method on the speak property
    filename = f"tts1.mp3"
    file_path = os.path.join(TTS_FOLDER, filename)
    response = deepgram.speak.rest.v("1").save(file_path, SPEAK_OPTIONS, options)
            
    return response

@mcp.tool()
def female_voice(input:str) :
    SPEAK_OPTIONS = {"text": input} 

    deepgram = DeepgramClient()
    options = SpeakOptions(
    model="aura-asteria-en",
        )

        # STEP 3: Call the save method on the speak property
    filename = f"tts2.mp3"
    file_path = os.path.join(TTS_FOLDER, filename)
    response = deepgram.speak.rest.v("1").save(file_path, SPEAK_OPTIONS, options)
            
    return response



if __name__ == "__main__":
    mcp.run(transport="stdio")