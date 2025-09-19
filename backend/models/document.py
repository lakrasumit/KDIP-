from marshmallow import Schema, fields
from typing import Optional, Dict, Any, Union
from datetime import datetime

class Document:
    def __init__(self, id: str, filename: str, file_path: str, created_at: Union[datetime, str],
                 title: Optional[str] = None, author: Optional[str] = None, 
                 subject: Optional[str] = None, summary: Optional[str] = None,
                 processed_at: Optional[Union[datetime, str]] = None, file_size: Optional[int] = None,
                 page_count: Optional[int] = None, review_status: Optional[str] = "not reviewed",
                 priority: Optional[str] = "normal", due_date: Optional[str] = None):
        self.id = id
        self.filename = filename
        self.title = title
        self.author = author
        self.subject = subject
        self.summary = summary
        self.file_path = file_path
        
        # Handle datetime parsing
        if isinstance(created_at, str):
            self.created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        else:
            self.created_at = created_at
            
        if isinstance(processed_at, str):
            self.processed_at = datetime.fromisoformat(processed_at.replace('Z', '+00:00'))
        else:
            self.processed_at = processed_at
            
        self.file_size = file_size
        self.page_count = page_count
        self.review_status = review_status
        self.priority = priority
        self.due_date = due_date
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'title': self.title,
            'author': self.author,
            'subject': self.subject,
            'summary': self.summary,
            'file_path': self.file_path,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'file_size': self.file_size,
            'page_count': self.page_count,
            'review_status': self.review_status,
            'priority': self.priority,
            'due_date': self.due_date
        }

class DocumentSchema(Schema):
    id = fields.Str(required=True)
    filename = fields.Str(required=True)
    title = fields.Str(allow_none=True)
    author = fields.Str(allow_none=True)
    subject = fields.Str(allow_none=True)
    summary = fields.Str(allow_none=True)
    file_path = fields.Str(required=True)
    created_at = fields.DateTime(required=True)
    processed_at = fields.DateTime(allow_none=True)
    file_size = fields.Int(allow_none=True)
    page_count = fields.Int(allow_none=True)
    review_status = fields.Str(allow_none=True)
    priority = fields.Str(allow_none=True)
    due_date = fields.Str(allow_none=True)

class DocumentCreateSchema(Schema):
    filename = fields.Str(required=True)
    file_path = fields.Str(required=True)
    
class DocumentUpdateSchema(Schema):
    title = fields.Str(allow_none=True)
    author = fields.Str(allow_none=True)
    subject = fields.Str(allow_none=True)
    summary = fields.Str(allow_none=True)
    processed_at = fields.DateTime(allow_none=True)
    page_count = fields.Int(allow_none=True)