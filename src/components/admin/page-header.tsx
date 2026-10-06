export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      <div>
        <h1 className="font-serif text-[2.2rem] leading-none tracking-tight sm:text-[2.8rem]">{title}</h1>
        {description && <p className="mt-2.5 max-w-2xl text-[0.9rem] text-stone">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function AdminCard({ children, className, ...rest }: React.ComponentProps<"section">) {
  return (
    <section className={`border border-line bg-paper-2 ${className ?? ""}`} {...rest}>
      {children}
    </section>
  );
}
