# ai-freebusy-calendar
Welcome! This guide is designed to help you get the project running on your Mac, even if you're new to the command line. We'll walk you through every step.

## 1. Prerequisites (One-Time Setup)

Before you can run the project, you need a few things installed and set up on your computer. You only need to do this part once.

### a. Get Your Gemini API Key

This project uses Google's Gemini AI. You'll need a special key (called an API Key) to use it.

1. Go to the Google AI Studio website: <https://aistudio.google.com/app/apikey>
2. You may need to log in with your Google account.
3. Click the "**Create API key**" button.
4. A new key will be generated for you. It's a long string of letters and numbers.
5. **Copy this key and save it somewhere safe**, like in a notes app. You will need it in a moment.

### b. Open the Terminal App

The "Terminal" is an application on your Mac that lets you run commands directly.

1. Press the `Command` + `Space` keys on your keyboard to open Spotlight Search.
2. Type `Terminal` and press `Enter`.
3. A window with a flashing cursor will open. This is the command line. You'll copy and paste commands into this window.

### c. Install Node.js & Other Tools

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

### d. Navigate to the Project and Install Dependencies

Now, tell the Terminal where your project files are located.

1.  **Open the Project Folder:** Drag the project's main folder from your Finder window and drop it directly onto the Terminal window. The path to the folder will appear.
2.  **Go to the Directory:** In your Terminal window, type `cd ` (make sure to include the space after 'cd'), then drag the project folder from Finder directly into the Terminal window. The path will appear automatically. Press `Enter`.
    ```bash
    # Example: cd /Users/yourname/Desktop/aifbc-agent
    cd [path to your project folder]
    ```
3.  **Make Scripts Executable:** Before we continue, you need to give your Mac permission to run the project's scripts. Copy and paste the following command into your Terminal and press `Enter`:
    ```bash
    chmod +x create-env.sh start.sh
    ```
4.  **Install Dependencies:** Now that you are "inside" the project folder in your Terminal, run this command to download the necessary code packages.
    ```bash
    npm install
    ```
    This command downloads all the necessary code packages that the project depends on to run correctly. This might take a minute or two.

## 2. Running The Application

Once you've completed all the prerequisites, follow these two steps every time you want to run the app.

### Step 1: Set Your API Key

You need to tell the application about the secret API key you got from Google. Our special script makes this easy.

1.  Make sure you are still in the project's folder in your Terminal.
2.  Run the `create-env.sh` script by typing this and pressing `Enter`:
    ```bash
    ./create-env.sh
    ```
3.  The script will ask you to choose a project. Type `1` or `2` and press `Enter`.
4.  It will then ask for a **KEY**. Type `GEMINI_API_KEY` and press `Enter`.
5.  Finally, it will ask for the **VALUE**. **Paste the Gemini API Key** you saved earlier and press `Enter`.
6.  Press `e` and then `Enter` to finish.

### Step 2: Start the App

Now you're ready to go!

1.  In the same Terminal window, run this command:
    ```bash
    ./start.sh
    ```
2.  The Terminal will show a lot of text, indicating that the application's processes are starting up. The application should now be running locally!

**To stop the application**, go back to the Terminal window and press `Ctrl` + `C` on your keyboard.
