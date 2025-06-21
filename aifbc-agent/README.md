# AI FreeBusy Calendar - Agent

A Node.js Express.js backend service for the AI FreeBusy Calendar project. This agent provides RESTful API endpoints for calendar management, AI-powered analytics, and serves as a proxy to the Python Flask calendar service.

## 🚀 Features

### Core Functionality
- **RESTful API**: Express.js server with TypeScript
- **AI Integration**: Google Gemini AI for calendar analytics
- **Calendar Proxy**: Routes requests to Python Flask service
- **Health Monitoring**: Service health checks and status reporting
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Error Handling**: Comprehensive error handling and logging

### Technical Features
- **Express.js 4.18.2**: Fast, unopinionated web framework
- **TypeScript 5.3.3**: Full type safety and modern JavaScript features
- **Google Generative AI**: Gemini 2.0 Flash model integration
- **Axios**: HTTP client for Python service communication
- **CORS**: Cross-origin request handling
- **Environment Variables**: Secure configuration management

## 📁 Project Structure

```
aifbc-agent/
├── src/
│   └── index.ts           # Main server file with all endpoints
├── dist/                  # Compiled JavaScript output
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── .env                   # Environment variables (create this)
└── README.md              # This file
```

## 🛠️ Technology Stack

- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express.js 4.18.2
- **Language**: TypeScript 5.3.3
- **AI Service**: Google Generative AI (Gemini 2.0 Flash)
- **HTTP Client**: Axios 1.6.7
- **Development**: ts-node, ts-node-dev
- **CORS**: cors 2.8.5

## 📦 Installation

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn package manager
- Python Flask service running on port 8090

### Quick Setup
```bash
# Navigate to the agent directory
cd aifbc-agent

# Install dependencies
npm ci

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Manual Setup
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd ai-freebusy-calendar/aifbc-agent

# Install dependencies
npm install

# Create environment file
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
echo "GOOGLE_API_KEY=your_google_api_key_here" >> .env

# Start development server
npm run dev
```

## 🚀 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Build TypeScript to JavaScript
npm run build
```

### Development Server
The development server runs on `http://localhost:8000` by default.

### Environment Variables
Create a `.env` file in the agent directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
```

## 🏗️ Architecture

### Server Configuration
- **Port**: 8000 (configurable)
- **CORS**: Enabled for `http://localhost:3000` (frontend)
- **Body Parser**: JSON middleware enabled
- **Python Service**: Proxies to `http://localhost:8090`

### API Structure
- **Health Check**: Service status monitoring
- **Calendar Endpoints**: Proxy to Python service
- **AI Analytics**: Direct Gemini AI integration
- **Agent Card**: Service discovery endpoint

### Error Handling
- **Try-Catch Blocks**: Comprehensive error catching
- **Status Codes**: Proper HTTP status codes
- **Error Logging**: Console logging for debugging
- **User-Friendly Messages**: Clear error responses

## 🔗 API Endpoints

### Health & Status
- `GET /health` - Service health check
- `GET /.well-known/agent.json` - Agent discovery endpoint

### Calendar Management (Proxy to Python)
- `GET /calendar/events?max_results=10` - Get calendar events
- `GET /calendar/today` - Get today's events
- `POST /calendar/freebusy` - Check free/busy status
- `POST /calendar/ai-query` - AI-powered calendar queries

### AI Analytics (Direct Integration)
- `POST /ai-analytics` - AI analysis of calendar data

### Request/Response Examples

#### Health Check
```bash
GET /health
```
```json
{
  "status": "healthy",
  "express": "running",
  "python_server": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### Calendar Events
```bash
GET /calendar/events?max_results=5
```
```json
{
  "events": [
    {
      "id": "event_1",
      "title": "Team Meeting",
      "start": "2024-01-01T10:00:00Z",
      "end": "2024-01-01T11:00:00Z"
    }
  ]
}
```

#### AI Analytics
```bash
POST /ai-analytics
Content-Type: application/json

{
  "userPrompt": "Analyze my schedule for this week",
  "jsonData": "[calendar data in JSON format]"
}
```
```json
{
  "result": {
    "text": "Based on your calendar data, you have 8 meetings scheduled this week..."
  }
}
```

#### Free/Busy Check
```bash
POST /calendar/freebusy
Content-Type: application/json

{
  "start_date": "2024-01-01T09:00:00Z",
  "end_date": "2024-01-01T17:00:00Z"
}
```

## 🔧 Configuration

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Express Configuration
```typescript
// CORS configuration
app.use(cors({ origin: "http://localhost:3000" }));

// JSON body parser
app.use(express.json());

// Environment variables
dotenv.config();
```

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Get calendar events
curl http://localhost:8000/calendar/events?max_results=5

# AI analytics
curl -X POST http://localhost:8000/ai-analytics \
  -H "Content-Type: application/json" \
  -d '{"userPrompt": "Test", "jsonData": "{}"}'
```

### API Testing Tools
- **Postman**: Import collection for endpoint testing
- **curl**: Command-line API testing
- **Browser**: Direct endpoint access for GET requests

## 🚀 Deployment

### Production Build
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
GEMINI_API_KEY=your_production_key
GOOGLE_API_KEY=your_production_key
PORT=8000
```

### Deployment Options
- **Docker**: Containerized deployment
- **PM2**: Process manager for Node.js
- **Cloud Platforms**: Heroku, AWS, Google Cloud
- **VPS**: Direct server deployment

## 🔍 Monitoring & Logging

### Health Monitoring
- **Health Endpoint**: `/health` for service status
- **Python Service Check**: Verifies Flask service connectivity
- **Error Logging**: Console output for debugging

### Logging
```typescript
// Error logging example
console.error("Calendar Events Error:", errorMessage);
console.log("Sending error response:", JSON.stringify(errorResponse, null, 2));
```

## 🐛 Troubleshooting

### Common Issues

**Server Won't Start**
```bash
# Check if port is in use
lsof -i :8000

# Kill process if needed
kill -9 <PID>
```

**Python Service Connection Issues**
- Verify Python Flask service is running on port 8090
- Check network connectivity
- Review Python service logs

**Environment Variable Issues**
```bash
# Check environment variables
echo $GEMINI_API_KEY
echo $GOOGLE_API_KEY

# Verify .env file exists
ls -la .env
```

**TypeScript Build Errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**CORS Issues**
- Verify frontend URL in CORS configuration
- Check browser console for CORS errors
- Ensure proper headers are set

## 🔒 Security

### Environment Variables
- **API Keys**: Stored in `.env` file (not committed to git)
- **CORS**: Restricted to frontend origin
- **Input Validation**: Request body validation
- **Error Handling**: No sensitive data in error responses

### Best Practices
- Use HTTPS in production
- Validate all input data
- Implement rate limiting
- Monitor API usage
- Regular dependency updates

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Make changes with TypeScript
3. Test API endpoints
4. Update documentation
5. Submit pull request

### Code Style
- Use TypeScript for all code
- Follow Express.js patterns
- Implement proper error handling
- Add JSDoc comments for functions
- Maintain consistent formatting

## 📄 License

This project is part of the AI FreeBusy Calendar application. See the main project README for license information.

## 🔗 Related Projects

- **Frontend**: `aifbc-frontend` - React application
- **Calendar Service**: `aifbc-google-calendar-agent` - Python Flask service
- **Main Project**: `ai-freebusy-calendar` - Complete application

## 📚 API Documentation

For detailed API documentation, see the main project README or run the server and visit:
- `http://localhost:8000/.well-known/agent.json` - Agent capabilities
- `http://localhost:8000/health` - Service status

---

For more information, see the main project README or contact the development team. 