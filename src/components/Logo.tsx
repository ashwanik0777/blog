import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label={`${SITE_NAME} home`}>
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 transition-transform duration-300 group-hover:-rotate-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <Image src="/logo.png" alt="" width={36} height={36} priority />
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
        TechUpdates<span className="text-accent">Zone</span>
      </span>
    </Link>
  );
}
