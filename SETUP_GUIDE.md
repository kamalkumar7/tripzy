# Tripzy - Local Setup & Run Guide

## Project Overview

**Tripzy** is an AI-powered travel planning application that uses multiple agents to create comprehensive travel plans.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                    │
│                   - Next.js 16.2.9                      │
│                   - TypeScript                          │
│                   - Tailwind CSS                        │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP Requests
                  ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Flask)                        │
│              - POST /api/plan                           │
│              - GET /api/health                          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│        LangGraph Workflow (Multi-Agent Orchestration)   │
│                                                         │
│  User Input → Extraction → Places → Restaurants →      │
│              Hotels → Itinerary → Response             │
│                                                         │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┼─────────┬────────────┐
        ▼         ▼         ▼            ▼
    ┌────────┐ ┌──────┐ ┌────────┐ ┌──────────┐
    │ Azure  │ │Tavily│ │Pexels  │ │ Google   │
    │OpenAI  │ │Search│ │Images  │ │ Maps     │
    └────────┘ └──────┘ └────────┘ └──────────┘
```

### Code Flow

1. **ExtractionAgent** - Parses user natural language input, extracts:
   - Destination city
   - Trip duration
   - Budget
   - Travel type (adventure, cultural, etc.)
   - Number of travelers
   - Interests/preferences

2. **PlaceAgent** - Finds tourist attractions:
   - Uses Tavily API for web search
   - Uses Azure OpenAI to structure results
   - Gets images from Pexels API
   - Generates Google Maps links

3. **RestaurantsAgent** - Finds dining options:
   - Web search for local restaurants
   - Filters by budget and cuisine preferences
   - Adds images and location details

4. **HotelsAgent** - Finds accommodation:
   - Searches for hotels by budget level
   - Includes amenities and ratings
   - Calculates total costs for the trip

5. **ItineraryAgent** - Creates day-by-day plan:
   - Schedules activities realistically
   - Balances sightseeing with rest
   - Includes meal times and costs
   - Suggests transportation between locations

6. **Budget Calculator** - Calculates:
   - Accommodation costs
   - Food costs
   - Activity/entry fees
   - Transportation (estimated)
   - Miscellaneous (estimated)
   - Total vs. user budget

---

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+ (for frontend)
- pip and npm package managers

### Step 1: Backend Setup

#### 1.1 Navigate to backend directory
```bash
cd backend
```

#### 1.2 Create Python virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 1.3 Install dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Environment Variables Configuration

Create a `.env` file in the **project root** (`tripzy/.env`) with the following variables:

```env
# ========================================
# AZURE OPENAI CONFIGURATION
# ========================================
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key-here
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name

# ========================================
# TAVILY API (Web Search)
# ========================================
TAVILY_API_KEY=tvly-your-api-key-here

# ========================================
# GOOGLE APIs
# ========================================
GOOGLE_API_KEY=your-google-api-key-here
GOOGLE_SEARCH_ENGINE_ID=your-custom-search-engine-id-here
GOOGLE_PLACES_API_KEY=your-google-places-api-key-here

# ========================================
# PEXELS API (Images)
# ========================================
PEXELS_API_KEY=your-pexels-api-key-here

# ========================================
# FLASK CONFIGURATION
# ========================================
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000

# ========================================
# FRONTEND CONFIGURATION
# ========================================
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Get API Keys

#### Azure OpenAI
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create an Azure OpenAI resource (or use existing)
3. Deploy a model (gpt-4-turbo, gpt-4o, or similar)
4. Go to "Keys & Endpoint" section
5. Copy the endpoint and API key

#### Tavily API (Web Search)
1. Go to [Tavily.com](https://tavily.com/)
2. Sign up for free
3. Copy your API key from dashboard

#### Google APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use existing
3. Enable "Custom Search API" and "Places API"
4. Create credentials → API key
5. Restrict key to Custom Search API and Places API
6. For Custom Search Engine ID:
   - Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
   - Create a search engine to search the entire web
   - Copy the Search Engine ID

#### Pexels API
1. Go to [Pexels Developer](https://www.pexels.com/api/)
2. Sign up for free
3. Copy your API key

---

## Running Locally

### Option 1: Backend Only (API Server)

#### Terminal 1 - Start Flask Backend
```bash
cd backend
# Activate virtual environment (if not already activated)
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Run the server
python app.py
```

Expected output:
```
WARNING in app.run() is not recommended for use in development...
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

#### Test the API
```bash
# Health check
curl http://localhost:5000/api/health

# Create a travel plan (POST request)
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{"user_input": "Plan a 5-day trip to Paris with 3000 dollar budget"}'
```

### Option 2: Full Stack (Backend + Frontend)

#### Terminal 1 - Start Backend
```bash
cd backend
python app.py
# Runs on http://localhost:5000
```

#### Terminal 2 - Start Frontend
```bash
cd frontend/tripzy

# Install dependencies (first time only)
npm install

# Run development server
npm run dev
# Runs on http://localhost:3000
```

Visit `http://localhost:3000` in your browser.

---

## Testing Workflow Manually

### Test Script (test_workflow.py)

Create a file `backend/test_workflow.py`:

```python
from workflow import TravelPlanWorkflow

# Initialize workflow
workflow = TravelPlanWorkflow()

# Test input
user_input = "I want to plan a 7-day trip to Tokyo with a budget of $4000. I'm interested in temples, food, and technology."

# Run workflow
result = workflow.plan_travel(user_input)

# Print results
print("\n=== TRAVEL PLAN RESULT ===")
print(f"\nDestination: {result['travel_details'].get('destination')}")
print(f"Duration: {result['travel_details'].get('duration')} days")
print(f"Budget: ${result['travel_details'].get('budget')}")

print(f"\n🏛️ Found {len(result['places'])} places to visit")
print(f"🍽️ Found {len(result['restaurants'])} restaurants")
print(f"🏨 Found {len(result['hotels'])} hotels")
print(f"📅 Generated {len(result['itinerary'])} day itinerary")

print(f"\n💰 Budget Breakdown:")
for key, value in result['budget_breakdown'].items():
    print(f"  {key}: ${value if isinstance(value, (int, float)) else value}")
```

Run it:
```bash
cd backend
python test_workflow.py
```

---

## Environment Variables Explained

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI API endpoint | Azure Portal → Keys & Endpoint |
| `AZURE_OPENAI_API_KEY` | Authentication key | Azure Portal → Keys & Endpoint |
| `AZURE_OPENAI_API_VERSION` | API version | Use `2024-08-01-preview` |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Deployed model name | Azure Portal → Deployments |
| `TAVILY_API_KEY` | Web search API | [Tavily Dashboard](https://tavily.com/) |
| `GOOGLE_API_KEY` | Google APIs authentication | Google Cloud Console |
| `GOOGLE_SEARCH_ENGINE_ID` | Custom Search Engine ID | Programmable Search Engine |
| `PEXELS_API_KEY` | Image search API | [Pexels Developer](https://www.pexels.com/api/) |
| `FLASK_ENV` | Flask environment | Set to `development` locally |
| `FLASK_DEBUG` | Enable debug mode | Set to `True` for development |
| `FLASK_PORT` | Port number | Default: `5000` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## API Endpoints

### 1. Health Check
```
GET /api/health

Response:
{
  "status": "healthy",
  "message": "API is running",
  "version": "0.1.0"
}
```

### 2. Create Travel Plan
```
POST /api/plan

Request Body:
{
  "user_input": "I want a 5-day trip to Paris with 3000 budget"
}

Response:
{
  "travel_details": {
    "destination": "Paris, France",
    "duration": 5,
    "budget": 3000,
    "travel_type": "Cultural",
    "travelers": 2,
    "interests": ["museums", "restaurants", "history"],
    "overview": "..."
  },
  "places": [
    {
      "name": "Eiffel Tower",
      "description": "...",
      "category": "Landmark",
      "rating": 4.8,
      "image_url": "...",
      "maps_link": "..."
    }
  ],
  "restaurants": [...],
  "hotels": [...],
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival & City Overview",
      "morning": {...},
      "afternoon": {...},
      "evening": {...}
    }
  ],
  "budget_breakdown": {
    "accommodation": 1000,
    "food": 800,
    "activities": 400,
    "transportation": 360,
    "miscellaneous": 240,
    "total_estimated": 2800,
    "remaining": 200,
    "within_budget": true
  }
}
```

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'openai'"
**Solution:** Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: "Azure OpenAI API connection failed"
**Solution:**
1. Verify `AZURE_OPENAI_ENDPOINT` - should end with `/`
2. Check `AZURE_OPENAI_API_KEY` is correct
3. Verify deployment exists in Azure Portal

### Issue: "Tavily API key invalid"
**Solution:** Copy key directly from Tavily dashboard without extra spaces

### Issue: "CORS error when frontend calls backend"
**Solution:** Ensure Flask app has CORS enabled (already included in app.py)

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Change port in .env
FLASK_PORT=5001

# Or kill the process using port 5000
# Windows: netstat -ano | findstr :5000
# macOS/Linux: lsof -i :5000 | kill -9 <PID>
```

---

## Project Structure

```
tripzy/
├── .env                          # Environment variables (CREATE THIS)
├── README.md
├── backend/
│   ├── app.py                   # Flask API server
│   ├── workflow.py              # LangGraph workflow
│   ├── requirements.txt          # Python dependencies
│   ├── helpers.py               # Helper functions
│   ├── google_helper.py         # Google APIs (unused)
│   └── agents/
│       ├── __init__.py
│       ├── base_agent.py        # Base agent with LLM
│       ├── extraction_agent.py  # Extract travel details
│       ├── place_agent.py       # Find attractions
│       ├── restaurants_agent.py # Find restaurants
│       ├── hotels_agent.py      # Find hotels
│       └── itinerary_agent.py   # Create day-by-day plan
└── frontend/
    └── tripzy/
        ├── package.json
        ├── next.config.ts
        ├── tsconfig.json
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx         # Main page (needs implementation)
        │   └── globals.css
        └── components/
            └── ui/
                └── button.tsx
```

---

## Next Steps

1. ✅ Create `.env` file with all API keys
2. ✅ Install backend dependencies
3. ✅ Start Flask backend server
4. ✅ Test API endpoints
5. Build frontend UI in `frontend/tripzy/app/page.tsx`
6. Integrate API calls in frontend
7. Deploy to production

---

## Support

For issues:
1. Check the Troubleshooting section above
2. Verify all environment variables are set correctly
3. Check terminal output for detailed error messages
4. Ensure all API keys are valid and have necessary permissions
