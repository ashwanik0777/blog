"use client";
import { errorMessage, useConfirm, useToast } from "@/components/admin/AdminFeedback";
import type { AdminSessionUser } from "@/types/admin";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Mail, 
  Calendar,
  Search,
  Filter,
  XCircle,
  Lock,
  Unlock,
  Crown,
  UserCheck,
  UserX
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'sub-admin' | 'editor';
  permissions?: string[];
  disabled: boolean;
  createdAt: string;
  lastLogin?: string;
  emailVerified?: string;
}

export default function UserManagementPage() {
  const toast = useToast();
  const askConfirm = useConfirm();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: 'sub-admin' as 'sub-admin' | 'editor',
    permissions: [] as string[]
  });

  const availablePermissions = [
    'manage_blogs',
    'manage_users',
    'view_analytics',
    'manage_newsletter',
    'ai_content_generation',
    'manage_settings',
    'manage_issues'
  ];

  const permissionLabels: Record<string, string> = {
    manage_blogs: 'Manage blogs',
    manage_users: 'Manage staff',
    view_analytics: 'View analytics',
    manage_newsletter: 'Manage newsletter',
    ai_content_generation: 'Use AI tools',
    manage_settings: 'Manage settings',
    manage_issues: 'Manage issues',
  };

  // Check if user is admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/admin-session');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.user);
          fetchUsers();
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

  async function fetchUsers() {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser() {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([newUser, ...users]);
        setShowCreateModal(false);
        resetForm();
        toast.success('User created successfully!');
      } else {
        toast.error(await errorMessage(response, 'Failed to create user'));
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Something went wrong while creating user. Please check your connection and try again.');
    }
  }

  async function handleUpdateUser() {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u._id === editingUser._id ? updatedUser : u));
        setEditingUser(null);
        resetForm();
        toast.success('User updated successfully!');
      } else {
        toast.error(await errorMessage(response, 'Failed to update user'));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Something went wrong while updating user. Please check your connection and try again.');
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!(await askConfirm({ title: 'Delete this staff account?', message: 'They will lose access to the dashboard immediately. This cannot be undone.', confirmLabel: 'Delete account', tone: 'danger' }))) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
        toast.success('User deleted successfully!');
      } else {
        toast.error(await errorMessage(response, 'Failed to delete user'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Something went wrong while deleting user. Please check your connection and try again.');
    }
  }

  async function handleToggleStatus(user: User) {
    try {
      const response = await fetch(`/api/admin/users/${user._id}/toggle-status`, {
        method: 'PATCH',
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u._id === user._id ? updatedUser : u));
        toast.success(`User ${user.disabled ? 'activated' : 'deactivated'} successfully!`);
      } else {
        toast.error(await errorMessage(response, 'Failed to update user status'));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Something went wrong while updating user status. Please check your connection and try again.');
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: 'sub-admin',
      permissions: []
    });
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role === 'admin' ? 'sub-admin' : user.role,
      permissions: user.permissions || []
    });
  }

  // Filter staff users
  const filteredUsers = users.filter(user => {
    if (user.role === 'admin') return false;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && !user.disabled) ||
                         (filterStatus === 'inactive' && user.disabled);
    return matchesSearch && matchesRole && matchesStatus;
  });

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Staff Management
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300">
              Create sub-admins and editors with specific permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Staff</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm p-6 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Staff</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">{filteredUsers.length}</p>
            </div>
            <div className="p-3 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
              <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
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
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Staff</p>
              <p className="text-3xl font-bold text-green-600">{users.filter(u => u.role !== 'admin' && !u.disabled).length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
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
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Sub Admins</p>
              <p className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'sub-admin').length}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Editors</p>
              <p className="text-3xl font-bold text-red-600">{users.filter(u => u.role === 'editor').length}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="sub-admin">Sub-Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-8 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
        <div className="p-6">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : user.role === 'sub-admin'
                          ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                          : user.role === 'editor'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 
                         user.role === 'sub-admin' ? 'Sub-Admin' :
                         'Editor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.disabled
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {user.disabled ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-brand-600 hover:text-brand-900 dark:hover:text-brand-400 p-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.disabled
                              ? 'text-green-600 hover:text-green-900 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-red-600 hover:text-red-900 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={user.disabled ? 'Activate user' : 'Deactivate user'}
                        >
                          {user.disabled ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

                {filteredUsers.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                    <p className="text-zinc-500 dark:text-zinc-400 text-lg">No staff members found</p>
                    <p className="text-zinc-400 dark:text-zinc-500">Create your first sub-admin or editor to get started</p>
                  </div>
                )}
        </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {editingUser ? 'Edit Staff' : 'Create New Staff'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingUser) {
                handleUpdateUser();
              } else {
                handleCreateUser();
              }
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Password {editingUser ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'sub-admin' | 'editor' }))}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="sub-admin">Sub-Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            permissions: e.target.checked
                              ? [...prev.permissions, permission]
                              : prev.permissions.filter((item) => item !== permission),
                          }));
                        }}
                        className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>{permissionLabels[permission] || permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all duration-200 font-semibold"
                >
                  {editingUser ? 'Update Staff' : 'Create Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 