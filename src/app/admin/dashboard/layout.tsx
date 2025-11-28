"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  LineChart,
  Newspaper,
  Users,
  FlaskConical,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  User,
  Search,
  Bell,
  AlertCircle,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MenuItem[];
  color: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedDropdown, setCollapsedDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    role: "admin" | "faculty" | "volunteer";
    avatar?: string;
  }>({
    name: "Admin User",
    role: "admin",
  });

  // Menu structure with colors for each icon
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-purple-400",
    },
    {
      id: "blogs",
      label: "Blog Management",
      icon: FileText,
      color: "text-blue-400",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: LineChart,
      color: "text-green-400",
    },
    {
      id: "newsletter",
      label: "Newsletter",
      icon: Newspaper,
      color: "text-orange-400",
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      color: "text-cyan-400",
    },
    {
      id: "ai-content",
      label: "AI Content",
      icon: FlaskConical,
      color: "text-yellow-400",
    },
    {
      id: "issues",
      label: "Reported Issues",
      icon: AlertCircle,
      color: "text-red-400",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "text-gray-400",
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setCollapsedDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCollapsedItemClick = (item: MenuItem, event: React.MouseEvent) => {
    if (item.children && item.children.length > 0) {
      event.preventDefault();
      event.stopPropagation();

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setDropdownPosition({
        top: rect.top,
        left: rect.right + 8,
      });
      setCollapsedDropdown(collapsedDropdown === item.id ? null : item.id);
    } else {
      // Navigate to the page
      router.push(`/admin/dashboard/${item.id}`);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      router.push("/admin");
    } catch (error) {
      console.error("Error during logout:", error);
      window.location.href = "/admin";
    }
  };

  const getUserIcon = () => {
    switch (userInfo.role) {
      case "admin":
        return Shield;
      case "faculty":
        return User;
      case "volunteer":
        return User;
      default:
        return User;
    }
  };

  const getUserRoleText = () => {
    switch (userInfo.role) {
      case "admin":
        return "Administrator";
      case "faculty":
        return "Faculty Member";
      case "volunteer":
        return "Volunteer";
      default:
        return "User";
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const IconComponent = item.icon;
    const hasChildren = item.children && item.children.length > 0;

    if (sidebarCollapsed) {
      return (
        <button
          key={item.id}
          onClick={(e) => handleCollapsedItemClick(item, e)}
          className="w-full flex items-center justify-center p-3 text-left transition-colors duration-200 rounded group relative text-gray-300 hover:bg-gray-800 hover:text-white"
          title={item.label}
        >
          <IconComponent className={`h-5 w-5 ${item.color} group-hover:text-white`} />
        </button>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => router.push(`/admin/dashboard/${item.id}`)}
        className="w-full flex items-center px-4 py-3 text-left transition-colors duration-200 rounded group text-gray-300 hover:bg-gray-800 hover:text-white"
      >
        <IconComponent className={`h-4 w-4 mr-3 ${item.color} group-hover:text-white`} />
        <span className="text-sm font-medium">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${sidebarCollapsed ? "w-16" : "w-72"} bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out relative z-40`}
      >
        {/* Header */}
        <div className={`${sidebarCollapsed ? "p-2" : "p-4"} border-b border-gray-800`}>
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              </div>
            )}
            <button
              onClick={() => {
                setSidebarCollapsed(!sidebarCollapsed);
                setCollapsedDropdown(null);
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 ${sidebarCollapsed ? "px-1" : "px-2"}`}>
          <div className="space-y-1">{menuItems.map((item) => renderMenuItem(item))}</div>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-800 p-4">
          {!sidebarCollapsed ? (
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-600 rounded-full mr-3">
                    {(() => {
                      const UserIcon = getUserIcon();
                      return <UserIcon className="h-4 w-4 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{userInfo.name}</h3>
                    <p className="text-xs text-gray-400">{getUserRoleText()}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-600 rounded-lg transition-colors group"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4 text-gray-400 group-hover:text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-blue-600 rounded-full">
                {(() => {
                  const UserIcon = getUserIcon();
                  return <UserIcon className="h-4 w-4 text-white" />;
                })()}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-600 rounded-lg transition-colors group"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-gray-400 group-hover:text-white" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Floating Dropdown for Collapsed Sidebar */}
      {sidebarCollapsed && collapsedDropdown && (
        <div
          ref={dropdownRef}
          className="fixed z-50 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 min-w-64 max-w-80"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          {(() => {
            const item = menuItems.find((item) => item.id === collapsedDropdown);
            if (!item || !item.children) return null;

            return (
              <div className="py-2">
                {/* Header with parent label */}
                <div className="px-4 py-3 border-b border-gray-700 bg-gray-750">
                  <div className="flex items-center">
                    <item.icon className={`h-4 w-4 mr-3 ${item.color}`} />
                    <span className="text-sm font-medium text-white">{item.label}</span>
                  </div>
                </div>

                {/* Child items with connecting lines */}
                <div className="relative py-2">
                  {/* Main vertical line */}
                  <div
                    className="absolute left-6 top-2 w-px bg-gray-600"
                    style={{ height: `${(item.children.length - 1) * 44 + 22}px` }}
                  ></div>

                  {/* Child items */}
                  <div className="space-y-1">
                    {item.children.map((child, index) => {
                      const ChildIcon = child.icon;

                      return (
                        <div key={child.id} className="relative">
                          {/* Curved connecting line */}
                          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex items-center">
                            <div className="w-4 h-4 border-l border-b border-gray-600 rounded-bl-lg"></div>
                          </div>

                          <button
                            onClick={() => router.push(`/admin/dashboard/${child.id}`)}
                            className="w-full flex items-center px-4 py-2.5 text-left transition-colors duration-200 hover:bg-gray-700 text-gray-300"
                          >
                            <div className="w-7"></div> {/* Spacer for alignment */}
                            <ChildIcon className={`h-4 w-4 mr-3 ${child.color}`} />
                            <span className="text-sm">{child.label}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              
              {/* User Menu */}
              <button className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium">Admin User</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 