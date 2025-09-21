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
  Heart,
  Users,
  Filter,
  X,
  Calendar
} from 'lucide-react';

const HRDashboard = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    reviewStatus: 'all',
    accessLevel: 'all',
    dateRange: 'all'
  });

  // Backend API base URL
  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch HR documents
  const fetchHRDocuments = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/documents/department/human_resources`;
      
      if (userRole) {
        url += `?role=${userRole.toLowerCase()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch HR documents');
      }
      
      const documents = await response.json();
      setDocuments(documents);
      setError(null);
    } catch (err) {
      console.error('Error fetching HR documents:', err);
      setError('Failed to load HR documents');
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

  // Function to update review status
  const updateReviewStatus = async (docId, reviewStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${docId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ review_status: reviewStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update review status');
      }
      
      // Refresh data
      fetchHRDocuments();
    } catch (err) {
      console.error('Error updating review status:', err);
      alert('Failed to update review status');
    }
  };

  // Function to update priority
  const updatePriority = async (docId, priority) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${docId}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: priority }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update priority');
      }
      
      // Refresh data
      fetchHRDocuments();
    } catch (err) {
      console.error('Error updating priority:', err);
      alert('Failed to update priority');
    }
  };

  // Function to update due date
  const updateDueDate = async (docId, dueDate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${docId}/due-date`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ due_date: dueDate }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update due date');
      }
      
      // Refresh data
      fetchHRDocuments();
    } catch (err) {
      console.error('Error updating due date:', err);
      alert('Failed to update due date');
    }
  };

  // Helper function to format due date
  const formatDueDate = (dueDateString) => {
    if (!dueDateString) return null;
    
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formatOptions = { month: 'short', day: 'numeric' };
    const formattedDate = dueDate.toLocaleDateString('en-US', formatOptions);
    
    if (diffDays < 0) {
      return { text: `${formattedDate} (Overdue)`, color: 'text-red-600 bg-red-100', urgent: true };
    } else if (diffDays === 0) {
      return { text: `${formattedDate} (Today)`, color: 'text-red-600 bg-red-100', urgent: true };
    } else if (diffDays === 1) {
      return { text: `${formattedDate} (Tomorrow)`, color: 'text-yellow-600 bg-yellow-100', urgent: true };
    } else if (diffDays <= 7) {
      return { text: `${formattedDate} (${diffDays} days)`, color: 'text-yellow-600 bg-yellow-100', urgent: false };
    } else {
      return { text: formattedDate, color: 'text-green-600 bg-green-100', urgent: false };
    }
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Helper function to get suggested due dates
  const getSuggestedDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    return [
      { label: 'Tomorrow', date: tomorrow.toISOString().split('T')[0] },
      { label: 'Next Week', date: nextWeek.toISOString().split('T')[0] },
      { label: 'Next Month', date: nextMonth.toISOString().split('T')[0] }
    ];
  };

  // Helper functions for styling
  const getReviewStatusColor = (status) => {
    switch (status) {
      case 'reviewed': return 'text-green-600 bg-green-100';
      case 'not reviewed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'urgent': return 'text-yellow-600 bg-yellow-100';
      case 'normal': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Filter functions
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      priority: 'all',
      reviewStatus: 'all',
      accessLevel: 'all',
      dateRange: 'all'
    });
  };

  const isDateInRange = (dateString, range) => {
    if (range === 'all') return true;
    
    const docDate = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.floor((now - docDate) / (1000 * 60 * 60 * 24));
    
    switch (range) {
      case 'today': return daysDiff === 0;
      case 'week': return daysDiff <= 7;
      case 'month': return daysDiff <= 30;
      case 'older': return daysDiff > 30;
      default: return true;
    }
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      // Search filter
      const matchesSearch = !searchQuery || 
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Priority filter
      const matchesPriority = filters.priority === 'all' || 
        (doc.priority || 'normal') === filters.priority;
      
      // Review status filter
      const matchesReviewStatus = filters.reviewStatus === 'all' || 
        (doc.review_status || 'not reviewed') === filters.reviewStatus;
      
      // Access level filter
      const matchesAccessLevel = filters.accessLevel === 'all' || 
        (doc.access_level || 'general') === filters.accessLevel;
      
      // Date range filter
      const matchesDateRange = isDateInRange(doc.created_at, filters.dateRange);
      
      return matchesSearch && matchesPriority && matchesReviewStatus && 
             matchesAccessLevel && matchesDateRange;
    });
  };

  const filteredDocuments = getFilteredDocuments();
  const hasActiveFilters = Object.values(filters).some(filter => filter !== 'all');

  useEffect(() => {
    fetchHRDocuments();
  }, [userRole]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Human Resources Dashboard
              </h1>
              <p className="text-gray-600">
                HR policies, employee resources, and personnel documents
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <button 
            onClick={fetchHRDocuments}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
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
            <div className="p-2 bg-pink-100 rounded-lg">
              <FileText className="h-6 w-6 text-pink-600" />
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
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search HR documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
              hasActiveFilters 
                ? 'border-pink-500 bg-pink-50 text-pink-700' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                {Object.values(filters).filter(f => f !== 'all').length}
              </span>
            )}
          </button>
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="urgent">Urgent</option>
                  <option value="normal">Normal</option>
                </select>
              </div>
              
              {/* Review Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Status</label>
                <select
                  value={filters.reviewStatus}
                  onChange={(e) => handleFilterChange('reviewStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="not reviewed">Not Reviewed</option>
                </select>
              </div>
              
              {/* Access Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                <select
                  value={filters.accessLevel}
                  onChange={(e) => handleFilterChange('accessLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Levels</option>
                  <option value="general">General</option>
                  <option value="departmental">Departmental</option>
                  <option value="confidential">Confidential</option>
                  <option value="restricted">Restricted</option>
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="older">Older</option>
                </select>
              </div>
            </div>
            
            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <X className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">HR Documents</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredDocuments.length} of {documents.length} documents
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                  Filtered
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-pink-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading HR documents...</p>
            </div>
          )}
          
          {error && (
            <div className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchHRDocuments}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="divide-y divide-gray-200">
              {filteredDocuments.length === 0 ? (
                <div className="p-8 text-center">
                  <Heart className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {documents.length === 0 
                      ? "No HR documents found" 
                      : "No documents match your filters"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {documents.length === 0 
                      ? "Upload HR policies and documents to get started."
                      : "Try adjusting your search or filter criteria."}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-3 px-4 py-2 text-pink-600 hover:text-pink-800 border border-pink-300 rounded-lg hover:bg-pink-50"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                    <div key={doc.id} className="p-6 border-l-4 border-l-pink-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {doc.title || doc.filename}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{doc.subject || 'HR Document'}</span>
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
                            {/* Review Status Badge with Dropdown */}
                            <div className="flex items-center space-x-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReviewStatusColor(doc.review_status || 'not reviewed')}`}>
                                {doc.review_status === 'reviewed' ? '✓ Reviewed' : '○ Not Reviewed'}
                              </span>
                              
                              {/* Review Status Dropdown */}
                              <div className="relative group">
                                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                  <span className="text-xs text-gray-400">⋮</span>
                                </button>
                                <div className="absolute left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                  <button 
                                    onClick={() => updateReviewStatus(doc.id, 'reviewed')}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-green-600"
                                  >
                                    ✓ Mark as Reviewed
                                  </button>
                                  <button 
                                    onClick={() => updateReviewStatus(doc.id, 'not reviewed')}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600"
                                  >
                                    ○ Mark as Not Reviewed
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Priority Badge with Dropdown */}
                            <div className="flex items-center space-x-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPriorityColor(doc.priority || 'normal')}`}>
                                {doc.priority === 'critical' && <AlertTriangle className="h-3 w-3" />}
                                {doc.priority === 'urgent' && <Clock className="h-3 w-3" />}
                                {doc.priority === 'normal' && <CheckCircle className="h-3 w-3" />}
                                <span className="capitalize">{doc.priority || 'normal'}</span>
                              </span>
                              
                              {/* Priority Dropdown */}
                              <div className="relative group">
                                <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                  <span className="text-xs text-gray-400">⋮</span>
                                </button>
                                <div className="absolute left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                  <button 
                                    onClick={() => updatePriority(doc.id, 'critical')}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                                  >
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Critical</span>
                                  </button>
                                  <button 
                                    onClick={() => updatePriority(doc.id, 'urgent')}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-yellow-600 flex items-center space-x-2"
                                  >
                                    <Clock className="h-3 w-3" />
                                    <span>Urgent</span>
                                  </button>
                                  <button 
                                    onClick={() => updatePriority(doc.id, 'normal')}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-green-600 flex items-center space-x-2"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Normal</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Due Date Badge with Dropdown */}
                            {doc.due_date ? (
                              <div className="flex items-center space-x-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                                  formatDueDate(doc.due_date)?.color || 'text-gray-600 bg-gray-100'
                                }`}>
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDueDate(doc.due_date)?.text}</span>
                                </span>
                                
                                {/* Due Date Dropdown */}
                                <div className="relative group">
                                  <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                                    <span className="text-xs text-gray-400">⋮</span>
                                  </button>
                                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    <div className="p-3">
                                      <label className="block text-xs font-medium text-gray-700 mb-2">Update Due Date</label>
                                      <input 
                                        type="date"
                                        min={getTodayDate()}
                                        defaultValue={doc.due_date}
                                        onChange={(e) => updateDueDate(doc.id, e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                      />
                                      <div className="mt-2 space-y-1">
                                        {getSuggestedDates().map((suggestion) => (
                                          <button
                                            key={suggestion.label}
                                            onClick={() => updateDueDate(doc.id, suggestion.date)}
                                            className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-50 rounded"
                                          >
                                            {suggestion.label}
                                          </button>
                                        ))}
                                      </div>
                                      <div className="mt-2 pt-2 border-t border-gray-200">
                                        <button 
                                          onClick={() => updateDueDate(doc.id, null)}
                                          className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-50 rounded text-red-600"
                                        >
                                          Remove Due Date
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="relative group">
                                <button className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Set Due Date</span>
                                </button>
                                
                                {/* Add Due Date Dropdown */}
                                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                  <div className="p-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Set Due Date</label>
                                    <input 
                                      type="date"
                                      min={getTodayDate()}
                                      onChange={(e) => updateDueDate(doc.id, e.target.value)}
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                    />
                                    <div className="mt-2 space-y-1">
                                      {getSuggestedDates().map((suggestion) => (
                                        <button
                                          key={suggestion.label}
                                          onClick={() => updateDueDate(doc.id, suggestion.date)}
                                          className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-50 rounded"
                                        >
                                          {suggestion.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Department Badge */}
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-600">
                              <Heart className="inline h-3 w-3 mr-1" />
                              Human Resources
                            </span>
                            
                            {/* Access Level */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${{
                              'restricted': 'bg-red-100 text-red-600',
                              'confidential': 'bg-orange-100 text-orange-600', 
                              'departmental': 'bg-yellow-100 text-yellow-600',
                              'general': 'bg-green-100 text-green-600'
                            }[doc.access_level] || 'bg-green-100 text-green-600'}`}>
                              {doc.access_level === 'restricted' && '🔒'}
                              {doc.access_level === 'confidential' && '🔐'}
                              {doc.access_level === 'departmental' && '👥'}
                              {doc.access_level === 'general' && '🌐'}
                              <span className="ml-1 capitalize">{doc.access_level || 'general'}</span>
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
                <strong>Department:</strong> Human Resources
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
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
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

export default HRDashboard;