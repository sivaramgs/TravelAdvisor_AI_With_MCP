from mcp.server.fastmcp import FastMCP
import requests
import os
from dotenv import load_dotenv

load_dotenv()

mcp = FastMCP("Custom Open Weather MCP Server")

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

@mcp.tool()
def get_current_weather(city: str):
    response = requests.get(
      "https://api.openweathermap.org/data/2.5/weather",
      params={
          "q":city,
          "appid":OPENWEATHER_API_KEY,
          "units":"metricß"
      }  
    )

    data = response.json()
    if response.status_code  !=200:
        return data
    
    return {
        "city": data["name"],
        "temperature_c": data["main"]["temp"],
        "feels_like_c": data["main"]["feels_like"],
        "humidity": data["main"]["humidity"],
        "condition": data["weather"][0]["description"],
    }

@mcp.tool()
def get_weather_forecast(city: str):
    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric"
    }

    response = requests.get(
        "https://api.openweathermap.org/data/2.5/forecast",
        params=params
    )

    data = response.json()

    forecast = []

    # Return first 5 forecast entries
    for item in data["list"][:5]:

        forecast.append(
            {
                "datetime": item["dt_txt"],
                "temperature": item["main"]["temp"],
                "weather": item["weather"][0]["description"]
            }
        )

    return {
        "city": city,
        "forecast": forecast
    }


if __name__ == "__main__":
    mcp.run()