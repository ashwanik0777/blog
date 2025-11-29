"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collapsedDropdown, setCollapsedDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [isDark, setIsDark] = useState(false);
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

  // Check system theme
  useEffect(() => {
    const checkTheme = () => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
      } else {
        setIsDark(false);
      }
    };
    
    checkTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);
    
    return () => mediaQuery.removeEventListener('change', checkTheme);
  }, []);

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
        return "Faculty";
      case "volunteer":
        return "Volunteer";
      default:
        return "User";
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = pathname?.includes(`/admin/dashboard/${item.id}`);
    const Icon = item.icon;

    if (sidebarCollapsed) {
      return (
        <button
          key={item.id}
          onClick={(e) => handleCollapsedItemClick(item, e)}
          className={`w-full p-3 rounded-lg transition-all duration-200 ${
            isActive
              ? "bg-blue-600 text-white"
              : "text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-white"
          }`}
          title={item.label}
        >
          <Icon className="h-5 w-5 mx-auto" />
        </button>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => router.push(`/admin/dashboard/${item.id}`)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-lg"
            : "text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-white"
        }`}
      >
        <Icon className={`h-5 w-5 ${isActive ? "text-white" : item.color}`} />
        <span className="font-medium">{item.label}</span>
      </button>
    );
  };

  const sidebarBg = isDark 
    ? "bg-gray-900 text-white border-r border-gray-800" 
    : "bg-white text-gray-900 border-r border-gray-200 shadow-lg";
  const sidebarText = isDark ? "text-white" : "text-gray-900";
  const sidebarHover = isDark ? "hover:bg-gray-800" : "hover:bg-gray-50";
  const sidebarBorder = isDark ? "border-gray-800" : "border-gray-200";

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${sidebarCollapsed ? "w-16" : "w-72"} ${sidebarBg} flex flex-col transition-all duration-300 ease-in-out relative z-40`}
      >
        {/* Header */}
        <div className={`${sidebarCollapsed ? "p-2" : "p-4"} border-b ${sidebarBorder}`}>
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <h1 className={`text-lg font-bold ${sidebarText}`}>Admin Panel</h1>
              </div>
            )}
            <button
              onClick={() => {
                setSidebarCollapsed(!sidebarCollapsed);
                setCollapsedDropdown(null);
              }}
              className={`p-2 ${sidebarHover} rounded-lg transition-colors`}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
              ) : (
                <ChevronLeft className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-600"}`} />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 ${sidebarCollapsed ? "px-1" : "px-2"}`}>
          <div className="space-y-1">{menuItems.map((item) => renderMenuItem(item))}</div>
        </nav>

        {/* User Profile Section */}
        <div className={`border-t ${sidebarBorder} p-4`}>
          {!sidebarCollapsed ? (
            <div className={`${isDark ? "bg-gray-800" : "bg-gray-50"} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-600 rounded-full mr-3">
                    {(() => {
                      const UserIcon = getUserIcon();
                      return <UserIcon className="h-4 w-4 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium ${sidebarText}`}>{userInfo.name}</h3>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>{getUserRoleText()}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className={`p-2 ${isDark ? "hover:bg-red-600" : "hover:bg-red-100"} rounded-lg transition-colors group`}
                  title="Logout"
                >
                  <LogOut className={`h-4 w-4 ${isDark ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-red-600"}`} />
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
                className={`p-2 ${isDark ? "hover:bg-red-600" : "hover:bg-red-100"} rounded-lg transition-colors group`}
                title="Logout"
              >
                <LogOut className={`h-4 w-4 ${isDark ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-red-600"}`} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Floating Dropdown for Collapsed Sidebar */}
      {sidebarCollapsed && collapsedDropdown && (
        <div
          ref={dropdownRef}
          className={`fixed z-50 ${isDark ? "bg-gray-800" : "bg-white"} rounded-lg shadow-2xl border ${sidebarBorder} min-w-64 max-w-80`}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          {(() => {
            const item = menuItems.find((item) => item.id === collapsedDropdown);
            if (!item || !item.children) return null;
            return (
              <div className="p-2">
                {item.children.map((child) => {
                  const ChildIcon = child.icon;
                  return (
                    <button
                      key={child.id}
                      onClick={() => {
                        router.push(`/admin/dashboard/${item.id}/${child.id}`);
                        setCollapsedDropdown(null);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg ${sidebarHover} ${sidebarText} transition-colors`}
                    >
                      <ChildIcon className={`h-4 w-4 ${child.color}`} />
                      <span>{child.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    </div>
  );
}
