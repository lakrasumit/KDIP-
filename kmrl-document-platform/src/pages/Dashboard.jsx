import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  Search,
  Plus,
  Download,
  Eye,
  Filter,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  X
} from 'lucide-react';

const Dashboard = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingEmails, setProcessingEmails] = useState(false);
  const [processingDocs, setProcessingDocs] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Backend API base URL
  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch recent documents from backend
  const fetchRecentDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/documents/recent`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const documents = await response.json();
      setRecentDocuments(documents);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load recent documents');
    } finally {
      setLoading(false);
    }
  };

  // Check emails and download attachments
  const handleCheckEmails = async () => {
    try {
      setProcessingEmails(true);
      const response = await fetch(`${API_BASE_URL}/email/check`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to check emails');
      }
      
      // Refresh documents after checking emails
      setTimeout(() => {
        fetchRecentDocuments();
        setProcessingEmails(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error checking emails:', err);
      setProcessingEmails(false);
    }
  };

  // Process documents and generate summaries
  const handleProcessDocuments = async () => {
    try {
      setProcessingDocs(true);
      const response = await fetch(`${API_BASE_URL}/documents/process`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to process documents');
      }
      
      // Refresh documents after processing
      setTimeout(() => {
        fetchRecentDocuments();
        setProcessingDocs(false);
      }, 5000);
      
    } catch (err) {
      console.error('Error processing documents:', err);
      setProcessingDocs(false);
    }
  };

  // Function to handle view document
  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  // Function to close modal
  const closeModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
  };

  // Load documents on component mount
  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  // Mock data - in a real application, this would come from an API
  const getStatsForRole = (role) => {
    const baseStats = {
      Engineering: {
        totalDocuments: 0,
        pendingReviews: 23,
        recentAlerts: 5,
        completedTasks: 89
      },
      Operations: {
        totalDocuments: 1923,
        pendingReviews: 12,
        recentAlerts: 3,
        completedTasks: 156
      },
      Finance: {
        totalDocuments: 3421,
        pendingReviews: 31,
        recentAlerts: 8,
        completedTasks: 203
      },
      HR: {
        totalDocuments: 1654,
        pendingReviews: 18,
        recentAlerts: 2,
        completedTasks: 134
      },
      Management: {
        totalDocuments: 5847,
        pendingReviews: 45,
        recentAlerts: 12,
        completedTasks: 78
      }
    };
    return baseStats[role] || baseStats.Management;
  };

  const stats = getStatsForRole(userRole);

  // Mock alerts data - can be replaced with API call later
  const alerts = [
    {
      id: 1,
      title: 'Regulatory Deadline Approaching',
      message: 'Metro Rail Safety audit documents due in 5 days',
      type: 'warning',
      time: '2 hours ago'
    },
    {
      id: 2,
      title: 'New Document Available',
      message: 'Updated operational procedures have been uploaded',
      type: 'info',
      time: '4 hours ago'
    },
    {
      id: 3,
      title: 'Compliance Review Required',
      message: 'Monthly safety review documents need approval',
      type: 'warning',
      time: '1 day ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userRole === 'Management' ? 'Manager' : userRole}
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your documents today.
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <button 
            onClick={handleCheckEmails}
            disabled={processingEmails}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {processingEmails && (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}
            <span>{processingEmails ? 'Checking...' : 'Check Emails'}</span>
          </button>
          <button 
            onClick={handleProcessDocuments}
            disabled={processingDocs}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {processingDocs && (
              <RefreshCw className="h-4 w-4 animate-spin" />
            )}
            <span>{processingDocs ? 'Processing...' : 'Process Docs'}</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search documents, policies, or circulars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{recentDocuments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-yellow-600">Requires attention</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentAlerts}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600">Action required</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600">This month</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={fetchRecentDocuments}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading documents...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-8 text-center">
              <XCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchRecentDocuments}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Documents List */}
          {!loading && !error && (
            <div className="divide-y divide-gray-200">
              {recentDocuments.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No documents found</p>
                  <p className="text-sm text-gray-500">
                    Try checking emails or uploading documents to get started.
                  </p>
                </div>
              ) : (
                recentDocuments.map((doc) => (
                  <div key={doc.id} className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {doc.title || doc.filename}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{doc.subject || 'Document'}</span>
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
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                          {doc.processed_at ? 'Processed' : 'Pending'}
                        </span>
                        <button 
                          onClick={() => handleViewDocument(doc)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="View Document Details"
                        >
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Download className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Alerts & Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 border-t border-gray-200">
            <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Upload Document</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Search className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Search Knowledge</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Check Compliance</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Team Collaboration</span>
          </button>
        </div>
      </div>

      {/* Document Details Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Document Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Document Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-lg font-medium text-gray-900">{selectedDocument.title || selectedDocument.filename}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                    <p className="text-gray-900">{selectedDocument.author || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <p className="text-gray-900">{selectedDocument.subject || 'Document'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                    <p className="text-gray-900">{new Date(selectedDocument.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Processed Date</label>
                    <p className="text-gray-900">
                      {selectedDocument.processed_at ? new Date(selectedDocument.processed_at).toLocaleDateString() : 'Not processed'}
                    </p>
                  </div>
                </div>
                
                {selectedDocument.file_size && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                      <p className="text-gray-900">{(selectedDocument.file_size / 1024).toFixed(2)} KB</p>
                    </div>
                    {selectedDocument.page_count && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                        <p className="text-gray-900">{selectedDocument.page_count}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filename</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">{selectedDocument.filename}</p>
                </div>
                
                {/* Summary Section */}
                {selectedDocument.summary && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">AI Generated Summary</label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed">{selectedDocument.summary}</p>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processing Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDocument.processed_at 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedDocument.processed_at ? 'Processed' : 'Pending Processing'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;