import requests
import os
from mcp.server.fastmcp import FastMCP
import io
import datetime
from PIL import Image
from dotenv import load_dotenv
load_dotenv()
import aiohttp

mcp = FastMCP("Image_generator")

H_KEY = os.getenv('HUGGING_FACE_API_KEY_1')
API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev"
headers = {"Authorization": H_KEY}




@mcp.tool()
def image_generation(very_short_image_prompt:str) -> str:
    """Generates an image based on the prompt and saves it with a unique filename."""
    
    # Ensure the 'images' directory exists
    os.makedirs("images", exist_ok=True)
    scene_index = 0
    # Generate a unique filename using timestamp
    if very_short_image_prompt:
        scene_index += 1
        filename = f"images/generated_image_{scene_index}.png"

    try:
        # Send request to Hugging Face API
        response = requests.post(API_URL, headers=headers, json={"inputs": very_short_image_prompt})
        response.raise_for_status()  # Raise error if request fails

        # Convert response content to image
        image = Image.open(io.BytesIO(response.content))
        image.save(filename)  # Save image

        flag = "Image generated successfully"
        return flag  # Return saved file name

    except requests.exceptions.RequestException as e:
        flag = "Image is not generated"
        return flag
    
    
if __name__ == "__main__":
    mcp.run(transport="stdio")

