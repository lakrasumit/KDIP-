import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  Download,
  Eye,
  CheckCircle,
  RefreshCw,
  Crown,
  BarChart3
} from 'lucide-react';

const ManagementDashboard = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Backend API base URL
  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch management documents
  const fetchManagementDocuments = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/documents/department/management`;
      
      if (userRole) {
        url += `?role=${userRole.toLowerCase()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch management documents');
      }
      
      const documents = await response.json();
      setDocuments(documents);
      setError(null);
    } catch (err) {
      console.error('Error fetching management documents:', err);
      setError('Failed to load management documents');
    } finally {
      setLoading(false);
    }
  };

  // Handle document actions  
  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/download/${doc.filename}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document. Please try again.');
    }
  };

  const closeModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
  };

  useEffect(() => {
    fetchManagementDocuments();
  }, [userRole]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Management Dashboard
              </h1>
              <p className="text-gray-600">
                Strategic documents, policies, executive reports, and governance
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <button 
            onClick={fetchManagementDocuments}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {documents.filter(doc => doc.review_status === 'not reviewed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Priority</p>
              <p className="text-2xl font-semibold text-gray-900">
                {documents.filter(doc => doc.priority === 'critical').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviewed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {documents.filter(doc => doc.review_status === 'reviewed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search management documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div className="mt-3 text-sm text-gray-500">
          💡 <strong>Filter features coming soon!</strong> Advanced filtering options will be available in the next update.
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Management Documents</h2>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-purple-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading management documents...</p>
            </div>
          )}
          
          {error && (
            <div className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchManagementDocuments}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="divide-y divide-gray-200">
              {documents.length === 0 ? (
                <div className="p-8 text-center">
                  <Crown className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No management documents found</p>
                  <p className="text-sm text-gray-500">
                    Upload strategic documents and policies to get started.
                  </p>
                </div>
              ) : (
                documents
                  .filter(doc => !searchQuery || 
                    doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    doc.summary?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((doc) => (
                    <div key={doc.id} className="p-6 border-l-4 border-l-purple-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {doc.title || doc.filename}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{doc.subject || 'Management Document'}</span>
                            <span>•</span>
                            <span>{doc.author || 'Unknown'}</span>
                            <span>•</span>
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          </div>
                          {doc.summary && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {doc.summary.substring(0, 150)}...
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {/* Department Badge */}
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                              <Crown className="inline h-3 w-3 mr-1" />
                              Management
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button 
                            onClick={() => handleViewDocument(doc)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="View Document Details"
                          >
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(doc)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Download Document"
                          >
                            <Download className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDocument.title || selectedDocument.filename}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <strong>Author:</strong> {selectedDocument.author || 'Unknown'}
              </div>
              <div>
                <strong>Created:</strong> {new Date(selectedDocument.created_at).toLocaleDateString()}
              </div>
              <div>
                <strong>Department:</strong> Management
              </div>
              <div>
                <strong>Access Level:</strong> {selectedDocument.access_level || 'General'}
              </div>
              {selectedDocument.summary && (
                <div>
                  <strong>Summary:</strong>
                  <p className="mt-1 text-gray-600">{selectedDocument.summary}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button 
                onClick={() => handleDownloadDocument(selectedDocument)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDashboard;