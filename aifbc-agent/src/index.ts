import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

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
    ],
  });
});

// AI Analytics endpoint
const aiAnalyticsHandler = async (req: Request, res: Response) => {
  try {
    const { userPrompt, jsonData } = req.body;

    const fullPrompt = `${userPrompt}\n\nHere is the calendar data:\n\n${jsonData}`;

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
  console.log(`Writer agent running at http://localhost:${PORT}`);
});
