# ⚡ TRIPZY - QUICK START GUIDE

## 📋 What You Need to Do (3 Steps)

### Step 1: Add Environment Variables
Create `.env` in project root (`tripzy/.env`):
```env
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_API_KEY=your-key
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4-turbo
TAVILY_API_KEY=tvly-xxxx
GOOGLE_API_KEY=your-google-key
GOOGLE_SEARCH_ENGINE_ID=xxxxx
GOOGLE_PLACES_API_KEY=your-google-key
PEXELS_API_KEY=your-pexels-key
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 2: Install & Run Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
python app.py
```

✅ Server ready at: http://localhost:5000

### Step 3: Test It!
```bash
# In another terminal
curl http://localhost:5000/api/health

# Or create a trip
curl -X POST http://localhost:5000/api/plan \
  -H "Content-Type: application/json" \
  -d '{"user_input":"5 day trip to Paris with 3000 budget"}'
```

---

## 🔑 Where to Get API Keys

| Key | Website | Time |
|-----|---------|------|
| Azure OpenAI | portal.azure.com | 5 min |
| Tavily | tavily.com | 1 min |
| Google APIs | console.cloud.google.com | 10 min |
| Pexels | pexels.com/api | 1 min |

---

## 🚀 Frontend (When Ready)
```bash
cd frontend/tripzy
npm install
npm run dev
# Visit http://localhost:3000
```

---

## 📊 What Works

✅ Extract travel details from user input  
✅ Find attractions via web search  
✅ Find restaurants via web search  
✅ Find hotels with pricing  
✅ Create day-by-day itinerary  
✅ Calculate budget breakdown  
✅ REST API endpoints  
✅ Error handling & fallbacks  

---

## 🎯 Flow

```
User Input → LangGraph Agents → Travel Plan
   "5 day Paris trip"
         ↓
   Extraction Agent
   Places Agent (Tavily Search)
   Restaurants Agent (Tavily Search)
   Hotels Agent (Tavily Search)
   Itinerary Agent (Day-by-day plan)
         ↓
   {travel_details, places, restaurants, hotels, itinerary, budget}
```

---

## ⚠️ Common Issues

| Problem | Solution |
|---------|----------|
| "No module named openai" | `pip install -r requirements.txt` |
| Port 5000 in use | Change `FLASK_PORT` in .env to 5001 |
| Azure OpenAI fails | Check ENDPOINT (ends with `/`) and API_KEY |
| API key not working | Paste from dashboard (no extra spaces) |
| CORS error | Already enabled in backend |

---

## 📞 Support Files

- `SETUP_GUIDE.md` - Complete setup instructions
- `IMPLEMENTATION_COMPLETE.md` - Detailed summary
- `backend/test_workflow.py` - Python test script

---

## 🎉 Project Status

- ✅ Backend: Complete & Tested
- ✅ API Endpoints: Ready
- ✅ Agents: All Implemented
- ⏳ Frontend: Needs UI Implementation
- ⏳ Database: Optional

**Ready to run after adding .env keys!**
