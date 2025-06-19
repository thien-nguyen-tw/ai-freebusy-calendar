import { Close, CloudUpload } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import type { TypographyProps } from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";

// --- Type Definitions ---

interface CalendarEvent {
  uid: string | null;
  summary: string | null;
  description: string | null;
  location: string | null;
  dtstart: string | null;
  dtend: string | null;
  status: string | null;
  organizer: string | null;
  attendees: string[];
}

type MessageType = "info" | "success" | "warning" | "danger";

interface MessageBoxProps {
  message: string;
  type: MessageType;
  onClear: () => void;
}

interface FileUploadProps {
  onFilesProcessed: (jsonData: string) => void;
  onMessage: (text: string, type: MessageType) => void;
}

interface AiAnalysisProps {
  jsonData: string;
  onAnalysisStart: () => void;
  onAnalysisComplete: (reportHtml: string) => void;
  onMessage: (text: string, type: MessageType) => void;
}

interface AiReportProps {
  report: string;
  isLoading: boolean;
}

// --- Helper Functions ---

const parseICS = (icsData: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let match;

  while ((match = eventRegex.exec(icsData)) !== null) {
    const eventData = match[1];
    const event: Partial<CalendarEvent> = {};

    const getProp = (propName: string): string | null => {
      const propRegex = new RegExp(`^${propName}(?:;.+?)?:(.*)$`, "im");
      const propMatch = eventData.match(propRegex);
      return propMatch
        ? propMatch[1].trim().replace(/\\,/g, ",").replace(/\\n/g, "\n")
        : null;
    };

    event.uid = getProp("UID");
    event.summary = getProp("SUMMARY");
    event.description = getProp("DESCRIPTION");
    event.location = getProp("LOCATION");
    event.dtstart = getProp("DTSTART");
    event.dtend = getProp("DTEND");
    event.status = getProp("STATUS");
    event.organizer = getProp("ORGANIZER");

    const attendeeRegex = /^ATTENDEE(?:;.+?)?:(.*)$/gim;
    let attendeeMatch;
    event.attendees = [];
    while ((attendeeMatch = attendeeRegex.exec(eventData)) !== null) {
      event.attendees.push(attendeeMatch[1].trim());
    }
    events.push(event as CalendarEvent);
  }
  return events;
};

// --- MUI Theme ---
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// --- React Components ---

const MessageBox: FC<MessageBoxProps> = ({ message, type, onClear }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClear, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message) return null;

  const severity = type === "danger" ? "error" : type;

  return (
    <Box sx={{ position: "fixed", top: 20, right: 20, zIndex: 1050 }}>
      <Alert severity={severity} onClose={onClear}>
        {message}
      </Alert>
    </Box>
  );
};

const FileUpload: FC<FileUploadProps> = ({ onFilesProcessed, onMessage }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      let allEvents: CalendarEvent[] = [];
      for (const file of files) {
        try {
          const text = await file.text();
          const events = parseICS(text);
          allEvents = allEvents.concat(events);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "An unknown error occurred.";
          onMessage(`Error processing ${file.name}: ${errorMessage}`, "danger");
          console.error("Error reading or parsing file:", file.name, error);
        }
      }
      const jsonData = JSON.stringify(allEvents, null, 2);
      onFilesProcessed(jsonData);
    },
    [onFilesProcessed, onMessage]
  );

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter((file) =>
      file.name.toLowerCase().endsWith(".ics")
    );
    if (validFiles.length !== newFiles.length) {
      onMessage(
        "Some files were not in the .ics format and were ignored.",
        "warning"
      );
    }
    const updatedFiles = [...uploadedFiles, ...validFiles];
    setUploadedFiles(updatedFiles);

    if (updatedFiles.length > 0) {
      processFiles(updatedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    onFilesProcessed(
      updatedFiles.length > 0 ? JSON.stringify(parseICS(""), null, 2) : ""
    );
    if (updatedFiles.length > 0) {
      processFiles(updatedFiles);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Step 1: Upload Files
      </Typography>
      <Box
        sx={{
          border: `2px dashed ${
            isDragOver ? theme.palette.primary.main : "grey.400"
          }`,
          backgroundColor: isDragOver ? "action.hover" : "background.paper",
          p: 4,
          textAlign: "center",
          borderRadius: 1,
          cursor: "pointer",
          transition: "border-color 0.3s, background-color 0.3s",
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".ics"
          multiple
          ref={fileInputRef}
          className="d-none"
          onChange={(e) => handleFileChange(e.target.files)}
        />
        {uploadedFiles.length === 0 ? (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: "text.secondary" }} />
            <Typography variant="h6">
              <span
                style={{
                  color: theme.palette.primary.main,
                  fontWeight: "bold",
                }}
              >
                Click to upload
              </span>{" "}
              or drag and drop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              iCalendar (.ics) files only
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: "left" }}>
            {uploadedFiles.map((file, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  mb: 1,
                  p: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">{file.name}</Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <Close />
                </IconButton>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const AiAnalysis: FC<AiAnalysisProps> = ({
  jsonData,
  onAnalysisComplete,
  onAnalysisStart,
  onMessage,
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (!jsonData || jsonData === "[]") {
      onMessage(
        "No data available for analysis. Please upload valid files first.",
        "warning"
      );
      return;
    }

    setIsLoading(true);
    onAnalysisStart();
    let userPrompt =
      prompt.trim() ||
      "Based on the following calendar data in JSON format, provide a concise summary of the upcoming events. Mention the total number of events, highlight any potential conflicts or busy days, and list the next 3 upcoming events with their date and time.";
    try {
      const payload = {
        userPrompt,
        jsonData,
      };
      const apiUrl = "http://localhost:8000/ai-analytics";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const { result }: { result?: { text?: string } } = await response.json();
      const content = result?.text?.trim();

      if (content) {
        let htmlText = content
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/(\r\n|\n|\r)/g, "<br />");
        onAnalysisComplete(htmlText);
      } else {
        throw new Error(`Invalid response structure from AI API`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("AI Analysis Error:", errorMessage);
      onAnalysisComplete(
        `<p style="color: red;"><strong>Error:</strong> Could not get analysis. ${errorMessage}</p>`
      );
      onMessage(`Analysis failed: ${errorMessage}`, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Step 2: AI Analysis
      </Typography>
      <TextField
        id="aiPrompt"
        label="Analysis Prompt"
        multiline
        rows={3}
        fullWidth
        variant="outlined"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Summarize my upcoming week's schedule."
      />
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleAnalyze}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isLoading ? "Analyzing..." : "Analyze with AI"}
        </Button>
      </Box>
    </Box>
  );
};

const AiReport: FC<AiReportProps> = ({ report, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          AI is analyzing your calendar...
        </Typography>
      </Box>
    );
  }
  if (!report) return null;

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        AI Report
      </Typography>
      <Card variant="outlined">
        <CardContent sx={{ backgroundColor: "action.hover" }}>
          <Typography
            component="div"
            dangerouslySetInnerHTML={{ __html: report }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default function App(): JSX.Element {
  const [jsonData, setJsonData] = useState<string>("");
  const [aiReport, setAiReport] = useState<string>("");
  const [isAnalysisRunning, setIsAnalysisRunning] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<MessageType>("info");

  const handleFilesProcessed = (data: string) => {
    setJsonData(data);
    setAiReport("");
    if (data && data !== "[]") {
      handleMessage("Files processed. Ready for AI analysis.", "success");
    }
  };

  const handleAnalysisStart = () => {
    setIsAnalysisRunning(true);
    setAiReport("");
  };
  const handleAnalysisComplete = (reportHtml: string) => {
    setIsAnalysisRunning(false);
    setAiReport(reportHtml);
  };
  const handleMessage = (text: string, type: MessageType = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  return (
    <ThemeProvider theme={theme}>
      <MessageBox
        message={message}
        type={messageType}
        onClear={() => setMessage("")}
      />
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        <header className="text-center mb-5">
          <Typography variant="h3" component="h1" fontWeight="bold">
            Calendar AI Analyzer
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Upload iCalendar (.ics) files for an AI-powered analysis.
          </Typography>
        </header>

        <Card raised>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <div className="row g-5">
              <div className="col-12">
                <FileUpload
                  onFilesProcessed={handleFilesProcessed}
                  onMessage={handleMessage}
                />
              </div>
              {jsonData && jsonData !== "[]" && (
                <div className="col-12">
                  <AiAnalysis
                    jsonData={jsonData}
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onMessage={handleMessage}
                  />
                </div>
              )}
              {(isAnalysisRunning || aiReport) && (
                <div className="col-12">
                  <AiReport report={aiReport} isLoading={isAnalysisRunning} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
}
