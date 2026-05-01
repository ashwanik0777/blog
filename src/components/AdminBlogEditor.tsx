"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Blog {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  excerpt?: string;
  readingTime?: number;
  tags: string[];
  categories: string[];
  featuredImage?: string;
  published: boolean;
  status: string;
}

interface AdminBlogEditorProps {
  blog?: Blog | null;
  onSave?: (blog: Blog) => void;
  onCancel?: () => void;
  onClose?: () => void;
  mode?: 'create' | 'edit';
}

export default function AdminBlogEditor({ blog, onSave, onCancel, onClose, mode = blog ? 'edit' : 'create' }: AdminBlogEditorProps) {
  const [formData, setFormData] = useState({
    title: blog?.title || "",
    content: blog?.content || "",
    summary: blog?.summary || "",
    metaTitle: blog?.metaTitle || "",
    metaDescription: blog?.metaDescription || "",
    keywords: blog?.keywords?.join(', ') || "",
    excerpt: blog?.excerpt || "",
    readingTime: blog?.readingTime || 0,
    tags: blog?.tags?.join(', ') || "",
    categories: blog?.categories?.join(', ') || "",
    featuredImage: blog?.featuredImage || "",
    published: blog?.published || false
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReferences, setAiReferences] = useState<Array<{ title: string; url: string }>>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleAIGenerate() {
    if (!formData.title.trim()) {
      setError("Please enter a title first");
      return;
    }

    setAiLoading(true);
    setError("");

    try {
      const response = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: formData.title,
          keywords: formData.tags
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiKeywords = Array.isArray(data.keywords) ? data.keywords : data.tags;
        setFormData(prev => ({
          ...prev,
          content: data.content || prev.content,
          summary: data.summary || prev.summary,
          metaTitle: data.seoTitle || prev.metaTitle,
          metaDescription: data.seoDescription || prev.metaDescription,
          keywords: Array.isArray(aiKeywords) ? aiKeywords.join(', ') : prev.keywords,
          readingTime: data.readingTime || prev.readingTime,
          excerpt: data.summary || prev.excerpt,
          tags: data.tags?.join(', ') || prev.tags,
          categories: data.categories?.join(', ') || prev.categories
        }));
        setAiReferences(data.references || []);
        setMessage("AI content generated successfully!");
      } else {
        setError(data.error || "Failed to generate content");
      }
    } catch (error) {
      setError("Error generating content");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        categories: formData.categories.split(',').map(cat => cat.trim()).filter(Boolean),
        keywords: formData.keywords.split(',').map(keyword => keyword.trim()).filter(Boolean),
        readingTime: formData.readingTime || undefined
      };

      if (blog) {
        blogData._id = blog._id;
      }

      // If onSave is provided, use it; otherwise make API call directly
      if (onSave) {
        onSave(blogData as Blog);
      } else {
        // Make API call directly
        const url = blog ? `/api/blog/${blog._id}` : '/api/blog';
        const method = blog ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...blogData,
            status: blogData.published ? 'approved' : 'draft'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save blog');
        }

        const savedBlog = await response.json();
        setMessage(`${mode === 'create' ? 'Created' : 'Updated'} successfully!`);
        
        // Call onClose if provided
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (error) {
      setError(`Error ${mode === 'create' ? 'creating' : 'updating'} blog`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {mode === 'create' ? 'Create New Blog' : 'Edit Blog'}
        </h2>
        <button
          onClick={onCancel || onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Blog Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter blog title"
            required
          />
        </div>

        {/* AI Generation Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={aiLoading || !formData.title.trim()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {aiLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </div>
            ) : (
              "🤖 Generate with AI"
            )}
          </button>
        </div>

        {/* Summary */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Summary
          </label>
          <textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief summary of the blog post"
          />
        </div>

        {/* SEO Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SEO Title
            </label>
            <input
              type="text"
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="SEO friendly title"
            />
          </div>
          <div>
            <label htmlFor="readingTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reading Time (minutes)
            </label>
            <input
              type="number"
              id="readingTime"
              min={0}
              value={formData.readingTime}
              onChange={(e) => setFormData(prev => ({ ...prev, readingTime: Number(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SEO Description
          </label>
          <textarea
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Meta description for search engines"
          />
        </div>
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            SEO Keywords
          </label>
          <input
            type="text"
            id="keywords"
            value={formData.keywords}
            onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Short excerpt used in lists"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={12}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your blog content here... (Markdown supported)"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        {aiReferences.length > 0 && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">AI References</div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {aiReferences.map((ref, index) => (
                <li key={`${ref.url}-${index}`} className="break-all">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{ref.title}</span>
                  {ref.url ? ` - ${ref.url}` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Categories */}
        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categories
          </label>
          <input
            type="text"
            id="categories"
            value={formData.categories}
            onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="category1, category2"
          />
        </div>

        {/* Featured Image */}
        <div>
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Featured Image URL
          </label>
          <input
            type="url"
            id="featuredImage"
            value={formData.featuredImage}
            onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Published Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Publish immediately
          </label>
        </div>

        {/* Messages */}
        {message && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
          >
            <p className="text-green-600 dark:text-green-400 text-sm font-medium">{message}</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </div>
            ) : (
              mode === 'create' ? 'Create Blog' : 'Update Blog'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel || onClose}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
} 