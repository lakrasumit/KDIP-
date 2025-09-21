#!/usr/bin/env python3
"""
Fix script to address document processing issues:
1. Add missing department fields to existing documents
2. Migrate documents to department-specific JSON files
3. Regenerate summaries without AI dependency (as backup)
"""

import os
import json
import hashlib
from datetime import datetime
from typing import Dict, Any

class DocumentFixer:
    def __init__(self):
        self.metadata_file = "documents_metadata.json"
        self.department_files = {
            'engineering': 'documents_engineering.json',
            'operations': 'documents_operations.json', 
            'finance': 'documents_finance.json',
            'human_resources': 'documents_hr.json',
            'management': 'documents_management.json'
        }
        
        # Simple keyword-based classification (fallback)
        self.department_keywords = {
            'engineering': ['technical', 'software', 'development', 'coding', 'programming', 'engineering', 'system', 'architecture', 'database', 'api', 'algorithm', 'design', 'hardware', 'infrastructure', 'boolean', 'digital', 'electronics'],
            'operations': ['operations', 'maintenance', 'support', 'troubleshooting', 'monitoring', 'deployment', 'infrastructure', 'server', 'network', 'backup', 'security', 'incident', 'metro', 'report'],
            'finance': ['budget', 'financial', 'cost', 'revenue', 'expense', 'profit', 'invoice', 'payment', 'accounting', 'tax', 'audit', 'investment'],
            'human_resources': ['employee', 'recruitment', 'hiring', 'resignation', 'promotion', 'hr', 'human resources', 'staff', 'personnel', 'training', 'performance', 'salary', 'benefits', 'leave', 'application'],
            'management': ['strategy', 'planning', 'management', 'executive', 'leadership', 'policy', 'governance', 'decision', 'meeting', 'review', 'approval']
        }

    def load_metadata(self) -> Dict[str, Any]:
        """Load main document metadata"""
        try:
            if os.path.exists(self.metadata_file):
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            print(f"Error loading metadata: {e}")
        return {}

    def save_metadata(self, metadata: Dict[str, Any]):
        """Save main document metadata"""
        try:
            with open(self.metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, default=str)
            print("✅ Saved main metadata")
        except Exception as e:
            print(f"❌ Error saving metadata: {e}")

    def load_department_metadata(self, department: str) -> Dict[str, Any]:
        """Load department-specific metadata"""
        try:
            if department in self.department_files:
                dept_file = self.department_files[department]
                if os.path.exists(dept_file):
                    with open(dept_file, 'r', encoding='utf-8') as f:
                        return json.load(f)
        except Exception as e:
            print(f"Error loading department metadata for {department}: {e}")
        return {}

    def save_department_metadata(self, department: str, metadata: Dict[str, Any]):
        """Save department-specific metadata"""
        try:
            if department in self.department_files:
                dept_file = self.department_files[department]
                with open(dept_file, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=2, default=str)
                print(f"✅ Saved {department} department metadata ({len(metadata)} documents)")
        except Exception as e:
            print(f"❌ Error saving department metadata for {department}: {e}")

    def classify_document_simple(self, filename: str, title: str, subject: str) -> tuple[str, str, int]:
        """Simple classification based on filename and title (no AI required)"""
        # Combine text for analysis
        text_lower = ' '.join([filename, title, subject]).lower()
        
        # Count keyword matches for each department
        department_scores = {}
        for dept, keywords in self.department_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            department_scores[dept] = score
        
        # Get department with highest score
        best_department = 'management'  # default
        max_score = 0
        
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
        
        return best_department, access_level, max_score

    def generate_simple_summary(self, filename: str, title: str) -> str:
        """Generate a simple summary when AI is not available"""
        # Extract meaningful words from title
        title_words = title.replace('_', ' ').replace('-', ' ').split()
        meaningful_words = [word for word in title_words if len(word) > 3 and word.lower() not in ['the', 'and', 'for', 'with', 'from']]
        
        if len(meaningful_words) >= 3:
            return f"This document covers {', '.join(meaningful_words[:3])} and related topics."
        elif len(meaningful_words) >= 1:
            return f"This document discusses {meaningful_words[0]} and related information."
        else:
            return f"Document containing information from {filename}."

    def fix_documents(self):
        """Main fix function"""
        print("🔧 Starting document fix process...")
        
        # Load existing metadata
        metadata = self.load_metadata()
        if not metadata:
            print("❌ No metadata found!")
            return
        
        print(f"📄 Found {len(metadata)} documents in main metadata")
        
        # Track changes
        updated_docs = 0
        migrated_docs = {}
        
        # Process each document
        for doc_id, doc_data in metadata.items():
            try:
                # Check if document needs department classification
                if 'department' not in doc_data or not doc_data.get('department'):
                    print(f"🔍 Classifying: {doc_data.get('filename', 'Unknown')}")
                    
                    # Classify using simple method
                    department, access_level, score = self.classify_document_simple(
                        doc_data.get('filename', ''),
                        doc_data.get('title', ''),
                        doc_data.get('subject', '')
                    )
                    
                    # Update document data
                    doc_data['department'] = department
                    doc_data['access_level'] = doc_data.get('access_level', access_level)
                    
                    print(f"   → Classified as: {department} (score: {score})")
                    updated_docs += 1
                
                # Check if summary needs improvement
                current_summary = doc_data.get('summary', '')
                if not current_summary or 'Error generating summary' in current_summary:
                    print(f"📝 Generating simple summary for: {doc_data.get('filename', 'Unknown')}")
                    doc_data['summary'] = self.generate_simple_summary(
                        doc_data.get('filename', ''),
                        doc_data.get('title', '')
                    )
                
                # Track for department migration
                department = doc_data.get('department', 'management')
                if department not in migrated_docs:
                    migrated_docs[department] = []
                migrated_docs[department].append((doc_id, doc_data))
                
            except Exception as e:
                print(f"❌ Error processing document {doc_id}: {e}")
                continue
        
        # Save updated main metadata
        if updated_docs > 0:
            self.save_metadata(metadata)
            print(f"✅ Updated {updated_docs} documents with department classification")
        
        # Migrate to department files
        for department, docs in migrated_docs.items():
            if docs:
                print(f"📁 Migrating {len(docs)} documents to {department} department...")
                
                # Load existing department metadata
                dept_metadata = self.load_department_metadata(department)
                
                # Add documents to department metadata
                for doc_id, doc_data in docs:
                    dept_metadata[doc_id] = doc_data
                
                # Save department metadata
                self.save_department_metadata(department, dept_metadata)
        
        print("🎉 Document fix completed!")
        print(f"📊 Summary:")
        print(f"   • Total documents processed: {len(metadata)}")
        print(f"   • Documents updated: {updated_docs}")
        for dept, docs in migrated_docs.items():
            print(f"   • {dept.title()}: {len(docs)} documents")

if __name__ == "__main__":
    fixer = DocumentFixer()
    fixer.fix_documents()