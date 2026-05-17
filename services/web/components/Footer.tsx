import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-paper-3 bg-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-bold text-base mb-3">
            HUB<span className="text-brand-500">.</span>OPERACIONAL
          </div>
          <p className="text-steel-500">
            Softwarehouse Percus.<br />
            Automação WhatsApp + IA aplicada.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3">Produtos</div>
          <ul className="space-y-2 text-steel-500">
            <li><Link href="/produtos" className="hover:text-brand-500">Catálogo completo</Link></li>
            <li><Link href="/produtos/familia-milionaria" className="hover:text-brand-500">Família Milionária</Link></li>
            <li><Link href="/produtos/robo-vendas" className="hover:text-brand-500">Robô de Vendas</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Recursos</div>
          <ul className="space-y-2 text-steel-500">
            <li><Link href="/afiliados" className="hover:text-brand-500">Programa de afiliados</Link></li>
            <li><Link href="/sobre" className="hover:text-brand-500">Sobre</Link></li>
            <li><Link href="/contato" className="hover:text-brand-500">Contato</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Operação</div>
          <ul className="space-y-2 text-steel-500">
            <li><a href="https://auth.huboperacional.com.br" className="hover:text-brand-500">Auth</a></li>
            <li><a href="https://painel.huboperacional.com.br" className="hover:text-brand-500">Painel</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper-3">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-steel-500 flex justify-between">
          <span>© {year} Percus — Hub Operacional</span>
          <span className="font-mono text-[10px]">huboperacional.com.br</span>
        </div>
      </div>
    </footer>
  );
}
