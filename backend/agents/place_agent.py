import json
import os
from .base_agent import BaseAgent
from helper import Helper
from tavily import TavilyClient

class PlaceAgent(BaseAgent):

    def __init__(self):
        super().__init__()
        tavily_key = os.getenv("TAVILY_API_KEY")
        self.tavily = TavilyClient(api_key=tavily_key) if tavily_key else None
        self.helper = Helper()

    def find_places(self, travel_details:dict) -> list:
        """Find top places to visit with real data from web search"""
        
        destination = travel_details.get('destination', 'Unknown')
        duration = travel_details.get('duration', 7)
        interests = travel_details.get('interests', [])

        # Web search for real places
        search_results = []
        if self.tavily:
            try:
                query = f"top tourist attractions places to visit in {destination} {' '.join(interests[:3])}"
                search_response = self.tavily.search(query, max_results=5)
                search_results = search_response.get('results', [])
            except Exception as e:
                print(f"Tavily search error: {e}")
        
        # Prepare context from web search
        web_context = "\n".join([
            f"- {result.get('title', '')}: {result.get('content', '')[:200]}"
            for result in search_results[:5]
        ]) if search_results else "No web data available"

        system_prompt = """You are a local travel expert with deep knowledge of tourist attractions.
        Use the web search results to provide accurate, real information about places.
        Return ONLY valid JSON array, nothing else."""

        user_prompt = f"""Based on web search results and your knowledge, create a detailed list of must-visit places in {destination} for a {duration}-day trip.

            Web Search Results:
            {web_context}

            Interests: {', '.join(interests)}
            Budget level: ${travel_details.get('budget', 2000)}

            Create a JSON array of 6-8 places with this exact structure:
            [
                {{
                    "name": "Place name",
                    "description": "2-3 sentences describing the place and why it's worth visiting",
                    "category": "Museum/Landmark/Park/Market/Temple/etc",
                    "location": "specific area/district in the city",
                    "how_to_reach": "metro/bus/walk details with station names",
                    "best_time": "morning/afternoon/evening/night",
                    "duration": "1-3 hours",
                    "entry_fee": "price in USD or 'Free'",
                    "rating": 4.0-5.0,
                    "tips": "one helpful visitor tip",
                    "image_url": "realistic placeholder based on place type",
                    "coordinates": "approximate lat,long if known or 'N/A'"
                }}
            ]

        Return ONLY the JSON array, no other text."""

        response = self.invoke(system_prompt, user_prompt)

        try:
            response = response.strip()
            if(response.startswith("```json")):
                response = response[7:]
            if(response.startswith("```")):
                response = response[3:]
            if(response.endswith("```")):
                response = response[:-3]
            response = response.strip()

            places = json.loads(response)
            
            # Add image URLs from Google and Maps links
            for i, place in enumerate(places):
                if i < len(search_results) and 'url' in search_results[i]:
                    place['source_url'] = search_results[i]['url']
                
                # Get image from Google Custom Search
                place_query = f"{place.get('name', '')} {destination} landmark"
                images = self.helper.search_images(place_query)
                place['image_url'] = images[0] if images else f"https://source.unsplash.com/800x600/?{place.get('category', 'landmark')},tourism"
                
                # Add Google Maps link
                place['maps_link'] = self.helper.get_maps_link(place.get('name', ''), destination)
                place['image_search'] = f"{place['name']} {destination} tourist attraction"
            return places
        except json.JSONDecodeError as e:
            print(f"JSON decode error in place agent : {e}")
            print(f"response was {response}")
            return []