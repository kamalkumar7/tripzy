import logging
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError as FutureTimeoutError
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from agents.extraction_agent import ExtractionAgent
from agents.place_agent import PlaceAgent
from agents.restaurants_agent import RestaurantsAgent
from agents.hotels_agent import HotelsAgent
from agents.itinerary_agent import ItineraryAgent

# Force UTF-8 on stdout/stderr so emoji in log messages don't crash on Windows CP1252
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', line_buffering=True)

logger = logging.getLogger(__name__)

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
        logger.info("Extracting travel details")
        try:
            travel_details = self.extraction_agent.extract_details(state['user_input'])
            logger.info("Extracted raw: %s", travel_details)
            state['travel_details'] = travel_details
            logger.info("Extracted: %s - %s days", travel_details.get('destination'), travel_details.get('duration'))
        except Exception as e:
            if _is_rate_limit_error(e):
                logger.warning("Rate limit hit during extraction: %s", e)
                state['error'] = 'RATE_LIMIT'
            else:
                logger.error("Extraction error: %s", e)
                state['error'] = str(e)
        return state
    
    def _places_node(self, state: TravelPlanState) -> TravelPlanState:
        """Node for places agent"""
        logger.info("Finding places to visit...")
        try:
            places = self.places_agent.find_places(state["travel_details"])
            state["places"] = places
            logger.info("Found %d places", len(places))
        except Exception as e:
            logger.error("Places error: %s", e)
            state["places"] = []
        return state
    
    def _restaurants_node(self, state: TravelPlanState) -> TravelPlanState:
        """Node for restaurants agent"""
        logger.info("Finding restaurants...")
        try:
            restaurants = self.restaurants_agent.find_restaurants(state["travel_details"])
            state["restaurants"] = restaurants
            logger.info("Found %d restaurants", len(restaurants))
        except Exception as e:
            logger.error("Restaurants error: %s", e)
            state["restaurants"] = []
        return state

    def _hotels_node(self, state: TravelPlanState) -> TravelPlanState:
        """Node for hotels agent"""
        logger.info("Finding hotels...")
        try:
            hotels = self.hotels_agent.find_hotels(state["travel_details"])
            state["hotels"] = hotels
            logger.info("Found %d hotels", len(hotels))
        except Exception as e:
            logger.error("Hotels error: %s", e)
            state["hotels"] = []
        return state
    
    def _itinerary_node(self, state: TravelPlanState) -> TravelPlanState:
        """Node for itinerary agent"""
        logger.info("Creating day-by-day itinerary...")
        try:
            itinerary = self.itinerary_agent.create_itinerary(state)
            state["itinerary"] = itinerary
            logger.info("Created %d day itinerary", len(itinerary))
            state["budget_breakdown"] = self._calculate_budget(state)
            logger.info("Budget breakdown calculated")
        except Exception as e:
            logger.error("Itinerary error: %s", e)
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
            lunch = day.get("lunch", {}) or {}
            dinner = day.get("dinner", {}) or {}
            lunch_cost = extract_cost(lunch.get("estimated_cost", "0"))
            dinner_cost = extract_cost(dinner.get("estimated_cost", "0"))
            food_cost += (lunch_cost + dinner_cost)
        
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

    def plan_travel(self, user_input: str, *, job_id: str | None = None, store=None) -> dict:
        """Execute the full travel planning workflow"""
        logger.info("\nStarting travel planning workflow...")
        logger.info(f"User input: {user_input[:100]}...")

        def _push_partial(partial_state: dict):
            if store and job_id:
                try:
                    store.update_partial(job_id, {
                        "travel_details": partial_state.get("travel_details", {}),
                        "places":         partial_state.get("places", []),
                        "restaurants":    partial_state.get("restaurants", []),
                        "hotels":         partial_state.get("hotels", []),
                        "itinerary":      partial_state.get("itinerary", []),
                        "budget_breakdown": partial_state.get("budget_breakdown", {}),
                        "error":          partial_state.get("error"),
                    })
                except Exception as pe:
                    logger.info(f"Partial update error: {pe}")
        
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

        # Push travel_details immediately so UI can show destination info
        _push_partial(state)

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
            for future in as_completed(future_to_key, timeout=90):  # 90 second timeout for all tasks
                key = future_to_key[future]
                try:
                    # Individual task timeout of 60 seconds
                    state[key] = future.result(timeout=60)
                    logger.info(f"Found {len(state[key])} {key}")
                except FutureTimeoutError:
                    logger.warning(f"{key.title()} task timed out after 60 seconds")
                    state[key] = []
                except Exception as e:
                    logger.info(f"{key.title()} error: {e}")
                    state[key] = []
                # Push partial result after every section completes
                _push_partial(state)

        try:
            state["itinerary"] = self.itinerary_agent.create_itinerary(state)
            state["budget_breakdown"] = self._calculate_budget(state)
        except Exception as e:
            logger.info(f"Itinerary error: {e}")
            state["itinerary"] = []
            state["budget_breakdown"] = {}

        _push_partial(state)
        logger.info("\nWorkflow complete!")
        return {
            "travel_details": state.get("travel_details", {}),
            "places": state.get("places", []),
            "restaurants": state.get("restaurants", []),
            "hotels": state.get("hotels", []),
            "itinerary": state.get("itinerary", []),
            "budget_breakdown": state.get("budget_breakdown", {}),
            "error": state.get("error")
        }
