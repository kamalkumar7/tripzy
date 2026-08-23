import json
import os
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from .base_agent import BaseAgent
from tavily import TavilyClient
from cache import cache
from config import CACHE_TTL_SECONDS

logger = logging.getLogger(__name__)

class SuggestionsAgent(BaseAgent):
    """Agent responsible for destination travel suggestions: clothing by season, scam warnings, and must-do activities."""

    def __init__(self):
        super().__init__()
        tavily_key = os.getenv("TAVILY_API_KEY")
        self.tavily = TavilyClient(api_key=tavily_key) if tavily_key else None

    def get_suggestions(self, travel_details: dict) -> dict:
        """Fetch seasonal clothing, scam warnings, and must-do activities for the destination."""
        destination = travel_details.get('destination', 'Unknown')
        interests = travel_details.get('interests', [])
        travel_type = travel_details.get('travel_type', 'General')

        # Tavily search for scams & seasonal travel advice
        search_results = []
        if self.tavily:
            try:
                query = f"tourist scams to avoid and seasonal clothing packing tips for {destination}"
                cache_key = cache.make_key("tavily-suggestions", query, 5)
                cached_results = cache.get_json(cache_key)
                if cached_results is not None:
                    search_results = cached_results
                else:
                    with ThreadPoolExecutor(max_workers=1) as executor:
                        future = executor.submit(self.tavily.search, query, max_results=5)
                        try:
                            search_response = future.result(timeout=15)
                            search_results = search_response.get('results', [])
                            cache.set_json(cache_key, search_results, CACHE_TTL_SECONDS)
                        except FutureTimeoutError:
                            logger.warning(f"Tavily search timeout for suggestions: {query}")
                            search_results = []
            except Exception as e:
                logger.warning(f"Tavily search error for suggestions: {e}")

        web_context = "\n".join([
            f"- {result.get('title', '')}: {result.get('content', '')[:200]}"
            for result in search_results[:5]
        ]) if search_results else "No web search data available."

        system_prompt = """You are an expert local concierge, security advisor, and seasoned world traveler.
Provide authentic, practical, and highly specific travel suggestions for the requested destination.
Return ONLY a valid JSON object matching the requested schema, nothing else."""

        user_prompt = f"""Generate comprehensive travel suggestions for {destination}.
Travel type: {travel_type}
Interests: {', '.join(interests) if interests else 'Sightseeing, Culture, Food'}

Web Research Context:
{web_context}

Return a JSON object with this exact structure:
{{
    "seasonal_clothing": {{
        "climate_overview": "1-2 sentences summarizing the climate and general dress culture in {destination}.",
        "seasons": [
            {{
                "season_name": "Summer / Warm Season (e.g. May - Aug)",
                "weather_summary": "e.g. 28°C - 35°C, hot & sunny",
                "clothing_items": [
                    "Lightweight breathable linen/cotton shirts",
                    "UV protection sunglasses and wide-brim hat",
                    "Comfortable cushioned walking shoes",
                    "Moisture-wicking shorts or lightweight trousers"
                ],
                "packing_essentials": [
                    "High-SPF sunscreen (SPF 50+)",
                    "Refillable insulated water bottle",
                    "Compact folding umbrella / UV parasol"
                ],
                "dress_code_tips": "Modesty rules for temples/sacred sites (cover shoulders & knees) or nightlife."
            }},
            {{
                "season_name": "Monsoon / Rainy Season (e.g. Sep - Nov)",
                "weather_summary": "e.g. 24°C - 30°C, sudden tropical downpours",
                "clothing_items": [
                    "Quick-dry t-shirts and light pants",
                    "Breathable waterproof light jacket or poncho",
                    "Water-resistant walking sandals or sneakers"
                ],
                "packing_essentials": [
                    "Windproof sturdy compact umbrella",
                    "Waterproof phone pouch / dry bag",
                    "Anti-frizz hair serum / quick-dry towel"
                ],
                "dress_code_tips": "Avoid floor-length trousers or delicate leather footwear on rainy days."
            }},
            {{
                "season_name": "Winter / Cool Season (e.g. Dec - Feb)",
                "weather_summary": "e.g. 18°C - 26°C, pleasant & breezy",
                "clothing_items": [
                    "Layerable cotton shirts and cardigans",
                    "Light denim or chinos",
                    "Comfortable slip-on walking shoes"
                ],
                "packing_essentials": [
                    "Light evening jacket or pashmina shawl",
                    "Hydrating moisturizer and lip balm"
                ],
                "dress_code_tips": "Air-conditioned malls and trains can be chilly; carry a light layer."
            }},
            {{
                "season_name": "Spring / Shoulder Season (e.g. Mar - Apr)",
                "weather_summary": "e.g. 23°C - 31°C, warm with clear skies",
                "clothing_items": [
                    "Casual tees, polo shirts, and sundresses",
                    "Supportive sneakers for sightseeing",
                    "UV sunglasses"
                ],
                "packing_essentials": [
                    "Mosquito / insect repellent spray",
                    "Electrolyte hydration packets"
                ],
                "dress_code_tips": "Smart casual attire is ideal for rooftop bars and restaurants."
            }}
        ],
        "general_dress_tips": [
            "Always dress respectfully at religious or historic monuments (cover shoulders and knees).",
            "Bring easily removable footwear for places where shoes must be taken off."
        ]
    }},
    "scams_and_safety": [
        {{
            "title": "Unmetered / Rigged Taxi Scam",
            "risk_level": "High",
            "description": "Drivers claiming meters are broken or refusing to use them, charging 3x-5x the standard rate.",
            "prevention": "Use official ride-hailing apps (Grab, Uber, Bolt) or buy fixed-fare coupons at official airport counters.",
            "warning_signs": "Driver says 'flat rate only' or claims the meter is faulty."
        }},
        {{
            "title": "Closed Landmark / Alternative Tour Trap",
            "risk_level": "Medium",
            "description": "Touts near major landmarks claim the site is closed for a holiday and steer you to high-commission souvenir shops or private boats.",
            "prevention": "Never believe street touts. Walk up directly to the official ticket counter to check opening hours.",
            "warning_signs": "Friendly stranger approaching you unsolicited near attraction entrances."
        }},
        {{
            "title": "Distraction Pickpocketing in Crowded Markets",
            "risk_level": "High",
            "description": "Commotions such as staged spills, accidental bumping, or sudden flower sellers used to distract while an accomplice takes your valuables.",
            "prevention": "Keep phones and wallets in front zip pockets or cross-body bags worn in front of your chest.",
            "warning_signs": "Sudden unusual commotion or multiple people crowding you closely."
        }},
        {{
            "title": "Overly Friendly Tea House / Bar Invite",
            "risk_level": "Medium",
            "description": "Strangers invite you to practice English or share drinks, leading you to a venue where you receive an inflated bill in the hundreds of dollars.",
            "prevention": "Politely decline invitations to private bars or tea houses with strangers you just met.",
            "warning_signs": "Strangers insisting on taking you to a specific hidden spot they recommend."
        }}
    ],
    "must_do_activities": [
        {{
            "title": "Golden Hour Rooftop / Scenic Sunset Vantage",
            "category": "Scenic Experience",
            "description": "Experience panoramic skyline and landscape views as the golden hour illuminates {destination}.",
            "insider_tip": "Arrive 45 minutes before sunset to grab the best viewing spot without extra reservation fees.",
            "best_time": "5:30 PM - 7:00 PM",
            "estimated_cost": "$10 - $25"
        }},
        {{
            "title": "Authentic Night Market Street Food Trail",
            "category": "Culinary & Culture",
            "description": "Immerse in vibrant local night markets tasting signature regional dishes prepared right in front of you.",
            "insider_tip": "Look for stalls with long lines of local residents — turnover is fast and food is fresh.",
            "best_time": "7:30 PM onwards",
            "estimated_cost": "$5 - $15"
        }},
        {{
            "title": "Dawn Heritage & Temple Awakening Walk",
            "category": "Cultural Exploration",
            "description": "Explore ancient architectural treasures and atmospheric lanes in serene morning tranquility before tour groups arrive.",
            "insider_tip": "Wear comfortable slip-on shoes for temple visits and arrive before 8:00 AM.",
            "best_time": "7:00 AM - 9:00 AM",
            "estimated_cost": "Free or low entry fee"
        }},
        {{
            "title": "Local Artisan Workshop / Hidden Alley Discovery",
            "category": "Unique & Offbeat",
            "description": "Discover local craft studios, bespoke coffee houses, and historic courtyards tucked behind main avenues.",
            "insider_tip": "Ask local shopkeepers for their favorite neighborhood café recommendations.",
            "best_time": "2:00 PM - 5:00 PM",
            "estimated_cost": "$15 - $35"
        }}
    ],
    "local_hacks_and_etiquette": [
        {{
            "topic": "Tipping Culture",
            "category": "Money",
            "tip": "Tipping norms for {destination}: service charge is often included, but small tips for good service are warmly welcomed."
        }},
        {{
            "topic": "Connectivity & SIMs",
            "category": "Tech",
            "tip": "Grab an e-SIM online before landing or purchase a tourist SIM card at the airport arrival terminal."
        }},
        {{
            "topic": "Public Transit Hacks",
            "category": "Transport",
            "tip": "Purchase a rechargeable transit card or use contactless credit cards for seamless metro and bus rides."
        }},
        {{
            "topic": "Cultural Etiquette",
            "category": "Etiquette",
            "tip": "Respect local customs regarding greetings, footwear removal, and voice volume in sacred or public spaces."
        }}
    ],
    "emergency_contacts": {{
        "police": "999 / 112",
        "ambulance": "999 / 112",
        "tourist_helpline": "Available at airport and central visitor centers",
        "emergency_notes": "Always carry a digital photo of your passport and insurance policy on your phone."
    }}
}}
Return ONLY valid JSON."""

        response = self.invoke(system_prompt, user_prompt)

        try:
            response = self.extract_json(response)
            suggestions = json.loads(response)
            return suggestions
        except Exception as e:
            logger.warning(f"Error parsing suggestions JSON: {e}")
            return self._fallback_suggestions(destination)

    def _fallback_suggestions(self, destination: str) -> dict:
        """Provide rich fallback suggestions if LLM or parsing fails."""
        return {
            "seasonal_clothing": {
                "climate_overview": f"The climate in {destination} varies by season, featuring distinct weather patterns throughout the year.",
                "seasons": [
                    {
                        "season_name": "Warm / Summer Season",
                        "weather_summary": "Warm & sunny (26°C - 33°C)",
                        "clothing_items": [
                            "Breathable linen & cotton tops",
                            "UV-filtering sunglasses & sunhat",
                            "Comfortable walking shoes/sandals",
                            "Light shorts & casual dresses"
                        ],
                        "packing_essentials": [
                            "Sunscreen SPF 50+",
                            "Refillable water bottle",
                            "Light folding umbrella"
                        ],
                        "dress_code_tips": "Modest clothing covering shoulders and knees is required at temples and historic monuments."
                    },
                    {
                        "season_name": "Rainy / Monsoon Season",
                        "weather_summary": "Showers with humid breaks (24°C - 30°C)",
                        "clothing_items": [
                            "Quick-drying t-shirts & light trousers",
                            "Lightweight waterproof jacket or poncho",
                            "Slip-resistant walking shoes"
                        ],
                        "packing_essentials": [
                            "Compact windproof umbrella",
                            "Waterproof phone case",
                            "Ziplock bags for electronics"
                        ],
                        "dress_code_tips": "Avoid trailing maxi dresses or delicate leather shoes on rainy days."
                    },
                    {
                        "season_name": "Cool / Winter Season",
                        "weather_summary": "Mild to crisp temperatures (16°C - 25°C)",
                        "clothing_items": [
                            "Layerable knitwear & cotton cardigans",
                            "Denim, chinos & comfortable pants",
                            "Cushioned walking sneakers"
                        ],
                        "packing_essentials": [
                            "Light evening jacket or scarf",
                            "Moisturizing lip balm & lotion"
                        ],
                        "dress_code_tips": "Carry a light sweater for air-conditioned indoor spaces."
                    }
                ],
                "general_dress_tips": [
                    "Dress respectfully when visiting places of worship.",
                    "Comfortable, broken-in footwear is essential for exploring on foot."
                ]
            },
            "scams_and_safety": [
                {
                    "title": "Unmetered Taxi Overcharging",
                    "risk_level": "High",
                    "description": "Drivers claiming meters are broken and asking for exorbitant upfront prices.",
                    "prevention": "Insist on the meter or use reputable ride-hailing apps like Grab or Uber.",
                    "warning_signs": "Driver refuses meter or offers a 'special deal' without meter."
                },
                {
                    "title": "Closed Landmark Misdirection",
                    "risk_level": "Medium",
                    "description": "Touts claim attractions are closed and offer alternative paid tours to commission stores.",
                    "prevention": "Always verify opening hours directly at the main ticket office.",
                    "warning_signs": "Unsolicited street guides approaching near entrance gates."
                },
                {
                    "title": "Crowded Market Pickpocketing",
                    "risk_level": "High",
                    "description": "Pickpockets operating in busy night markets and transit stations using bump-and-grab tactics.",
                    "prevention": "Keep cash and phone in front zip pockets or a secured crossbody pouch.",
                    "warning_signs": "Sudden artificial jostling or staged distractions."
                }
            ],
            "must_do_activities": [
                {
                    "title": "Iconic Sunset Skyline Vantage",
                    "category": "Scenic",
                    "description": f"Catch breathtaking sunset views over {destination} from an elevated observation deck or rooftop venue.",
                    "insider_tip": "Arrive 45 minutes before sunset for prime photo spots.",
                    "best_time": "5:30 PM - 7:00 PM",
                    "estimated_cost": "$15 - $30"
                },
                {
                    "title": "Local Street Food & Hawker Trail",
                    "category": "Culinary",
                    "description": "Sample famous local delicacies and authentic culinary specialties freshly cooked at lively food stalls.",
                    "insider_tip": "Follow queues of local families for the freshest dishes.",
                    "best_time": "Evening dinner hours",
                    "estimated_cost": "$5 - $15"
                },
                {
                    "title": "Historic Old Town Morning Walk",
                    "category": "Culture",
                    "description": f"Wander the historic heritage quarter of {destination} in the peaceful morning hours.",
                    "insider_tip": "Start early before crowds and midday heat peak.",
                    "best_time": "7:30 AM - 9:30 AM",
                    "estimated_cost": "Free"
                }
            ],
            "local_hacks_and_etiquette": [
                {
                    "topic": "Tipping",
                    "category": "Money",
                    "tip": "Check if a 10% service charge is on the bill; modest extra tips are appreciated."
                },
                {
                    "topic": "Connectivity",
                    "category": "Tech",
                    "tip": "Purchase an e-SIM before travel or get a local tourist SIM card upon airport arrival."
                },
                {
                    "topic": "Transport",
                    "category": "Transport",
                    "tip": "Use transit cards or mobile ride apps for convenient, fair-priced local travel."
                }
            ],
            "emergency_contacts": {
                "police": "112 / 999",
                "ambulance": "112 / 999",
                "tourist_helpline": "Available at major tourist visitor information centers",
                "emergency_notes": "Keep copies of passport and emergency travel insurance accessible offline."
            }
        }
