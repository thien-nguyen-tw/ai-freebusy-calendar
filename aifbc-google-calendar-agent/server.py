#!/usr/bin/env python
"""
Flask server to expose Google Calendar functionality to Express server.
"""
import os
import sys
import json
from datetime import datetime, timedelta
from typing import Optional
import pytz

from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
import google.generativeai as genai
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events.freebusy",
]

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


def get_credentials():
    """Get valid user credentials from storage or user input."""
    creds = None
    # The file token.json stores the user's access and refresh tokens.
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            print(f"Starting OAuth server on http://localhost:8080")
            creds = flow.run_local_server(port=8080)

        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    return creds


def get_service():
    """Get Google Calendar service using OAuth credentials."""
    try:
        creds = get_credentials()
        service = build("calendar", "v3", credentials=creds)
        return service
    except FileNotFoundError:
        raise Exception("credentials.json not found")
    except Exception as e:
        raise Exception(f"Error building service: {e}")


def get_gemini_model():
    """Get Gemini AI model."""
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise Exception("GEMINI_API_KEY not found in environment variables")

    try:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        return model
    except Exception as e:
        raise Exception(f"Error configuring Gemini: {e}")


def convert_to_timezone(date_str: str, timezone_str: str = "Asia/Bangkok") -> str:
    """Convert a date string to the specified timezone."""
    try:
        # Parse the date string
        if "T" in date_str:
            # ISO format with time
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        else:
            # Date only
            dt = datetime.strptime(date_str, "%Y-%m-%d")

        # Convert to target timezone
        target_tz = pytz.timezone(timezone_str)
        if dt.tzinfo is None:
            # If no timezone info, assume UTC
            dt = pytz.utc.localize(dt)

        converted_dt = dt.astimezone(target_tz)

        # Format based on whether it's date-only or datetime
        if "T" in date_str:
            return converted_dt.strftime("%Y-%m-%d %H:%M:%S")
        else:
            return converted_dt.strftime("%Y-%m-%d")
    except Exception as e:
        print(f"Error converting timezone: {e}")
        return date_str


def get_calendar_data(service, days=30, timezone_str="Asia/Bangkok"):
    """Get calendar data for AI analysis."""
    try:
        # Get events for the next N days
        now = datetime.utcnow().isoformat() + "Z"
        end_date = (datetime.utcnow() + timedelta(days=days)).isoformat() + "Z"

        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=now,
                timeMax=end_date,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])

        # Format events for AI analysis
        formatted_events = []
        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            end = event["end"].get("dateTime", event["end"].get("date"))

            # Convert to target timezone
            start_converted = convert_to_timezone(start, timezone_str)
            end_converted = convert_to_timezone(end, timezone_str)

            formatted_event = {
                "summary": event.get("summary", "No title"),
                "description": event.get("description", ""),
                "location": event.get("location", ""),
                "start": start_converted,
                "end": end_converted,
                "all_day": "T" not in start,
            }
            formatted_events.append(formatted_event)

        return formatted_events
    except HttpError as error:
        raise Exception(f"Error fetching calendar data: {error}")


def ask_gemini_about_calendar(
    model, calendar_data, question, timezone_str="Asia/Bangkok"
):
    """Ask Gemini AI about calendar data."""
    try:
        # Create context for Gemini
        context = f"""
You are a helpful AI assistant that analyzes Google Calendar data. 
The user's timezone is {timezone_str}.
Here is the user's calendar data for the next 7 days (all times in {timezone_str}):

{json.dumps(calendar_data, indent=2)}

User Question: {question}

Please provide a helpful analysis based on the calendar data above. Be concise and actionable.
All times mentioned should be in the user's timezone ({timezone_str}).
"""

        response = model.generate_content(context)
        return response.text
    except Exception as e:
        raise Exception(f"Error asking Gemini: {e}")


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "google-calendar-agent"})


@app.route("/events", methods=["GET"])
def get_events():
    """Get upcoming events."""
    try:
        service = get_service()
        max_results = request.args.get("max_results", 10, type=int)
        timezone_str = request.args.get("timezone", "Asia/Bangkok")

        # Get events
        now = datetime.utcnow().isoformat() + "Z"
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=now,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])

        # Format response
        formatted_events = []
        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            end = event["end"].get("dateTime", event["end"].get("date"))

            # Convert to target timezone
            start_converted = convert_to_timezone(start, timezone_str)
            end_converted = convert_to_timezone(end, timezone_str)

            formatted_event = {
                "summary": event.get("summary", "No title"),
                "description": event.get("description", ""),
                "location": event.get("location", ""),
                "start": start_converted,
                "end": end_converted,
                "all_day": "T" not in start,
            }
            formatted_events.append(formatted_event)

        return jsonify({"events": formatted_events})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/today", methods=["GET"])
def get_today_events():
    """Get today's events."""
    try:
        service = get_service()
        timezone_str = request.args.get("timezone", "Asia/Bangkok")

        # Get today's date range in the target timezone
        target_tz = pytz.timezone(timezone_str)
        now = datetime.now(target_tz)
        today = now.date()
        start_of_day = target_tz.localize(datetime.combine(today, datetime.min.time()))
        end_of_day = target_tz.localize(datetime.combine(today, datetime.max.time()))

        # Convert to UTC for API call
        start_utc = start_of_day.astimezone(pytz.utc)
        end_utc = end_of_day.astimezone(pytz.utc)

        # Get events
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=start_utc.isoformat(),
                timeMax=end_utc.isoformat(),
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])

        # Format response
        formatted_events = []
        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            end = event["end"].get("dateTime", event["end"].get("date"))

            # Convert to target timezone
            start_converted = convert_to_timezone(start, timezone_str)
            end_converted = convert_to_timezone(end, timezone_str)

            formatted_event = {
                "summary": event.get("summary", "No title"),
                "description": event.get("description", ""),
                "location": event.get("location", ""),
                "start": start_converted,
                "end": end_converted,
                "all_day": "T" not in start,
            }
            formatted_events.append(formatted_event)

        return jsonify({"events": formatted_events, "date": today.strftime("%Y-%m-%d")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/freebusy", methods=["POST"])
def get_freebusy():
    """Get free/busy information for a time period."""
    try:
        service = get_service()
        data = request.get_json()

        start_date = data.get("start_date")
        end_date = data.get("end_date")
        timezone_str = data.get("timezone", "Asia/Bangkok")

        if not start_date or not end_date:
            return jsonify({"error": "start_date and end_date are required"}), 400

        # Parse dates in target timezone
        target_tz = pytz.timezone(timezone_str)
        start_time = target_tz.localize(datetime.strptime(start_date, "%Y-%m-%d"))
        end_time = target_tz.localize(datetime.strptime(end_date, "%Y-%m-%d"))

        # Convert to UTC for API call
        start_utc = start_time.astimezone(pytz.utc)
        end_utc = end_time.astimezone(pytz.utc)

        body = {
            "timeMin": start_utc.isoformat(),
            "timeMax": end_utc.isoformat(),
            "items": [{"id": "primary"}],
        }

        events_result = service.freebusy().query(body=body).execute()
        calendar_dict = events_result["calendars"]["primary"]

        busy_periods = []
        if calendar_dict["busy"]:
            for busy_period in calendar_dict["busy"]:
                start = datetime.fromisoformat(
                    busy_period["start"].replace("Z", "+00:00")
                )
                end = datetime.fromisoformat(busy_period["end"].replace("Z", "+00:00"))

                # Convert to target timezone
                start_converted = start.astimezone(target_tz)
                end_converted = end.astimezone(target_tz)

                busy_periods.append(
                    {
                        "start": start_converted.isoformat(),
                        "end": end_converted.isoformat(),
                        "start_formatted": start_converted.strftime("%Y-%m-%d %H:%M"),
                        "end_formatted": end_converted.strftime("%H:%M"),
                    }
                )

        return jsonify({"busy_periods": busy_periods, "is_busy": len(busy_periods) > 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/ai-query", methods=["POST"])
def ai_query():
    """Ask AI about calendar data."""
    try:
        service = get_service()
        gemini_model = get_gemini_model()
        data = request.get_json()

        question = data.get("question")
        timezone_str = data.get("timezone", "Asia/Bangkok")

        if not question:
            return jsonify({"error": "question is required"}), 400

        # Get calendar data
        calendar_data = get_calendar_data(service, timezone_str=timezone_str)

        if not calendar_data:
            return jsonify({"error": "No calendar data found"}), 404

        # Ask Gemini
        ai_response = ask_gemini_about_calendar(
            gemini_model, calendar_data, question, timezone_str
        )

        return jsonify({"response": ai_response, "calendar_data": calendar_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8090, debug=True)
