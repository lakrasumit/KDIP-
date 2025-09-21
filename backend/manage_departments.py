#!/usr/bin/env python3
"""
JSON Management Utility for Department-Specific Documents
This script ensures all department JSON files are properly initialized and synchronized.
"""

import os
import json
from datetime import datetime

def initialize_department_files():
    """Initialize empty department JSON files if they don't exist"""
    
    department_files = {
        'engineering': 'documents_engineering.json',
        'operations': 'documents_operations.json', 
        'finance': 'documents_finance.json',
        'human_resources': 'documents_hr.json',
        'management': 'documents_management.json'
    }
    
    print("Initializing department JSON files...")
    
    for dept, filename in department_files.items():
        if not os.path.exists(filename):
            print(f"Creating {filename}")
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump({}, f, indent=2)
        else:
            print(f"✓ {filename} already exists")
    
    print("All department files initialized successfully!")

def sync_department_files():
    """Sync documents from main metadata to department files"""
    
    # Load main metadata
    if not os.path.exists('documents_metadata.json'):
        print("Main metadata file not found!")
        return
    
    with open('documents_metadata.json', 'r', encoding='utf-8') as f:
        main_metadata = json.load(f)
    
    # Department files mapping
    department_files = {
        'engineering': 'documents_engineering.json',
        'operations': 'documents_operations.json', 
        'finance': 'documents_finance.json',
        'human_resources': 'documents_hr.json',
        'management': 'documents_management.json'
    }
    
    # Initialize department containers
    department_data = {dept: {} for dept in department_files.keys()}
    
    # Distribute documents to departments
    for doc_id, doc_data in main_metadata.items():
        department = doc_data.get('department')
        if department and department in department_data:
            department_data[department][doc_id] = doc_data
    
    # Write department files
    for dept, filename in department_files.items():
        print(f"Updating {filename} with {len(department_data[dept])} documents")
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(department_data[dept], f, indent=2, default=str)
    
    print("Department files synchronized successfully!")

def print_department_summary():
    """Print summary of documents in each department"""
    
    department_files = {
        'Engineering': 'documents_engineering.json',
        'Operations': 'documents_operations.json', 
        'Finance': 'documents_finance.json',
        'Human Resources': 'documents_hr.json',
        'Management': 'documents_management.json'
    }
    
    print("\n" + "="*50)
    print("DEPARTMENT DOCUMENT SUMMARY")
    print("="*50)
    
    total_docs = 0
    for dept_name, filename in department_files.items():
        if os.path.exists(filename):
            with open(filename, 'r', encoding='utf-8') as f:
                dept_data = json.load(f)
            doc_count = len(dept_data)
            total_docs += doc_count
            print(f"{dept_name:<18}: {doc_count:>3} documents")
            
            # Show document titles
            if doc_count > 0:
                for doc_id, doc_data in list(dept_data.items())[:3]:  # Show first 3
                    title = doc_data.get('title', doc_data.get('filename', 'Unknown'))
                    print(f"  • {title[:45]}{'...' if len(title) > 45 else ''}")
                if doc_count > 3:
                    print(f"  • ...and {doc_count - 3} more")
                print()
        else:
            print(f"{dept_name:<18}: File not found")
    
    print("-"*50)
    print(f"{'TOTAL':<18}: {total_docs:>3} documents")
    print("="*50)

def main():
    """Main function to run all utilities"""
    print("🏢 KMRL Department JSON Management Utility")
    print("=" * 50)
    
    # Initialize files
    initialize_department_files()
    print()
    
    # Sync files
    sync_department_files()
    print()
    
    # Print summary
    print_department_summary()

if __name__ == "__main__":
    main()