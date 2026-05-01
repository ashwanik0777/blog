"use client";

import { useMemo, useState } from "react";
import { Share2, X, Facebook, Twitter, Linkedin, Mail, MessageCircle, Send, Instagram, Download, Link as LinkIcon, Check } from "lucide-react";

type ShareMenuProps = {
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
};

function safeText(value: string, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export default function ShareMenu({ url, title, description, imageUrl }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareTitle = safeText(title, "TechUpdatesZone");
  const shareText = safeText(description, "Read this blog post on TechUpdatesZone.");

  const shareLinks = useMemo(() => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedText = encodeURIComponent(shareText);

    return [
      {
        name: "X",
        href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        icon: Twitter,
      },
      {
        name: "Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        icon: Facebook,
      },
      {
        name: "LinkedIn",
        href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`,
        icon: Linkedin,
      },
      {
        name: "WhatsApp",
        href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        icon: MessageCircle,
      },
      {
        name: "Telegram",
        href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        icon: Send,
      },
      {
        name: "Email",
        href: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A${encodedUrl}`,
        icon: Mail,
      },
    ];
  }, [shareTitle, shareText, url]);

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return;
    try {
      await navigator.share({ title: shareTitle, text: shareText, url });
    } catch {
      // Ignore share cancellation.
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="Share"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[320px] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-4 z-50">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Share this post</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pick a platform or copy the link.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close share menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {shareLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.name}
                </a>
              );
            })}
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <LinkIcon className="w-3.5 h-3.5" />
                <span className="truncate max-w-[180px]">{url}</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : null}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={handleNativeShare}
              disabled={typeof navigator === "undefined" || !navigator.share}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
            >
              <Share2 className="w-4 h-4" />
              Quick Share
            </button>

            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Instagram does not allow direct web posting. Use Quick Share on mobile or download the cover image and post it in the Instagram app.
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-pink-300 hover:text-pink-600 transition"
              >
                <Instagram className="w-4 h-4" />
                Open Instagram
              </a>
              {imageUrl ? (
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-emerald-300 hover:text-emerald-600 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Cover
                </a>
              ) : (
                <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 py-2 text-xs font-semibold text-gray-400">
                  <Download className="w-4 h-4" />
                  No Cover Image
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
