"use client";
import type { AdminSessionUser } from "@/types/admin";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  Download,
  Filter,
  RefreshCw,
  Activity,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totalViews: number;
  totalBlogs: number;
  publishedBlogs: number;
  totalUsers: number;
  totalSubscribers: number;
  totalIssues: number;
  pendingIssues: number;
  uniqueVisitors: number;
  totalPageViews: number;
  uniqueIPs: number;
  viewsByDay: { [date: string]: number };
  visitorsByDay: { [date: string]: number };
  pageViewsByDay: { [date: string]: number };
  topBlogs: Array<{
    title: string;
    views: number;
    slug: string;
    _id: string;
  }>;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  userGrowth: Array<{
    date: string;
    users: number;
  }>;
  deviceStats: { [key: string]: number };
  browserStats: { [key: string]: number };
  referrerStats?: Array<{
    referer: string;
    count: number;
  }>;
  topComments?: Array<{
    _id: string;
    authorName: string;
    authorEmail?: string;
    content: string;
    status: string;
    createdAt: string;
    blogTitle: string;
    blogSlug: string;
  }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState("lifetime");

  // Returns data instead of setting state so the effect below can apply it asynchronously.
  const loadAnalytics = useCallback(async (): Promise<AnalyticsData> => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        // If error response, try to get error message
        const errorData = await response.json().catch(() => ({}));
        console.error('Analytics fetch error:', errorData);
        // Set empty data structure
        return ({
          totalViews: 0,
          totalBlogs: 0,
          publishedBlogs: 0,
          totalUsers: 0,
          totalSubscribers: 0,
          totalIssues: 0,
          pendingIssues: 0,
          uniqueVisitors: 0,
          totalPageViews: 0,
          uniqueIPs: 0,
          viewsByDay: {},
          visitorsByDay: {},
          pageViewsByDay: {},
          topBlogs: [],
          topPages: [],
          userGrowth: [],
          deviceStats: {},
          browserStats: {},
          referrerStats: [],
          topComments: []
        });
      }
      
      const data = await response.json();
      
      // Check if response has error field
      if (data.error) {
        console.error('Analytics API error:', data.error);
        return ({
          totalViews: 0,
          totalBlogs: 0,
          publishedBlogs: 0,
          totalUsers: 0,
          totalSubscribers: 0,
          totalIssues: 0,
          pendingIssues: 0,
          uniqueVisitors: 0,
          totalPageViews: 0,
          uniqueIPs: 0,
          viewsByDay: {},
          visitorsByDay: {},
          pageViewsByDay: {},
          topBlogs: [],
          topPages: [],
          userGrowth: [],
          deviceStats: {},
          browserStats: {},
          referrerStats: [],
          topComments: []
        });
      }
      
      return data as AnalyticsData;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty data on error
      return ({
        totalViews: 0,
        totalBlogs: 0,
        publishedBlogs: 0,
        totalUsers: 0,
        totalSubscribers: 0,
        totalIssues: 0,
        pendingIssues: 0,
        uniqueVisitors: 0,
        totalPageViews: 0,
        uniqueIPs: 0,
        viewsByDay: {},
        visitorsByDay: {},
        pageViewsByDay: {},
        topBlogs: [],
        topPages: [],
        userGrowth: [],
        deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
        browserStats: { chrome: 0, firefox: 0, safari: 0, edge: 0 },
        referrerStats: [],
        topComments: []
      });
    }
  }, [timeRange]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsData(await loadAnalytics());
  }, [loadAnalytics]);

  // Check if user is admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/admin-session');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.user);
        } else {
          router.push('/admin');
        }
      } catch {
        router.push('/admin');
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!adminUser) return;
    let active = true;
    loadAnalytics().then((data) => {
      if (active) setAnalyticsData(data);
    });
    return () => {
      active = false;
    };
  }, [adminUser, loadAnalytics]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300">
              Track your website performance and user engagement
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="pl-10 pr-8 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="lifetime">Lifetime</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <button
              onClick={fetchAnalytics}
              className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Views</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {analyticsData?.totalViews?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5%
              </p>
            </div>
            <div className="p-3 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
              <Eye className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Users</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {analyticsData?.totalUsers?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8.2%
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Blogs</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {analyticsData?.totalBlogs || '0'}
              </p>
              <p className="text-sm text-brand-600 dark:text-brand-400 flex items-center mt-1">
                <Activity className="w-4 h-4 mr-1" />
                Active
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Unique Visitors</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {analyticsData?.uniqueVisitors?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-brand-600 dark:text-brand-400 flex items-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                {analyticsData?.uniqueIPs || '0'} unique IPs
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Views Over Time */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Views Over Time
            </h3>
            <button className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {Object.keys(analyticsData.pageViewsByDay || analyticsData.viewsByDay || {}).length > 0 ? (
              Object.entries(analyticsData.pageViewsByDay || analyticsData.viewsByDay || {}).map(([date, views]) => {
                const allValues = Object.values(analyticsData.pageViewsByDay || analyticsData.viewsByDay || {});
                const maxValue = Math.max(...allValues, 1);
                return (
                  <div key={date} className="flex-1 flex flex-col items-center min-w-0">
                    <div 
                      className="w-full bg-brand-600 rounded-t hover:bg-brand-700 transition-colors"
                      style={{ height: `${(Number(views) / maxValue) * 200}px`, minHeight: '4px' }}
                      title={`${date}: ${views} views`}
                    ></div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 truncate w-full text-center">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                <p>No data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Unique Visitors Over Time */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Unique Visitors Over Time
            </h3>
            <button className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {Object.keys(analyticsData.visitorsByDay || {}).length > 0 ? (
              Object.entries(analyticsData.visitorsByDay || {}).map(([date, visitors]) => {
                const allValues = Object.values(analyticsData.visitorsByDay || {});
                const maxValue = Math.max(...allValues, 1);
                return (
                  <div key={date} className="flex-1 flex flex-col items-center min-w-0">
                    <div 
                      className="w-full bg-green-600 rounded-t hover:bg-green-700 transition-colors"
                      style={{ height: `${(Number(visitors) / maxValue) * 200}px`, minHeight: '4px' }}
                      title={`${date}: ${visitors} unique visitors`}
                    ></div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 truncate w-full text-center">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                <p>No data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Top Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performing Blogs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Top Performing Blogs
            </h3>
            <button className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {analyticsData.topBlogs && analyticsData.topBlogs.length > 0 ? (
              analyticsData.topBlogs.map((blog, index) => (
                <div key={blog._id || blog.slug} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-xs">
                        {blog.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {blog.views?.toLocaleString() || '0'} views
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {analyticsData?.totalViews ? Math.round((blog.views / analyticsData.totalViews) * 100) : 0}%
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No blogs available</p>
            )}
          </div>
        </motion.div>

        {/* Top 50 Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Top 50 Comments
            </h3>
            <button className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {analyticsData.topComments && analyticsData.topComments.length > 0 ? (
              analyticsData.topComments.map((comment) => {
                const getStatusIcon = () => {
                  switch (comment.status) {
                    case 'approved':
                      return <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />;
                    case 'pending':
                      return <Clock className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />;
                    case 'flagged':
                      return <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />;
                    case 'rejected':
                      return <XCircle className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />;
                    default:
                      return <MessageSquare className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />;
                  }
                };
                return (
                  <div key={comment._id} className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon()}
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                          {comment.authorName}
                        </span>
                        {comment.authorEmail && (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            ({comment.authorEmail})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 mb-2 line-clamp-2">
                      {comment.content}
                    </p>
                    {comment.blogSlug && (
                      <Link 
                        href={`/blog/${comment.blogSlug}`}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        {comment.blogTitle}
                      </Link>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">No comments available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
            Device Distribution
          </h3>
          <div className="space-y-4">
            {(() => {
              const deviceStats = analyticsData?.deviceStats || {};
              const total = Object.values(deviceStats).reduce((sum: number, val: number) => sum + (val || 0), 0) || 1;
              const devices = [
                { key: 'desktop', label: 'Desktop', color: 'bg-brand-500' },
                { key: 'mobile', label: 'Mobile', color: 'bg-green-500' },
                { key: 'tablet', label: 'Tablet', color: 'bg-purple-500' },
              ];
              return devices.map((device) => {
                const count = deviceStats[device.key] || 0;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={device.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${device.color} rounded`}></div>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{device.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                        <div 
                          className={`${device.color} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white w-20 text-right">
                        {count.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </motion.div>

        {/* Browser Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
            Browser Usage
          </h3>
          <div className="space-y-4">
            {(() => {
              const browserStats = analyticsData?.browserStats || {};
              const total = Object.values(browserStats).reduce((sum: number, val: number) => sum + (val || 0), 0) || 1;
              const browsers = [
                { key: 'chrome', label: 'Chrome', color: 'bg-red-500' },
                { key: 'firefox', label: 'Firefox', color: 'bg-orange-500' },
                { key: 'safari', label: 'Safari', color: 'bg-brand-500' },
                { key: 'edge', label: 'Edge', color: 'bg-green-500' },
              ];
              return browsers.map((browser) => {
                const count = browserStats[browser.key] || 0;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={browser.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${browser.color} rounded`}></div>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{browser.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                        <div 
                          className={`${browser.color} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white w-20 text-right">
                        {count.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 