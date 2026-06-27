import json
import os
from .base_agent import BaseAgent
from helpers import Helper
from tavily import TavilyClient
from cache import cache
from config import CACHE_TTL_SECONDS

class HotelsAgent(BaseAgent):
    """Agent responsible for finding hotels with web search"""
    
    def __init__(self):
        super().__init__()
        tavily_key = os.getenv("TAVILY_API_KEY")
        self.tavily = TavilyClient(api_key=tavily_key) if tavily_key else None
        self.helper = Helper()
    
    def find_hotels(self, travel_details: dict) -> list:
        """Find hotel recommendations with real data"""
        
        destination = travel_details.get('destination', 'Unknown')
        budget = travel_details.get('budget', 2000)
        duration = travel_details.get('duration', 7)
        travelers = travel_details.get('travelers', 2)
        travel_type = travel_details.get('travel_type', 'General')
        
        # Web search for real hotels
        search_results = []
        if self.tavily:
            try:
                query = f"best hotels to stay in {destination} accommodation reviews"
                cache_key = cache.make_key("tavily-search", query, 5)
                cached_results = cache.get_json(cache_key)
                if cached_results is not None:
                    search_results = cached_results
                else:
                    search_response = self.tavily.search(query, max_results=5)
                    search_results = search_response.get('results', [])
                    cache.set_json(cache_key, search_results, CACHE_TTL_SECONDS)
            except Exception as e:
                print(f"Tavily search error: {e}")
        
        web_context = "\n".join([
            f"- {result.get('title', '')}: {result.get('content', '')[:200]}"
            for result in search_results[:5]
        ]) if search_results else "No web data available"
        
        system_prompt = """You are a hotel and accommodation expert with knowledge of properties worldwide.
        Use web search results to recommend real hotels with accurate information.
        Return ONLY valid JSON array, nothing else."""
        
        user_prompt = f"""Based on web search results, recommend hotels in {destination} for {travelers} travelers, {duration} days.

Web Search Results:
{web_context}

Total Budget: ${budget}
Travel Type: {travel_type}

Create a JSON array of 5-6 hotels across different budget ranges:
[
    {{
        "name": "Hotel name",
        "category": "Budget/3-Star/4-Star/5-Star/Boutique",
        "description": "what makes this hotel special, amenities, unique features (2-3 sentences)",
        "location": "neighborhood/area with landmarks",
        "price_per_night": "$50-100 or $150-250 etc",
        "total_estimated": "$350-700 for {duration} nights",
        "rating": 4.0-5.0,
        "amenities": ["WiFi", "Pool", "Gym", "Spa", "Restaurant", "Parking", etc],
        "room_type": "Standard Double/Deluxe Suite/Family Room/etc",
        "proximity": "near main attractions/metro station/airport",
        "booking_tip": "best time to book or platform recommendation",
        "image_search": "hotel name + city",
        "source_url": "if available or N/A"
    }}
]

Return ONLY the JSON array, no other text."""
        
        response = self.invoke(system_prompt, user_prompt)
        
        try:
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            hotels = json.loads(response)
            
            # Add image URLs from Google and Maps links
            for i, hotel in enumerate(hotels):
                if i < len(search_results) and 'url' in search_results[i]:
                    hotel['source_url'] = search_results[i]['url']
                
                # Get image from Google Custom Search
                hotel_query = f"{hotel.get('name', '')} {destination} hotel"
                images = self.helper.search_images(hotel_query)
                hotel['image_url'] = images[0] if images else f"https://source.unsplash.com/800x600/?hotel,luxury,accommodation"
                
                # Add Google Maps link
                hotel['maps_link'] = self.helper.get_maps_link(hotel.get('name', ''), destination)
            
            return hotels
        except json.JSONDecodeError as e:
            print(f"JSON decode error in hotels: {e}")
            return []
