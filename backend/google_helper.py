import os
import requests
from urllib.parse import quote
from dotenv import load_dotenv

load_dotenv()

class GoogleAPIHelper:
    """Helper class for Google Custom Search API (Images) and Google Places API (Maps)"""
    
    def __init__(self):
        # Google Custom Search API credentials
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        # https://console.cloud.google.com/
        # Create or select a project.
        # APIs & Services → Credentials → Create credentials → API key.
        # Copy the key and (recommended) restrict it by API (e.g. “Custom Search API”, “Places API”) and optionally by IP/app.
        self.google_search_engine_id = os.getenv("GOOGLE_SEARCH_ENGINE_ID")
        # https://programmablesearchengine.google.com/
        # Add or edit a search engine.
        # Choose “Search the entire web” or add sites to search.
        # After creating it, open the engine → Setup → copy the Search engine ID (often looks like a1b2c3d4e5f6g7h8i).
        # You also need to enable Custom Search API in Cloud Console (APIs & Services → Enable APIs → search “Custom Search API”) and use the same project as the API key.
        
        # Google Places API key (can be same as above or different)
        self.google_places_key = os.getenv("GOOGLE_PLACES_API_KEY", self.google_api_key)
        # https://console.cloud.google.com/
        # Enable Places API (or Places API (New)): in Cloud Console → APIs & Services → Library → search “Places API” → Enable.
    
    def search_images(self, query: str, num_results: int = 1) -> list:
        """
        Get images using Google Custom Search API
        
        Required:
        - Google Custom Search API key
        - Custom Search Engine ID (with image search enabled)
        
        Setup: https://developers.google.com/custom-search/v1/overview
        """
        if not self.google_api_key or not self.google_search_engine_id:
            print("⚠️ Google API credentials not found, using placeholder")
            return [f"https://source.unsplash.com/800x600/?{quote(query)}"]
        
        try:
            url = "https://www.googleapis.com/customsearch/v1"
            params = {
                'key': self.google_api_key,
                'cx': self.google_search_engine_id,
                'q': query,
                'searchType': 'image',
                'num': num_results,
                'imgSize': 'large',
                'safe': 'active'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                results = response.json()
                images = []
                
                for item in results.get('items', []):
                    img_url = item.get('link', '')
                    if img_url:
                        images.append(img_url)
                
                if images:
                    print(f"✅ Found Google image for: {query}")
                    return images
                else:
                    print(f"No Google images found for: {query}")
                    return [f"https://source.unsplash.com/800x600/?{quote(query)}"]
            
            elif response.status_code == 403:
                print(f"❌ Google API: Access denied (check billing/quota)")
                return [f"https://source.unsplash.com/800x600/?{quote(query)}"]
            
            else:
                print(f"❌ Google API error {response.status_code}")
                return [f"https://source.unsplash.com/800x600/?{quote(query)}"]
                
        except Exception as e:
            print(f"Google Custom Search error: {e}")
            return [f"https://source.unsplash.com/800x600/?{quote(query)}"]
    
    def get_place_details(self, place_name: str, city: str = "") -> dict:
        """
        Get exact place details using Google Places API (Text Search)
        
        Returns: {
            'place_id': 'ChIJ...',
            'name': 'Actual place name',
            'formatted_address': 'Full address',
            'location': {'lat': 35.7148, 'lng': 139.7967},
            'rating': 4.5,
            'maps_url': 'Direct Google Maps URL'
        }
        
        Required:
        - Google Places API key
        - Places API enabled in Google Cloud Console
        
        Setup: https://developers.google.com/maps/documentation/places/web-service/overview
        """
        if not self.google_places_key:
            print("⚠️ Google Places API key not found")
            return self._fallback_place_data(place_name, city)
        
        try:
            # Step 1: Text Search to find the place
            search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
            query = f"{place_name}, {city}".strip(", ")
            
            params = {
                'key': self.google_places_key,
                'query': query,
                'fields': 'place_id,name,formatted_address,geometry,rating'
            }
            
            response = requests.get(search_url, params=params, timeout=10)
            
            if response.status_code == 200:
                results = response.json()
                
                if results.get('results'):
                    # Get first (most relevant) result
                    place = results['results'][0]
                    place_id = place.get('place_id', '')
                    
                    # Extract data
                    location = place.get('geometry', {}).get('location', {})
                    
                    place_data = {
                        'place_id': place_id,
                        'name': place.get('name', place_name),
                        'formatted_address': place.get('formatted_address', ''),
                        'location': {
                            'lat': location.get('lat', 0),
                            'lng': location.get('lng', 0)
                        },
                        'rating': place.get('rating', 0),
                        'maps_url': self._generate_maps_url_from_place_id(place_id) if place_id else self._fallback_maps_url(place_name, city)
                    }
                    
                    print(f"✅ Found exact location for: {place_name}")
                    return place_data
                else:
                    print(f"⚠️ No results found for: {query}")
                    return self._fallback_place_data(place_name, city)
            
            elif response.status_code == 403:
                print(f"❌ Google Places API: Access denied (check billing)")
                return self._fallback_place_data(place_name, city)
            
            else:
                print(f"❌ Google Places API error {response.status_code}")
                return self._fallback_place_data(place_name, city)
                
        except Exception as e:
            print(f"Google Places API error: {e}")
            return self._fallback_place_data(place_name, city)
    
    def _generate_maps_url_from_place_id(self, place_id: str) -> str:
        """Generate exact Google Maps URL from Place ID"""
        return f"https://www.google.com/maps/place/?q=place_id:{place_id}"
    
    def _fallback_maps_url(self, place_name: str, city: str = "") -> str:
        """Fallback to search-based Maps URL"""
        query = f"{place_name}, {city}".strip(", ")
        encoded_query = quote(query)
        return f"https://www.google.com/maps/search/?api=1&query={encoded_query}"
    
    def _fallback_place_data(self, place_name: str, city: str = "") -> dict:
        """Return fallback data when API is unavailable"""
        return {
            'place_id': None,
            'name': place_name,
            'formatted_address': f"{place_name}, {city}".strip(", "),
            'location': {'lat': 0, 'lng': 0},
            'rating': 0,
            'maps_url': self._fallback_maps_url(place_name, city)
        }
    
    
    def get_static_map_image(self, place_name: str, city: str = "", zoom: int = 15, size: str = "600x400") -> str:
        """
        Generate a static map image URL using Google Static Maps API
        
        Required:
        - Google Maps Static API key
        - Static Maps API enabled
        
        Setup: https://developers.google.com/maps/documentation/maps-static/overview
        """
        if not self.google_places_key:
            return ""
        
        place_details = self.get_place_details(place_name, city)
        
        if place_details['location']['lat'] == 0:
            # No coordinates found
            return ""
        
        lat = place_details['location']['lat']
        lng = place_details['location']['lng']
        
        # Generate static map image URL
        base_url = "https://maps.googleapis.com/maps/api/staticmap"
        params = {
            'center': f"{lat},{lng}",
            'zoom': zoom,
            'size': size,
            'markers': f"color:red|{lat},{lng}",
            'key': self.google_places_key
        }
        
        param_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{base_url}?{param_string}"