#!/usr/bin/env python3
"""
Test script to verify all API endpoints are working correctly
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoint(url, description):
    """Test a single endpoint"""
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {description}: {len(data) if isinstance(data, list) else 'OK'}")
            return data
        else:
            print(f"❌ {description}: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ {description}: {str(e)}")
        return None

def main():
    print("🧪 Testing API Endpoints...\n")
    
    # Test main endpoints
    test_endpoint(f"{BASE_URL}/documents/recent", "Recent Documents")
    test_endpoint(f"{BASE_URL}/departments", "Departments List")
    test_endpoint(f"{BASE_URL}/stats", "Statistics")
    test_endpoint(f"{BASE_URL}/alerts", "Alerts")
    
    print("\n🏢 Testing Department Endpoints...")
    
    # Test department endpoints
    departments = ["engineering", "human_resources", "operations", "finance", "management"]
    department_docs = {}
    
    for dept in departments:
        docs = test_endpoint(f"{BASE_URL}/documents/department/{dept}", f"{dept.title()} Department")
        if docs is not None:
            department_docs[dept] = len(docs) if isinstance(docs, list) else 0
    
    print("\n📊 Summary:")
    for dept, count in department_docs.items():
        print(f"   • {dept.title().replace('_', ' ')}: {count} documents")
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main()