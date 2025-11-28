"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, Clock } from 'lucide-react';

interface Comment {
  _id: string;
  content: string;
  authorName: string;
  authorEmail?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'flagged' | 'rejected';
}

interface CommentsProps {
  blogId: string;
}

export default function Comments({ blogId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  async function fetchComments() {
    setLoading(true);
    try {
      const response = await fetch(`/api/comments?blogId=${blogId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) {
      setError('Please fill in your name and comment');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogId,
          content: newComment.trim(),
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim() || undefined,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
        setAuthorName('');
        setAuthorEmail('');
        setShowForm(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to post comment');
      }
    } catch (error) {
      setError('Error posting comment');
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return (
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Comments</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h3>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Comment
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitComment}
          className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leave a Comment</h4>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Comment *
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
                disabled={submitting}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!newComment.trim() || !authorName.trim() || submitting}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post Comment
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError('');
                  setNewComment('');
                  setAuthorName('');
                  setAuthorEmail('');
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        <AnimatePresence>
          {comments.filter(c => c.status === 'approved').map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comment.authorName}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.filter(c => c.status === 'approved').length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}
