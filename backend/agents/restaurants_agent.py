import json
import os
from .base_agent import BaseAgent
from helpers import Helper
from tavily import TavilyClient
from cache import cache
from config import CACHE_TTL_SECONDS

class RestaurantsAgent(BaseAgent):
    """Agent responsible for finding restaurants with web search"""
    
    def __init__(self):
        super().__init__()
        tavily_key = os.getenv("TAVILY_API_KEY")
        self.tavily = TavilyClient(api_key=tavily_key) if tavily_key else None
        self.helper = Helper()
    
    def find_restaurants(self, travel_details: dict) -> list:
        """Find restaurant recommendations with real data"""
        
        destination = travel_details.get('destination', 'Unknown')
        budget = travel_details.get('budget', 2000)
        interests = travel_details.get('interests', [])
        travelers = travel_details.get('travelers', 2)
        
        # Web search for real restaurants
        search_results = []
        if self.tavily:
            try:
                query = f"best restaurants to eat in {destination} local cuisine food"
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
        
        system_prompt = """You are a food and dining expert with extensive knowledge of restaurants worldwide.
        Use web search results to provide accurate information about real restaurants.
        Return ONLY valid JSON array, nothing else."""
        
        user_prompt = f"""Based on web search results, recommend restaurants in {destination} for {travelers} travelers.

Web Search Results:
{web_context}

Budget: ${budget} total trip budget
Preferences: {', '.join(interests)}

Create a JSON array of 6-8 restaurants across different budget ranges:
[
    {{
        "name": "Restaurant name",
        "cuisine": "type of cuisine",
        "description": "what makes this place special, must-try dishes (2-3 sentences)",
        "budget_level": "Budget/Mid-range/Fine Dining",
        "avg_cost_per_person": "$10-20 or $25-50 or $60-100",
        "location": "specific area/address",
        "rating": 4.0-5.0,
        "specialties": ["dish1", "dish2", "dish3"],
        "atmosphere": "casual/romantic/family-friendly/upscale/traditional",
        "best_time": "lunch/dinner/both/breakfast",
        "reservation_needed": true or false,
        "image_search": "restaurant name + city for image search",
        "source_url": "if available from search or N/A"
    }}
]

Return ONLY the JSON array, no other text."""
        
        response = self.invoke(system_prompt, user_prompt)
        
        try:
            response = self.extract_json(response)
            restaurants = json.loads(response)
            
            # Add image URLs from Google and Maps links
            for i, restaurant in enumerate(restaurants):
                if i < len(search_results) and 'url' in search_results[i]:
                    restaurant['source_url'] = search_results[i]['url']
                
                # Get image from Google Custom Search
                restaurant_query = f"{restaurant.get('name', '')} {destination} restaurant food"
                images = self.helper.search_images(restaurant_query)
                restaurant['image_url'] = images[0] if images else f"https://source.unsplash.com/800x600/?{restaurant.get('cuisine', 'food')},restaurant"
                
                # Add Google Maps link
                restaurant['maps_link'] = self.helper.get_maps_link(restaurant.get('name', ''), destination)
            
            return restaurants
        except json.JSONDecodeError as e:
            print(f"JSON decode error in restaurants: {e}")
            return []
