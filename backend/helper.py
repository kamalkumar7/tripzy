import os
import requests
from  urllib.parse import quote
from dotenv import load_dotenv
import urllib3


# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

class Helper:
    """Helper class images and map url"""

    def __init__(self):
        self.pexels_api_key = os.getenv("PEXELS_API_KEY")

    def search_images(self, query:str, num_results:int = 1) -> list:
        if not (self.pexel_api_key):
            return [f"https://source.unsplash.com/800x600/?{quote(query)}"]
        
        try: 
            url ="https://api.pexels.com/v1/search"
            headers = {
                "Authorization": self.pexels_api_key
            }
            params = {
                'query': query,
                'per_page': num_results,
                'orientation': 'landscape'
                }
            
            response = requests.get(url, headers=headers, params=params,timeout=10, verify=False)

            if(response.status_code == 200):
                result = response.json()
                images = []

                for photo in result.get('photos', []):
                    image_url = photo.get('src', {}).get('large', '')
                    if image_url:
                        images.append(image_url)
                if images:
                    print(f"Found the image for : {query}")
                    return images
                
                else:
                    print(f"No pexel image found, using unsplash for :{query}")
                    return [f"https://source.unsplash.com/800x600/?{quote(query)}"]
            
        except Exception as e:
            print(f"Error fetching image from Pexels: {e}")
            print(f"Using unsplash for :{query}")
            return [f"https://source.unsplash.com/800x600/?{quote(query)}"]

    def map_url(self, place_name:str, city:str) -> str:
        """Generate a Google Maps URL for the given location"""
        location = f"{place_name}, {city}"
        return f"https://www.google.com/maps/search/?api=1&query={quote(location)}"