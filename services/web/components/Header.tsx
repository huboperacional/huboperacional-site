import Link from 'next/link';

const NAV = [
  { href: '/produtos', label: 'Produtos' },
  { href: '/afiliados', label: 'Afiliados' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-paper-3">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight no-underline hover:no-underline">
          HUB<span className="text-brand-500">.</span>OPERACIONAL
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-steel-700 hover:text-brand-500 no-underline hover:no-underline transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/afiliados"
          className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg no-underline hover:no-underline transition-colors"
        >
          Seja parceiro
        </Link>
      </div>
    </header>
  );
}
