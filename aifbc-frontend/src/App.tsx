import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
  Close,
  CloudUpload,
  CalendarToday,
  Event as MUIEvent,
  Schedule,
  Psychology,
  Google,
  AccessTime,
  Image as ImageIcon,
} from '@mui/icons-material';
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Import types from types.ts
import {
  CalendarEvent,
  MessageType,
  MessageBoxProps,
  FileUploadProps,
  AiAnalysisProps,
  AiReportProps,
  QuickCalendarProps,
  GoogleCalendarProps,
  ScheduleData,
} from './types';

// Import utils from utils.ts
import {
  parseICS,
  COMMON_TIMEZONES,
  formatDateForAPI,
  processScheduleImage,
} from './utils';

// --- MUI Theme ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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

  const severity = type === 'danger' ? 'error' : type;

  return (
    <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1050 }}>
      <Alert severity={severity} onClose={onClear}>
        {message}
      </Alert>
    </Box>
  );
};

const TimezoneSelector: FC<{
  timezone: string;
  onTimezoneChange: (timezone: string) => void;
  onMessage: (text: string, type: MessageType) => void;
}> = ({ timezone, onTimezoneChange, onMessage }) => {
  const handleTimezoneChange = (newTimezone: string) => {
    onTimezoneChange(newTimezone);
    onMessage(`Timezone changed to ${newTimezone}`, 'info');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
        Select your desired timezone
      </Typography>
      <FormControl fullWidth>
        <InputLabel>Select Timezone</InputLabel>
        <Select
          value={timezone}
          label="Select Timezone"
          onChange={e => handleTimezoneChange(e.target.value)}
        >
          {COMMON_TIMEZONES.map(tz => (
            <MenuItem key={tz.value} value={tz.value}>
              {tz.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

const FileUpload: FC<FileUploadProps> = ({ onFilesProcessed, onMessage }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      setIsProcessing(true);
      let allEvents: CalendarEvent[] = [];
      const allScheduleData: ScheduleData[] = [];

      for (const file of files) {
        try {
          const fileExtension = file.name.toLowerCase();

          if (fileExtension.endsWith('.ics')) {
            // Process ICS file
            const text = await file.text();
            const events = parseICS(text);
            allEvents = allEvents.concat(events);
          } else if (
            fileExtension.endsWith('.jpg') ||
            fileExtension.endsWith('.png')
          ) {
            // Process image file
            const scheduleData = await processScheduleImage(file);
            console.log(scheduleData);
            allScheduleData.push(scheduleData);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unknown error occurred.';
          onMessage(`Error processing ${file.name}: ${errorMessage}`, 'danger');
          console.error('Error reading or parsing file:', file.name, error);
        }
      }

      const jsonData = JSON.stringify(allEvents, null, 2);
      onFilesProcessed(jsonData, allScheduleData);
      setIsProcessing(false);
    },
    [onFilesProcessed, onMessage]
  );

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter(file => {
      const fileName = file.name.toLowerCase();
      return (
        fileName.endsWith('.ics') ||
        fileName.endsWith('.jpg') ||
        fileName.endsWith('.png')
      );
    });

    if (validFiles.length !== newFiles.length) {
      onMessage(
        'Some files were not in the .ics, .jpg, or .png format and were ignored.',
        'warning'
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

    if (updatedFiles.length > 0) {
      processFiles(updatedFiles);
    } else {
      onFilesProcessed('', []);
    }
  };

  const getFileIcon = (fileName: string) => {
    const fileExtension = fileName.toLowerCase();
    if (fileExtension.endsWith('.ics')) {
      return <CalendarToday sx={{ fontSize: 20, color: 'primary.main' }} />;
    } else if (
      fileExtension.endsWith('.jpg') ||
      fileExtension.endsWith('.png')
    ) {
      return <ImageIcon sx={{ fontSize: 20, color: 'secondary.main' }} />;
    }
    return <CloudUpload sx={{ fontSize: 20, color: 'text.secondary' }} />;
  };

  const isImageFile = (fileName: string) => {
    const fileExtension = fileName.toLowerCase();
    return fileExtension.endsWith('.jpg') || fileExtension.endsWith('.png');
  };

  const ImagePreview: FC<{ file: File }> = ({ file }) => {
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
      <Box
        component="img"
        src={imageUrl}
        alt={file.name}
        sx={{
          width: 60,
          height: 60,
          objectFit: 'cover',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      />
    );
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Step 1: Upload Files
      </Typography>
      <Box
        sx={{
          border: `2px dashed ${
            isDragOver ? theme.palette.primary.main : 'grey.400'
          }`,
          backgroundColor: isDragOver ? 'action.hover' : 'background.paper',
          p: 4,
          textAlign: 'center',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'border-color 0.3s, background-color 0.3s',
          position: 'relative',
        }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".ics,.jpg,.png"
          multiple
          ref={fileInputRef}
          className="d-none"
          onChange={e => handleFileChange(e.target.files)}
        />
        {uploadedFiles.length === 0 ? (
          <Box>
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
            <Typography variant="h6">
              <span
                style={{
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                }}
              >
                Click to upload
              </span>{' '}
              or drag and drop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              iCalendar (.ics), image (.jpg, .png) files only
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'left' }}>
            {uploadedFiles.map((file, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  mb: 1,
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flex: 1,
                  }}
                >
                  {isImageFile(file.name) ? (
                    <ImagePreview file={file} />
                  ) : (
                    getFileIcon(file.name)
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={e => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={isProcessing}
                >
                  <Close />
                </IconButton>
              </Card>
            ))}
            {isProcessing && (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}
              >
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Processing files...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const ScheduleDataDisplay: FC<{ scheduleData: ScheduleData[] }> = ({
  scheduleData,
}) => {
  if (scheduleData.length === 0) return null;

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Processed Schedule Data
      </Typography>
      {scheduleData.map((schedule, index) => (
        <Card key={index} variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {schedule.fileName}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="success.main">
                  Available Times:
                </Typography>
                <Typography variant="body2">
                  {schedule.choices.length > 0
                    ? (schedule.choices[0] as any).message.content
                    : 'None specified'}
                </Typography>
              </Box>
              {/* <Box>
                <Typography variant="subtitle2" color="error.main">
                  Busy Times:
                </Typography>
                <Typography variant="body2">
                  {schedule.busy.length > 0 ? schedule.busy.join(', ') : 'None specified'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="primary.main">
                  Best Meeting Slots:
                </Typography>
                <Typography variant="body2">
                  {schedule.bestSlots.length > 0 ? schedule.bestSlots.join(', ') : 'None specified'}
                </Typography>
              </Box> */}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

const AiAnalysis: FC<AiAnalysisProps> = ({
  jsonData,
  scheduleData = [],
  onAnalysisComplete,
  onAnalysisStart,
  onMessage,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if ((!jsonData || jsonData === '[]') && scheduleData.length === 0) {
      onMessage(
        'No data available for analysis. Please upload valid files first.',
        'warning'
      );
      return;
    }

    setIsLoading(true);
    onAnalysisStart();

    // Create a comprehensive prompt that includes both calendar events and schedule data
    let dataDescription = '';

    if (jsonData && jsonData !== '[]') {
      dataDescription += `Calendar Events Data:\n${jsonData}\n\n`;
    }

    if (scheduleData.length > 0) {
      dataDescription += `Schedule Data from Images:\n`;
      scheduleData.forEach((schedule, index) => {
        dataDescription += `\nSchedule ${index + 1} (${schedule.fileName}):\n`;
        dataDescription += `Available times: ${schedule.available.join(', ')}\n`;
        dataDescription += `Busy times: ${schedule.busy.join(', ')}\n`;
        dataDescription += `Best meeting slots: ${schedule.bestSlots.join(', ')}\n`;
      });
      dataDescription += '\n';
    }

    const userPrompt =
      prompt.trim() ||
      'Based on the following calendar data and schedule information, provide a comprehensive analysis. Include insights about available meeting times, busy periods, and recommendations for optimal scheduling.';

    try {
      const payload = {
        userPrompt,
        jsonData,
        scheduleData,
        dataDescription,
      };
      const apiUrl = 'http://localhost:8000/ai-analytics';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const { result }: { result?: { text?: string } } = await response.json();
      const content = result?.text?.trim();

      if (content) {
        const htmlText = content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/(\r\n|\n|\r)/g, '<br />');
        onAnalysisComplete(htmlText);
      } else {
        throw new Error(`Invalid response structure from AI API`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error('AI Analysis Error:', errorMessage);
      onAnalysisComplete(
        `<p style="color: red;"><strong>Error:</strong> Could not get analysis. ${errorMessage}</p>`
      );
      onMessage(`Analysis failed: ${errorMessage}`, 'danger');
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
        onChange={e => setPrompt(e.target.value)}
        placeholder="Analyze my calendar and schedule images to find the best meeting times."
      />
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={handleAnalyze}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isLoading ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
      </Box>
    </Box>
  );
};

const AiReport: FC<AiReportProps> = ({ report, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
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
        <CardContent sx={{ backgroundColor: 'action.hover' }}>
          <Typography
            component="div"
            dangerouslySetInnerHTML={{ __html: report }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

const QuickCalendar: FC<QuickCalendarProps & { timezone: string }> = ({
  onMessage,
  timezone,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('events');
  const [maxResults, setMaxResults] = useState<number>(10);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Set default dates in selected timezone
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    setStartDate(formatDateForAPI(today, timezone).split(' ')[0]);
    setEndDate(formatDateForAPI(nextWeek, timezone).split(' ')[0]);
  }, [timezone]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      let response;
      const baseUrl = 'http://localhost:8000/calendar';

      switch (selectedOption) {
        case 'events':
          response = await fetch(
            `${baseUrl}/events?max_results=${maxResults}&timezone=${encodeURIComponent(
              timezone
            )}`
          );
          break;
        case 'today':
          response = await fetch(
            `${baseUrl}/today?timezone=${encodeURIComponent(timezone)}`
          );
          break;
        case 'freebusy':
          response = await fetch(`${baseUrl}/freebusy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start_date: startDate,
              end_date: endDate,
              timezone,
            }),
          });
          break;
        default:
          throw new Error('Invalid option selected');
      }

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        onMessage('Calendar data retrieved successfully!', 'success');
      } else {
        throw new Error(data.error || 'Failed to fetch calendar data');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      onMessage(`Error: ${errorMessage}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  const formatResult = () => {
    if (!result) return null;

    switch (selectedOption) {
      case 'events':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Upcoming Events ({timezone})
            </Typography>
            {result.events?.map((event: any, index: number) => (
              <Card key={index} sx={{ mb: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {event.summary}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.start} - {event.end}
                </Typography>
                {event.location && (
                  <Typography variant="body2" color="text.secondary">
                    📍 {event.location}
                  </Typography>
                )}
              </Card>
            ))}
          </Box>
        );

      case 'today':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Today&apos;s Events ({result.date}) - {timezone}
            </Typography>
            {result.events?.map((event: any, index: number) => (
              <Card key={index} sx={{ mb: 1, p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {event.summary}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.start} - {event.end}
                </Typography>
                {event.location && (
                  <Typography variant="body2" color="text.secondary">
                    📍 {event.location}
                  </Typography>
                )}
              </Card>
            ))}
          </Box>
        );

      case 'freebusy':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Free/Busy Status ({timezone})
            </Typography>
            {result.is_busy ? (
              <Box>
                <Typography variant="body1" color="error" gutterBottom>
                  Busy Periods:
                </Typography>
                {result.busy_periods?.map((period: any, index: number) => (
                  <Card
                    key={index}
                    sx={{ mb: 1, p: 2, bgcolor: 'error.light' }}
                  >
                    <Typography variant="body2">
                      {period.start_formatted} - {period.end_formatted}
                    </Typography>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body1" color="success.main">
                No busy periods found in this time range.
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Choose your quick option to view the calendar:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <TextField
            fullWidth
            label="Email"
            type="text"
            value={"thien.nguyen@gmail.com"}
            contentEditable={false}
            disabled
          />
        </Box>

        <Box>
          <FormControl fullWidth>
            <InputLabel>Calendar Option</InputLabel>
            <Select
              value={selectedOption}
              label="Calendar Option"
              onChange={e => setSelectedOption(e.target.value)}
            >
              <MenuItem value="events">
                <MUIEvent sx={{ mr: 1 }} />
                Upcoming Events
              </MenuItem>
              <MenuItem value="today">
                <CalendarToday sx={{ mr: 1 }} />
                Today&apos;s Events
              </MenuItem>
              <MenuItem value="freebusy">
                <Schedule sx={{ mr: 1 }} />
                Free/Busy Times
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {selectedOption === 'events' && (
          <Box>
            <TextField
              fullWidth
              label="Number of upcoming events"
              type="number"
              value={maxResults}
              onChange={e => setMaxResults(Number(e.target.value))}
              inputProps={{ min: 1, max: 50 }}
            />
          </Box>
        )}

        {selectedOption === 'freebusy' && (
          <>
            <Box>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </>
        )}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Loading...' : 'Get Calendar Data'}
        </Button>
      </Box>

      {result && (
        <Card variant="outlined">
          <CardContent>{formatResult()}</CardContent>
        </Card>
      )}
    </Box>
  );
};

const GoogleCalendar: FC<GoogleCalendarProps & { timezone: string }> = ({
  onMessage,
  timezone,
}) => {
  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!question.trim()) {
      onMessage('Please enter a question', 'warning');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/calendar/ai-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          timezone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        onMessage('AI analysis completed!', 'success');
      } else {
        throw new Error(data.error || 'Failed to get AI analysis');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      onMessage(`Error: ${errorMessage}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        <Google sx={{ mr: 1, verticalAlign: 'middle' }} />
        Google Calendar AI Query ({timezone})
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Ask AI questions about your connected Google Calendar
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Ask about your calendar"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="e.g., What's my busiest day this week? When do I have free time for a meeting?"
        sx={{ mb: 2 }}
      />

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isLoading || !question.trim()}
          startIcon={
            isLoading ? <CircularProgress size={20} /> : <Psychology />
          }
        >
          {isLoading ? 'Analyzing...' : 'Ask AI'}
        </Button>
      </Box>

      {result && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Analysis
            </Typography>
            <Typography
              component="div"
              dangerouslySetInnerHTML={{
                __html: result.response
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/(\r\n|\n|\r)/g, '<br />'),
              }}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

const App: React.FC = () => {
  const [jsonData, setJsonData] = useState<string>('');
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([]);
  const [aiReport, setAiReport] = useState<string>('');
  const [isAnalysisRunning, setIsAnalysisRunning] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageType>('info');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [timezone, setTimezone] = useState<string>('Asia/Bangkok'); // Default to GMT+7

  const handleFilesProcessed = (data: string, scheduleData: ScheduleData[]) => {
    setJsonData(data);
    setScheduleData(scheduleData);
    setAiReport('');
    if ((data && data !== '[]') || scheduleData.length > 0) {
      handleMessage('Files processed. Ready for AI analysis.', 'success');
    }
  };

  const handleAnalysisStart = () => {
    setIsAnalysisRunning(true);
    setAiReport('');
  };

  const handleAnalysisComplete = (reportHtml: string) => {
    setIsAnalysisRunning(false);
    setAiReport(reportHtml);
  };

  const handleMessage = (text: string, type: MessageType = 'info') => {
    setMessage(text);
    setMessageType(type);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
  };

  return (
    <ThemeProvider theme={theme}>
      <MessageBox
        message={message}
        type={messageType}
        onClear={() => setMessage('')}
      />
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <header className="text-center mb-5">
          <Typography variant="h3" component="h1" fontWeight="bold">
            Trivio Schedule Assistant
          </Typography>
          <Typography variant="h6" color="text.secondary">
            A powerful AI assistant for your personal calendar.
          </Typography>
        </header>

        <Card raised>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <TimezoneSelector
              timezone={timezone}
              onTimezoneChange={handleTimezoneChange}
              onMessage={handleMessage}
            />

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ mb: 4 }}
            >
              <Tab
                label="Quick Calendar"
                icon={<MUIEvent />}
                iconPosition="start"
              />
              <Tab
                label="Upload & Analyze"
                icon={<CloudUpload />}
                iconPosition="start"
              />
              <Tab
                label="Google Calendar AI"
                icon={<Google />}
                iconPosition="start"
              />
            </Tabs>

            {activeTab === 0 && (
              <QuickCalendar onMessage={handleMessage} timezone={timezone} />
            )}

            {activeTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <FileUpload
                    onFilesProcessed={handleFilesProcessed}
                    onMessage={handleMessage}
                  />
                </Box>
                {(jsonData && jsonData !== '[]') || scheduleData.length > 0 ? (
                  <Box>
                    <ScheduleDataDisplay scheduleData={scheduleData} />
                    <AiAnalysis
                      jsonData={jsonData}
                      scheduleData={scheduleData}
                      onAnalysisStart={handleAnalysisStart}
                      onAnalysisComplete={handleAnalysisComplete}
                      onMessage={handleMessage}
                    />
                  </Box>
                ) : null}
                {(isAnalysisRunning || aiReport) && (
                  <Box>
                    <AiReport report={aiReport} isLoading={isAnalysisRunning} />
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <GoogleCalendar onMessage={handleMessage} timezone={timezone} />
            )}
          </CardContent>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default App;
