from flask import Flask, request, jsonify, abort, send_from_directory
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

@app.route("/api/documents/download/<filename>", methods=["GET"])
def download_document(filename):
    """Download a document file from pdf_files directory"""
    try:
        # Security check - ensure filename doesn't contain path traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            return jsonify({"error": "Invalid filename"}), 400
        
        # Check if file exists in pdf_files directory
        pdf_files_dir = os.path.join(os.getcwd(), 'pdf_files')
        file_path = os.path.join(pdf_files_dir, filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        # Send file
        return send_from_directory(pdf_files_dir, filename, as_attachment=True)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/email/check", methods=["POST"])
def check_emails():
    """Check for new emails and download PDF attachments"""
    try:
        def background_email_check():
            # Run email checking in background thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(email_service.check_and_download_pdfs())
            loop.close()
        
        # Start background thread
        thread = threading.Thread(target=background_email_check)
        thread.daemon = True
        thread.start()
        
        return jsonify({"message": "Email check started"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/process", methods=["POST"]) 
def process_documents():
    """Process all PDF documents and generate summaries"""
    try:
        def background_processing():
            # Run document processing in background thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(document_service.process_all_documents())
            loop.close()
        
        # Start background thread
        thread = threading.Thread(target=background_processing)
        thread.daemon = True
        thread.start()
        
        return jsonify({"message": "Document processing started"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/<doc_id>", methods=["GET"])
def get_document(doc_id):
    """Get specific document by ID"""
    try:
        # Load metadata and find document
        metadata_file = "documents_metadata.json"
        if os.path.exists(metadata_file):
            with open(metadata_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            if doc_id in metadata:
                return jsonify(metadata[doc_id])
            else:
                return jsonify({"error": "Document not found"}), 404
        else:
            return jsonify({"error": "No documents found"}), 404
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/<doc_id>", methods=["DELETE"])
def delete_document(doc_id):
    """Delete a document"""
    try:
        # Load metadata
        metadata_file = "documents_metadata.json"
        if not os.path.exists(metadata_file):
            return jsonify({"error": "No documents found"}), 404
            
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        if doc_id not in metadata:
            return jsonify({"error": "Document not found"}), 404
            
        # Get file path and delete file if it exists
        doc_data = metadata[doc_id]
        if 'file_path' in doc_data and os.path.exists(doc_data['file_path']):
            os.remove(doc_data['file_path'])
        
        # Remove from metadata
        del metadata[doc_id]
        
        # Save updated metadata
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, default=str)
            
        return jsonify({"message": "Document deleted successfully"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/upload", methods=["POST"])
def upload_document():
    """Upload a new document"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        # Save file to pdf_files directory
        pdf_files_dir = os.path.join(os.getcwd(), 'pdf_files')
        if not os.path.exists(pdf_files_dir):
            os.makedirs(pdf_files_dir)
            
        file_path = os.path.join(pdf_files_dir, file.filename)
        file.save(file_path)
        
        return jsonify({"message": "File uploaded successfully", "filename": file.filename})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/search", methods=["GET"])
def search_documents():
    """Search documents by query"""
    try:
        query = request.args.get('q', '').lower()
        if not query:
            return jsonify([])
            
        # Load metadata
        metadata_file = "documents_metadata.json"
        if not os.path.exists(metadata_file):
            return jsonify([])
            
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        # Search in title, filename, summary, and subject
        results = []
        for doc_data in metadata.values():
            searchable_text = ' '.join([
                doc_data.get('title', ''),
                doc_data.get('filename', ''),
                doc_data.get('summary', ''),
                doc_data.get('subject', '')
            ]).lower()
            
            if query in searchable_text:
                results.append(doc_data)
        
        # Sort by relevance (documents with query in title first)
        results.sort(key=lambda x: query in x.get('title', '').lower(), reverse=True)
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Get platform statistics"""
    try:
        # Load metadata
        metadata_file = "documents_metadata.json"
        if not os.path.exists(metadata_file):
            return jsonify({
                "total_documents": 0,
                "processed_documents": 0,
                "pending_documents": 0,
                "total_size": 0
            })
            
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        total_documents = len(metadata)
        processed_documents = sum(1 for doc in metadata.values() if doc.get('processed_at'))
        pending_documents = total_documents - processed_documents
        total_size = sum(doc.get('file_size', 0) for doc in metadata.values())
        
        return jsonify({
            "total_documents": total_documents,
            "processed_documents": processed_documents,
            "pending_documents": pending_documents,
            "total_size": total_size
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Ensure required directories exist
    os.makedirs("pdf_files", exist_ok=True)
    
    # Run the Flask application
    app.run(host="0.0.0.0", port=8000, debug=True)