# AI FreeBusy Calendar - Frontend

A modern React-based frontend application for the AI FreeBusy Calendar project. This application provides an intuitive interface for calendar management, AI-powered analytics, and timezone-aware scheduling.

## 🚀 Features

### Core Functionality

- **Calendar Upload & Analysis**: Upload `.ics` files for AI-powered calendar analysis
- **Google Calendar Integration**: Connect to Google Calendar for real-time data
- **AI-Powered Queries**: Natural language queries for calendar insights
- **Timezone Support**: Full timezone awareness with GMT+7 default
- **Modern UI**: Material-UI based interface with responsive design

### Technical Features

- **React 18**: Latest React features with hooks and functional components
- **TypeScript**: Full type safety and better development experience
- **Vite**: Fast development server and optimized builds
- **Material-UI**: Professional UI components and theming
- **Axios**: HTTP client for API communication
- **Context API**: Global state management for timezone and app state

## 📁 Project Structure

```
aifbc-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── TimezoneSelector.tsx
│   ├── contexts/           # React contexts for state management
│   │   └── TimezoneContext.tsx
│   ├── dummy-calendars/    # Sample .ics files for testing
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions
│   └── vite-env.d.ts      # Vite environment types
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md              # This file
```

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.3.5
- **UI Library**: Material-UI (MUI) 7.1.2
- **HTTP Client**: Axios 1.6.7
- **Styling**: Emotion (CSS-in-JS)
- **Development**: TypeScript 5.3.3

## 📦 Installation

### Prerequisites

- Node.js >= 18
- npm or yarn package manager

### Quick Setup

```bash
# Navigate to the frontend directory
cd aifbc-frontend

# Install dependencies
npm ci

# Start development server
npm run dev
```

### Manual Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd ai-freebusy-calendar/aifbc-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server

The development server runs on `http://localhost:5173` by default.

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_PYTHON_API_BASE_URL=http://localhost:8090
```

## 🏗️ Architecture

### Component Structure

- **App.tsx**: Main application component with tabbed interface
- **TimezoneSelector**: Dropdown for timezone selection
- **Contexts**: Global state management for timezone and app configuration

### State Management

- **TimezoneContext**: Manages global timezone state
- **Local State**: Component-specific state using React hooks
- **API State**: Server state managed through Axios requests

### API Integration

- **Express Backend**: Main API endpoints (`/api/*`)
- **Python Flask**: Calendar and AI endpoints (`/calendar/*`, `/ai/*`)
- **Error Handling**: Comprehensive error handling and user feedback

## 🎨 UI/UX Features

### Design System

- **Material-UI**: Consistent design language
- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Theme**: Theme support (configurable)
- **Accessibility**: WCAG compliant components

### User Experience

- **Tabbed Interface**: Organized feature sections
- **File Upload**: Drag-and-drop calendar file upload
- **Loading States**: Visual feedback during operations
- **Error Messages**: Clear error communication
- **Success Feedback**: Confirmation of successful operations

## 🔧 Configuration

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
      "/calendar": "http://localhost:8090",
      "/ai": "http://localhost:8090",
    },
  },
});
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🧪 Testing

### Manual Testing

- **File Upload**: Test with sample `.ics` files in `dummy-calendars/`
- **Timezone Changes**: Verify timezone conversion works correctly
- **API Integration**: Test with running backend services
- **Responsive Design**: Test on different screen sizes

### Sample Data

The `dummy-calendars/` directory contains sample `.ics` files for testing:

- `corporate_executive.ics`
- `freelance_designer.ics`
- `university_student.ics`

## 🚀 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Build Output

The build creates a `dist/` directory with:

- Optimized JavaScript bundles
- Minified CSS
- Static assets
- HTML entry point

### Deployment Options

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Container**: Docker with nginx

## 🔗 API Endpoints

### Express Backend (Port 8000)

- `GET /api/health` - Health check
- `POST /api/upload` - File upload endpoint
- `POST /api/query` - AI query endpoint

### Python Flask (Port 8090)

- `GET /calendar/health` - Calendar service health
- `POST /calendar/upload` - Calendar file processing
- `POST /ai/query` - AI-powered calendar queries
- `GET /calendar/google/auth` - Google OAuth
- `POST /calendar/google/query` - Google Calendar queries

## 🐛 Troubleshooting

### Common Issues

**Development Server Won't Start**

```bash
# Check if port is in use
lsof -i :5173

# Kill process if needed
kill -9 <PID>
```

**API Connection Issues**

- Verify backend services are running
- Check environment variables
- Ensure CORS is configured correctly

**Build Errors**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**

```bash
# Check TypeScript configuration
npx tsc --noEmit
```

## 🤝 Contributing

### Development Workflow

1. Create feature branch
2. Make changes with TypeScript
3. Test functionality
4. Update documentation
5. Submit pull request

### Code Style

- Use TypeScript for all new code
- Follow React hooks patterns
- Use Material-UI components
- Maintain consistent formatting

## 📄 License

This project is part of the AI FreeBusy Calendar application. See the main project README for license information.

## 🔗 Related Projects

- **Backend**: `aifbc-agent` - Express.js API server
- **Calendar Service**: `aifbc-google-calendar-agent` - Python Flask service
- **Main Project**: `ai-freebusy-calendar` - Complete application

---

For more information, see the main project README or contact the development team.
