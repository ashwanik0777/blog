"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaTachometerAlt,
  FaBlog,
  FaChartLine,
  FaNewspaper,
  FaUsers,
  FaFlask,
  FaCogs,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaUserShield,
  FaUser,
} from "react-icons/fa";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: FaTachometerAlt,
    description: 'Overview and statistics',
    color: 'text-purple-400'
  },
  {
    name: 'Blog Management',
    href: '/admin/dashboard/blogs',
    icon: FaBlog,
    description: 'Create, edit, and manage blogs',
    color: 'text-blue-400'
  },
  {
    name: 'Analytics',
    href: '/admin/dashboard/analytics',
    icon: FaChartLine,
    description: 'Website analytics and insights',
    color: 'text-green-400'
  },
  {
    name: 'Newsletter',
    href: '/admin/dashboard/newsletter',
    icon: FaNewspaper,
    description: 'Newsletter subscribers',
    color: 'text-orange-400'
  },
  {
    name: 'User Management',
    href: '/admin/dashboard/users',
    icon: FaUsers,
    description: 'Manage users and sub-admins',
    color: 'text-cyan-400'
  },
  {
    name: 'AI Content',
    href: '/admin/dashboard/ai-content',
    icon: FaFlask,
    description: 'AI content generation tools',
    color: 'text-yellow-400'
  },
  {
    name: 'Settings',
    href: '/admin/dashboard/settings',
    icon: FaCogs,
    description: 'Website configuration',
    color: 'text-red-400'
  }
];

export default function AdminSidebar({ isOpen, onToggle, isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl z-50 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        ${isCollapsed ? 'w-16' : 'w-64'} border-r border-gray-700
      `}>
        {/* Header */}
        <div className={`${isCollapsed ? "p-2" : "p-4"} border-b border-gray-800`}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <FaTachometerAlt className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <FaChevronRight className="h-4 w-4 text-gray-400" />
              ) : (
                <FaChevronLeft className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? "px-1" : "px-2"}`}>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              
              if (isCollapsed) {
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={`w-full flex items-center justify-center p-3 text-left transition-colors duration-200 rounded group relative ${
                      isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                    title={item.name}
                  >
                    <IconComponent className={`h-5 w-5 ${isActive ? "text-white" : `${item.color} group-hover:text-white`}`} />
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-200 rounded group ${
                    isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <IconComponent className={`h-4 w-4 mr-3 ${isActive ? "text-white" : `${item.color} group-hover:text-white`}`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-800 p-4">
          {!isCollapsed ? (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3">
                    <FaUserShield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Admin User</h3>
                    <p className="text-xs text-gray-400">Administrator</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Handle logout
                    localStorage.clear();
                    window.location.href = "/admin";
                  }}
                  className="p-2 hover:bg-red-600 rounded-lg transition-colors group"
                  title="Logout"
                >
                  <FaSignOutAlt className="h-4 w-4 text-gray-400 group-hover:text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <FaUserShield className="h-4 w-4 text-white" />
              </div>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/admin";
                }}
                className="p-2 hover:bg-red-600 rounded-lg transition-colors group"
                title="Logout"
              >
                <FaSignOutAlt className="h-4 w-4 text-gray-400 group-hover:text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 