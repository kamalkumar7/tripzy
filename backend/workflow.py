from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from agents.extraction_agent import ExtractionAgent
from agents.place_agent import PlaceAgent
from agents.restaurants_agent import RestaurantsAgent
from agents.hotels_agent import HotelsAgent
from agents.itinerary_agent import ItineraryAgent

RATE_LIMIT_KEYWORDS = [
    '429', 'rate limit', 'rate_limit', 'quota', 'resource exhausted',
    'resourceexhausted', 'too many requests', 'ratelimiterror',
    'resource has been exhausted',
]

def _is_rate_limit_error(e: Exception) -> bool:
    return any(kw in str(e).lower() for kw in RATE_LIMIT_KEYWORDS)

class TravelPlanState(TypedDict):
    """State object for the travel planning workflow"""
    user_input: str
    travel_details: dict
    places: list
    restaurants: list
    hotels: list
    itinerary: list
    budget_breakdown: dict
    error: str | None

class TravelPlanWorkflow:
    """LangGraph workflow orchestrating multiple agents"""
    
    def __init__(self):
        self.extraction_agent = ExtractionAgent()
        self.places_agent = PlaceAgent()
        self.restaurants_agent = RestaurantsAgent()
        self.hotels_agent = HotelsAgent()
        self.itinerary_agent = ItineraryAgent()
        
        # Build the workflow graph
        self.workflow = self._build_workflow()

    def _build_workflow(self) -> StateGraph:
        """Build the langgraph workflow"""

        # create a graph
        workflow = StateGraph(TravelPlanState)
        
        # node for agents
        workflow.add_node("extract", self._extract_node)
        workflow.add_node("find_places", self._places_node)
        workflow.add_node("find_restaurants", self._restaurants_node)
        workflow.add_node("find_hotels", self._hotels_node)
        workflow.add_node("create_itinerary", self._itinerary_node)

        # define workflow edges
        workflow.set_entry_point("extract")
        workflow.add_edge("extract", "find_places")
        workflow.add_edge("find_places", "find_restaurants")
        workflow.add_edge("find_restaurants", "find_hotels")
        workflow.add_edge("find_hotels", "create_itinerary")
        workflow.add_edge("create_itinerary", END)

        return workflow.compile()

    def _extract_node(self, state: TravelPlanState) -> TravelPlanState:
        """Node for extraction agent"""
        print("Extracting travel details")
        try:
            travel_details = self.extraction_agent.extract_details(state['user_input'])
            print("🧠 Extracted raw:", travel_details)
            state['travel_details'] = travel_details
            print(f"✅ Extracted: {travel_details.get('destination')} - {travel_details.get('duration')} days")
        except Exception as e:
            if _is_rate_limit_error(e):
                print(f"⚠️ Rate limit hit during extraction: {e}")
                state['error'] = 'RATE_LIMIT'
            else:
                print(f"❌ Extraction error: {e}")
                state['error'] = str(e)
        return state
    
    def _places_node(self, state: TravelPlanState) -> TravelPlanState:
        """Node for places agent"""
        print("🏛️ Finding places to visit...")
        try:
            places = self.places_agent.find_places(state["travel_details"])
            state["places"] = places
            print(f"✅ Found {len(places)} places")
        except Exception as e:
            print(f"❌ Places error: {e}")
            state["places"] = []
        return state
    
    def _restaurants_node(self, state: TravelPlanState) -> TravelPlanState:
        """Node for restaurants agent"""
        print("🍽️ Finding restaurants...")
        try:
            restaurants = self.restaurants_agent.find_restaurants(state["travel_details"])
            state["restaurants"] = restaurants
            print(f"✅ Found {len(restaurants)} restaurants")
        except Exception as e:
            print(f"❌ Restaurants error: {e}")
            state["restaurants"] = []
        return state

    def _hotels_node(self, state: TravelPlanState) -> TravelPlanState:
        """Node for hotels agent"""
        print("🏨 Finding hotels...")
        try:
            hotels = self.hotels_agent.find_hotels(state["travel_details"])
            state["hotels"] = hotels
            print(f"✅ Found {len(hotels)} hotels")
        except Exception as e:
            print(f"❌ Hotels error: {e}")
            state["hotels"] = []
        return state
    
    def _itinerary_node(self, state: TravelPlanState) -> TravelPlanState:
        """Node for itinerary agent"""
        print("📅 Creating day-by-day itinerary...")
        try:
            itinerary = self.itinerary_agent.create_itinerary(state)
            state["itinerary"] = itinerary
            print(f"✅ Created {len(itinerary)} day itinerary")
            
            # Calculate budget breakdown
            state["budget_breakdown"] = self._calculate_budget(state)
            print(f"💰 Budget breakdown calculated")
        except Exception as e:
            print(f"❌ Itinerary error: {e}")
            state["itinerary"] = []
        return state

    def _calculate_budget(self, state: TravelPlanState) -> dict:
        import re

        def extract_cost(cost_str: str) -> float:
            """Extract numeric cost from string like '$50-100' or '$50'"""
            if not cost_str or cost_str == "Free" or cost_str == "N/A":
                return 0
            numbers = re.findall(r'\d+', str(cost_str))
            if numbers:
                if len(numbers) >= 2:
                    return (float(numbers[0]) + float(numbers[1])) / 2
                return float(numbers[0])
            return 0

        # Calculate accommodation cost
        hotels = state.get("hotels", [])
        hotel_costs = []
        for hotel in hotels:
            total_cost = extract_cost(hotel.get("total_estimated", "0"))
            hotel_costs.append(total_cost)
        
        accommodation_cost = min(hotel_costs) if hotel_costs else 0
        
        # Calculate food cost from itinerary
        food_cost = 0
        itinerary = state.get("itinerary", [])
        for day in itinerary:
            food_cost += extract_cost(day.get("estimated_cost", "0"))
        
        # Calculate activities/entry fees cost
        activities_cost = 0
        places = state.get("places", [])
        for place in places:
            activities_cost += extract_cost(place.get("entry_fee", "0"))
        
        # Estimate transportation (12% of budget)
        try:
            budget = float(state.get("travel_details", {}).get("budget", 2000))
        except (TypeError, ValueError):
            budget = 2000
        transportation_cost = budget * 0.12
        
        # Miscellaneous (8% of budget)
        miscellaneous_cost = budget * 0.08

        total_estimated = (
            accommodation_cost + food_cost + activities_cost +
            transportation_cost + miscellaneous_cost
        )
        
        remaining_budget = budget - total_estimated
        
        return {
            "accommodation": round(accommodation_cost, 2),
            "food": round(food_cost, 2),
            "activities": round(activities_cost, 2),
            "transportation": round(transportation_cost, 2),
            "miscellaneous": round(miscellaneous_cost, 2),
            "total_estimated": round(total_estimated, 2),
            "user_budget": budget,
            "remaining": round(remaining_budget, 2),
            "within_budget": remaining_budget >= 0
        }

    def plan_travel(self, user_input: str) -> dict:
        """Execute the full travel planning workflow"""
        print("\nStarting travel planning workflow...")
        print(f"User input: {user_input[:100]}...")
        
        state = {
            "user_input": user_input,
            "travel_details": {},
            "places": [],
            "restaurants": [],
            "hotels": [],
            "itinerary": [],
            "budget_breakdown": {},
            "error": None
        }

        state = self._extract_node(state)
        if state.get("error"):
            return {
                "travel_details": state.get("travel_details", {}),
                "places": [],
                "restaurants": [],
                "hotels": [],
                "itinerary": [],
                "budget_breakdown": {},
                "error": state.get("error")
            }

        travel_details = state.get("travel_details", {})
        agent_tasks = {
            "places": self.places_agent.find_places,
            "restaurants": self.restaurants_agent.find_restaurants,
            "hotels": self.hotels_agent.find_hotels,
        }

        with ThreadPoolExecutor(max_workers=len(agent_tasks)) as executor:
            future_to_key = {
                executor.submit(agent_func, travel_details): key
                for key, agent_func in agent_tasks.items()
            }
            for future in as_completed(future_to_key):
                key = future_to_key[future]
                try:
                    state[key] = future.result()
                    print(f"Found {len(state[key])} {key}")
                except Exception as e:
                    print(f"{key.title()} error: {e}")
                    state[key] = []

        try:
            state["itinerary"] = self.itinerary_agent.create_itinerary(state)
            state["budget_breakdown"] = self._calculate_budget(state)
        except Exception as e:
            print(f"Itinerary error: {e}")
            state["itinerary"] = []
            state["budget_breakdown"] = {}

        print("\nWorkflow complete!")
        return {
            "travel_details": state.get("travel_details", {}),
            "places": state.get("places", []),
            "restaurants": state.get("restaurants", []),
            "hotels": state.get("hotels", []),
            "itinerary": state.get("itinerary", []),
            "budget_breakdown": state.get("budget_breakdown", {}),
            "error": state.get("error")
        }
