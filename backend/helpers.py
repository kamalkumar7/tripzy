import os
import requests
from urllib.parse import quote
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

from cache import cache
from config import CACHE_TTL_SECONDS, REQUEST_TIMEOUT_SECONDS

load_dotenv()
logger = logging.getLogger(__name__)

class Helper:
    """Helper class images and map url"""

    def __init__(self):
        self.pexels_api_key = os.getenv("PEXELS_API_KEY")

    def search_images(self, query:str, num_results:int = 1) -> list:
        """Search for images with quick fallback to Unsplash. Uses shorter timeout to prevent hanging."""
        cache_key = cache.make_key("pexels-images", query, num_results)
        cached_images = cache.get_json(cache_key)
        if cached_images is not None:
            return cached_images

        # Quick fallback if no Pexels API key
        if not self.pexels_api_key:
            images = [f"https://source.unsplash.com/800x600/?{quote(query)}"]
            cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
            return images
        
        try: 
            url = "https://api.pexels.com/v1/search"
            headers = {
                "Authorization": self.pexels_api_key
            }
            params = {
                'query': query,
                'per_page': num_results,
                'orientation': 'landscape'
            }
            
            # Use shorter timeout (10 seconds) to prevent long hangs
            response = requests.get(url, headers=headers, params=params, timeout=10)

            if response.status_code == 200:
                result = response.json()
                images = []

                for photo in result.get('photos', []):
                    image_url = photo.get('src', {}).get('large', '')
                    if image_url:
                        images.append(image_url)
                
                if images:
                    logger.debug(f"Found image from Pexels for: {query}")
                    cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
                    return images
            
            # Fall back to Unsplash if no results
            logger.debug(f"No Pexels image found, using Unsplash for: {query}")
            images = [f"https://source.unsplash.com/800x600/?{quote(query)}"]
            cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
            return images
            
        except requests.Timeout:
            logger.warning(f"Pexels request timeout for: {query}, using Unsplash")
            images = [f"https://source.unsplash.com/800x600/?{quote(query)}"]
            cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
            return images
        except Exception as e:
            logger.warning(f"Error fetching image from Pexels for '{query}': {e}, using Unsplash")
            images = [f"https://source.unsplash.com/800x600/?{quote(query)}"]
            cache.set_json(cache_key, images, CACHE_TTL_SECONDS)
            return images

    def search_images_batch(self, queries: list) -> dict:
        """Search for multiple images in parallel to avoid sequential delays."""
        results = {}
        
        # Use ThreadPoolExecutor to parallelize image searches
        with ThreadPoolExecutor(max_workers=4) as executor:
            # Submit all image search tasks
            future_to_query = {
                executor.submit(self.search_images, query): query 
                for query in queries
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_query, timeout=30):
                query = future_to_query[future]
                try:
                    images = future.result(timeout=5)
                    results[query] = images
                except Exception as e:
                    logger.warning(f"Failed to fetch image for '{query}': {e}, using Unsplash fallback")
                    results[query] = [f"https://source.unsplash.com/800x600/?{quote(query)}"]
        
        return results

    def get_maps_link(self, place_name:str, city:str) -> str:
        """Generate a Google Maps URL for the given location"""
        location = f"{place_name}, {city}".strip(",")
        encoded_query = quote(location)
        return f"https://www.google.com/maps/search/?api=1&query={encoded_query}"
