from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import threading
from typing import List, Optional
import os
import json
from datetime import datetime
import asyncio

from services.email_service import EmailService
from services.document_service import DocumentService
from models.document import Document, DocumentSchema

app = Flask(__name__)

# CORS configuration for React frontend
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
     supports_credentials=True)

# Initialize services
email_service = EmailService()
document_service = DocumentService()
document_schema = DocumentSchema()

@app.route("/")
def root():
    return {"message": "KMRL Document Platform API"}

@app.route("/api/documents/recent", methods=["GET"])
def get_recent_documents():
    """Get list of recent documents with summaries"""
    try:
        # Since we're converting from async, we need to handle this differently
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        documents = loop.run_until_complete(document_service.get_recent_documents())
        loop.close()
        
        # Convert Document objects to dictionaries
        documents_dict = [doc.to_dict() if hasattr(doc, 'to_dict') else doc for doc in documents]
        return jsonify(documents_dict)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/process", methods=["POST"])
def process_documents():
    """Process all PDFs in the directory and generate summaries"""
    try:
        # Run in background thread instead of background tasks
        def run_processing():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(document_service.process_all_documents())
            loop.close()
        
        thread = threading.Thread(target=run_processing)
        thread.daemon = True
        thread.start()
        
        return jsonify({"message": "Document processing started in background"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/email/check", methods=["POST"])
def check_emails():
    """Check for new emails and download PDF attachments"""
    try:
        # Run in background thread
        def run_email_check():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(email_service.check_and_download_emails())
            loop.close()
        
        thread = threading.Thread(target=run_email_check)
        thread.daemon = True
        thread.start()
        
        return jsonify({"message": "Email checking started in background"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/<document_id>", methods=["GET"])
def get_document(document_id):
    """Get specific document details"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        document = loop.run_until_complete(document_service.get_document_by_id(document_id))
        loop.close()
        
        if not document:
            abort(404, description="Document not found")
        
        document_dict = document.to_dict() if hasattr(document, 'to_dict') else document
        return jsonify(document_dict)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/<document_id>", methods=["DELETE"])
def delete_document(document_id):
    """Delete a document"""
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        success = loop.run_until_complete(document_service.delete_document(document_id))
        loop.close()
        
        if not success:
            abort(404, description="Document not found")
        
        return jsonify({"message": "Document deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)