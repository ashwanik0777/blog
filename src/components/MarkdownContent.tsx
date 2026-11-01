import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyButton from "@/components/CopyButton";
import { headingId } from "@/lib/blog";
import { getSiteUrl } from "@/lib/site";

type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function nodeText(node?: HastNode): string {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  return (node.children || []).map(nodeText).join("");
}

function isExternal(href?: string) {
  if (!href || !/^https?:\/\//i.test(href)) return false;
  try {
    return new URL(href).host !== new URL(getSiteUrl()).host;
  } catch {
    return true;
  }
}

export default function MarkdownContent({ content }: { content: string }) {
  // Shared between headings so ids line up with the table of contents.
  const seen = new Map<string, number>();
  const heading = (Tag: "h2" | "h3") =>
    function Heading({ node, children }: { node?: unknown; children?: ReactNode }) {
      const id = headingId(nodeText(node as HastNode), seen);
      return (
        <Tag id={id} className="group">
          <a href={`#${id}`} className="no-underline! text-inherit!">
            {children}
          </a>
        </Tag>
      );
    };

  const components: Components = {
    h1: heading("h2"),
    h2: heading("h2"),
    h3: heading("h3"),
    a: ({ href, children }) =>
      isExternal(href) ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <a href={href}>{children}</a>
      ),
    p: ({ node, children }) => {
      const kids = ((node as HastNode | undefined)?.children || []).filter(
        (child) => !(child.type === "text" && !child.value?.trim())
      );
      const onlyImages = kids.length > 0 && kids.every((child) => child.tagName === "img");
      return onlyImages ? <div className="space-y-4">{children}</div> : <p>{children}</p>;
    },
    img: ({ src, alt }) =>
      typeof src === "string" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt || ""} loading="lazy" decoding="async" className="border border-zinc-200 dark:border-zinc-800" />
      ) : null,
    pre: ({ node, children }) => {
      const code = (node as HastNode | undefined)?.children?.find((child) => child.tagName === "code");
      const classNames = (code?.properties?.className as string[] | undefined) || [];
      const language = classNames.find((name) => name.startsWith("language-"))?.replace("language-", "") || "code";
      return (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#0d1117] shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="flex gap-1.5" aria-hidden>
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </span>
              <span className="font-mono text-xs text-zinc-400">{language}</span>
            </div>
            <CopyButton text={nodeText(code).replace(/\n$/, "")} />
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-relaxed text-zinc-200 [&_code]:bg-transparent [&_code]:p-0">
            {children}
          </pre>
        </div>
      );
    },
    table: ({ children }) => (
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table>{children}</table>
      </div>
    ),
  };

  return (
    <div className="article">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
