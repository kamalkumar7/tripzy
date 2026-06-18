import json
from .base_agent import BaseAgent

class ItineraryAgent(BaseAgent):
    """Agent responsible for creating day-by-day itinerary"""
    
    def create_itinerary(self, travel_details: dict, places: list, restaurants: list) -> list:
        """Create detailed day-by-day itinerary using places and restaurants"""
        
        destination = travel_details.get('destination', 'Unknown')
        duration = travel_details.get('duration', 7)
        interests = travel_details.get('interests', [])
        budget = travel_details.get('budget', 2000)

        # Prepare context
        places_summary = "\n".join([
            f"- {p.get('name', '')}: {p.get('category', '')} - {p.get('location', '')} - {p.get('entry_fee', '')}"
            for p in places[:10]
        ]) if places else "No places data"
        
        restaurants_summary = "\n".join([
            f"- {r.get('name', '')}: {r.get('cuisine', '')} - {r.get('budget_level', '')}"
            for r in restaurants[:10]
        ]) if restaurants else "No restaurants data"
        
        system_prompt = """You are an expert itinerary planner creating realistic, well-paced daily schedules.
        Use the provided places and restaurants to create a cohesive plan.
        Return ONLY valid JSON array, nothing else."""


        user_prompt = f"""Create a detailed day-by-day itinerary for {duration} days in {destination}.

        Available Places to Visit:
        {places_summary}

        Available Restaurants:
        {restaurants_summary}

        Travelers: {travel_details.get('travelers', 2)} people
        Interests: {', '.join(interests)}
        Budget: ${budget}

        Create a JSON array with daily plans (make sure activities are realistic and well-timed):
        [
            {{
                "day": 1,
                "title": "Arrival & City Introduction / Cultural Exploration / etc",
                "activities": [
                    {{
                        "time": "9:00 AM",
                        "activity": "activity name from places list or new activity",
                        "description": "what to do and see",
                        "location": "specific location",
                        "duration": "1-3 hours",
                        "cost": "$10-50"
                    }},
                    // 3-5 activities per day
                ],
                "meals": {{
                    "breakfast": "restaurant name from list or suggestion",
                    "lunch": "restaurant name from list or suggestion",
                    "dinner": "restaurant name from list or suggestion"
                }},
                "estimated_cost": "$100-300",
                "tips": "important tips for the day (transport, dress code, etc)"
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
            
            return json.loads(response)
        except json.JSONDecodeError as e:
            print(f"JSON decode error in itinerary: {e}")
            return []

        
