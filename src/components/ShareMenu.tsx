"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Facebook, Link as LinkIcon, Linkedin, MessageCircle, Share2, Twitter } from "lucide-react";

type ShareMenuProps = {
  url: string;
  title: string;
  layout?: "row" | "column";
};

const subscribeNoop = () => () => {};

export default function ShareMenu({ url, title, layout = "row" }: ShareMenuProps) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(
    subscribeNoop,
    () => typeof navigator.share === "function",
    () => false
  );

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    { name: "Share on X", href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, icon: Twitter },
    { name: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: Linkedin },
    { name: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: Facebook },
    { name: "Share on WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, icon: MessageCircle },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const buttonClass =
    "flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-brand-700 dark:hover:text-brand-300";

  return (
    <div className={`flex gap-2 ${layout === "column" ? "flex-col" : "flex-wrap items-center"}`}>
      {links.map((link) => (
        <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name} title={link.name} className={buttonClass}>
          <link.icon className="h-4 w-4" />
        </a>
      ))}
      <button type="button" onClick={copyLink} aria-label="Copy link" title="Copy link" className={buttonClass}>
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <LinkIcon className="h-4 w-4" />}
      </button>
      {canNativeShare && (
        <button
          type="button"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
          aria-label="More sharing options"
          title="More options"
          className={buttonClass}
        >
          <Share2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
