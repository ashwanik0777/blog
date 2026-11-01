type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  children?: React.ReactNode;
};

export default function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="relative -mt-16 overflow-hidden border-b border-zinc-200/70 pt-16 dark:border-zinc-800/70">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-400/25 via-fuchsia-400/20 to-cyan-300/25 blur-3xl dark:from-brand-700/25 dark:via-fuchsia-700/15 dark:to-cyan-700/15" />
      <div className="container-page relative max-w-4xl py-16 text-center sm:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 text-balance text-4xl font-extrabold leading-tight text-zinc-900 sm:text-5xl dark:text-white">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-zinc-600 dark:text-zinc-400">{description}</p>
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
