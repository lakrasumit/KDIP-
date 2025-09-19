import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Image,
  Mail,
  Smartphone,
  Cloud,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Camera,
  Scan,
  Languages,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';

const DocumentHub = ({ userRole }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Function to handle file download
  const handleDownloadDocument = async (doc) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/download/${doc.filename}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document. Please try again.');
    }
  };

  // Load documents when Recent Processing tab is active
  useEffect(() => {
    if (activeTab === 'recent') {
      fetchRecentDocuments();
    }
  }, [activeTab]);

  const uploadSources = [
    {
      id: 'file',
      name: 'File Upload',
      description: 'Upload files from your computer',
      icon: HardDrive,
      color: 'bg-blue-500'
    },
    {
      id: 'email',
      name: 'Email Import',
      description: 'Import from email attachments',
      icon: Mail,
      color: 'bg-green-500'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp PDFs',
      description: 'Extract PDFs from WhatsApp',
      icon: Smartphone,
      color: 'bg-green-600'
    },
    {
      id: 'cloud',
      name: 'Cloud Storage',
      description: 'Import from SharePoint/Google Drive',
      icon: Cloud,
      color: 'bg-purple-500'
    },
    {
      id: 'scan',
      name: 'Document Scanner',
      description: 'Scan physical documents',
      icon: Scan,
      color: 'bg-orange-500'
    },
    {
      id: 'maximo',
      name: 'Maximo Export',
      description: 'Import from Maximo system',
      icon: FileText,
      color: 'bg-red-500'
    }
  ];

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  // Helper function to get document type from filename
  const getDocumentType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return 'PDF Document';
      case 'doc':
      case 'docx': return 'Word Document';
      case 'xls':
      case 'xlsx': return 'Excel Document';
      default: return 'Document';
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return '1 day ago';
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const newFiles = fileArray.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'uploading',
      progress: 0
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach((fileObj) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, progress, status: progress === 100 ? 'processing' : 'uploading' }
              : f
          )
        );
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileObj.id 
                  ? { ...f, status: 'processed' }
                  : f
              )
            );
          }, 2000);
        }
      }, 200);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'uploading': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return CheckCircle;
      case 'processing': return AlertCircle;
      case 'uploading': return Upload;
      case 'error': return X;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Ingestion Hub</h1>
        <p className="text-gray-600">
          Automated document processing from multiple sources with AI-powered insights
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upload Documents
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recent Processing
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Import Sources
          </button>
        </nav>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
                <p className="text-gray-600">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: PDF, DOC, DOCX, JPG, PNG, Tables, Bilingual documents
                </p>
              </div>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Choose Files
              </label>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upload Progress</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {uploadedFiles.map((file) => {
                  const StatusIcon = getStatusIcon(file.status);
                  return (
                    <div key={file.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                            {file.status}
                          </span>
                          {file.status === 'uploading' && (
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Processing Tab */}
      {activeTab === 'recent' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recently Processed Documents</h3>
              <button 
                onClick={fetchRecentDocuments}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading processed documents...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
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
                  <p className="text-gray-600 mb-4">No processed documents found</p>
                  <p className="text-sm text-gray-500">
                    Documents will appear here after they are processed.
                  </p>
                </div>
              ) : (
                recentDocuments.map((doc) => {
                  const StatusIcon = doc.processed_at ? CheckCircle : AlertCircle;
                  const status = doc.processed_at ? 'processed' : 'pending';
                  
                  return (
                    <div key={doc.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <StatusIcon className={`h-5 w-5 mt-0.5 ${doc.processed_at ? 'text-green-500' : 'text-yellow-500'}`} />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{doc.title || doc.filename}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span>{getDocumentType(doc.filename)}</span>
                              <span>•</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Languages className="h-3 w-3 mr-1" />
                                English
                              </span>
                              <span>•</span>
                              <span>{formatTimestamp(doc.created_at)}</span>
                              {doc.page_count && (
                                <>
                                  <span>•</span>
                                  <span>{doc.page_count} pages</span>
                                </>
                              )}
                            </div>
                            {doc.summary && (
                              <p className="text-sm text-gray-600 mt-2 max-w-2xl">
                                <strong>AI Summary:</strong> {doc.summary.substring(0, 200)}
                                {doc.summary.length > 200 && '...'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            status === 'processed' 
                              ? 'text-green-600 bg-green-100' 
                              : 'text-yellow-600 bg-yellow-100'
                          }`}>
                            {status === 'processed' ? 'Processed' : 'Processing'}
                          </span>
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
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Import Sources Tab */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploadSources.map((source) => (
            <div key={source.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${source.color} rounded-lg flex items-center justify-center`}>
                  <source.icon className="h-6 w-6 text-white" />
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Configure
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {source.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {source.description}
              </p>
              <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                Set Up Integration
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Processing Features */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI-Powered Processing Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Automatic text extraction from images</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Bilingual document recognition</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Document type classification</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Key information extraction</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Automatic summarization</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Cross-reference document linking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentHub;