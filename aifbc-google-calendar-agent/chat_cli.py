#!/usr/bin/env python
"""
Simple CLI for Google Calendar operations with Gemini AI integration.

Prereqs:
    pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client google-generativeai rich prompt_toolkit python-dotenv
"""
import os
import sys
import json
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
import google.generativeai as genai
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
from rich.panel import Panel

# If modifying these scopes, delete the file token.json.
SCOPES = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events.freebusy",
]

console = Console()

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
        console.print("[red]Error: credentials.json not found.[/red]")
        console.print("Please download your Google Calendar API credentials and save as 'credentials.json'")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]Error building service: {e}[/red]")
        sys.exit(1)


def get_gemini_model():
    """Get Gemini AI model."""
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        console.print(
            "[red]Error: GEMINI_API_KEY not found in environment variables.[/red]"
        )
        console.print("Please set GEMINI_API_KEY in your .env file or environment.")
        sys.exit(1)
    
    try:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        return model
    except Exception as e:
        console.print(f"[red]Error configuring Gemini: {e}[/red]")
        sys.exit(1)


def get_calendar_data(service, days=30):
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
            
            formatted_event = {
                "summary": event.get("summary", "No title"),
                "description": event.get("description", ""),
                "location": event.get("location", ""),
                "start": start,
                "end": end,
                "all_day": "T" not in start
            }
            formatted_events.append(formatted_event)
        
        return formatted_events
    except HttpError as error:
        console.print(f"[red]Error fetching calendar data: {error}[/red]")
        return []


def ask_gemini_about_calendar(model, calendar_data, question):
    """Ask Gemini AI about calendar data."""
    try:
        # Create context for Gemini
        context = f"""
You are a helpful AI assistant that analyzes Google Calendar data. 
Here is the user's calendar data for the next 7 days:

{json.dumps(calendar_data, indent=2)}

User Question: {question}

Please provide a helpful analysis based on the calendar data above. Be concise and actionable.
"""
        
        response = model.generate_content(context)
        return response.text
    except Exception as e:
        console.print(f"[red]Error asking Gemini: {e}[/red]")
        return "Sorry, I couldn't analyze your calendar at the moment."


def list_events(service, max_results=10):
    """List upcoming events from Google Calendar."""
    try:
        # Call the Calendar API
        now = datetime.utcnow().isoformat() + "Z"  # 'Z' indicates UTC time
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

        if not events:
            console.print("[yellow]No upcoming events found.[/yellow]")
            return

        # Create a table to display events
        table = Table(title="Upcoming Events")
        table.add_column("Date", style="cyan")
        table.add_column("Time", style="green")
        table.add_column("Event", style="white")
        table.add_column("Location", style="yellow")

        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            if "T" in start:  # Has time
                start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                date_str = start_dt.strftime("%Y-%m-%d")
                time_str = start_dt.strftime("%H:%M")
            else:  # All-day event
                date_str = start
                time_str = "All day"

            summary = event.get("summary", "No title")
            location = event.get("location", "No location")

            table.add_row(date_str, time_str, summary, location)

        console.print(table)

    except HttpError as error:
        console.print(f"[red]An error occurred: {error}[/red]")


def get_free_busy(service, start_time, end_time):
    """Get free/busy information for a time period."""
    try:
        body = {
            "timeMin": start_time.isoformat() + "Z",
            "timeMax": end_time.isoformat() + "Z",
            "items": [{"id": "primary"}],
        }

        events_result = service.freebusy().query(body=body).execute()
        calendar_dict = events_result["calendars"]["primary"]

        print(calendar_dict)
        if calendar_dict["busy"]:
            console.print("[red]Busy periods:[/red]")
            for busy_period in calendar_dict["busy"]:
                start = datetime.fromisoformat(
                    busy_period["start"].replace("Z", "+00:00")
                )
                end = datetime.fromisoformat(busy_period["end"].replace("Z", "+00:00"))
                console.print(
                    f"  {start.strftime('%Y-%m-%d %H:%M')} - {end.strftime('%H:%M')}"
                )
        else:
            console.print("[green]No busy periods found in this time range.[/green]")

    except HttpError as error:
        console.print(f"[red]An error occurred: {error}[/red]")


def get_today_events(service):
    """Get today's events from Google Calendar."""
    try:
        # Get today's date range
        today = datetime.now().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())

        # Call the Calendar API
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=start_of_day.isoformat() + "Z",
                timeMax=end_of_day.isoformat() + "Z",
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
        events = events_result.get("items", [])

        if not events:
            console.print(
                f"[yellow]No events found for today ({today.strftime('%Y-%m-%d')}).[/yellow]"
            )
            return

        # Create a table to display today's events
        table = Table(title=f"Today's Events ({today.strftime('%Y-%m-%d')})")
        table.add_column("Time", style="green")
        table.add_column("Event", style="white")
        table.add_column("Location", style="yellow")
        table.add_column("Duration", style="cyan")

        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            end = event["end"].get("dateTime", event["end"].get("date"))

            if "T" in start:  # Has time
                start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))
                time_str = start_dt.strftime("%H:%M")
                duration = end_dt - start_dt
                duration_str = (
                    f"{duration.seconds // 3600}h {(duration.seconds % 3600) // 60}m"
                )
            else:  # All-day event
                time_str = "All day"
                duration_str = "24h"

            summary = event.get("summary", "No title")
            location = event.get("location", "No location")

            table.add_row(time_str, summary, location, duration_str)

        console.print(table)

    except HttpError as error:
        console.print(f"[red]An error occurred: {error}[/red]")


def main():
    """Main CLI function."""
    console.print(
        Panel.fit(
            "[bold blue]Google Calendar CLI with Gemini AI[/bold blue]\n"
            "Simple calendar operations and AI-powered analysis using OAuth",
            title="Welcome",
        )
    )

    try:
        # Get services
        service = get_service()
        gemini_model = get_gemini_model()
        console.print("[green]✓ Connected to Google Calendar API (OAuth)[/green]")
        console.print("[green]✓ Connected to Gemini AI[/green]\n")

        while True:
            console.print("\n[bold]Available commands:[/bold]")
            console.print("1. [cyan]list[/cyan] - List upcoming events")
            console.print("2. [cyan]busy[/cyan] - Check free/busy status")
            console.print("3. [cyan]today[/cyan] - List today's events")
            console.print("4. [cyan]ai[/cyan] - Ask AI about your calendar")
            console.print("5. [cyan]exit[/cyan] - Quit")

            choice = Prompt.ask(
                "\nEnter command", choices=["list", "busy", "today", "ai", "exit"]
            )

            if choice == "exit":
                console.print("[yellow]Goodbye![/yellow]")
                break
            elif choice == "list":
                max_results = Prompt.ask("Number of events to show", default="10")
                list_events(service, int(max_results))
            elif choice == "busy":
                console.print("\n[bold]Check free/busy status:[/bold]")
                start_date = Prompt.ask(
                    "Start date (YYYY-MM-DD)",
                    default=datetime.now().strftime("%Y-%m-%d"),
                )
                end_date = Prompt.ask(
                    "End date (YYYY-MM-DD)",
                    default=(datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
                )

                try:
                    start_time = datetime.strptime(start_date, "%Y-%m-%d")
                    end_time = datetime.strptime(end_date, "%Y-%m-%d")
                    get_free_busy(service, start_time, end_time)
                except ValueError:
                    console.print("[red]Invalid date format. Use YYYY-MM-DD[/red]")
            elif choice == "today":
                get_today_events(service)
            elif choice == "ai":
                console.print("\n[bold]AI Calendar Analysis:[/bold]")
                question = Prompt.ask("What would you like to know about your calendar?")
                
                if question.strip():
                    console.print("\n[blue]Fetching calendar data and analyzing...[/blue]")
                    calendar_data = get_calendar_data(service)
                    
                    if calendar_data:
                        ai_response = ask_gemini_about_calendar(gemini_model, calendar_data, question)
                        console.print("\n[bold green]AI Analysis:[/bold green]")
                        console.print(Panel(ai_response, title="Gemini AI Response"))
                    else:
                        console.print("[yellow]No calendar data found to analyze.[/yellow]")

    except Exception as e:
        console.print(f"[red]An error occurred: {e}[/red]")
        sys.exit(1)


if __name__ == "__main__":
    main()
