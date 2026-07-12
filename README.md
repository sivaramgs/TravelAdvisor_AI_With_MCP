# TravelAdvisor_AI_With_MCP

Mult-Agent AI travel planner that turns a user trip request into a perfect travel plan with flight and hotel suggestions, weather details, and a complete itinerary. The project uses a multi-agent workflow built with LangGraph, LangChain, FastAPI and MCP tools (Tavily (Remote), AviationStack (local), wealther (local custom)).

## Why this project?

Planning a trip usually means jumping between multiple websites, tools, and spreadsheets. This project brings that flow into one experience by combining:

- a flight-search agent,
- a hotel-research agent,
- a weather agent,
- an itinerary-planning agent, and
- a final response agent,

all coordinated through a LangGraph workflow with MCP-based tool integrations.

## Features

- ✈️ Flight research using AviationStack
- 🏨 Hotel suggestions using Tavily search
- 🌤 Weather lookup via a custom MCP tool
- 🧠 Multi-agent orchestration with LangGraph and MCP
- 📝 Structured travel itinerary generation
- 🌐 FastAPI backend with a simple web interface
- 💾 Conversation state persistence using PostgreSQL
- ⚡ LLM-powered responses with Groq

## Tech Stack

- Python 3.12+
- FastAPI
- Jinja2 + HTML/CSS/JavaScript frontend
- LangGraph
- LangChain
- Groq LLMs
- PostgreSQL
- Tavily API
- AviationStack API
- MCP via `langchain-mcp-adapters` and `mcp`


## Prerequisites

Before running the project locally, make sure you have:

- Python 3.12 or newer installed
- PostgreSQL running and accessible
- API keys for:
  - Groq
  - Tavily
  - AviationStack
  - OpenWeather
- `uvx` available for local `aviationstack-mcp` usage (or adjust `mcp_client.py` accordingly)

## State and MCP Integration

This project integrates MCP in several places:

- `Tavily` search uses a remote MCP endpoint at `https://mcp.tavily.com/mcp/`
- `AviationStack` uses a local stdio MCP command: `uvx aviationstack-mcp`
- `Weather` is implemented with a custom local MCP server in `weather_mcp_custom_local.py`

The MCP client is defined in `mcp_client.py`, which exposes async helper functions for:

- `tavily_mcp_search`
- `aviation_mcp_call`
- `weather_mcp_search`
- `forecast_mcp_search`
- `extract_destination`

The main travel workflow in `backend.py` calls these helpers from the flight, hotel, and weather agents.


## Installation

```bash
uv init
uv venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
uv add -r requirements.txt
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
GROK_API_KEY=""
AVIATIONSTACK_API_KEY=""
TAVILY_API_KEY=""
DEFAULT_ORIGIN_DATA=""
OPENWEATHER_API_KEY=""
DATABASE_URL=
LANGSMITH_TRACING=""
LANGSMITH_ENDPOINT=""
LANGSMITH_PROJECT=""
LANGSMITH_API_KEY=""
```

## Running the App

Start the FastAPI server:

```bash
uv run app.py
```

Then open your browser at:

```text
http://127.0.0.1:8000/
```

## Using MCP Tools

The app uses MCP behind the scenes, so there is no separate frontend change required after the environment is set up.

If you need to customize the weather MCP server command, edit `mcp_client.py` and update the `weather` tool path to your local Python environment.

## API Endpoints

- GET /health - Health check
- POST /api/travel - Submit a travel request

Example request:

```bash
curl -X POST http://127.0.0.1:8000/api/travel \
  -H "Content-Type: application/json" \
  -d '{"message":"Plan a 3-day trip to Tokyo with a budget of $1200"}'
```

## How the Workflow Works

1. The user submits a travel request.
2. The flight agent uses MCP-backed AviationStack data.
3. The hotel agent uses a remote Tavily MCP search.
4. The weather agent calls the custom weather MCP server.
5. The itinerary agent creates a practical travel plan.
6. The final response is returned through the web API.

