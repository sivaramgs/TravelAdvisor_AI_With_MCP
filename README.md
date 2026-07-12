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


## Installation

```bash
uv init
uv venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
uv add -r requirements.txt
```
