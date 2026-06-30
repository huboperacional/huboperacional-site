// Catalogo de 8 produtos Percus exibidos em huboperacional.com.br.
// Conteudo MVP extraido dos CLAUDE.md de cada projeto. Operador edita pra refinar.

export type Product = {
  slug: string;
  title: string;
  tagline: string;
  icon: string;        // lucide-react icon name
  category: 'b2c' | 'b2b' | 'integracao' | 'agencia';
  status: 'producao' | 'beta' | 'desenvolvimento';
  updatedAt: string;   // ISO YYYY-MM-DD — last meaningful content change (sitemap lastmod)
  website?: string;
  description: string;
  features: string[];
  cta: { label: string; url: string };
};

export const PRODUCTS: Product[] = [
  {
    slug: 'familia-milionaria',
    title: 'Familia Milionaria',
    tagline: 'Gestao financeira familiar via WhatsApp',
    icon: 'piggy-bank',
    category: 'b2c',
    status: 'producao',
    website: 'https://familiamilionaria.com.br',
    description:
      'Bot de WhatsApp pra familias organizarem orcamento, lancamentos, metas e categorias sem planilha. Cada familia tem multiplos membros que registram gastos pela conversa — IA categoriza e dashboards web mostram evolucao mensal.',
    features: [
      'Lancamentos por mensagem ("gastei 50 no mercado") com categorizacao automatica',
      'Multiplos membros por familia, cada um com seu acesso',
      'Dashboard web com gastos por categoria + metas',
      'Lembretes proativos de contas a pagar',
    ],
    updatedAt: '2026-05-17',
    cta: { label: 'Conhecer a plataforma', url: 'https://familiamilionaria.com.br' },
  },
  {
    slug: 'robo-vendas',
    title: 'Robo de Vendas / TiAtendo',
    tagline: 'Pre-vendas IA via WhatsApp com qualificacao SPICED',
    icon: 'bot',
    category: 'b2b',
    status: 'producao',
    website: 'https://tiatendo.com.br',
    description:
      'Agente de pre-vendas multi-tenant que atende leads no WhatsApp/SMS 24x7 e qualifica usando metodologia SPICED. Marca reunioes direto na agenda do vendedor + sincroniza CRM. Plataforma SaaS B2B com onboarding self-service.',
    features: [
      'Atendimento WhatsApp/SMS multi-tenant (cada cliente isolado)',
      'Qualificacao SPICED automatica + score por lead',
      'Agendamento de reuniao direto pelo bot',
      'Integracao com CRMs (Pipedrive, HubSpot, GHL)',
    ],
    updatedAt: '2026-05-17',
    cta: { label: 'Conhecer a plataforma', url: 'https://tiatendo.com.br' },
  },
  {
    slug: 'social-midia-ia',
    title: 'Social Midia IA',
    tagline: 'Automacao de conteudo social pra agencias',
    icon: 'sparkles',
    category: 'agencia',
    status: 'producao',
    description:
      'Sistema completo de automacao de conteudo social media pra agencias de marketing. Gera posts (imagem, carrossel, video) automaticamente com IA pra multiplos clientes em paralelo, com aprovacao em fluxo e publicacao agendada.',
    features: [
      'Geracao automatica de posts (imagem + carrossel + video)',
      'Multi-cliente com aprovacao por workflow',
      'Publicacao agendada Instagram/Facebook/TikTok',
      'Analytics de engajamento integrado',
    ],
    updatedAt: '2026-05-17',
    cta: { label: 'Falar com o time', url: '/contato?produto=social-midia-ia' },
  },
  {
    slug: 'ghl-evolution',
    title: 'GHL-Evolution Adapter',
    tagline: 'Ponte entre GoHighLevel e Evolution API (WhatsApp)',
    icon: 'plug-zap',
    category: 'integracao',
    status: 'producao',
    description:
      'Adapter NestJS que faz a ponte entre GoHighLevel (GHL) e Evolution API: traduz webhooks dos dois lados, gerencia OAuth do GHL Marketplace, mapeia mensagens/contatos e provisiona instancias Evolution sob demanda. Backend-only — API REST pra consumir.',
    features: [
      'OAuth flow completo com GHL Marketplace',
      'Provisionamento automatico de instancias Evolution',
      'Mapeamento bidirecional de mensagens GHL <-> WhatsApp',
      'Modulo ZapFlow pra orquestracao de fluxos',
    ],
    updatedAt: '2026-05-17',
    cta: { label: 'Documentacao API', url: '/contato?produto=ghl-evolution' },
  },
  {
    slug: 'paid-midia-automation',
    title: 'Paid Midia Automation',
    tagline: 'Plataforma de agencia pra Meta Ads + Google Ads',
    icon: 'bar-chart-3',
    category: 'agencia',
    status: 'producao',
    description:
      'Plataforma SaaS pra agencias gerenciarem campanhas Meta Ads + Google Ads em escala. Analise diaria + otimizacao automatica pra ate 100 contas Meta + 100 Google Ads. Workers Python rodam diariamente + dashboard Next.js mostra performance.',
    features: [
      'Analise diaria automatica de campanhas (Meta + Google)',
      'Otimizacao por regras configuraveis (pausar criativos sem performance, etc)',
      'Suporta ate 100 contas Meta + 100 Google em paralelo',
      'Dashboard com metricas consolidadas por cliente',
    ],
    updatedAt: '2026-05-17',
    cta: { label: 'Falar com o time', url: '/contato?produto=paid-midia-automation' },
  },
  {
    slug: 'plexco-tasks',
    title: 'Plexco Tasks',
    tagline: 'SaaS de gestao de tarefas com IA + WhatsApp',
    icon: 'list-checks',
    category: 'b2b',
    status: 'producao',
    description:
      'SaaS multi-tenant de gestao de tarefas com diferencial: subtarefas recursivas em 3 niveis + assistente IA multimodal pra criar/editar/consultar tarefas + integracao WhatsApp bidirecional pra registrar tarefas pela conversa.',
    features: [
      'Subtarefas recursivas em 3 niveis (epico -> tarefa -> subtarefa)',
      'Assistente IA multimodal (texto + imagem + audio)',
      'WhatsApp bidirecional pra criar/atualizar tarefas',
      'Multi-tenant com workspaces isolados',
    ],
    updatedAt: '2026-05-17',
    cta: { label: 'Conhecer a plataforma', url: '/contato?produto=plexco-tasks' },
  },
  {
    slug: 'plexco-coach',
    title: 'Plexco Coach',
    tagline: 'Plataforma de coaching com IA assistente',
    icon: 'graduation-cap',
    category: 'b2b',
    status: 'producao',
    description:
      'Plataforma SaaS pra coaches gerenciarem clientes, sessoes, planos de acao e materiais. IA assistente ajuda a sintetizar sessoes, gerar planos de acao + lembrar clientes via WhatsApp. Multi-coach com workspaces isolados.',
    features: [
      'Gestao de clientes + sessoes + planos de acao',
      'IA sintetiza notas de sessao automaticamente',
      'Lembretes WhatsApp pros clientes',
      'Material complementar versionado por cliente',
    ],
    updatedAt: '2026-05-17',
    cta: { label: 'Falar com o time', url: '/contato?produto=plexco-coach' },
  },
  {
    slug: 'plexco-tickets',
    title: 'Plexco Tickets',
    tagline: 'Sistema de tickets de suporte',
    icon: 'ticket',
    category: 'b2b',
    status: 'desenvolvimento',
    description:
      'Sistema multi-tenant de tickets de suporte com IA pra triagem automatica + roteamento por especialidade + integracao WhatsApp pro cliente abrir e acompanhar tickets pela conversa. Em desenvolvimento ativo.',
    features: [
      'Tickets multi-tenant com SLA configuravel',
      'Triagem automatica por IA + roteamento',
      'WhatsApp bidirecional pra cliente',
      'Base de conhecimento integrada',
    ],
    updatedAt: '2026-05-17',
    cta: { label: 'Notifique-me no lancamento', url: '/contato?produto=plexco-tickets' },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}
