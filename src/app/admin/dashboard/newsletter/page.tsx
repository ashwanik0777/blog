"use client";
import { errorMessage, useConfirm, useToast } from "@/components/admin/AdminFeedback";
import type { AdminSessionUser } from "@/types/admin";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Mail, 
  Users, 
  Send, 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp
} from "lucide-react";

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  subscribed: boolean;
  subscribedAt: string;
  lastEmailSent?: string;
  tags?: string[];
  source?: string;
}

interface Newsletter {
  _id: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  opened: number;
  clicked: number;
  createdAt: string;
}

export default function NewsletterPage() {
  const toast = useToast();
  const askConfirm = useConfirm();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateNewsletter, setShowCreateNewsletter] = useState(false);
  const [showCreateSubscriber, setShowCreateSubscriber] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'newsletters'>('subscribers');
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Form states
  const [newsletterForm, setNewsletterForm] = useState({
    subject: "",
    content: "",
    scheduledAt: "",
    status: 'draft' as 'draft' | 'scheduled' | 'sent'
  });

  const [subscriberForm, setSubscriberForm] = useState({
    email: "",
    name: "",
    tags: [] as string[],
    source: ""
  });

  // Check if user is admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/admin-session');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.user);
          fetchData();
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

  async function fetchData() {
    try {
      const [subscribersRes, newslettersRes] = await Promise.all([
        fetch('/api/admin/newsletter/subscribers'),
        fetch('/api/admin/newsletter/newsletters')
      ]);
      
      const subscribersData = await subscribersRes.json();
      const newslettersData = await newslettersRes.json();
      
      setSubscribers(subscribersData.subscribers || []);
      setNewsletters(newslettersData.newsletters || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNewsletter() {
    try {
      const response = await fetch('/api/admin/newsletter/newsletters', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsletterForm),
      });

      if (response.ok) {
        const newNewsletter = await response.json();
        setNewsletters([newNewsletter, ...newsletters]);
        setShowCreateNewsletter(false);
        resetNewsletterForm();
        toast.success('Newsletter created successfully!');
      } else {
        toast.error(await errorMessage(response, 'Failed to create newsletter'));
      }
    } catch (error) {
      console.error('Error creating newsletter:', error);
      toast.error('Something went wrong while creating newsletter. Please check your connection and try again.');
    }
  }

  async function handleSendNewsletter(newsletter: Newsletter) {
    const activeCount = subscribers.filter(s => s.subscribed).length;
    if (!(await askConfirm({ title: `Send "${newsletter.subject}"?`, message: `It will be emailed to ${activeCount} active subscriber(s) right away. Sent emails cannot be recalled.`, confirmLabel: 'Send now' }))) return;

    setSendingId(newsletter._id);
    try {
      const response = await fetch(`/api/admin/newsletter/newsletters/${newsletter._id}/send`, {
        method: 'POST'
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setNewsletters(newsletters.map(n => n._id === newsletter._id ? data : n));
        const delivery = data.delivery || {};
        toast.success(`Newsletter sent to ${delivery.sent ?? 0} subscriber(s)${delivery.failed ? `, ${delivery.failed} failed` : ''}.`);
      } else {
        toast.error(data.error || 'Failed to send newsletter');
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error('Something went wrong while sending newsletter. Please check your connection and try again.');
    } finally {
      setSendingId(null);
    }
  }

  async function handleCreateSubscriber() {
    try {
      const response = await fetch('/api/admin/newsletter/subscribers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriberForm),
      });

      if (response.ok) {
        const newSubscriber = await response.json();
        setSubscribers([newSubscriber, ...subscribers]);
        setShowCreateSubscriber(false);
        resetSubscriberForm();
        toast.success('Subscriber added successfully!');
      } else {
        toast.error(await errorMessage(response, 'Failed to add subscriber'));
      }
    } catch (error) {
      console.error('Error adding subscriber:', error);
      toast.error('Something went wrong while adding subscriber. Please check your connection and try again.');
    }
  }

  async function handleDeleteSubscriber(subscriberId: string) {
    if (!(await askConfirm({ title: 'Remove this subscriber?', message: 'They will be deleted from your list and will no longer receive newsletters.', confirmLabel: 'Remove', tone: 'danger' }))) return;

    try {
      const response = await fetch(`/api/admin/newsletter/subscribers/${subscriberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSubscribers(subscribers.filter(s => s._id !== subscriberId));
        toast.success('Subscriber deleted successfully!');
      } else {
        toast.error(await errorMessage(response, 'Failed to delete subscriber'));
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Something went wrong while deleting subscriber. Please check your connection and try again.');
    }
  }

  async function handleToggleSubscription(subscriber: Subscriber) {
    try {
      const response = await fetch(`/api/admin/newsletter/subscribers/${subscriber._id}/toggle`, {
        method: 'PATCH'
      });

      if (response.ok) {
        const updatedSubscriber = await response.json();
        setSubscribers(subscribers.map(s => s._id === subscriber._id ? updatedSubscriber : s));
        toast.success(`Subscriber ${subscriber.subscribed ? 'unsubscribed' : 'subscribed'} successfully!`);
      } else {
        toast.error(await errorMessage(response, 'Failed to update subscription'));
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Something went wrong while updating subscription. Please check your connection and try again.');
    }
  }

  function resetNewsletterForm() {
    setNewsletterForm({
      subject: "",
      content: "",
      scheduledAt: "",
      status: 'draft'
    });
  }

  function resetSubscriberForm() {
    setSubscriberForm({
      email: "",
      name: "",
      tags: [],
      source: ""
    });
  }

  // Filter data
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'subscribed' && subscriber.subscribed) ||
                         (filterStatus === 'unsubscribed' && !subscriber.subscribed);
    return matchesSearch && matchesStatus;
  });

  const filteredNewsletters = newsletters.filter(newsletter => {
    const matchesSearch = newsletter.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || newsletter.status === filterStatus;
    return matchesSearch && matchesStatus;
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
              Newsletter Management
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300">
              Manage subscribers and create engaging newsletters
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateSubscriber(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Subscriber</span>
            </button>
            <button
              onClick={() => setShowCreateNewsletter(true)}
              className="bg-brand-600 text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg"
            >
              <Send className="w-5 h-5" />
              <span>Create Newsletter</span>
            </button>
          </div>
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
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Subscribers</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">{subscribers.length}</p>
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
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Active Subscribers</p>
              <p className="text-3xl font-bold text-green-600">{subscribers.filter(s => s.subscribed).length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
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
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Newsletters Sent</p>
              <p className="text-3xl font-bold text-purple-600">{newsletters.filter(n => n.status === 'sent').length}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Send className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Drafts & Scheduled</p>
              <p className="text-3xl font-bold text-orange-600">
                {newsletters.filter(n => n.status === 'draft' || n.status === 'scheduled' || n.status === 'failed').length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 mb-6">
        <div className="border-b border-zinc-200 dark:border-zinc-700">
          <nav className="flex space-x-8 px-6">
            {(['subscribers', 'newsletters'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setFilterStatus('all');
                  setSearchTerm('');
                }}
                className={`py-4 px-1 border-b-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:hover:text-zinc-200'
                }`}
              >
                {tab} ({tab === 'subscribers' ? subscribers.length : newsletters.length})
              </button>
            ))}
          </nav>
        </div>

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
        <div className="p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="subscribed">Subscribed</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
              <thead className="bg-zinc-50 dark:bg-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Subscriber
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Subscribed
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                {filteredSubscribers.map((subscriber) => (
                  <motion.tr
                    key={subscriber._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {subscriber.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {subscriber.email}
                          </div>
                          {subscriber.name && (
                            <div className="text-sm text-zinc-500 dark:text-zinc-400">
                              {subscriber.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        subscriber.subscribed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {subscriber.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(subscriber.subscribedAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleSubscription(subscriber)}
                          className={`p-2 rounded-lg transition-colors ${
                            subscriber.subscribed
                              ? 'text-red-600 hover:text-red-900 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:text-green-900 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={subscriber.subscribed ? 'Unsubscribe' : 'Subscribe'}
                        >
                          {subscriber.subscribed ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSubscriber(subscriber._id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete subscriber"
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

          {filteredSubscribers.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">No subscribers found</p>
              <p className="text-zinc-400 dark:text-zinc-500">Add your first subscriber to get started</p>
            </div>
          )}
        </div>
        )}

        {/* Newsletters Tab */}
        {activeTab === 'newsletters' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search newsletters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredNewsletters.map((newsletter) => (
                <div
                  key={newsletter._id}
                  className="flex flex-col gap-4 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{newsletter.subject}</h3>
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        newsletter.status === 'sent'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                          : newsletter.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                            : newsletter.status === 'scheduled'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200'
                      }`}>
                        {newsletter.status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{newsletter.content}</p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Created {new Date(newsletter.createdAt).toLocaleDateString()}
                      {newsletter.scheduledAt && newsletter.status === 'scheduled' && ` · Scheduled for ${new Date(newsletter.scheduledAt).toLocaleString()}`}
                      {newsletter.sentAt && newsletter.status === 'sent' && ` · Sent ${new Date(newsletter.sentAt).toLocaleString()} to ${newsletter.recipients} subscriber(s)`}
                    </p>
                  </div>
                  {newsletter.status !== 'sent' && (
                    <button
                      type="button"
                      onClick={() => handleSendNewsletter(newsletter)}
                      disabled={sendingId !== null || newsletter.status === 'sending'}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      {sendingId === newsletter._id || newsletter.status === 'sending' ? 'Sending...' : newsletter.status === 'failed' ? 'Retry send' : 'Send now'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {filteredNewsletters.length === 0 && !loading && (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400 text-lg">No newsletters yet</p>
                <p className="text-zinc-400 dark:text-zinc-500">Click &quot;Create Newsletter&quot; to write your first issue</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Newsletter Modal */}
      {showCreateNewsletter && (
        <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Create Newsletter
              </h2>
              <button
                onClick={() => {
                  setShowCreateNewsletter(false);
                  resetNewsletterForm();
                }}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateNewsletter();
            }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newsletterForm.subject}
                  onChange={(e) => setNewsletterForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={newsletterForm.content}
                  onChange={(e) => setNewsletterForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={10}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Write your newsletter... Markdown supported: # Heading, **bold**, [link](https://...), - list items"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Status
                  </label>
                  <select
                    value={newsletterForm.status}
                    onChange={(e) => setNewsletterForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'scheduled' }))}
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Send Now</option>
                  </select>
                </div>

                {newsletterForm.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Schedule Date
                    </label>
                    <input
                      type="datetime-local"
                      value={newsletterForm.scheduledAt}
                      onChange={(e) => setNewsletterForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                      className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateNewsletter(false);
                    resetNewsletterForm();
                  }}
                  className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all duration-200 font-semibold"
                >
                  Create Newsletter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Subscriber Modal */}
      {showCreateSubscriber && (
        <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Add Subscriber
              </h2>
              <button
                onClick={() => {
                  setShowCreateSubscriber(false);
                  resetSubscriberForm();
                }}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateSubscriber();
            }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={subscriberForm.email}
                  onChange={(e) => setSubscriberForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={subscriberForm.name}
                  onChange={(e) => setSubscriberForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={subscriberForm.source}
                  onChange={(e) => setSubscriberForm(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="e.g., Website, Social Media, Referral"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateSubscriber(false);
                    resetSubscriberForm();
                  }}
                  className="px-6 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold"
                >
                  Add Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 