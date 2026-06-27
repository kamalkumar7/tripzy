import os
import requests
from urllib.parse import quote
from dotenv import load_dotenv

from cache import cache
from config import CACHE_TTL_SECONDS, REQUEST_TIMEOUT_SECONDS

load_dotenv()

class Helper:
    """Helper class images and map url"""

    def __init__(self):
        self.pexels_api_key = os.getenv("PEXELS_API_KEY")

    def search_images(self, query:str, num_results:int = 1) -> list:
        cache_key = cache.make_key("pexels-images", query, num_results)
        cached_images = cache.get_json(cache_key)
        if cached_images is not None:
            return cached_images

        if not (self.pexels_api_key):
            images = [f"https://source.unsplash.com/800x600/?{quote(query)}"]
            cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
            return images
        
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
            
            response = requests.get(url, headers=headers, params=params, timeout=REQUEST_TIMEOUT_SECONDS)

            if(response.status_code == 200):
                result = response.json()
                images = []

                for photo in result.get('photos', []):
                    image_url = photo.get('src', {}).get('large', '')
                    if image_url:
                        images.append(image_url)
                if images:
                    print(f"Found the image for : {query}")
                    cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
                    return images
                
                else:
                    print(f"No pexel image found, using unsplash for :{query}")
                    images = [f"https://source.unsplash.com/800x600/?{quote(query)}"]
                    cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
                    return images
            
        except Exception as e:
            print(f"Error fetching image from Pexels: {e}")
            print(f"Using unsplash for :{query}")
            images = [f"https://source.unsplash.com/800x600/?{quote(query)}"]
            cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
            return images

        images = [f"https://source.unsplash.com/800x600/?{quote(query)}"]
        cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
        return images

    def get_maps_link(self, place_name:str, city:str) -> str:
        """Generate a Google Maps URL for the given location"""
        location = f"{place_name}, {city}".strip(",")
        encoded_query = quote(location)
        return f"https://www.google.com/maps/search/?api=1&query={encoded_query}"
