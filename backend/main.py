from flask import Flask, request, jsonify, abort, send_from_directory
from flask_cors import CORS
import threading
from typing import List, Optional
import os
import json
from datetime import datetime, timedelta
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
        # Get optional query parameters
        user_role = request.args.get('role')
        department = request.args.get('department')
        
        # Since we're converting from async, we need to handle this differently
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        documents = loop.run_until_complete(document_service.get_recent_documents(user_role, department))
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
            loop.run_until_complete(email_service.check_and_download_emails())
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
            
        if not file.filename or not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        # Save file to pdf_files directory
        pdf_files_dir = os.path.join(os.getcwd(), 'pdf_files')
        if not os.path.exists(pdf_files_dir):
            os.makedirs(pdf_files_dir)
            
        if not file.filename:
            return jsonify({"error": "No file selected"}), 400
            
        file_path = os.path.join(pdf_files_dir, file.filename)
        file.save(file_path)
        
        return jsonify({"message": "File uploaded successfully", "filename": file.filename})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/department/<department>", methods=["GET"])
def get_documents_by_department(department):
    """Get documents filtered by department"""
    try:
        user_role = request.args.get('role')
        
        # Get available departments
        available_departments = document_service.get_available_departments()
        if department not in available_departments:
            return jsonify({"error": f"Invalid department. Available: {available_departments}"}), 400
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        documents = loop.run_until_complete(document_service.get_documents_by_department(department, user_role))
        loop.close()
        
        # Convert Document objects to dictionaries
        documents_dict = [doc.to_dict() if hasattr(doc, 'to_dict') else doc for doc in documents]
        return jsonify(documents_dict)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/departments", methods=["GET"])
def get_departments():
    """Get list of available departments"""
    try:
        departments = document_service.get_available_departments()
        return jsonify({"departments": departments})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/<doc_id>/review", methods=["PUT"])
def update_document_review_status(doc_id):
    """Update document review status"""
    try:
        data = request.get_json()
        if not data or 'review_status' not in data:
            return jsonify({"error": "review_status is required"}), 400
        
        review_status = data['review_status']
        if review_status not in ['reviewed', 'not reviewed']:
            return jsonify({"error": "Invalid review status"}), 400
        
        # Load metadata
        metadata_file = "documents_metadata.json"
        if not os.path.exists(metadata_file):
            return jsonify({"error": "No documents found"}), 404
        
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        if doc_id not in metadata:
            return jsonify({"error": "Document not found"}), 404
        
        # Update review status
        metadata[doc_id]['review_status'] = review_status
        
        # Save metadata
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, default=str)
        
        # Update department-specific files
        department = metadata[doc_id].get('department')
        if department:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(document_service._update_department_document(department, doc_id, metadata[doc_id]))
            loop.close()
        
        return jsonify({"message": "Review status updated successfully"})
        
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
                "total_size": 0,
                "pending_reviews": 0,
                "reviewed_documents": 0,
                "critical_priority": 0,
                "urgent_priority": 0,
                "overdue_documents": 0,
                "due_today": 0
            })
            
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        total_documents = len(metadata)
        processed_documents = sum(1 for doc in metadata.values() if doc.get('processed_at'))
        pending_documents = total_documents - processed_documents
        total_size = sum(doc.get('file_size', 0) for doc in metadata.values())
        
        # Review statistics
        pending_reviews = sum(1 for doc in metadata.values() if doc.get('review_status', 'not reviewed') == 'not reviewed')
        reviewed_documents = sum(1 for doc in metadata.values() if doc.get('review_status', 'not reviewed') == 'reviewed')
        
        # Priority statistics
        critical_priority = sum(1 for doc in metadata.values() if doc.get('priority', 'normal') == 'critical')
        urgent_priority = sum(1 for doc in metadata.values() if doc.get('priority', 'normal') == 'urgent')
        
        # Due date statistics
        today = datetime.now().date()
        overdue_documents = 0
        due_today = 0
        
        for doc in metadata.values():
            due_date_str = doc.get('due_date')
            if due_date_str:
                try:
                    due_date = datetime.fromisoformat(due_date_str).date()
                    if due_date < today:
                        overdue_documents += 1
                    elif due_date == today:
                        due_today += 1
                except ValueError:
                    continue
        
        return jsonify({
            "total_documents": total_documents,
            "processed_documents": processed_documents,
            "pending_documents": pending_documents,
            "total_size": total_size,
            "pending_reviews": pending_reviews,
            "reviewed_documents": reviewed_documents,
            "critical_priority": critical_priority,
            "urgent_priority": urgent_priority,
            "overdue_documents": overdue_documents,
            "due_today": due_today
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    """Get recent alerts based on document status"""
    try:
        # Load metadata
        metadata_file = "documents_metadata.json"
        if not os.path.exists(metadata_file):
            return jsonify([])
            
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        alerts = []
        today = datetime.now().date()
        alert_id = 1
        
        # Collect document-specific alerts
        overdue_docs = []
        due_today_docs = []
        due_tomorrow_docs = []
        critical_unreviewed_docs = []
        urgent_unreviewed_docs = []
        
        for doc in metadata.values():
            # Due date alerts
            due_date_str = doc.get('due_date')
            if due_date_str:
                try:
                    due_date = datetime.fromisoformat(due_date_str).date()
                    if due_date < today:
                        overdue_docs.append(doc)
                    elif due_date == today:
                        due_today_docs.append(doc)
                    elif due_date == today + timedelta(days=1):
                        due_tomorrow_docs.append(doc)
                except ValueError:
                    continue
            
            # Priority-based alerts
            priority = doc.get('priority', 'normal')
            review_status = doc.get('review_status', 'not reviewed')
            
            if priority == 'critical' and review_status == 'not reviewed':
                critical_unreviewed_docs.append(doc)
            elif priority == 'urgent' and review_status == 'not reviewed':
                urgent_unreviewed_docs.append(doc)
        
        # Generate detailed alerts
        
        # Critical priority overdue documents (highest priority)
        critical_overdue = [doc for doc in overdue_docs if doc.get('priority') == 'critical']
        if critical_overdue:
            for doc in critical_overdue:
                alerts.append({
                    "id": alert_id,
                    "title": "CRITICAL: Overdue Document",
                    "message": f"'{doc.get('title', doc.get('filename'))}' is overdue and marked as critical priority",
                    "type": "critical",
                    "time": "Overdue",
                    "doc_id": doc.get('id'),
                    "doc_title": doc.get('title', doc.get('filename')),
                    "priority": "critical",
                    "icon": "alert-triangle"
                })
                alert_id += 1
        
        # Overdue documents (general)
        non_critical_overdue = [doc for doc in overdue_docs if doc.get('priority') != 'critical']
        if non_critical_overdue:
            alerts.append({
                "id": alert_id,
                "title": "Overdue Documents",
                "message": f"{len(non_critical_overdue)} document(s) are past their due date",
                "type": "error",
                "time": "Overdue",
                "count": len(non_critical_overdue),
                "details": [{'title': doc.get('title', doc.get('filename')), 'id': doc.get('id')} for doc in non_critical_overdue[:3]],
                "icon": "clock"
            })
            alert_id += 1
        
        # Due today documents
        if due_today_docs:
            alerts.append({
                "id": alert_id,
                "title": "Due Today",
                "message": f"{len(due_today_docs)} document(s) are due today",
                "type": "warning",
                "time": "Today",
                "count": len(due_today_docs),
                "details": [{'title': doc.get('title', doc.get('filename')), 'id': doc.get('id')} for doc in due_today_docs[:3]],
                "icon": "calendar"
            })
            alert_id += 1
        
        # Due tomorrow documents
        if due_tomorrow_docs:
            alerts.append({
                "id": alert_id,
                "title": "Due Tomorrow",
                "message": f"{len(due_tomorrow_docs)} document(s) are due tomorrow",
                "type": "info",
                "time": "Tomorrow",
                "count": len(due_tomorrow_docs),
                "details": [{'title': doc.get('title', doc.get('filename')), 'id': doc.get('id')} for doc in due_tomorrow_docs[:3]],
                "icon": "calendar-clock"
            })
            alert_id += 1
        
        # Critical priority unreviewed documents
        if critical_unreviewed_docs:
            alerts.append({
                "id": alert_id,
                "title": "Critical Documents Pending Review",
                "message": f"{len(critical_unreviewed_docs)} critical priority document(s) need review",
                "type": "warning",
                "time": "Pending",
                "count": len(critical_unreviewed_docs),
                "details": [{'title': doc.get('title', doc.get('filename')), 'id': doc.get('id')} for doc in critical_unreviewed_docs[:3]],
                "icon": "alert-circle"
            })
            alert_id += 1
        
        # Urgent priority unreviewed documents
        if urgent_unreviewed_docs:
            alerts.append({
                "id": alert_id,
                "title": "Urgent Documents Pending Review",
                "message": f"{len(urgent_unreviewed_docs)} urgent priority document(s) need review",
                "type": "info",
                "time": "Pending",
                "count": len(urgent_unreviewed_docs),
                "details": [{'title': doc.get('title', doc.get('filename')), 'id': doc.get('id')} for doc in urgent_unreviewed_docs[:3]],
                "icon": "clock"
            })
            alert_id += 1
        
        # Add general info alert if no urgent alerts
        if len(alerts) == 0:
            alerts.append({
                "id": alert_id,
                "title": "All Documents Up to Date",
                "message": "No urgent actions required at this time",
                "type": "success",
                "time": "Current status",
                "count": 0,
                "icon": "check-circle"
            })
        
        return jsonify(alerts)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/<doc_id>/priority", methods=["PUT"])
def update_document_priority(doc_id):
    """Update document priority"""
    try:
        data = request.get_json()
        if not data or 'priority' not in data:
            return jsonify({"error": "Priority is required"}), 400
            
        priority = data['priority']
        if priority not in ['critical', 'urgent', 'normal']:
            return jsonify({"error": "Invalid priority. Must be 'critical', 'urgent', or 'normal'"}), 400
        
        # Load metadata
        metadata_file = "documents_metadata.json"
        if not os.path.exists(metadata_file):
            return jsonify({"error": "No documents found"}), 404
            
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        if doc_id not in metadata:
            return jsonify({"error": "Document not found"}), 404
        
        # Update priority
        metadata[doc_id]['priority'] = priority
        
        # Save updated metadata
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, default=str)
        
        # Update department-specific files
        department = metadata[doc_id].get('department')
        if department:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(document_service._update_department_document(department, doc_id, metadata[doc_id]))
            loop.close()
            
        return jsonify({"message": "Priority updated successfully", "priority": priority})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/documents/<doc_id>/due-date", methods=["PUT"])
def update_document_due_date(doc_id):
    """Update document due date"""
    try:
        data = request.get_json()
        if not data or 'due_date' not in data:
            return jsonify({"error": "Due date is required"}), 400
            
        due_date = data['due_date']
        
        # Validate due date format if not None
        if due_date is not None:
            try:
                # Parse the date to ensure it's valid
                datetime.fromisoformat(due_date)
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        # Load metadata
        metadata_file = "documents_metadata.json"
        if not os.path.exists(metadata_file):
            return jsonify({"error": "No documents found"}), 404
            
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        if doc_id not in metadata:
            return jsonify({"error": "Document not found"}), 404
        
        # Update due date
        metadata[doc_id]['due_date'] = due_date
        
        # Save updated metadata
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, default=str)
        
        # Update department-specific files
        department = metadata[doc_id].get('department')
        if department:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(document_service._update_department_document(department, doc_id, metadata[doc_id]))
            loop.close()
            
        return jsonify({"message": "Due date updated successfully", "due_date": due_date})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    # Ensure required directories exist
    os.makedirs("pdf_files", exist_ok=True)
    
    # Run the Flask application
    app.run(host="0.0.0.0", port=8000, debug=True)