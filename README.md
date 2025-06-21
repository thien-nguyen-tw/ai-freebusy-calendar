# ai-freebusy-calendar

Welcome! This guide is designed to help you get the project running on your Mac, even if you're new to the command line. We'll walk you through every step.

# How to get the project:

## Download and Setup Instructions

### Method 1: Download ZIP from GitHub (Recommended for beginners)

#### Step 1: Download the ZIP file

1. **Go to the GitHub repository:**
   - Open your web browser
   - Navigate to: `https://github.com/your-username/ai-freebusy-calendar`
   - Replace `your-username` with the actual repository owner's username

2. **Download the ZIP file:**
   - Click the green "**Code**" button (usually in the top-right area)
   - From the dropdown menu, select "**Download ZIP**"
   - The file will be named `ai-freebusy-calendar-main.zip` (or similar)
   - The download will start automatically to your default Downloads folder

#### Step 2: Extract the ZIP file

**On macOS:**
1. **Navigate to Downloads folder:**
   - Open Finder
   - Click on "Downloads" in the sidebar, or
   - Press `Cmd + Shift + L` to open Downloads folder

2. **Extract the ZIP file:**
   - Find the downloaded `ai-freebusy-calendar-main.zip` file
   - Double-click the ZIP file
   - macOS will automatically extract it to the same folder
   - A new folder named `ai-freebusy-calendar-main` will be created

3. **Move to desired location:**
   - Drag the extracted `ai-freebusy-calendar-main` folder to your Desktop or Documents
   - Rename it to `ai-freebusy-calendar` if desired

#### Step 3: Verify the extraction

After extraction, you should have a folder structure like this:
```
ai-freebusy-calendar/
├── aifbc-frontend/
├── aifbc-agent/
├── aifbc-google-calendar-agent/
├── scripts/
├── README.md
└── run-app.sh
```

### Method 2: Using Command Line (Advanced users)

#### Using curl/wget to download directly:

**On macOS/Linux:**
```bash
# Navigate to where you want to download the project
cd ~/Desktop

# Download the ZIP file
curl -L -o ai-freebusy-calendar.zip https://github.com/your-username/ai-freebusy-calendar/archive/main.zip

# Extract the ZIP file
unzip ai-freebusy-calendar.zip

# Rename the folder
mv ai-freebusy-calendar-main ai-freebusy-calendar

# Navigate into the project folder
cd ai-freebusy-calendar
```

**Using wget (if available):**
```bash
# Download the ZIP file
wget https://github.com/your-username/ai-freebusy-calendar/archive/main.zip

# Extract and rename
unzip main.zip
mv ai-freebusy-calendar-main ai-freebusy-calendar
cd ai-freebusy-calendar
```

### Method 3: Using Git Clone (For developers)

If you have Git installed and want to get the latest version:

```bash
# Navigate to where you want to clone the project
cd ~/Desktop

# Clone the repository
git clone https://github.com/your-username/ai-freebusy-calendar.git

# Navigate into the project folder
cd ai-freebusy-calendar
```

### Troubleshooting Download Issues

#### If the ZIP file won't download:
1. **Check your internet connection**
2. **Try a different browser**
3. **Clear browser cache and cookies**
4. **Check if the repository is public**

#### If the ZIP file won't extract:
1. **Verify the download completed successfully**
2. **Check if you have enough disk space**
3. **Try downloading the ZIP file again**
4. **Use a different extraction tool**

#### If you get permission errors:
```bash
# On macOS/Linux, make sure you have proper permissions
chmod -R 755 ai-freebusy-calendar
```

### Next Steps

After successfully downloading and extracting the project:

1. **Open Terminal/Command Prompt**
2. **Navigate to the project folder:**
   ```bash
   cd /path/to/ai-freebusy-calendar
   ```
3. **Continue with the setup instructions below**

---

## Google Calendar Credentials

For running the app locally, please contact the code owner (nguyen.thien@thoughtworks.com) to get the `GOOGLE_API_KEY` & `credentials` for testing. Otherwise, you will need to go to Google Cloud Console to enable your our `GOOGLE_API_KEY`, `enable` Google Calendar API and create your own `credentials`.

### Setting Up Google Cloud Console Credentials

1. **Go to Google Cloud Console:**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project:**
   - Click on the project dropdown at the top of the page
   - Click "New Project"
   - Enter a project name (e.g., "AI FreeBusy Calendar")
   - Click "Create"

3. **Enable Google Calendar API:**
   - In the left sidebar, click "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on "Google Calendar API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" user type
     - Fill in the required fields (App name, User support email, Developer contact information)
     - Add scopes: `https://www.googleapis.com/auth/calendar.readonly`
     - Add test users (your email address)
   - For Application type, choose "Web application"
   - Add these Authorized redirect URIs:
     - `http://localhost:8090/`
     - `http://localhost:8090/`
     - `http://localhost:3000/`
   - Click "Create"
   - Download the JSON file and save it as `credentials.json` in the `aifbc-google-calendar-agent/` folder

5. **Alternative: Create API Key (Limited Functionality):**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key for use in the application
   - **Note:** API keys have limited access and won't work for freebusy queries

### Important Notes:
- **OAuth 2.0** is required for full calendar access and freebusy queries
- **API Keys** only work for basic calendar reading and have usage limits
- The application will automatically use OAuth if `credentials.json` is present, otherwise it will fall back to API key authentication

## Get Your Gemini API Key

This project uses Google's Gemini AI. You'll need a special key (called an API Key) to use it.

1. Go to the Google AI Studio website: <https://aistudio.google.com/app/apikey>
2. You may need to log in with your Google account.
3. Click the "**Create API key**" button.
4. A new key will be generated for you. It's a long string of letters and numbers.
5. **Copy this key and save it somewhere safe**, like in a notes app. You will need it in a moment.

## Open the Terminal App

The "Terminal" is an application on your Mac that lets you run commands directly.

1. Press the `Command` + `Space` keys on your keyboard to open Spotlight Search.
2. Type `Terminal` and press `Enter`.
3. A window with a flashing cursor will open. This is the command line. You'll copy and paste commands into this window.

Now, tell the Terminal where your project files are located.

1.  **Open the Project Folder:** Drag the project's main folder from your Finder window and drop it directly onto the Terminal window. The path to the folder will appear.
2.  **Go to the Directory:** In your Terminal window, type `cd ` (make sure to include the space after 'cd'), then drag the project folder from Finder directly into the Terminal window. The path will appear automatically. Press `Enter`.
    ```bash
    # Navigate to your project folder
    # Example: cd /Users/yourname/Desktop/ai-freebusy-calendar
    cd [path to your project folder]
    ```

---

## Quick Start Options: You have two ways to set up and run the application:

### Option A: Easy Setup with Shell Script (Recommended)

**First Time Setup:**

```bash
# Make the script executable
chmod +x run-app.sh

# Run the complete setup and start
./run-app.sh
```

The script will automatically:

- Install all dependencies (Node.js and Python)
- Set up environment variables
- Start all services

**Subsequent Runs:**

```bash
# For quick start (skip setup steps)
# Alternative, run: ./run-app.sh --start-only
./run-app.sh -so
```

### Option B: Manual Setup (For advanced users)

If you prefer to set up everything manually, follow the detailed steps in the sections below.

## 1. Prerequisites (One-Time Setup)

Before you can run the project, you need a few things installed and set up on your computer. You only need to do this part once.

### a. Get the Project Files

First, you need to download the project files to your computer. You have two options:

**Option 1: Download from GitHub (Recommended for beginners)**

1. Go to the project's GitHub page: [https://github.com/your-username/ai-freebusy-calendar](https://github.com/your-username/ai-freebusy-calendar)
2. Click the green "**Code**" button
3. Select "**Download ZIP**"
4. The ZIP file will download to your Downloads folder
5. Double-click the ZIP file to extract it
6. Move the extracted folder to a location like your Desktop or Documents folder

**Option 2: Use Git (For developers)**
If you have Git installed, you can clone the repository:

```bash
git clone https://github.com/your-username/ai-freebusy-calendar.git
cd ai-freebusy-calendar
```

### b. Install Node.js & Other Tools

We'll use a tool called **Homebrew** to easily install the software we need.

1.  **Install Homebrew:** Copy the entire command below, paste it into your Terminal window, and press `Enter`. It will ask for your Mac's password to proceed.
    ```bash
    /bin/bash -c "$(curl -fsSL [https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh](https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh))"
    ```
2.  **Install Node.js:** Once Homebrew is finished, copy and paste this next command to install Node.js (a JavaScript runtime environment).
    ```bash
    brew install node@18
    ```
3.  **Verify the Installation:** To make sure it worked, run this command. It should show you a version number starting with `v18`.
    ```bash
    node -v
    ```

### c. Install Dependencies

1.  **Make Scripts Executable:** Before we continue, you need to give your Mac permission to run the project's scripts. Copy and paste the following command into your Terminal and press `Enter`:
    ```bash
    chmod +x scripts/*.sh start.sh
    ```
2.  **Install Dependencies:** This project has multiple components that need their dependencies installed. We'll install them one by one:

    **For Node.js Projects (Frontend and Backend):**

    a. **Install Frontend Dependencies:**

    ```bash
    cd aifbc-frontend
    npm ci
    cd ..
    ```

    b. **Install Backend Dependencies:**

    ```bash
    cd aifbc-agent
    npm ci
    cd ..
    ```

    **For Python Project (Google Calendar Agent):**

    c. **Create and Setup Python Virtual Environment:**

    ```bash
    cd aifbc-google-calendar-agent
    python3 -m venv .venv
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    deactivate
    cd ..
    ```

    **What these commands do:**

    - `npm ci` downloads all the necessary JavaScript packages for each Node.js project
    - `python3 -m venv .venv` creates a Python virtual environment (isolated space for Python packages)
    - `source .venv/bin/activate` activates the virtual environment
    - `pip install -r requirements.txt` installs all Python packages listed in the requirements file
    - `deactivate` exits the virtual environment

    This might take a few minutes to complete all installations.

## 2. Running The Application (Manual Setup)

Once you've completed all the prerequisites, follow these two steps every time you want to run the app.

### Step 1: Set Your API Key

You need to tell the application about the secret API key you got from Google. Our special script makes this easy.

1.  Make sure you are still in the project's folder in your Terminal.
2.  Run the `create-env.sh` script by typing this and pressing `Enter`:
    ```bash
    ./scripts/create-env.sh
    ```
3.  The script will ask you to input the values for `GOOGLE_API_KEY` and `GEMINI_API_KEY`.
4.  **Paste the Gemini API Key** you saved earlier and press `Enter` (For easier setup, just use the same API key for both)

### Step 2: Start the App

Now you're ready to go!

1.  In the same Terminal window, run this command:
    ```bash
    ./run-app.sh
    ```
2.  The Terminal will show a lot of text, indicating that the application's processes are starting up. The application should now be running locally! Open app by entering this URL: http://localhost:3000

**To stop the application**, go back to the Terminal window and press `Ctrl` + `C` on your keyboard.

## 3. Project Structure

This project consists of three main components:

```
ai-freebusy-calendar/
├── aifbc-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   └── types.ts         # TypeScript type definitions
│   └── package.json
├── aifbc-agent/             # Node.js Express backend
│   ├── src/
│   │   └── index.ts         # Express server
│   └── package.json
├── aifbc-google-calendar-agent/  # Python Flask server
│   ├── server.py            # Flask server with Google Calendar API
│   ├── chat_cli.py          # Command-line interface
│   └── requirements.txt     # Python dependencies
└── scripts/                 # Setup and utility scripts
```

## 4. Troubleshooting

### Common Issues and Solutions

#### Issue: "Module not found" or "Cannot find module"
**Solution:** Make sure all dependencies are installed:
```bash
# Reinstall frontend dependencies
cd aifbc-frontend && npm ci && cd ..

# Reinstall backend dependencies  
cd aifbc-agent && npm ci && cd ..

# Reinstall Python dependencies
cd aifbc-google-calendar-agent
source .venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

#### Issue: "Port already in use" errors
**Solution:** Kill processes using the required ports:
```bash
# Kill processes on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill processes on port 8090 (backend)
lsof -ti:8090 | xargs kill -9

# Kill processes on port 8090 (Python server)
lsof -ti:8090 | xargs kill -9
```

#### Issue: "OAuth redirect URI mismatch"
**Solution:** 
1. Go to Google Cloud Console > APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add the exact redirect URI that's being used (check the error message)
4. Common URIs to add: `http://localhost:8090/`, `http://localhost:8090/`, `http://localhost:3000/`

#### Issue: "API key quota exceeded"
**Solution:**
1. Check your Google Cloud Console quotas
2. Consider using OAuth 2.0 instead of API key
3. Wait for quota reset (usually daily)

#### Issue: "Python virtual environment not found"
**Solution:** Recreate the virtual environment:
```bash
cd aifbc-google-calendar-agent
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

#### Issue: "Node.js version incompatible"
**Solution:** Install the correct Node.js version:
```bash
# Install Node.js 18
brew install node@18

# Link it as the default
brew link node@18

# Verify version
node -v  # Should show v18.x.x
```

### Environment Variables

The application uses these environment variables (set in `.env` file):

```bash
# Required for AI functionality
GEMINI_API_KEY=your_gemini_api_key_here

# For Google Calendar API (alternative to OAuth)
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Custom ports
FRONTEND_PORT=3000
BACKEND_PORT=8090
PYTHON_SERVER_PORT=8090
```

## 5. Advanced Usage

### Running Individual Components

If you want to run components separately for development:

**Frontend Only:**
```bash
cd aifbc-frontend
npm run dev
```

**Backend Only:**
```bash
cd aifbc-agent
npm start
```

**Python Server Only:**
```bash
cd aifbc-google-calendar-agent
source .venv/bin/activate
python server.py
```

### Development Mode

For development with hot reloading:

```bash
# Frontend with hot reload
cd aifbc-frontend
npm run dev

# Backend with nodemon (install first: npm install -g nodemon)
cd aifbc-agent
nodemon src/index.ts
```

### Testing the Application

1. **Frontend Testing:**
   - Open http://localhost:3000
   - Test file upload with `.ics` files
   - Test quick calendar queries
   - Test Google Calendar AI queries

2. **Backend Testing:**
   - Test API endpoints at http://localhost:8090
   - Check server logs for errors

3. **Python Server Testing:**
   - Test calendar endpoints at http://localhost:8090
   - Use the chat CLI: `python chat_cli.py`

### File Upload Testing

The application includes sample `.ics` files for testing:
- `aifbc-frontend/src/dummy-calendars/corporate_executive.ics`
- `aifbc-frontend/src/dummy-calendars/freelance_designer.ics`
- `aifbc-frontend/src/dummy-calendars/university_student.ics`

### Logs and Debugging

**View logs for each component:**

```bash
# Frontend logs (in browser console)
# Backend logs (in terminal where you ran the server)
# Python server logs (in terminal where you ran the server)
```

**Enable debug mode:**
```bash
# Set debug environment variable
export DEBUG=true
./run-app.sh
```

## 6. Contributing

### Code Style
- Frontend: Follow React/TypeScript best practices
- Backend: Follow Node.js/Express conventions
- Python: Follow PEP 8 style guidelines

### Adding New Features
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit a pull request

### Reporting Issues
When reporting issues, please include:
- Operating system and version
- Node.js version (`node -v`)
- Python version (`python3 --version`)
- Error messages and stack traces
- Steps to reproduce the issue

## 7. Support

For technical support or questions:
- Email: nguyen.thien@thoughtworks.com
- Create an issue on the project repository
- Check the troubleshooting section above

---

**Happy coding! 🚀**
