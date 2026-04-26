interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-[#0A0A0A] h-[120px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="font-serif text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-300 font-sans">{subtitle}</p>}
      </div>
    </div>
  );
}
