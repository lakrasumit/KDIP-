import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Search,
  Shield,
  Menu,
  X,
  LogOut,
  Bell,
  User,
  Globe
} from 'lucide-react';

const Layout = ({ children, userRole, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const location = useLocation();

  const roleColors = {
    Engineering: 'bg-blue-500',
    Operations: 'bg-green-500',
    Finance: 'bg-yellow-500',
    HR: 'bg-purple-500',
    Management: 'bg-red-500'
  };

  const navigation = [
    {
      name: language === 'en' ? 'Dashboard' : 'ഡാഷ്ബോർഡ്',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Engineering', 'Operations', 'Finance', 'HR', 'Management']
    },
    {
      name: language === 'en' ? 'Document Hub' : 'ഡോക്യുമെന്റ് ഹബ്',
      href: '/documents',
      icon: FileText,
      roles: ['Engineering', 'Operations', 'Finance', 'HR', 'Management']
    },
    {
      name: language === 'en' ? 'Knowledge Search' : 'വിജ്ഞാന തിരയൽ',
      href: '/search',
      icon: Search,
      roles: ['Engineering', 'Operations', 'Finance', 'HR', 'Management']
    },
    {
      name: language === 'en' ? 'Compliance Tracker' : 'കംപ്ലയൻസ് ട്രാക്കർ',
      href: '/compliance',
      icon: Shield,
      roles: ['Management', 'HR', 'Operations']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ml' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:transform-none flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {language === 'en' ? 'KMRL DMS' : 'കെഎംആർഎൽ ഡിഎംഎസ്'}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 mt-8 px-4 overflow-y-auto">
          <div className="space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${roleColors[userRole]} rounded-full flex items-center justify-center flex-shrink-0`}>
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {language === 'en' ? userRole : {
                  Engineering: 'എഞ്ചിനീയറിംഗ്',
                  Operations: 'ഓപ്പറേഷൻസ്',
                  Finance: 'ഫിനാൻസ്',
                  HR: 'എച്ച്ആർ',
                  Management: 'മാനേജ്മെന്റ്'
                }[userRole]}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'en' ? 'Department' : 'വകുപ്പ്'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center space-x-4 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 flex-shrink-0"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {language === 'en' ? 'KMRL Document Management Platform' : 'കെഎംആർഎൽ ഡോക്യുമെന്റ് മാനേജ്മെന്റ് പ്ലാറ്റ്ഫോം'}
              </h1>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 px-2 lg:px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'മലയാളം' : 'English'}</span>
              </button>

              {/* Notifications */}
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'Logout' : 'ലോഗൗട്ട്'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;