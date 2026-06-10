type Props = {
  title: string;
  description?: string;
};

export function SectionHeader({ title, description }: Props) {
  return (
    <header className="mb-4 animate-fade-in-up">
      <h1 className="mb-1 text-2xl font-semibold text-swagger-text md:text-3xl">{title}</h1>
      {description && <p className="max-w-3xl text-swagger-muted">{description}</p>}
    </header>
  );
}
