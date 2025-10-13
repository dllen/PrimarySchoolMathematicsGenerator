# Primary School Mathematics Generator

## Overview
This is a Vue 3 + Vite application for generating primary school math practice problems. The app allows users to configure various parameters (digit count, operation types, number of problems) and generate customized math worksheets that can be printed.

## Project Architecture

### Tech Stack
- **Frontend Framework**: Vue 3 (Options API)
- **Build Tool**: Vite 4.4.5
- **Language**: JavaScript
- **Styling**: Native CSS with responsive design

### Project Structure
```
├── public/          # Static assets
├── src/
│   ├── App.vue      # Main application component
│   ├── main.js      # Application entry point
│   └── style.css    # Global styles
├── index.html       # HTML template
├── package.json     # Dependencies and scripts
└── vite.config.js   # Vite configuration
```

## Features
- Generate math problems with configurable parameters:
  - Digit count (1-3 digits)
  - Number of problems (1-100)
  - Number of terms (2-4)
  - Operation types (addition, subtraction, multiplication, division)
  - Problem type (find result or find operand)
- Show/hide answers
- Print-friendly layout
- Responsive design

## Development Setup

### Running the Application
The app runs on port 5000 with the workflow named "Server":
- Command: `npm run dev`
- Port: 5000
- Host: 0.0.0.0 (configured for Replit environment)

### Deployment
- **Type**: Autoscale (static site)
- **Build**: `npm run build`
- **Run**: `npx vite preview --host 0.0.0.0 --port 5000`

## Configuration Notes

### Replit Environment
The Vite configuration has been updated to work properly in Replit:
- Server listens on 0.0.0.0:5000
- HMR (Hot Module Replacement) configured for port 5000
- No host verification restrictions (allows Replit proxy)

### Original Deployment
The project was originally configured for GitHub Pages deployment with:
- Base path: `/PrimarySchoolMathematicsGenerator/`
- Deploy script using gh-pages

## Recent Changes
- **2025-10-13**: Imported from GitHub and configured for Replit environment
  - Updated vite.config.js to serve on 0.0.0.0:5000
  - Configured workflow for development server
  - Set up deployment configuration for autoscale
