import os
import os
import json
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import logging

try:
    import google.generativeai as genai
except ImportError:
    genai = None

# Configure logging
logger = logging.getLogger(__name__)

# Import your existing modules
import sys
sys.path.append('..')

try:
    import PyPDF2
except ImportError:
    logger.error("PyPDF2 not installed")
    PyPDF2 = None

from models.document import Document

class DocumentService:
    def __init__(self):
        # Set paths relative to current directory
        self.pdf_dir = "pdf_files"
        self.metadata_file = "documents_metadata.json"
        self.google_api_key = 'AIzaSyD8SgsvgWNZ43WdtPF9jvfblmbrO6q3_xU  '
        
        # Department-specific files
        self.department_files = {
            'engineering': 'documents_engineering.json',
            'operations': 'documents_operations.json',
            'finance': 'documents_finance.json',
            'human_resources': 'documents_hr.json',
            'management': 'documents_management.json'
        }
        
        # Department keywords for classification
        self.department_keywords = {
            'engineering': ['technical', 'software', 'development', 'coding', 'programming', 'engineering', 'system', 'architecture', 'database', 'api', 'algorithm', 'design', 'hardware', 'infrastructure'],
            'operations': ['operations', 'maintenance', 'support', 'troubleshooting', 'monitoring', 'deployment', 'infrastructure', 'server', 'network', 'backup', 'security', 'incident'],
            'finance': ['budget', 'financial', 'cost', 'revenue', 'expense', 'profit', 'invoice', 'payment', 'accounting', 'tax', 'audit', 'investment'],
            'human_resources': ['employee', 'recruitment', 'hiring', 'resignation', 'promotion', 'hr', 'human resources', 'staff', 'personnel', 'training', 'performance', 'salary', 'benefits'],
            'management': ['strategy', 'planning', 'management', 'executive', 'leadership', 'policy', 'governance', 'decision', 'meeting', 'review', 'approval']
        }
        
        self.setup_gemini()
        self.ensure_directories()
    
    def setup_gemini(self):
        """Initialize Gemini AI"""
        try:
            if genai:
                genai.configure(api_key=self.google_api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            else:
                logger.warning("Google Generative AI not available")
                self.model = None
        except Exception as e:
            logger.error(f"Failed to setup Gemini: {e}")
            self.model = None
    
    def ensure_directories(self):
        """Create necessary directories"""
        if not os.path.exists(self.pdf_dir):
            os.makedirs(self.pdf_dir)
    
    async def get_recent_documents(self, user_role: Optional[str] = None, department: Optional[str] = None) -> List[Document]:
        """Get list of recent documents, optionally filtered by user role or department"""
        try:
            if department and department in self.department_files:
                # Get documents from specific department
                metadata = self._load_department_metadata(department)
            else:
                # Get all documents
                metadata = self._load_metadata()
            
            documents = []
            
            for doc_data in metadata.values():
                # Check if file still exists
                if os.path.exists(doc_data['file_path']):
                    # Apply role-based filtering if specified
                    if user_role:
                        doc_access_level = doc_data.get('access_level', 'general')
                        if not self._has_access(user_role, doc_access_level):
                            continue
                    
                    documents.append(Document(**doc_data))
            
            # Sort by created_at descending
            documents.sort(key=lambda x: x.created_at, reverse=True)
            return documents[:20]  # Return last 20 documents
            
        except Exception as e:
            logger.error(f"Error getting recent documents: {e}")
            return []
    
    def _load_metadata(self) -> Dict[str, Any]:
        """Load document metadata from JSON file"""
        try:
            if os.path.exists(self.metadata_file):
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading metadata: {e}")
        return {}
    
    def _save_metadata(self, metadata: Dict[str, Any]):
        """Save document metadata to JSON file"""
        try:
            with open(self.metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving metadata: {e}")
    
    def _load_department_metadata(self, department: str) -> Dict[str, Any]:
        """Load department-specific metadata from JSON file"""
        try:
            if department in self.department_files:
                dept_file = self.department_files[department]
                if os.path.exists(dept_file):
                    with open(dept_file, 'r', encoding='utf-8') as f:
                        return json.load(f)
        except Exception as e:
            logger.error(f"Error loading department metadata for {department}: {e}")
        return {}
    
    def _save_department_metadata(self, department: str, metadata: Dict[str, Any]):
        """Save department-specific metadata to JSON file"""
        try:
            if department in self.department_files:
                dept_file = self.department_files[department]
                with open(dept_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error saving department metadata for {department}: {e}")
    
    def _has_access(self, user_role: str, doc_access_level: str) -> bool:
        """Check if user role has access to document based on access level"""
        # Define access hierarchy: general < departmental < confidential < restricted
        role_hierarchy = {
            'employee': ['general'],
            'supervisor': ['general', 'departmental'],
            'manager': ['general', 'departmental', 'confidential'],
            'admin': ['general', 'departmental', 'confidential', 'restricted']
        }
        
        allowed_levels = role_hierarchy.get(user_role, ['general'])
        return doc_access_level in allowed_levels
    
    def _classify_document_with_department(self, text_content: str) -> Dict[str, str]:
        """Enhanced document classification with department targeting"""
        try:
            if not self.model:
                return self._fallback_classification(text_content)
            
            # Use AI for more accurate classification
            prompt = f"""
            Analyze this document and classify it based on the following departments:
            - Engineering: Technical documents, software development, system design, coding
            - Operations: Maintenance, support, monitoring, infrastructure, deployment
            - Finance: Budget, financial reports, invoices, accounting, cost analysis
            - Human Resources: Employee matters, recruitment, HR policies, personnel
            - Management: Strategic planning, executive decisions, policies, governance
            
            Also determine the access level:
            - general: Available to all employees
            - departmental: Restricted to specific department
            - confidential: Manager level and above
            - restricted: Admin only
            
            Document content (first 3000 characters):
            {text_content[:3000]}
            
            Respond in this exact format:
            Department: [department_name]
            Access Level: [access_level]
            Reasoning: [brief explanation]
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Parse response
            department = 'management'  # default
            access_level = 'general'   # default
            
            lines = result_text.split('\n')
            for line in lines:
                if line.lower().startswith('department:'):
                    dept = line.split(':', 1)[1].strip().lower().replace(' ', '_')
                    if dept in self.department_files:
                        department = dept
                elif line.lower().startswith('access level:'):
                    level = line.split(':', 1)[1].strip().lower()
                    if level in ['general', 'departmental', 'confidential', 'restricted']:
                        access_level = level
            
            return {
                'department': department,
                'access_level': access_level
            }
            
        except Exception as e:
            logger.error(f"Error in AI classification: {e}")
            return self._fallback_classification(text_content)
    
    def _fallback_classification(self, text_content: str) -> Dict[str, str]:
        """Fallback classification using keyword matching"""
        text_lower = text_content.lower()
        
        # Count keyword matches for each department
        department_scores = {}
        for dept, keywords in self.department_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            department_scores[dept] = score
        
        # Get department with highest score
        best_department = 'management'  # default
        max_score = 0
        if department_scores:
            for dept, score in department_scores.items():
                if score > max_score:
                    max_score = score
                    best_department = dept
        
        # Simple access level determination
        access_level = 'general'
        if any(word in text_lower for word in ['confidential', 'internal', 'restricted']):
            access_level = 'confidential'
        elif any(word in text_lower for word in ['department', 'team', 'division']):
            access_level = 'departmental'
        
        logger.info(f"Fallback classification: {best_department} (score: {max_score})")
        
        return {
            'department': best_department,
            'access_level': access_level
        }
    
    def _add_to_department(self, department: str, document_data: Dict[str, Any]):
        """Add document to department-specific JSON file"""
        try:
            # Load existing department metadata
            dept_metadata = self._load_department_metadata(department)
            
            # Add the document
            dept_metadata[document_data['id']] = document_data
            
            # Save department metadata
            self._save_department_metadata(department, dept_metadata)
            
            logger.info(f"Added document {document_data['id']} to {department} department")
            
        except Exception as e:
            logger.error(f"Error adding document to department {department}: {e}")
    
    async def process_all_documents(self):
        """Process all PDF documents in the directory"""
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._process_pdfs_sync)
        except Exception as e:
            logger.error(f"Error processing documents: {e}")
    
    def _process_pdfs_sync(self):
        """Synchronous PDF processing"""
        try:
            if not PyPDF2:
                logger.error("PyPDF2 not available for text extraction")
                return
            
            if not self.model:
                logger.error("Gemini AI model not available for summarization")
                return
            
            # Load existing metadata
            metadata = self._load_metadata()
            processed_files = []
            
            # Get all PDF files in directory
            pdf_files = []
            if os.path.exists(self.pdf_dir):
                for filename in os.listdir(self.pdf_dir):
                    if filename.lower().endswith('.pdf'):
                        pdf_files.append(filename)
            
            logger.info(f"Found {len(pdf_files)} PDF files to process")
            
            for filename in pdf_files:
                try:
                    file_path = os.path.join(self.pdf_dir, filename)
                    
                    # Check if already processed
                    doc_id = self._generate_doc_id(filename)
                    if doc_id in metadata:
                        logger.info(f"Skipping already processed file: {filename}")
                        continue
                    
                    # Extract text from PDF
                    text_content = self._extract_pdf_text(file_path)
                    if not text_content.strip():
                        logger.warning(f"No text extracted from {filename}")
                        continue
                    
                    # Generate summary using Gemini
                    summary = self._generate_summary(text_content)
                    
                    # Classify document with department
                    classification = self._classify_document_with_department(text_content)
                    
                    # Get file statistics
                    file_size = os.path.getsize(file_path)
                    page_count = self._get_pdf_page_count(file_path)
                    
                    # Create document record
                    document_data = {
                        'id': doc_id,
                        'filename': filename,
                        'title': self._extract_title(filename),
                        'author': 'Unknown',
                        'subject': 'Document',
                        'summary': summary,
                        'file_path': file_path,
                        'created_at': datetime.now().isoformat(),
                        'processed_at': datetime.now().isoformat(),
                        'file_size': file_size,
                        'page_count': page_count,
                        'review_status': 'not reviewed',
                        'priority': 'normal',
                        'due_date': None,
                        'department': classification['department'],
                        'access_level': classification['access_level']
                    }
                    
                    # Add to main metadata
                    metadata[doc_id] = document_data
                    
                    # Add to department-specific metadata
                    self._add_to_department(classification['department'], document_data)
                    
                    processed_files.append(filename)
                    
                    logger.info(f"Successfully processed: {filename}")
                    
                except Exception as e:
                    logger.error(f"Error processing {filename}: {e}")
                    continue
            
            # Save updated metadata
            if processed_files:
                self._save_metadata(metadata)
                logger.info(f"Processed {len(processed_files)} new documents")
            else:
                logger.info("No new documents to process")
                
        except Exception as e:
            logger.error(f"Error in PDF processing: {e}")
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text content from PDF file"""
        try:
            if not PyPDF2:
                return ""
                
            text_content = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text_content += page.extract_text() + "\n"
            
            return text_content
            
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            return ""
    
    def _get_pdf_page_count(self, file_path: str) -> int:
        """Get number of pages in PDF"""
        try:
            if not PyPDF2:
                return 0
                
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                return len(pdf_reader.pages)
        except Exception as e:
            logger.error(f"Error getting page count for {file_path}: {e}")
            return 0
    
    def _generate_summary(self, text_content: str) -> str:
        """Generate summary using Google Gemini"""
        try:
            if not self.model:
                return "AI summarization not available."
                
            # Truncate text if too long (Gemini has token limits)
            max_chars = 30000
            if len(text_content) > max_chars:
                text_content = text_content[:max_chars] + "..."
            
            prompt = f"""
            Please provide a concise summary of the following document in 2-3 sentences:
            
            {text_content}
            
            Summary:
            """
            
            response = self.model.generate_content(prompt)
            summary = response.text.strip()
            
            return summary if summary else "No summary could be generated for this document."
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            return "Error generating summary for this document."
    
    def _generate_doc_id(self, filename: str) -> str:
        """Generate unique document ID based on filename"""
        # Create hash of filename for consistent ID
        hash_object = hashlib.md5(filename.encode())
        return f"doc_{hash_object.hexdigest()[:8]}"
    
    def _extract_title(self, filename: str) -> str:
        """Extract readable title from filename"""
        # Remove extension and replace underscores/hyphens with spaces
        title = os.path.splitext(filename)[0]
        title = title.replace('_', ' ').replace('-', ' ')
        # Capitalize words
        title = ' '.join(word.capitalize() for word in title.split())
        return title
    
    async def get_document_by_id(self, document_id: str) -> Optional[Document]:
        """Get document by ID"""
        metadata = self._load_metadata()
        if document_id in metadata:
            return Document(**metadata[document_id])
        return None
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete document"""
        metadata = self._load_metadata()
        if document_id in metadata:
            # Remove file if exists
            file_path = metadata[document_id]['file_path']
            if os.path.exists(file_path):
                os.remove(file_path)
            
            # Remove from main metadata
            document_data = metadata[document_id]
            del metadata[document_id]
            self._save_metadata(metadata)
            
            # Remove from department-specific metadata
            department = document_data.get('department')
            if department and department in self.department_files:
                dept_metadata = self._load_department_metadata(department)
                if document_id in dept_metadata:
                    del dept_metadata[document_id]
                    self._save_department_metadata(department, dept_metadata)
            
            return True
        return False
    
    async def get_documents_by_department(self, department: str, user_role: Optional[str] = None) -> List[Document]:
        """Get documents filtered by department"""
        try:
            if department not in self.department_files:
                return []
            
            dept_metadata = self._load_department_metadata(department)
            documents = []
            
            for doc_data in dept_metadata.values():
                # Check if file still exists
                if os.path.exists(doc_data['file_path']):
                    # Apply role-based filtering if specified
                    if user_role:
                        doc_access_level = doc_data.get('access_level', 'general')
                        if not self._has_access(user_role, doc_access_level):
                            continue
                    
                    documents.append(Document(**doc_data))
            
            # Sort by created_at descending
            documents.sort(key=lambda x: x.created_at, reverse=True)
            return documents
            
        except Exception as e:
            logger.error(f"Error getting documents for department {department}: {e}")
            return []
    
    def get_available_departments(self) -> List[str]:
        """Get list of available departments"""
        return list(self.department_files.keys())
    
    async def _update_department_document(self, department: str, doc_id: str, doc_data: Dict[str, Any]):
        """Update a document in department-specific JSON file"""
        try:
            if department not in self.department_files:
                return
            
            # Load department metadata
            dept_metadata = self._load_department_metadata(department)
            
            # Update the document if it exists
            if doc_id in dept_metadata:
                dept_metadata[doc_id] = doc_data
                self._save_department_metadata(department, dept_metadata)
                logger.info(f"Updated document {doc_id} in {department} department")
            
        except Exception as e:
            logger.error(f"Error updating document in department {department}: {e}")