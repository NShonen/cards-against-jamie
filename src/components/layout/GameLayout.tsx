interface GameLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function GameLayout({ children, header, footer }: GameLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && (
        <header className="bg-primary text-white p-4">{header}</header>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {footer && (
        <footer className="bg-primary text-white p-4">{footer}</footer>
      )}
    </div>
  );
}
