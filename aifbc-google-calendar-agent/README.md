# AI FreeBusy Calendar

A comprehensive calendar management system that combines Google Calendar integration with AI-powered analysis. This project features a React frontend, Express backend, and Python Google Calendar agent with timezone support and Gemini AI integration.

## 🌟 Features

- **Multi-Component Architecture**: React frontend, Express backend, and Python Google Calendar agent
- **Google Calendar Integration**: OAuth-based authentication with full calendar access
- **AI-Powered Analysis**: Gemini AI integration for intelligent calendar insights
- **Timezone Support**: Global timezone selection with automatic date conversion
- **File Upload & Analysis**: Upload and analyze iCalendar (.ics) files
- **Quick Calendar Queries**: Events, today's schedule, and free/busy status
- **Real-time AI Queries**: Ask natural language questions about your calendar

## 🏗️ Project Structure

```
ai-freebusy-calendar/
├── aifbc-frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── contexts/              # React contexts
│   │   ├── types.ts               # TypeScript type definitions
│   │   ├── utils.ts               # Utility functions
│   │   └── App.tsx                # Main application component
│   ├── package.json
│   └── vite.config.ts
├── aifbc-agent/                    # Express TypeScript backend
│   ├── src/
│   │   └── index.ts               # Express server with proxy endpoints
│   ├── package.json
│   └── tsconfig.json
├── aifbc-google-calendar-agent/    # Python Google Calendar agent
│   ├── server.py                  # Flask server with Google Calendar API
│   ├── chat_cli.py                # CLI interface
│   ├── requirements.txt           # Python dependencies
│   └── README.md                  # This file
├── create-env.sh                  # Environment setup script
├── start.sh                       # Application startup script
└── README.md                      # Main project README
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Google Cloud Project with Calendar API enabled
- Gemini AI API key

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd ai-freebusy-calendar
   ```

2. **Set up environment variables:**

   ```bash
   # Create .env files for each component
   cp create-env.sh .env
   # Edit .env with your API keys
   ```

3. **Install frontend dependencies:**

   ```bash
   cd aifbc-frontend
   npm install
   ```

4. **Install backend dependencies:**

   ```bash
   cd ../aifbc-agent
   npm install
   ```

5. **Install Python agent dependencies:**
   ```bash
   cd ../aifbc-google-calendar-agent
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

### Configuration

1. **Google Cloud Setup:**

   - Create a Google Cloud Project
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Download `credentials.json` to `aifbc-google-calendar-agent/`

2. **Environment Variables:**

   ```env
   # Frontend (.env in aifbc-frontend/)
   VITE_API_URL=http://localhost:8000

   # Backend (.env in aifbc-agent/)
   PORT=8000
   PYTHON_AGENT_URL=http://localhost:8090

   # Python Agent (.env in aifbc-google-calendar-agent/)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 🎯 Usage

### Quick Start

Use the provided startup script:

```bash
./start.sh
```

This will start all three components:

- Frontend: http://localhost:3000
- Express Backend: http://localhost:8000
- Python Agent: http://localhost:8090

### Manual Startup

1. **Start Python Google Calendar Agent:**

   ```bash
   cd aifbc-google-calendar-agent
   source venv/bin/activate
   python server.py
   ```

2. **Start Express Backend:**

   ```bash
   cd aifbc-agent
   npm run dev
   ```

3. **Start React Frontend:**
   ```bash
   cd aifbc-frontend
   npm run dev
   ```

## 📱 Application Features

### 1. Timezone Selection

- Default timezone: Asia/Bangkok (GMT+7)
- Support for 10+ common timezones
- Automatic date/time conversion across all features

### 2. Quick Calendar Tab

- **Upcoming Events**: Fetch recent calendar events
- **Today's Events**: View today's schedule in selected timezone
- **Free/Busy Status**: Check availability for date ranges

### 3. Upload & Analyze Tab

- **File Upload**: Drag & drop or browse for .ics files
- **AI Analysis**: Get intelligent insights from uploaded calendar data
- **Custom Prompts**: Specify analysis requirements

### 4. Google Calendar AI Tab

- **Natural Language Queries**: Ask questions about your calendar
- **AI-Powered Responses**: Get intelligent analysis and recommendations
- **Timezone-Aware**: All responses respect your selected timezone

## 🔧 API Endpoints

### Express Backend (Port 8000)

- `GET /ai-analytics` - Analyze uploaded calendar data
- `GET /calendar/events` - Get upcoming events
- `GET /calendar/today` - Get today's events
- `POST /calendar/freebusy` - Check free/busy status
- `POST /calendar/ai-query` - AI calendar queries

### Python Agent (Port 8090)

- `GET /health` - Health check
- `GET /events` - Google Calendar events
- `GET /today` - Today's events
- `POST /freebusy` - Free/busy information
- `POST /ai-query` - AI calendar analysis

## 🛠️ Development

### Frontend Development

```bash
cd aifbc-frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development

```bash
cd aifbc-agent
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start            # Start production server
```

### Python Agent Development

```bash
cd aifbc-google-calendar-agent
source venv/bin/activate
python server.py     # Start Flask server
python chat_cli.py   # Run CLI interface
```

## 🔐 Authentication

The application uses Google OAuth 2.0 for calendar access:

1. First run triggers OAuth flow
2. Browser opens for authentication
3. Credentials saved to `token.json`
4. Subsequent runs use saved credentials

## 🌍 Timezone Support

- **Default**: Asia/Bangkok (GMT+7)
- **Supported**: 10+ common timezones
- **Automatic Conversion**: All dates converted to selected timezone
- **AI Context**: AI responses include timezone information

## 🤖 AI Integration

- **Gemini 2.0 Flash**: Google's latest AI model
- **Calendar Analysis**: Intelligent insights from calendar data
- **Natural Language**: Ask questions in plain English
- **Contextual Responses**: Timezone-aware and personalized

## 📦 Dependencies

### Frontend

- React 18+ with TypeScript
- Material-UI (MUI) for components
- Vite for build tooling

### Backend

- Express.js with TypeScript
- Axios for HTTP requests
- CORS enabled

### Python Agent

- Flask for web server
- Google Calendar API client
- Google Generative AI (Gemini)
- pytz for timezone handling

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid date" errors**: Ensure Python agent is running with pytz installed
2. **OAuth redirect errors**: Check redirect URI in Google Cloud Console
3. **API key errors**: Verify environment variables are set correctly
4. **Timezone issues**: Ensure pytz is installed in Python environment

### Debug Mode

Enable debug logging:

```bash
# Frontend
DEBUG=true npm run dev

# Backend
DEBUG=true npm run dev

# Python Agent
python server.py  # Debug mode enabled by default
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:

- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub

---

**Built with ❤️ using React, Express, Python, and Google AI**
