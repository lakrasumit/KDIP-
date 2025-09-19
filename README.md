# KMRL Document Platform with FastAPI Backend

This project integrates email processing and document summarization with a React frontend.

## Features

- 📧 **Email Processing**: Automatically download PDF attachments from Gmail
- 📄 **Document Summarization**: AI-powered document analysis using Google Gemini
- 🖥️ **Real-time Dashboard**: Live updates of recent documents
- 🔄 **Background Processing**: Non-blocking email checks and document processing

## Quick Start

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Install Node.js dependencies:**
   ```bash
   cd kmrl-document-platform
   npm install
   ```

3. **Run the platform:**
   ```bash
   # Double-click start-platform.bat (Windows)
   # Or run manually:
   
   # Terminal 1 - Backend
   cd backend
   python main.py
   
   # Terminal 2 - Frontend  
   cd kmrl-document-platform
   npm run dev
   ```

## API Endpoints

- `GET /api/documents/recent` - Get recent documents
- `POST /api/email/check` - Check for new emails
- `POST /api/documents/process` - Process PDFs and generate summaries
- `GET /api/documents/{id}` - Get specific document
- `DELETE /api/documents/{id}` - Delete document

## Configuration

### Email Settings
Update credentials in `backend/services/email_service.py`:
```python
self.email_address = "your_email@gmail.com"
self.password = "your_app_password"  # Use App Password for Gmail
```

### Google AI API
Update API key in `backend/services/document_service.py`:
```python
self.google_api_key = 'your_google_ai_api_key'
```

## Usage

1. **Check Emails**: Click "Check Emails" to download new PDF attachments
2. **Process Documents**: Click "Process Docs" to generate summaries for all PDFs
3. **View Results**: Recent documents appear in the dashboard with summaries

## File Structure

```
backend/
├── main.py                 # FastAPI application
├── models/document.py      # Data models
├── services/
│   ├── email_service.py    # Email processing
│   └── document_service.py # Document analysis
└── requirements.txt        # Python dependencies

kmrl-document-platform/
├── src/pages/Dashboard.jsx # Updated dashboard with API integration
└── package.json           # Node dependencies

pdf_files/                  # Downloaded PDFs (auto-created)
documents_metadata.json     # Document metadata (auto-created)
```

## Troubleshooting

- **Email not working**: Ensure Gmail App Password is configured
- **API errors**: Check if backend server is running on port 8000
- **CORS issues**: Frontend should run on port 5173 (configured in CORS settings)