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
  RefreshCw
} from 'lucide-react';

const Dashboard = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingEmails, setProcessingEmails] = useState(false);
  const [processingDocs, setProcessingDocs] = useState(false);

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

  // Load documents on component mount
  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  // Mock data - in a real application, this would come from an API
  const getStatsForRole = (role) => {
    const baseStats = {
      Engineering: {
        totalDocuments: 2847,
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
      title: 'New Safety Circular',
      message: 'Updated emergency procedures from CMRS',
      type: 'info',
      time: '4 hours ago'
    },
    {
      id: 3,
      title: 'Contract Renewal Alert',
      message: 'Cleaning services contract expires next month',
      type: 'warning',
      time: '1 day ago'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening in your department.</p>
        </div>
        <div className="mt-4 lg:mt-0 flex space-x-3">
          <button 
            onClick={handleCheckEmails}
            disabled={processingEmails}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {processingEmails ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>{processingEmails ? 'Checking...' : 'Check Emails'}</span>
          </button>
          <button 
            onClick={handleProcessDocuments}
            disabled={processingDocs}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {processingDocs ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments.toLocaleString()}</p>
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
            <span className="text-red-600">Need immediate action</span>
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
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Filter className="h-4 w-4 text-gray-500" />
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
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading documents...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchRecentDocuments}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="h-4 w-4 text-gray-400" />
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
    </div>
  );
};

export default Dashboard;