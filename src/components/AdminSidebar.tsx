"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Bot, 
  MessageSquare, 
  Mail, 
  BarChart3, 
  Settings, 
  Users, 
  UserPlus,
  X,
  Menu
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics'
  },
  {
    name: 'Blog Management',
    href: '/admin/dashboard/blogs',
    icon: FileText,
    description: 'Create, edit, and manage blogs'
  },
  {
    name: 'AI Content',
    href: '/admin/dashboard/ai-content',
    icon: Bot,
    description: 'AI content generation tools'
  },
  {
    name: 'Comments',
    href: '/admin/dashboard/comments',
    icon: MessageSquare,
    description: 'Manage user comments'
  },
  {
    name: 'Newsletter',
    href: '/admin/dashboard/newsletter',
    icon: Mail,
    description: 'Newsletter subscribers'
  },
  {
    name: 'Analytics',
    href: '/admin/dashboard/analytics',
    icon: BarChart3,
    description: 'Website analytics and insights'
  },
  {
    name: 'User Management',
    href: '/admin/dashboard/users',
    icon: Users,
    description: 'Manage users and sub-admins'
  },
  {
    name: 'Settings',
    href: '/admin/dashboard/settings',
    icon: Settings,
    description: 'Website configuration'
  }
];

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
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
        fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 border-r border-gray-200 dark:border-gray-700
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                Admin Panel
              </h1>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600'
                  }
                `}
                onClick={() => {
                  // Close sidebar on mobile after clicking
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
              >
                <div className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20'
                  }
                `}>
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                </div>
                                         <div className="flex-1">
                           <div className="font-semibold">{item.name}</div>
                         </div>
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
            Gemini AI Blog Admin
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
            v2.0.0
          </div>
        </div>
      </div>
    </>
  );
} 