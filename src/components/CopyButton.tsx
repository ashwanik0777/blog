"use client";
import { useState } from "react";
import { Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        "Copy Link"
      )}
    </button>
  );
}

