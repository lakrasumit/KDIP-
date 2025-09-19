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
        self.google_api_key = 'AIzaSyBAxdH3lyeQ1_giaxyFDZlyNFXwMQSml_Q'
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
    
    async def get_recent_documents(self) -> List[Document]:
        """Get list of recent documents"""
        try:
            metadata = self._load_metadata()
            documents = []
            
            for doc_data in metadata.values():
                # Check if file still exists
                if os.path.exists(doc_data['file_path']):
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
                        'due_date': None
                    }
                    
                    # Add to metadata
                    metadata[doc_id] = document_data
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
            
            # Remove from metadata
            del metadata[document_id]
            self._save_metadata(metadata)
            return True
        return False