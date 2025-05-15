# RVTools Excel Parser

This React application allows users to:
1. Upload RVTools export files in Excel format
2. Parse the Excel data into JSON format
3. Submit the parsed data to an AWS Lambda function

## Features

- File upload interface for Excel files (.xls, .xlsx)
- Excel to JSON conversion using the xlsx library
- JSON preview of parsed data
- Configurable AWS Lambda endpoint
- Form validation and error handling
- Responsive UI design

## Setup and Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Usage Instructions

1. Click "Choose File" to select an RVTools Excel export file
2. Click "Parse Excel to JSON" to convert the file to JSON format
3. Review the JSON preview to ensure data was parsed correctly
4. Enter your AWS Lambda function URL in the input field
5. Click "Submit to AWS Lambda" to send the data

## AWS Lambda Configuration

The application expects the AWS Lambda function to:
- Accept POST requests with JSON data
- Process the RVTools data in the format provided
- Return appropriate success/error responses

Example Lambda function URL format:
```
https://[lambda-id].lambda-url.[region].on.aws/
```

## Technologies Used
- React.js
- xlsx (for Excel parsing)
- Axios (for API calls)
- Jest and React Testing Library (for testing)

## Project Structure

```
/
├── public/             # Static files
├── src/
│   ├── components/     # React components
│   │   ├── RVToolsParser.js
│   │   ├── RVToolsParser.css
│   │   └── RVToolsParser.test.js
│   ├── App.js          # Main App component
│   ├── App.css         # App styles
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── package.json        # Dependencies and scripts
└── devfile.yaml        # Development environment configuration
```

## Development with Devfile

This project includes a devfile.yaml that defines the development environment configuration. The devfile:

- Uses schema version 2.0.0
- Configures a universal container image for development
- Defines commands for installing dependencies, building the application, and running tests

To use the devfile with a compatible tool:

```bash
# Install dependencies
devfile run install

# Build the application
devfile run build

# Run tests
devfile run test
```
