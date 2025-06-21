import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import axios from "axios";

// Load environment variables
dotenv.config();

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
export const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Python Flask server URL
const PYTHON_SERVER_URL = "http://localhost:8090";

// Agent Card endpoint
app.get("/.well-known/agent.json", (_req, res) => {
  res.json({
    name: "Free-Busy Calendar Agent",
    description:
      "An AI agent that helps users manage their calendar by checking free/busy status and scheduling events.",
    url: "http://localhost:8000",
    version: "1.0.0",
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: false,
    },
    defaultInputModes: ["text", "text/plain"],
    defaultOutputModes: ["text", "text/plain"],
    skills: [
      {
        id: "free_busy_check",
        name: "free-busy-check",
        description: "Checks free/busy status and schedules events",
      },
      {
        id: "calendar_events",
        name: "calendar-events",
        description: "Gets calendar events and today's schedule",
      },
      {
        id: "ai_calendar_query",
        name: "ai-calendar-query",
        description: "AI-powered calendar analysis and insights",
      },
    ],
  });
});

// Health check endpoint
app.get("/health", async (_req, res) => {
  try {
    const response = await axios.get(`${PYTHON_SERVER_URL}/health`);
    res.json({
      status: "healthy",
      express: "running",
      python_server: response.data
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      express: "running",
      python_server: "unreachable",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get calendar events endpoint
app.get("/calendar/events", async (req: Request, res: Response) => {
  try {
    const maxResults = req.query.max_results || 10;
    const response = await axios.get(`${PYTHON_SERVER_URL}/events?max_results=${maxResults}`);
    res.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Calendar Events Error:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Get today's events endpoint
app.get("/calendar/today", async (_req: Request, res: Response) => {
  try {
    const response = await axios.get(`${PYTHON_SERVER_URL}/today`);
    res.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Today's Events Error:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// Get free/busy status endpoint
app.post("/calendar/freebusy", async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.body;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date are required" });
    }
    
    const response = await axios.post(`${PYTHON_SERVER_URL}/freebusy`, {
      start_date,
      end_date
    });
    res.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Free/Busy Error:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// AI calendar query endpoint
app.post("/calendar/ai-query", async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }
    
    const response = await axios.post(`${PYTHON_SERVER_URL}/ai-query`, {
      question
    });
    res.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("AI Query Error:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

// AI Analytics endpoint
const aiAnalyticsHandler = async (req: Request, res: Response) => {
  try {
    const { userPrompt, jsonData } = req.body;

    const fullPrompt = `You are a helpful AI assistant that analyzes Google Calendar data. Here is the all calendars data: \n\n${jsonData}\n\nUser Question: ${userPrompt}\n\nPlease provide a helpful analysis based on the calendar data above. Be concise and actionable.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    if (!response) {
      throw new Error(
        result.response.promptFeedback?.blockReasonMessage ||
          `API request failed with unknown reason!`
      );
    }
    res.json({ result: { text: response } });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("AI Analysis Error:", errorMessage);
    const errorResponse = {
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: errorMessage,
      },
      id: req.body.id,
    };
    console.log(
      "Sending error response:",
      JSON.stringify(errorResponse, null, 2)
    );
    res.status(500).json(errorResponse);
  }
};
app.post("/ai-analytics", aiAnalyticsHandler);

// Start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Calendar agent running at http://localhost:${PORT}`);
  console.log(`Python server expected at ${PYTHON_SERVER_URL}`);
});
