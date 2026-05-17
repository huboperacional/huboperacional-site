import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Percus: softwarehouse independente focada em automação WhatsApp, IA aplicada e gestão.',
};

export default function SobrePage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10">
        <div className="font-mono text-xs text-brand-500 mb-3 tracking-wider">SOBRE</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">A softwarehouse Percus</h1>
        <p className="text-lg text-steel-700">
          Construímos produtos próprios e operamos infraestrutura própria. Sem dependência de SaaS pago,
          sem lock-in de cloud-provider, sem dívida técnica disfarçada de "MVP".
        </p>
      </header>

      <section className="prose max-w-none mb-10 space-y-5 text-fg">
        <p>
          A Percus é uma softwarehouse pequena e focada. Nossos produtos cobrem três frentes:
          <strong> automação WhatsApp</strong> (bots de pré-vendas, gestão financeira familiar, social media),
          <strong> IA aplicada</strong> (geração de conteúdo, qualificação de leads, assistentes operacionais) e
          <strong> gestão</strong> (tasks, tickets, coaching).
        </p>

        <p>
          Tudo é construído no mesmo stack canônico: <span className="font-mono text-sm">FastAPI + Next.js + Postgres + Redis + Docker Swarm</span>.
          Roda no nosso VPS (<span className="font-mono text-sm">161.97.129.138</span>) sob Traefik. O custo agregado de infra
          fica abaixo de R$ 500/mês para todos os produtos juntos.
        </p>

        <p>
          Não usamos Linear, Notion, Cortex, Backstage, OpsLevel ou qualquer outro SaaS de "developer experience".
          Em vez disso, construímos as ferramentas internas que precisamos: um plugin de review cross-provider,
          um catalog interno feature-tracked, um conselho de 3 modelos de IA pra opinar em decisões reversíveis,
          e auditoria YAML declarativa pra segurança.
        </p>
      </section>

      <section className="bg-white border border-paper-3 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-semibold mb-3">Princípios operacionais</h2>
        <ul className="space-y-2 text-sm text-steel-700">
          <li><strong className="text-fg">Auto-suficiência:</strong> infra própria, lib própria, kit próprio. Dependência externa é exceção, não regra.</li>
          <li><strong className="text-fg">Stack único:</strong> mesma tech em todo produto reduz custo cognitivo + facilita reuso.</li>
          <li><strong className="text-fg">Open-source quando possível:</strong> nosso plugin de review é público em <a href="https://github.com/huboperacional/percus-kit" className="text-brand-500 hover:underline">github.com/huboperacional/percus-kit</a>.</li>
          <li><strong className="text-fg">Operação enxuta:</strong> 1 operador + agente Claude Code + ferramentas próprias. Sem time grande, sem reunião desnecessária.</li>
        </ul>
      </section>

      <section className="text-center">
        <p className="text-steel-500 mb-4">Quer entender melhor o que fazemos?</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/produtos"
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg no-underline hover:no-underline transition-colors"
          >
            Ver produtos
          </Link>
          <Link
            href="/contato"
            className="bg-white hover:bg-paper border border-paper-3 hover:border-brand-500 text-fg font-semibold px-6 py-3 rounded-lg no-underline hover:no-underline transition-colors"
          >
            Fala com a gente
          </Link>
        </div>
      </section>
    </article>
  );
}
