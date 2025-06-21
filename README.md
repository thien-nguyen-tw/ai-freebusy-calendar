# ai-freebusy-calendar

Welcome! This guide is designed to help you get the project running on your Mac, even if you're new to the command line. We'll walk you through every step.

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
