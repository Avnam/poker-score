# Poker Score Calculator

A web application to track poker game scores and calculate how much each participant owes to others.

## Features

- Add and manage player names
- Support for 2-40 participants
- Input player balances
- Automatic calculation of debts between players
- Visual display of who owes whom and how much
- Data persistence using localStorage
- Mobile-responsive design

## How to Use

1. Click "Add player" to add new player names
2. Select the number of participants from the dropdown
3. For each participant:
   - Select their name from the dropdown
   - Enter their balance (positive for winners, negative for losers)
4. Click "Calculate" to see the results
5. The results will show who owes whom and how much

## Running Locally

You can run this application locally in several ways:

### Method 1: Open the HTML file directly
1. Simply double-click the `index.html` file in your file explorer
2. It will open in your default web browser

### Method 2: Use a local server (recommended)
1. Open a terminal/command prompt in the project directory
2. If you have Python installed, run:
   ```
   python -m http.server 8000
   ```
   Or if you have Node.js installed, run:
   ```
   npx http-server
   ```
3. Open your web browser and navigate to:
   - `http://localhost:8000` (for Python)
   - `http://localhost:8080` (for Node.js)

Note: Using a local server (Method 2) is recommended as it better simulates a real web environment and can help avoid potential issues with file loading.

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses localStorage for data persistence
- Responsive design that works on both desktop and mobile devices
- No external dependencies

## Files

- `index.html` - Main application interface
- `js/script.js` - Core application logic
- `css/style.css` - Styling and responsive design
