import imaplib
import email
import os
import asyncio
from typing import List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.email_address = "mymaisan02@gmail.com"
        self.password = "lkvn bdrl tpmo vkca"
        self.save_dir = "pdf_files"
        self.ensure_directory_exists()
    
    def ensure_directory_exists(self):
        """Ensure the PDF save directory exists"""
        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
    
    async def check_and_download_emails(self):
        """Check for new emails and download PDF attachments"""
        try:
            # Run the blocking email operations in a thread pool
            loop = asyncio.get_event_loop()
            downloaded_files = await loop.run_in_executor(None, self._download_pdf_attachments)
            logger.info(f"Downloaded {len(downloaded_files)} PDF files")
            return downloaded_files
        except Exception as e:
            logger.error(f"Error checking emails: {e}")
            raise e
    
    def _download_pdf_attachments(self) -> List[str]:
        """Download PDF attachments from new emails"""
        downloaded_files = []
        
        try:
            # Connect to Gmail IMAP
            mail = imaplib.IMAP4_SSL("imap.gmail.com")
            mail.login(self.email_address, self.password)
            mail.select("INBOX")
            
            # Search for unread emails
            status, messages = mail.search(None, 'UNSEEN')
            
            if status != 'OK':
                logger.info("No new messages found.")
                mail.logout()
                return downloaded_files
            
            # Process each unread email
            if messages[0]:
                for num in messages[0].split():
                    try:
                        # Fetch the email
                        typ, data = mail.fetch(num, '(RFC822)')
                        if data and len(data) > 0 and isinstance(data[0], tuple) and len(data[0]) > 1:
                            msg = email.message_from_bytes(data[0][1])
                            
                            # Process attachments
                            files = self._process_email_attachments(msg)
                            downloaded_files.extend(files)
                        
                    except Exception as e:
                        logger.error(f"Error processing email {num}: {e}")
                        continue
            
            mail.logout()
            
        except Exception as e:
            logger.error(f"Error connecting to email: {e}")
            raise e
        
        return downloaded_files
    
    def _process_email_attachments(self, msg) -> List[str]:
        """Process email attachments and save PDF files"""
        downloaded_files = []
        
        for part in msg.walk():
            if part.get_content_maintype() == 'multipart':
                continue
            if part.get('Content-Disposition') is None:
                continue
            
            filename = part.get_filename()
            if filename and (filename.lower().endswith('.pdf') or (filename.lower().endswith('.jpg') or (filename.lower().endswith('.jpeg')) or (filename.lower().endswith('.png')))):
                filepath = self._get_unique_filepath(filename)
                
                try:
                    with open(filepath, 'wb') as f:
                        f.write(part.get_payload(decode=True))
                    
                    downloaded_files.append(filepath)
                    logger.info(f"Downloaded {filename}")
                    
                except Exception as e:
                    logger.error(f"Error saving {filename}: {e}")
                    continue
        
        return downloaded_files
    
    def _get_unique_filepath(self, filename: str) -> str:
        """Generate a unique filepath to avoid overwriting existing files"""
        base_path = os.path.join(self.save_dir, filename)
        
        if not os.path.exists(base_path):
            return base_path
        
        # If file exists, add timestamp
        name, ext = os.path.splitext(filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{name}_{timestamp}{ext}"
        
        return os.path.join(self.save_dir, unique_filename)
        