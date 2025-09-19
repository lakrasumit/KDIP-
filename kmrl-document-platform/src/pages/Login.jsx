import React, { useState } from 'react';
import { User, Lock, Train } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    {
      id: 'Engineering',
      name: 'Engineering',
      description: 'Rolling stock, infrastructure, and technical operations',
      color: 'bg-blue-500',
      icon: '🔧'
    },
    {
      id: 'Operations',
      name: 'Operations',
      description: 'Train operations, station management, and daily operations',
      color: 'bg-green-500',
      icon: '🚆'
    },
    {
      id: 'Finance',
      name: 'Finance',
      description: 'Procurement, invoicing, and financial management',
      color: 'bg-yellow-500',
      icon: '💰'
    },
    {
      id: 'HR',
      name: 'Human Resources',
      description: 'Staff management, training, and policy administration',
      color: 'bg-purple-500',
      icon: '👥'
    },
    {
      id: 'Management',
      name: 'Management',
      description: 'Executive oversight and strategic planning',
      color: 'bg-red-500',
      icon: '📊'
    }
  ];

  const handleLogin = () => {
    if (selectedRole) {
      onLogin(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Train className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            KMRL Document Platform
          </h1>
          <p className="text-gray-600">
            Secure document management for Kochi Metro Rail Limited
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Select Your Department
            </h2>
            <p className="text-sm text-gray-600">
              Choose your role to access personalized content
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-3 mb-6">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedRole === role.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${role.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedRole === role.id
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedRole === role.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={!selectedRole}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
              selectedRole
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Access Platform</span>
            </div>
          </button>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-amber-600 text-sm">🔒</div>
              <div>
                <p className="text-sm text-amber-800 font-medium">Security Notice</p>
                <p className="text-xs text-amber-700 mt-1">
                  This is a demonstration platform. In production, multi-factor authentication and LDAP integration would be implemented.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Kochi Metro Rail Limited. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;