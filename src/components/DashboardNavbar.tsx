import React, { useState } from 'react';
import { Bell, User, ChevronDown, Home, Users, FileText, Share2, List } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface DashboardNavbarProps {
  onTabChange: () => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onTabChange }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', path: '/dashboard', icon: Home },
    { id: 'clients', label: 'Clients', path: '/clients', icon: Users },
    { id: 'lists', label: 'Listes', path: '/lists', icon: List },
    { id: 'requests', label: 'Demandes', path: '/requests', icon: FileText },
    { id: 'sharing', label: 'Partage', path: '/sharing', icon: Share2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="text-xl font-semibold text-blue-900">
              CentralDocs
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    isActive(tab.path)
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Mon profil
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Paramètres
                    </Link>
                    <Link
                      to="/logout"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Déconnexion
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;