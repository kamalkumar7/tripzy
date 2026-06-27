# Tripzy

Tripzy is an AI-powered travel planning application that helps users create personalized trip plans with destination insights, recommendations for places to visit, restaurants, hotels, and a day-by-day itinerary.

## Features

- AI-generated travel planning flow
- Destination extraction from natural language prompts
- Recommendations for places, restaurants, and hotels
- Budget breakdown and itinerary generation
- Modern frontend experience built with Next.js

## Project Structure

- backend/ - Flask API and LangGraph-based travel planning workflow
- frontend/tripzy/ - Next.js frontend UI

## Prerequisites

Make sure you have the following installed:

- Python 3.10+
- Node.js 18+
- npm
- Git

## 1. Clone the repository

```bash
git clone <your-repo-url>
cd tripzy
```

## 2. Backend setup

### Create and activate a virtual environment

On Windows PowerShell:

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
```

On Git Bash / macOS / Linux:

```bash
cd backend
python -m venv venv
source venv/Scripts/activate
```

### Install backend dependencies

```bash
pip install -r requirements.txt
```

### Configure environment variables

Create a `.env` file in the project root (`tripzy/.env`) with the required keys:

```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
TAVILY_API_KEY=your-tavily-api-key
GOOGLE_API_KEY=your-google-api-key
GOOGLE_SEARCH_ENGINE_ID=your-custom-search-engine-id
GOOGLE_PLACES_API_KEY=your-google-api-key
PEXELS_API_KEY=your-pexels-api-key
FLASK_ENV=development
FLASK_DEBUG=False
FLASK_PORT=5000
FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
TRIPZY_AUTH_REQUIRED=false
TRIPZY_API_KEYS=
TRIPZY_PLAN_RATE_LIMIT=5 per minute
TRIPZY_PLAN_DAILY_QUOTA=20 per day
MAX_CONTENT_LENGTH_BYTES=16384
MAX_USER_INPUT_CHARS=1000
REQUEST_TIMEOUT_SECONDS=30
PLAN_TIMEOUT_SECONDS=120
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Start the backend

```bash
cd backend
python app.py
```

The backend will run at:

```text
http://localhost:5000
```

### Test the backend

Health check:

```bash
curl http://localhost:5000/api/health
```

Example travel-plan request:

```bash
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{"user_input":"Plan a 5-day trip to Paris with a budget of 3000 dollars"}'
```

## 3. Frontend setup

### Install frontend dependencies

```bash
cd frontend/tripzy
npm install
```

### Start the frontend

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:3000
```

## 4. Run both together

Open two terminals:

- Terminal 1: start the backend
- Terminal 2: start the frontend

Then visit:

```text
http://localhost:3000
```

## 5. Notes

- The frontend expects the backend to be available at `http://localhost:5000`
- If you want to enable API key auth for production, set `TRIPZY_AUTH_REQUIRED=true` and provide a value in `TRIPZY_API_KEYS`
- For full travel plans, make sure your OpenAI, Tavily, Google, and Pexels keys are valid

## Troubleshooting

If the backend does not start:

- confirm your `.env` file exists in the project root
- confirm your Python packages are installed
- check the terminal output for missing package or environment errors

If the frontend cannot reach the backend:

- ensure the backend is running on port 5000
- verify `NEXT_PUBLIC_API_URL` in `.env` points to the backend
