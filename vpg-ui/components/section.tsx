interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({ title, children, className = "" }: SectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-semibold">{title}</h2>
        <button className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">
          View all
        </button>
      </div>

      {/* Responsive Grid Layout - 2 to 6 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {children}
      </div>
    </section>
  );
}
