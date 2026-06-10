import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  id: string;
  children: ReactNode;
  className?: string;
};

export function SectionReveal({ id, children, className = "" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`scroll-mt-16 py-2 md:scroll-mt-[4.5rem] md:py-4 ${className} ${
        revealed ? "animate-fade-in-up" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </section>
  );
}
