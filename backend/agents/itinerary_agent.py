import json
import os
from .base_agent import BaseAgent


class ItineraryAgent(BaseAgent):
    """Agent responsible for creating a day-by-day travel itinerary"""

    def __init__(self):
        super().__init__()

    def create_itinerary(self, state: dict) -> list:
        """Create a detailed day-by-day itinerary"""

        travel_details = state.get("travel_details", {})
        places = state.get("places", [])
        restaurants = state.get("restaurants", [])
        hotels = state.get("hotels", [])

        destination = travel_details.get("destination", "Unknown")
        duration = travel_details.get("duration", 7)
        budget = travel_details.get("budget", 2000)
        travel_type = travel_details.get("travel_type", "General")

        # Prepare place and restaurant context
        places_context = "\n".join([
            f"- {p.get('name', '')}: {p.get('description', '')[:100]}"
            for p in places[:5]
        ]) if places else "No places data"

        restaurants_context = "\n".join([
            f"- {r.get('name', '')} ({r.get('cuisine', '')}): {r.get('description', '')[:100]}"
            for r in restaurants[:5]
        ]) if restaurants else "No restaurants data"

        hotels_context = "\n".join([
            f"- {h.get('name', '')} ({h.get('category', '')}): {h.get('description', '')[:100]}"
            for h in hotels[:3]
        ]) if hotels else "No hotels data"

        system_prompt = """You are an expert travel itinerary planner.
        Create a detailed, realistic day-by-day travel plan that balances sightseeing, dining, and rest.
        Consider travel time between locations, opening hours, and traveler comfort.
        Return ONLY valid JSON, nothing else."""

        user_prompt = f"""Create a {duration}-day travel itinerary for {destination}.

Travel Type: {travel_type}
Budget: ${budget}

Available Places to Visit:
{places_context}

Recommended Restaurants:
{restaurants_context}

Accommodation Options:
{hotels_context}

Create a JSON array with {duration} daily plans. Each day should have:
[
    {{
        "day": 1,
        "title": "Day title (e.g., 'Arrival & City Overview')",
        "theme": "main theme or focus of the day",
        "morning": {{
            "time": "08:00-12:00",
            "activity": "activity name",
            "description": "what to do and see",
            "place": "location name if visiting a place",
            "duration": "2-4 hours"
        }},
        "lunch": {{
            "time": "12:00-14:00",
            "restaurant": "restaurant name",
            "cuisine": "type",
            "estimated_cost": "$10-20 per person"
        }},
        "afternoon": {{
            "time": "14:00-18:00",
            "activity": "activity name",
            "description": "what to do and see",
            "place": "location name if visiting a place",
            "duration": "3-4 hours"
        }},
        "dinner": {{
            "time": "19:00-21:00",
            "restaurant": "restaurant name",
            "cuisine": "type",
            "estimated_cost": "$15-30 per person"
        }},
        "evening": {{
            "time": "21:00+",
            "activity": "relaxation or entertainment",
            "description": "wind down activity"
        }},
        "transportation": "metro/bus/taxi recommendations with estimated costs",
        "tips": ["tip 1", "tip 2"],
        "estimated_daily_cost": "$150-250 per person (excluding accommodation)"
    }}
]

Make sure to:
1. Balance activities to avoid fatigue
2. Use the available places and restaurants
3. Include realistic travel time between locations
4. Suggest affordable and authentic experiences
5. Include free or low-cost activities
6. Consider opening times and crowds
7. Add cultural insights and local tips

Return ONLY the JSON array, no other text."""

        response = self.invoke(system_prompt, user_prompt)

        try:
            response = self.extract_json(response)
            itinerary = json.loads(response)
            
            # Calculate total estimated cost
            total_estimated = 0
            for day in itinerary:
                cost_str = day.get("estimated_daily_cost", "$0")
                # Extract first number from cost range
                try:
                    cost = int(''.join(c for c in cost_str.split('-')[0] if c.isdigit()))
                    total_estimated += cost
                except:
                    pass
            
            # Add metadata
            for day in itinerary:
                day["destination"] = destination
                day["travel_type"] = travel_type

            return itinerary

        except json.JSONDecodeError as e:
            print(f"JSON decode error in itinerary agent: {e}")
            print(f"Response was: {response}")
            # Return a basic fallback itinerary structure
            return self._create_fallback_itinerary(duration, destination)

    def _create_fallback_itinerary(self, duration: int, destination: str) -> list:
        """Create a basic itinerary as fallback"""
        itinerary = []
        themes = [
            "Arrival & Orientation",
            "Main Attractions",
            "Local Experiences",
            "Adventure Activities",
            "Cultural Immersion",
            "Relaxation & Shopping",
            "Departure Day"
        ]

        for day in range(1, duration + 1):
            theme = themes[min(day - 1, len(themes) - 1)]
            itinerary.append({
                "day": day,
                "title": f"Day {day}: {theme}",
                "theme": theme,
                "destination": destination,
                "morning": {
                    "time": "08:00-12:00",
                    "activity": "Explore local area",
                    "description": "Start your day with breakfast and explore nearby attractions"
                },
                "lunch": {
                    "time": "12:00-14:00",
                    "restaurant": "Local restaurant",
                    "cuisine": "Local",
                    "estimated_cost": "$10-20"
                },
                "afternoon": {
                    "time": "14:00-18:00",
                    "activity": "Sightseeing",
                    "description": "Visit major attractions and landmarks"
                },
                "dinner": {
                    "time": "19:00-21:00",
                    "restaurant": "Local eatery",
                    "cuisine": "Local",
                    "estimated_cost": "$15-25"
                },
                "evening": {
                    "time": "21:00+",
                    "activity": "Relax at hotel",
                    "description": "Rest and prepare for tomorrow"
                },
                "estimated_daily_cost": "$100-200 per person"
            })

        return itinerary
