interface PagePlaceholderProps {
  title: string;
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="text-gray-500">Próximamente.</p>
    </div>
  );
}
