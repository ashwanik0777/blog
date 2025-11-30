"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef } from "react";

export default function Editor({ initialData = {}, onSave }: { initialData?: any; onSave?: (data: any) => void }) {
  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [summary, setSummary] = useState(initialData.summary || "");
  const [tags, setTags] = useState(initialData.tags?.join(", ") || "");
  const [categories, setCategories] = useState(initialData.categories?.join(", ") || "");
  const [content, setContent] = useState(initialData.content || "");
  const [featuredImage, setFeaturedImage] = useState(initialData.featuredImage || "");
  const [published, setPublished] = useState(initialData.published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiTagsLoading, setAiTagsLoading] = useState(false);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [altText, setAltText] = useState(initialData.altText || "");
  const [aiAltLoading, setAiAltLoading] = useState(false);

  const draftKey = initialData?.slug ? `blog-draft-${initialData.slug}` : "blog-draft-new";
  const firstLoad = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save draft to localStorage every 5 seconds
  useEffect(() => {
    if (!firstLoad.current) {
      const timeout = setTimeout(() => {
        const draft = { title, slug, summary, tags, categories, content, featuredImage, published };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [title, slug, summary, tags, categories, content, featuredImage, published]);

  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft && firstLoad.current) {
      try {
        const d = JSON.parse(draft);
        setTitle(d.title || "");
        setSlug(d.slug || "");
        setSummary(d.summary || "");
        setTags(d.tags || "");
        setCategories(d.categories || "");
        setContent(d.content || "");
        setFeaturedImage(d.featuredImage || "");
        setPublished(d.published || false);
      } catch {}
    }
    firstLoad.current = false;
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const form = document.querySelector("form");
        if (form) {
          form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = {
      title,
      slug,
      summary,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      categories: categories.split(",").map((c) => c.trim()).filter(Boolean),
      content,
      featuredImage,
      published,
    };
    onSave?.(data);
    setLoading(false);
  }

  async function handleAIGenerate() {
    setAiLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, keywords: tags }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setContent(data.content || "");
        setSummary(data.summary || "");
        setTags((data.tags || []).join(", "));
        setCategories((data.categories || []).join(", "));
      }
    } catch (e) {
      setError("AI generation failed");
    }
    setAiLoading(false);
  }

  async function handleAISuggestTags() {
    setAiTagsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setTags((data.tags || []).join(", "));
        setCategories((data.categories || []).join(", "));
      }
    } catch (e) {
      setError("AI tag suggestion failed");
    }
    setAiTagsLoading(false);
  }

  async function handleAISummary() {
    setAiSummaryLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSummary(data.summary || "");
    } catch (e) {
      setError("AI summary failed");
    }
    setAiSummaryLoading(false);
  }

  async function handleAIAltText() {
    setAiAltLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/alt-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: featuredImage }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setAltText(data.alt || "");
    } catch (e) {
      setError("AI alt text failed");
    }
    setAiAltLoading(false);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) setFeaturedImage(data.url);
      else setError(data.error || "Upload failed");
    } catch (e) {
      setError("Upload failed");
    }
    setUploading(false);
  }

  function insertAtCursor(before: string, after: string = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    setContent(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = end + before.length;
    }, 0);
  }

  function getWordCount(text: string) {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }
  function getCharCount(text: string) {
    return text.length;
  }
  function getReadingTime(text: string) {
    const words = getWordCount(text);
    return Math.max(1, Math.ceil(words / 200));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Blog Editor</h2>
      {error && <div className="text-red-500">{error}</div>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        placeholder="Slug (unique URL)"
        value={slug}
        onChange={e => setSlug(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Summary"
        value={summary}
        onChange={e => setSummary(e.target.value)}
        className="w-full p-2 border rounded"
        rows={2}
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={e => setTags(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Categories (comma separated)"
        value={categories}
        onChange={e => setCategories(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <div className="mb-2 flex gap-2 flex-wrap">
        <button type="button" className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" title="Bold" onClick={() => insertAtCursor("**", "**")}>B</button>
        <button type="button" className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" title="Italic" onClick={() => insertAtCursor("*", "*")}>I</button>
        <button type="button" className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" title="Heading" onClick={() => insertAtCursor("# ")}>H</button>
        <button type="button" className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" title="List" onClick={() => insertAtCursor("- ")}>• List</button>
        <button type="button" className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300" title="Link" onClick={() => insertAtCursor("[", "](url)")}>🔗</button>
      </div>
      <div>
        <label className="block mb-1 font-medium">Markdown Content</label>
        <textarea
          ref={textareaRef}
          placeholder="Markdown Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full p-2 border rounded font-mono"
          rows={10}
          required
        />
        <div className="mt-2 flex gap-4 text-sm text-gray-500">
          <span>Words: {getWordCount(content)}</span>
          <span>Characters: {getCharCount(content)}</span>
          <span>Reading time: ~{getReadingTime(content)} min</span>
        </div>
        <div className="mt-4">
          <label className="block mb-1 font-medium">Live Preview</label>
          <div className="prose dark:prose-invert bg-gray-50 dark:bg-gray-900 p-4 rounded min-h-[120px]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">Featured Image</label>
        {featuredImage && (
          <>
            <img src={featuredImage} alt={altText || "Featured"} className="w-full h-48 object-cover rounded mb-2" />
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Image Alt Text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                onClick={handleAIAltText}
                disabled={aiAltLoading}
              >
                {aiAltLoading ? "Generating..." : "AI Alt Text"}
              </button>
            </div>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploading}
        />
        {uploading && <div className="text-blue-600 mt-1">Uploading...</div>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={e => setPublished(e.target.checked)}
          id="published"
        />
        <label htmlFor="published">Published</label>
      </div>
      <button
        type="button"
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        onClick={handleAIGenerate}
        disabled={aiLoading || !title}
      >
        {aiLoading ? "Generating..." : "AI Generate Blog"}
      </button>
      <button
        type="button"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        onClick={handleAISuggestTags}
        disabled={aiTagsLoading || !content}
      >
        {aiTagsLoading ? "Suggesting..." : "AI Suggest Tags & Categories"}
      </button>
      <button
        type="button"
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        onClick={handleAISummary}
        disabled={aiSummaryLoading || !content}
      >
        {aiSummaryLoading ? "Summarizing..." : "AI Generate Summary"}
      </button>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
        {loading ? "Saving..." : "Save Blog"}
      </button>
    </form>
  );
}
