import json
from .base_agent import BaseAgent

class ExtractionAgent(BaseAgent):
    """Agent responsible for the extracting useful information from the user's prompt"""

    def extract_details(self, user_input:str) -> dict:
        
        system_prompt = "You are a travel data extraction expert. Extract travel information and return ONLY valid JSON, nothing else. If information is missing, make reasonable estimates based on context."

        user_prompt= f""" Extract the following information from the user's travel request:

        User_Request : "{user_input}"

        Return a JSON object with:

            {{

            "destination": "city, country",
            "duration": number of days (estimate if not specified, default 7),
            "budget": estimated budget in USD (estimate if not specified, default 2000),
            "travel_type": "Adventure/Cultural/Relaxation/Family/Romantic/Business/Solo",
            "travelers": number of people (default 2),
            "interests": ["interest1", "interest2", ...],
            "overview": "brief 2-3 sentence destination overview with highlights"

    }}
    Return ONLY the JSON object, no other text.
    """
        
        response = self.invoke(system_prompt, user_prompt)
        print(response)

        try:
            response = response.strip()
            if(response.startswith("```json")):
                response = response[7:]
            if(response.startswith("```")):
                response = response[3:]
            if(response.endswith("```")):
                response = response[:-3]
            response = response.strip()

            return json.loads(response)
        except json.JSONDecodeError as e:

            print(f"JSON decode error: {e}")
            print(f"Response was: {response}")

            return {
                "destination":"unknown",
                "duration":7,
                "budget":"2000",
                "travel_type":"General",
                "travelers":2,
                "interests":["sightseeing"],
                "overview":"Exciting destination to explore"
            }