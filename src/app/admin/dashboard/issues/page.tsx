"use client";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle, Clock, Mail, User, MessageSquare, Search, Filter, Trash2, Eye, EyeOff } from "lucide-react";

interface Issue {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved' | 'closed';
  adminNotes?: string;
  resolvedAt?: string;
  resolvedBy?: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'closed'>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, searchTerm, statusFilter]);

  async function fetchIssues() {
    try {
      setLoading(true);
      const response = await fetch('/api/issues');
      if (!response.ok) throw new Error('Failed to fetch issues');
      const data = await response.json();
      setIssues(data.issues || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterIssues() {
    let filtered = [...issues];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(issue =>
        issue.name.toLowerCase().includes(term) ||
        issue.email.toLowerCase().includes(term) ||
        issue.subject.toLowerCase().includes(term) ||
        issue.message.toLowerCase().includes(term)
      );
    }

    setFilteredIssues(filtered);
  }

  async function updateIssueStatus(issueId: string, status: 'pending' | 'resolved' | 'closed', notes?: string) {
    try {
      setUpdating(true);
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes || adminNotes }),
      });

      if (!response.ok) throw new Error('Failed to update issue');
      
      await fetchIssues();
      if (selectedIssue?._id === issueId) {
        setSelectedIssue(null);
        setAdminNotes("");
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Failed to update issue');
    } finally {
      setUpdating(false);
    }
  }

  async function deleteIssue(issueId: string) {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete issue');
      
      await fetchIssues();
      if (selectedIssue?._id === issueId) {
        setSelectedIssue(null);
      }
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('Failed to delete issue');
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending': return Clock;
      case 'resolved': return CheckCircle;
      case 'closed': return XCircle;
      default: return AlertCircle;
    }
  }

  const pendingCount = issues.filter(i => i.status === 'pending').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const closedCount = issues.filter(i => i.status === 'closed').length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reported Issues</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and resolve user-reported issues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{issues.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{resolvedCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Closed</p>
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{closedCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'resolved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setStatusFilter('closed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === 'closed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Closed
            </button>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No issues found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredIssues.map((issue) => {
              const StatusIcon = getStatusIcon(issue.status);
              return (
                <div
                  key={issue._id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedIssue(issue);
                    setAdminNotes(issue.adminNotes || "");
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className={`h-5 w-5 ${issue.status === 'pending' ? 'text-yellow-600' : issue.status === 'resolved' ? 'text-green-600' : 'text-gray-600'}`} />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{issue.subject}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{issue.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{issue.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{issue.message}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssue(issue);
                          setAdminNotes(issue.adminNotes || "");
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteIssue(issue._id);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedIssue(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedIssue.subject}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{selectedIssue.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{selectedIssue.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(selectedIssue.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedIssue.status)}`}>
                {selectedIssue.status}
              </span>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  {selectedIssue.message}
                </p>
              </div>

              {selectedIssue.adminNotes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Admin Notes</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    {selectedIssue.adminNotes}
                  </p>
                </div>
              )}

              {selectedIssue.resolvedAt && selectedIssue.resolvedBy && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    <strong>Resolved on:</strong> {new Date(selectedIssue.resolvedAt).toLocaleString()}
                    {selectedIssue.resolvedBy && (
                      <> by {selectedIssue.resolvedBy.name}</>
                    )}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add notes about this issue..."
                />
              </div>

              <div className="flex gap-3">
                {selectedIssue.status !== 'resolved' && (
                  <button
                    onClick={() => updateIssueStatus(selectedIssue._id, 'resolved')}
                    disabled={updating}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    Mark as Resolved
                  </button>
                )}
                {selectedIssue.status !== 'closed' && (
                  <button
                    onClick={() => updateIssueStatus(selectedIssue._id, 'closed')}
                    disabled={updating}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    Close Issue
                  </button>
                )}
                {selectedIssue.status === 'resolved' && (
                  <button
                    onClick={() => updateIssueStatus(selectedIssue._id, 'pending')}
                    disabled={updating}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    Reopen Issue
                  </button>
                )}
                <button
                  onClick={() => {
                    if (adminNotes !== selectedIssue.adminNotes) {
                      updateIssueStatus(selectedIssue._id, selectedIssue.status, adminNotes);
                    } else {
                      setSelectedIssue(null);
                    }
                  }}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

