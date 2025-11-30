"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Tag,
  Image,
  Shield,
  Search,
  Wand2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Brain,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

export default function AIContentPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'generate' | 'summarize' | 'tags' | 'alt' | 'moderate' | 'seo'>('generate');
  
  // Generate Blog State
  const [generateTitle, setGenerateTitle] = useState("");
  const [generateKeywords, setGenerateKeywords] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [generatedCategories, setGeneratedCategories] = useState<string[]>([]);
  const [generateLoading, setGenerateLoading] = useState(false);
  
  // Summarize State
  const [summarizeContent, setSummarizeContent] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
  const [summarizeLoading, setSummarizeLoading] = useState(false);
  
  // Tags State
  const [tagsContent, setTagsContent] = useState("");
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  
  // Alt Text State
  const [altImageUrl, setAltImageUrl] = useState("");
  const [altContext, setAltContext] = useState("");
  const [generatedAltText, setGeneratedAltText] = useState("");
  const [altLoading, setAltLoading] = useState(false);
  
  // Moderate State
  const [moderateContent, setModerateContent] = useState("");
  const [moderationResult, setModerationResult] = useState<any>(null);
  const [moderateLoading, setModerateLoading] = useState(false);
  
  // SEO State
  const [seoContent, setSeoContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoResult, setSeoResult] = useState<any>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      } catch (error) {
        router.push('/admin');
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  async function handleGenerateBlog() {
    if (!generateTitle.trim()) {
      setError("Please enter a title");
      return;
    }

    setGenerateLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generateTitle,
          keywords: generateKeywords,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedContent(data.content || "");
        setGeneratedSummary(data.summary || "");
        setGeneratedTags(data.tags || []);
        setGeneratedCategories(data.categories || []);
        setMessage("Blog content generated successfully!");
      } else {
        setError(data.error || "Failed to generate content");
      }
    } catch (error) {
      setError("Error generating content");
    } finally {
      setGenerateLoading(false);
    }
  }

  async function handleSummarize() {
    if (!summarizeContent.trim()) {
      setError("Please enter content to summarize");
      return;
    }

    setSummarizeLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: summarizeContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setSummarizedText(data.summary || "");
        setMessage("Content summarized successfully!");
      } else {
        setError(data.error || "Failed to summarize content");
      }
    } catch (error) {
      setError("Error summarizing content");
    } finally {
      setSummarizeLoading(false);
    }
  }

  async function handleSuggestTags() {
    if (!tagsContent.trim()) {
      setError("Please enter content");
      return;
    }

    setTagsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch('/api/ai/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tagsContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuggestedTags(data.tags || []);
        setSuggestedCategories(data.categories || []);
        setMessage("Tags and categories suggested successfully!");
      } else {
        setError(data.error || "Failed to suggest tags");
      }
    } catch (error) {
      setError("Error suggesting tags");
    } finally {
      setTagsLoading(false);
    }
  }

  async function handleGenerateAltText() {
    if (!altImageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setAltLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch('/api/ai/alt-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: altImageUrl,
          context: altContext,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedAltText(data.altText || "");
        setMessage("Alt text generated successfully!");
      } else {
        setError(data.error || "Failed to generate alt text");
      }
    } catch (error) {
      setError("Error generating alt text");
    } finally {
      setAltLoading(false);
    }
  }

  async function handleModerate() {
    if (!moderateContent.trim()) {
      setError("Please enter content to moderate");
      return;
    }

    setModerateLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch('/api/ai/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: moderateContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setModerationResult(data);
        setMessage("Content moderated successfully!");
      } else {
        setError(data.error || "Failed to moderate content");
      }
    } catch (error) {
      setError("Error moderating content");
    } finally {
      setModerateLoading(false);
    }
  }

  async function handleSEOOptimize() {
    if (!seoContent.trim() || !seoTitle.trim()) {
      setError("Please enter title and content");
      return;
    }

    setSeoLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch('/api/ai/seo-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: seoTitle,
          content: seoContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSeoResult(data);
        setMessage("SEO optimization completed!");
      } else {
        setError(data.error || "Failed to optimize SEO");
      }
    } catch (error) {
      setError("Error optimizing SEO");
    } finally {
      setSeoLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  const tabs = [
    { id: 'generate', label: 'Generate Blog', icon: Sparkles, color: 'text-purple-600' },
    { id: 'summarize', label: 'Summarize', icon: FileText, color: 'text-blue-600' },
    { id: 'tags', label: 'Suggest Tags', icon: Tag, color: 'text-green-600' },
    { id: 'alt', label: 'Alt Text', icon: Image, color: 'text-orange-600' },
    { id: 'moderate', label: 'Moderate', icon: Shield, color: 'text-red-600' },
    { id: 'seo', label: 'SEO Optimize', icon: TrendingUp, color: 'text-cyan-600' },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          AI Content Generation
        </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Leverage Google Gemini AI to create, optimize, and enhance your content
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
        >
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-green-600 dark:text-green-400 text-sm font-medium">{message}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3"
        >
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setError("");
                  setMessage("");
                }}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${activeTab === tab.id ? tab.color : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Blog Tab */}
      {activeTab === 'generate' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              Generate Blog Content
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create a complete blog post with title, content, summary, tags, and categories
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                value={generateTitle}
                onChange={(e) => setGenerateTitle(e.target.value)}
                placeholder="Enter blog title..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Keywords (optional)
              </label>
              <input
                type="text"
                value={generateKeywords}
                onChange={(e) => setGenerateKeywords(e.target.value)}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleGenerateBlog}
              disabled={generateLoading || !generateTitle.trim()}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {generateLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" />
                  Generate Blog Content
                </>
              )}
            </button>

            {(generatedContent || generatedSummary || generatedTags.length > 0) && (
              <div className="mt-6 space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {generatedSummary && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary</label>
                      <button
                        onClick={() => copyToClipboard(generatedSummary)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-gray-900 dark:text-white">{generatedSummary}</p>
                  </div>
                )}

                {generatedTags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {generatedTags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {generatedCategories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {generatedCategories.map((cat, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                      <button
                        onClick={() => copyToClipboard(generatedContent)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={generatedContent}
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Summarize Tab */}
      {activeTab === 'summarize' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Summarize Content
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Generate a concise summary suitable for SEO meta descriptions
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content to Summarize *
              </label>
              <textarea
                value={summarizeContent}
                onChange={(e) => setSummarizeContent(e.target.value)}
                placeholder="Paste your content here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSummarize}
              disabled={summarizeLoading || !summarizeContent.trim()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {summarizeLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Generate Summary
                </>
              )}
            </button>

            {summarizedText && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary</label>
                  <button
                    onClick={() => copyToClipboard(summarizedText)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-gray-900 dark:text-white">{summarizedText}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Suggest Tags Tab */}
      {activeTab === 'tags' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Tag className="h-6 w-6 text-green-600 dark:text-green-400" />
              Suggest Tags & Categories
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Get AI-powered tag and category suggestions for your content
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                value={tagsContent}
                onChange={(e) => setTagsContent(e.target.value)}
                placeholder="Paste your content here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSuggestTags}
              disabled={tagsLoading || !tagsContent.trim()}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {tagsLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Lightbulb className="h-5 w-5" />
                  Suggest Tags & Categories
                </>
              )}
            </button>

            {(suggestedTags.length > 0 || suggestedCategories.length > 0) && (
              <div className="mt-6 space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {suggestedTags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Suggested Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {suggestedCategories.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Suggested Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedCategories.map((cat, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Alt Text Tab */}
      {activeTab === 'alt' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Image className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              Generate Alt Text
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create accessible alt text for images using AI
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                value={altImageUrl}
                onChange={(e) => setAltImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Context (optional)
              </label>
              <textarea
                value={altContext}
                onChange={(e) => setAltContext(e.target.value)}
                placeholder="Describe the context of the image..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleGenerateAltText}
              disabled={altLoading || !altImageUrl.trim()}
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {altLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Image className="h-5 w-5" />
                  Generate Alt Text
                </>
              )}
            </button>

            {generatedAltText && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alt Text</label>
                  <button
                    onClick={() => copyToClipboard(generatedAltText)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-gray-900 dark:text-white">{generatedAltText}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Moderate Tab */}
      {activeTab === 'moderate' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
              Content Moderation
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Check content for inappropriate or harmful material
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content to Moderate *
              </label>
              <textarea
                value={moderateContent}
                onChange={(e) => setModerateContent(e.target.value)}
                placeholder="Paste content to check..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleModerate}
              disabled={moderateLoading || !moderateContent.trim()}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {moderateLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Moderating...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Moderate Content
                </>
              )}
            </button>

            {moderationResult && (
              <div className={`mt-6 p-4 rounded-lg border ${
                moderationResult.verdict === 'approved'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : moderationResult.verdict === 'flagged'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {moderationResult.verdict === 'approved' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`font-semibold ${
                    moderationResult.verdict === 'approved'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {moderationResult.verdict === 'approved' ? 'Approved' : moderationResult.verdict === 'flagged' ? 'Flagged' : 'Needs Review'}
                  </span>
                </div>
                {moderationResult.reason && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{moderationResult.reason}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* SEO Optimize Tab */}
      {activeTab === 'seo' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              SEO Optimization
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
              Optimize your content for better search engine rankings
        </p>
      </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Enter title..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                value={seoContent}
                onChange={(e) => setSeoContent(e.target.value)}
                placeholder="Paste your content here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleSEOOptimize}
              disabled={seoLoading || !seoContent.trim() || !seoTitle.trim()}
              className="w-full bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
            >
              {seoLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Optimize for SEO
                </>
              )}
            </button>

            {seoResult && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">SEO Recommendations</h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {seoResult.recommendations && seoResult.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
} 
