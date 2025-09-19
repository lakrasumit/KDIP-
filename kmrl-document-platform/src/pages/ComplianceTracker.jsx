import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Bell,
  Target,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  Eye,
  Plus,
  X,
  ExternalLink,
  User,
  Building
} from 'lucide-react';

const ComplianceTracker = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompliance, setSelectedCompliance] = useState(null);

  const complianceItems = [
    {
      id: 1,
      title: 'Metro Rail Safety Audit 2024',
      description: 'Annual safety audit mandated by CMRS (Commissioner of Metro Rail Safety)',
      authority: 'CMRS',
      dueDate: '2024-09-25',
      status: 'pending',
      priority: 'high',
      progress: 75,
      assignedTo: 'Safety Department',
      documents: ['Safety Manual', 'Emergency Procedures', 'Incident Reports'],
      lastUpdate: '2024-09-18',
      category: 'Safety',
      requirements: [
        'Submit safety management system documentation',
        'Provide training records for all staff',
        'Submit incident reports for the past year',
        'Emergency evacuation drill records'
      ]
    },
    {
      id: 2,
      title: 'Environmental Impact Assessment',
      description: 'Environmental compliance review for new corridor expansion',
      authority: 'MoEF&CC',
      dueDate: '2024-10-15',
      status: 'in-progress',
      priority: 'medium',
      progress: 45,
      assignedTo: 'Engineering Department',
      documents: ['EIA Report', 'Environmental Clearance'],
      lastUpdate: '2024-09-15',
      category: 'Environmental',
      requirements: [
        'Environmental impact study report',
        'Mitigation measures documentation',
        'Public consultation records',
        'Environmental monitoring plan'
      ]
    },
    {
      id: 3,
      title: 'Financial Audit Compliance',
      description: 'Annual financial audit by CAG and internal auditors',
      authority: 'CAG',
      dueDate: '2024-11-30',
      status: 'pending',
      priority: 'high',
      progress: 20,
      assignedTo: 'Finance Department',
      documents: ['Financial Statements', 'Audit Reports', 'Budget Documents'],
      lastUpdate: '2024-09-10',
      category: 'Financial',
      requirements: [
        'Annual financial statements',
        'Budget utilization reports',
        'Internal audit findings',
        'Procurement compliance records'
      ]
    },
    {
      id: 4,
      title: 'HR Policy Compliance Review',
      description: 'Review of HR policies and procedures as per labor laws',
      authority: 'Labor Department',
      dueDate: '2024-12-20',
      status: 'completed',
      priority: 'low',
      progress: 100,
      assignedTo: 'HR Department',
      documents: ['HR Policies', 'Employee Handbook', 'Training Records'],
      lastUpdate: '2024-09-01',
      category: 'HR',
      requirements: [
        'Updated HR policy manual',
        'Employee training completion records',
        'Grievance handling procedures',
        'Performance evaluation system'
      ]
    }
  ];

  const upcomingDeadlines = [
    { title: 'Metro Rail Safety Audit', days: 7, priority: 'high' },
    { title: 'Quarterly Safety Report', days: 14, priority: 'medium' },
    { title: 'Environmental Monitoring', days: 21, priority: 'medium' },
    { title: 'Financial Statement Submission', days: 45, priority: 'high' }
  ];

  const complianceStats = {
    total: complianceItems.length,
    completed: complianceItems.filter(item => item.status === 'completed').length,
    pending: complianceItems.filter(item => item.status === 'pending').length,
    inProgress: complianceItems.filter(item => item.status === 'in-progress').length,
    overdue: 1 // Mock data
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Tracker</h1>
          <p className="text-gray-600">
            Monitor regulatory deadlines and compliance requirements across all departments
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Compliance Item</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{complianceStats.total}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{complianceStats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{complianceStats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{complianceStats.pending}</p>
            </div>
            <Bell className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{complianceStats.overdue}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compliance Overview
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'deadlines'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming Deadlines
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compliance Reports
          </button>
        </nav>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Compliance List */}
          <div className="lg:col-span-2 space-y-4">
            {complianceItems.map((item) => {
              const daysUntil = getDaysUntilDue(item.dueDate);
              return (
                <div key={item.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${getPriorityColor(item.priority)} p-6`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Authority:</span>
                          <span className="ml-2 text-gray-600">{item.authority}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Due Date:</span>
                          <span className={`ml-2 ${daysUntil <= 7 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            {item.dueDate} ({daysUntil} days)
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Assigned To:</span>
                          <span className="ml-2 text-gray-600">{item.assignedTo}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Category:</span>
                          <span className="ml-2 text-gray-600">{item.category}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.progress === 100 ? 'bg-green-500' : 
                              item.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          Last updated: {item.lastUpdate}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button 
                        onClick={() => setSelectedCompliance(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
              </div>
              <div className="p-6 space-y-4">
                {upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                      <p className="text-xs text-gray-500">{deadline.days} days remaining</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      deadline.priority === 'high' ? 'bg-red-500' : 
                      deadline.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Score */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Score</h3>
                  <p className="text-sm text-gray-600">Overall compliance health</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">87%</div>
                <div className="flex items-center justify-center space-x-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>+5% from last month</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Generate Report</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Set Reminder</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Schedule Review</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deadlines' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">All Upcoming Deadlines</h3>
            <div className="space-y-4">
              {complianceItems
                .filter(item => item.status !== 'completed')
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .map((item) => {
                  const daysUntil = getDaysUntilDue(item.dueDate);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          daysUntil <= 7 ? 'bg-red-500' : 
                          daysUntil <= 14 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.authority}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${daysUntil <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.dueDate}
                        </p>
                        <p className="text-sm text-gray-600">{daysUntil} days remaining</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Compliance Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 mb-2">Monthly Compliance Summary</h4>
              <p className="text-sm text-gray-600 mb-4">Overview of all compliance activities</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                Generate Report
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 mb-2">Audit Trail Report</h4>
              <p className="text-sm text-gray-600 mb-4">Detailed audit and compliance history</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                Generate Report
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
              <p className="text-sm text-gray-600 mb-4">Compliance risk analysis and mitigation</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Detail Modal */}
      {selectedCompliance && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedCompliance(null)}></div>
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto relative">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{selectedCompliance.title}</h2>
                <button
                  onClick={() => setSelectedCompliance(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Authority</h4>
                    <p className="text-gray-600">{selectedCompliance.authority}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Due Date</h4>
                    <p className="text-gray-600">{selectedCompliance.dueDate}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Assigned Department</h4>
                    <p className="text-gray-600">{selectedCompliance.assignedTo}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Category</h4>
                    <p className="text-gray-600">{selectedCompliance.category}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedCompliance.description}</p>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                  <ul className="space-y-2">
                    {selectedCompliance.requirements.map((req, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Related Documents</h4>
                  <div className="space-y-2">
                    {selectedCompliance.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{doc}</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">
                          View Document
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceTracker;