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
        # Set paths relative to project root (parent directory)
        self.pdf_dir = "../pdf_files"
        self.metadata_file = "../documents_metadata.json"
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
        # Implementation of your existing PDF processing logic
        pass
    
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