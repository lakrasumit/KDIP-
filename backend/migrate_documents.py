#!/usr/bin/env python3
"""
Migration script to add department and access_level fields to existing documents
and create department-specific JSON files.
"""

import os
import json
import sys
from datetime import datetime

# Import document service for classification
from services.document_service import DocumentService

def main():
    """Main migration function"""
    print("Starting document migration...")
    
    # Initialize document service
    doc_service = DocumentService()
    
    # Load existing metadata
    metadata_file = "documents_metadata.json"
    if not os.path.exists(metadata_file):
        print("No existing metadata file found. Nothing to migrate.")
        return
    
    print(f"Loading metadata from {metadata_file}...")
    with open(metadata_file, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    print(f"Found {len(metadata)} documents to migrate.")
    
    # Create backup
    backup_file = f"documents_metadata_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    print(f"Creating backup: {backup_file}")
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, default=str)
    
    # Department-specific metadata containers
    department_metadata = {
        'engineering': {},
        'operations': {},
        'finance': {},
        'human_resources': {},
        'management': {}
    }
    
    updated_count = 0
    
    # Process each document
    for doc_id, doc_data in metadata.items():
        print(f"Processing document: {doc_data.get('title', doc_id)}")
        
        # Check if document already has department info
        if 'department' in doc_data and 'access_level' in doc_data:
            print(f"  - Document {doc_id} already has department info, skipping...")
            # Still add to department-specific metadata
            dept = doc_data['department']
            if dept in department_metadata:
                department_metadata[dept][doc_id] = doc_data
            continue
        
        try:
            # Extract text content for classification
            file_path = doc_data.get('file_path', '')
            if os.path.exists(file_path):
                # Read PDF text content
                text_content = doc_service._extract_pdf_text(file_path)
                if not text_content.strip():
                    print(f"  - Warning: No text content extracted from {file_path}")
                    text_content = doc_data.get('summary', '') + ' ' + doc_data.get('title', '')
            else:
                print(f"  - Warning: File not found: {file_path}")
                # Use available metadata for classification
                text_content = doc_data.get('summary', '') + ' ' + doc_data.get('title', '')
            
            # Classify document
            classification = doc_service._classify_document_with_department(text_content)
            
            # Update document with department info
            doc_data['department'] = classification['department']
            doc_data['access_level'] = classification['access_level']
            
            print(f"  - Classified as: {classification['department']} ({classification['access_level']})")
            
            # Add to department-specific metadata
            dept = classification['department']
            if dept in department_metadata:
                department_metadata[dept][doc_id] = doc_data
            
            updated_count += 1
            
        except Exception as e:
            print(f"  - Error processing document {doc_id}: {e}")
            # Assign default values
            doc_data['department'] = 'management'
            doc_data['access_level'] = 'general'
            department_metadata['management'][doc_id] = doc_data
            updated_count += 1
    
    # Save updated main metadata
    print("Saving updated metadata...")
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, default=str)
    
    # Save department-specific metadata files
    print("Creating department-specific metadata files...")
    for department, dept_data in department_metadata.items():
        dept_file = doc_service.department_files[department]
        print(f"  - Creating {dept_file} with {len(dept_data)} documents")
        
        with open(dept_file, 'w', encoding='utf-8') as f:
            json.dump(dept_data, f, indent=2, default=str)
    
    print(f"Migration completed!")
    print(f"  - Updated {updated_count} documents")
    print(f"  - Created {len([d for d in department_metadata.values() if d])} department files")
    print(f"  - Backup saved as: {backup_file}")
    
    # Print department distribution
    print("\nDepartment distribution:")
    for department, dept_data in department_metadata.items():
        if dept_data:
            print(f"  - {department.replace('_', ' ').title()}: {len(dept_data)} documents")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nMigration cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)