import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  FileText,
  Download,
  Eye,
  Star,
  Tag,
  Clock,
  User,
  Building,
  Globe,
  ChevronDown,
  X,
  BookOpen,
  Link as LinkIcon,
  Zap
} from 'lucide-react';

const KnowledgeSearch = ({ userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: '',
    department: '',
    documentType: '',
    language: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const mockDocuments = [
    {
      id: 1,
      title: 'Metro Rail Safety Guidelines 2024',
      type: 'Safety Manual',
      department: 'Operations',
      language: 'English',
      date: '2024-09-15',
      author: 'Safety Department',
      summary: 'Comprehensive safety guidelines for metro rail operations including emergency procedures, equipment handling, and staff safety protocols.',
      content: 'This document outlines the critical safety measures required for all metro rail operations...',
      tags: ['safety', 'operations', 'emergency', 'protocols'],
      related: ['Emergency Response Plan', 'Staff Training Manual'],
      downloads: 245,
      views: 1250,
      isFavorite: true
    },
    {
      id: 2,
      title: 'വൈദ്യുതി സുരക്ഷാ നിർദ്ദേശങ്ങൾ',
      type: 'Safety Circular',
      department: 'Engineering',
      language: 'Malayalam',
      date: '2024-09-10',
      author: 'Electrical Engineering',
      summary: 'Electrical safety instructions for maintenance staff working on metro systems.',
      content: 'വൈദ്യുതി സുരക്ഷയുമായി ബന്ധപ്പെട്ട എല്ലാ നിർദ്ദേശങ്ങളും...',
      tags: ['electrical', 'safety', 'maintenance', 'malayalam'],
      related: ['Maintenance Schedule', 'Safety Equipment List'],
      downloads: 156,
      views: 892,
      isFavorite: false
    },
    {
      id: 3,
      title: 'Procurement Policy and Procedures',
      type: 'Policy Document',
      department: 'Finance',
      language: 'English',
      date: '2024-08-28',
      author: 'Finance Department',
      summary: 'Updated procurement policies including vendor selection criteria, approval workflows, and compliance requirements.',
      content: 'The procurement policy establishes the framework for all purchasing activities...',
      tags: ['procurement', 'policy', 'vendors', 'compliance'],
      related: ['Vendor Guidelines', 'Approval Matrix'],
      downloads: 189,
      views: 654,
      isFavorite: false
    },
    {
      id: 4,
      title: 'Staff Training and Development Plan',
      type: 'HR Policy',
      department: 'HR',
      language: 'English',
      date: '2024-09-05',
      author: 'Human Resources',
      summary: 'Annual training plan covering technical skills, safety training, and professional development programs.',
      content: 'This comprehensive training plan addresses the skill development needs...',
      tags: ['training', 'development', 'skills', 'hr'],
      related: ['Performance Metrics', 'Career Development'],
      downloads: 201,
      views: 987,
      isFavorite: true
    }
  ];

  const documentTypes = ['All Types', 'Safety Manual', 'Policy Document', 'Technical Report', 'Circular', 'Invoice', 'Contract'];
  const departments = ['All Departments', 'Engineering', 'Operations', 'Finance', 'HR', 'Management'];
  const languages = ['All Languages', 'English', 'Malayalam', 'Bilingual'];

  const handleSearch = () => {
    // Simulate search results
    const filtered = mockDocuments.filter(doc => {
      const matchesQuery = searchQuery === '' || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDepartment = filters.department === '' || filters.department === 'All Departments' || doc.department === filters.department;
      const matchesType = filters.documentType === '' || filters.documentType === 'All Types' || doc.type === filters.documentType;
      const matchesLanguage = filters.language === 'all' || filters.language === 'All Languages' || doc.language === filters.language;
      
      return matchesQuery && matchesDepartment && matchesType && matchesLanguage;
    });
    
    setSearchResults(filtered);
  };

  const toggleFavorite = (id) => {
    const updatedResults = searchResults.map(doc => 
      doc.id === id ? { ...doc, isFavorite: !doc.isFavorite } : doc
    );
    setSearchResults(updatedResults);
  };

  const clearFilters = () => {
    setFilters({
      dateRange: '',
      department: '',
      documentType: '',
      language: 'all'
    });
  };

  // Initialize with all documents
  React.useEffect(() => {
    setSearchResults(mockDocuments);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Search Hub</h1>
        <p className="text-gray-600">
          Search and discover documents with AI-powered insights and cross-referencing
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search documents, policies, circulars, or ask questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select
                  value={filters.documentType}
                  onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={filters.language}
                  onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Clear All Filters
              </button>
              <span className="text-sm text-gray-600">
                {searchResults.length} documents found
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="lg:col-span-2 space-y-4">
          {searchResults.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 
                      className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      {doc.title}
                    </h3>
                    <button
                      onClick={() => toggleFavorite(doc.id)}
                      className={`p-1 rounded ${doc.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                    >
                      <Star className={`h-4 w-4 ${doc.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      {doc.department}
                    </span>
                    <span className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {doc.type}
                    </span>
                    <span className="flex items-center">
                      <Globe className="h-3 w-3 mr-1" />
                      {doc.language}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {doc.date}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">{doc.summary}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {doc.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {doc.views} views
                    </span>
                    <span className="flex items-center">
                      <Download className="h-3 w-3 mr-1" />
                      {doc.downloads} downloads
                    </span>
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {doc.author}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button 
                    onClick={() => setSelectedDocument(doc)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                    <LinkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-medium text-gray-900">Related Topics</p>
                <p className="text-gray-600 mt-1">Safety protocols, Emergency procedures, Staff training</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-medium text-gray-900">Trending Documents</p>
                <p className="text-gray-600 mt-1">Safety guidelines are being accessed 40% more this week</p>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Recent Updates</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">12</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Popular Downloads</span>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">8</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">My Favorites</span>
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">5</span>
                </div>
              </button>
            </div>
          </div>

          {/* Knowledge Graph */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Connections</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Safety protocols → Training materials</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Procurement → Vendor management</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Maintenance → Equipment specs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedDocument(null)}></div>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto relative">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.title}</h2>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <span>{selectedDocument.type}</span>
                  <span>•</span>
                  <span>{selectedDocument.department}</span>
                  <span>•</span>
                  <span>{selectedDocument.language}</span>
                  <span>•</span>
                  <span>{selectedDocument.date}</span>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-600 mb-4">{selectedDocument.summary}</p>
                  <p className="text-gray-700">{selectedDocument.content}</p>
                </div>
                {selectedDocument.related && selectedDocument.related.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Related Documents</h4>
                    <div className="space-y-1">
                      {selectedDocument.related.map((rel, index) => (
                        <div key={index} className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                          {rel}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeSearch;