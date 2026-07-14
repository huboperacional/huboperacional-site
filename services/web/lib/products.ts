// Catalogo de 9 produtos Percus exibidos em huboperacional.com.br.
// Conteudo refinado em 2026-07-14 (acentos + polish), mantendo os fatos do MVP.
// Curadoria final e do operador.

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
    title: 'Família Milionária',
    tagline: 'Gestão financeira familiar pelo WhatsApp',
    icon: 'piggy-bank',
    category: 'b2c',
    status: 'producao',
    website: 'https://familiamilionaria.app',
    description:
      'Bot de WhatsApp pra família organizar orçamento, lançamentos, metas e categorias sem planilha. Vários membros registram os gastos pela conversa — a IA categoriza sozinha e os dashboards web mostram a evolução mês a mês.',
    features: [
      'Lançamentos por mensagem ("gastei 50 no mercado") com categorização automática',
      'Vários membros por família, cada um com seu acesso',
      'Dashboard web com gastos por categoria + metas',
      'Lembretes proativos de contas a pagar',
    ],
    updatedAt: '2026-07-14',
    cta: { label: 'Conhecer a plataforma', url: 'https://familiamilionaria.app' },
  },
  {
    slug: 'robo-vendas',
    title: 'Robô de Vendas / TiAtendo',
    tagline: 'Pré-vendas com IA no WhatsApp e qualificação SPICED',
    icon: 'bot',
    category: 'b2b',
    status: 'producao',
    website: 'https://tiatendo.com.br',
    description:
      'Agente de pré-vendas multi-tenant que atende leads no WhatsApp/SMS 24×7 e qualifica pela metodologia SPICED. Marca reuniões direto na agenda do vendedor e sincroniza o CRM. SaaS B2B com onboarding self-service.',
    features: [
      'Atendimento WhatsApp/SMS multi-tenant (cada cliente isolado)',
      'Qualificação SPICED automática + score por lead',
      'Agendamento de reunião direto pelo bot',
      'Integração com CRMs (Pipedrive, HubSpot, GHL)',
    ],
    updatedAt: '2026-07-14',
    cta: { label: 'Conhecer a plataforma', url: 'https://tiatendo.com.br' },
  },
  {
    slug: 'social-midia-ia',
    title: 'Social Mídia IA',
    tagline: 'Automação de conteúdo social pra agências',
    icon: 'sparkles',
    category: 'agencia',
    status: 'producao',
    description:
      'Sistema completo de automação de conteúdo de social media pra agências de marketing. Gera posts (imagem, carrossel, vídeo) com IA pra vários clientes em paralelo, com aprovação em fluxo e publicação agendada.',
    features: [
      'Geração automática de posts (imagem + carrossel + vídeo)',
      'Multi-cliente com aprovação por workflow',
      'Publicação agendada no Instagram/Facebook/TikTok',
      'Analytics de engajamento integrado',
    ],
    updatedAt: '2026-07-14',
    cta: { label: 'Falar com o time', url: '/contato?produto=social-midia-ia' },
  },
  {
    slug: 'ghl-evolution',
    title: 'GHL-Evolution Adapter',
    tagline: 'Ponte entre o GoHighLevel e a Evolution API (WhatsApp)',
    icon: 'plug-zap',
    category: 'integracao',
    status: 'producao',
    description:
      'Adapter NestJS que faz a ponte entre o GoHighLevel (GHL) e a Evolution API: traduz os webhooks dos dois lados, gerencia o OAuth do GHL Marketplace, mapeia mensagens e contatos e provisiona instâncias Evolution sob demanda. Backend-only — API REST pra consumir.',
    features: [
      'OAuth completo com o GHL Marketplace',
      'Provisionamento automático de instâncias Evolution',
      'Mapeamento bidirecional de mensagens GHL ↔ WhatsApp',
      'Módulo ZapFlow pra orquestração de fluxos',
    ],
    updatedAt: '2026-07-14',
    cta: { label: 'Documentação da API', url: '/contato?produto=ghl-evolution' },
  },
  {
    slug: 'ghl-gowa',
    title: 'GHL-Gowa Adapter',
    tagline: 'Ponte entre o GoHighLevel e o GOWA (WhatsApp multi-device)',
    icon: 'plug-zap',
    category: 'integracao',
    status: 'producao',
    description:
      'Adapter que faz a ponte entre o GoHighLevel (GHL) e o GOWA (WhatsApp multi-device): traduz os webhooks dos dois lados, resolve JID/número (inclusive o 9º dígito brasileiro), roteia envios por device nomeado e mapeia mensagens e contatos GHL ↔ WhatsApp. Backend-only — API REST pra consumir.',
    features: [
      'Multi-device: roteia cada envio por um device nomeado (header X-Device-Id)',
      'Resolução de JID/número BR (toggle automático do 9º dígito)',
      'Mapeamento bidirecional de mensagens GHL ↔ WhatsApp',
      'Webhooks GHL + GOWA traduzidos nos dois sentidos',
    ],
    updatedAt: '2026-07-14',
    cta: { label: 'Documentação da API', url: '/contato?produto=ghl-gowa' },
  },
  {
    slug: 'paid-midia-automation',
    title: 'Paid Mídia Automation',
    tagline: 'Plataforma de agência pra Meta Ads + Google Ads',
    icon: 'bar-chart-3',
    category: 'agencia',
    status: 'producao',
    description:
      'SaaS pra agências gerenciarem campanhas de Meta Ads e Google Ads em escala. Análise diária e otimização automática pra até 100 contas Meta + 100 Google Ads. Workers Python rodam todo dia e um dashboard Next.js mostra a performance.',
    features: [
      'Análise diária automática das campanhas (Meta + Google)',
      'Otimização por regras configuráveis (pausar criativos sem performance, etc.)',
      'Suporta até 100 contas Meta + 100 Google em paralelo',
      'Dashboard com métricas consolidadas por cliente',
    ],
    updatedAt: '2026-07-14',
    cta: { label: 'Falar com o time', url: '/contato?produto=paid-midia-automation' },
  },
  {
    slug: 'plexco-tasks',
    title: 'Plexco Tasks',
    tagline: 'SaaS de gestão de tarefas com IA + WhatsApp',
    icon: 'list-checks',
    category: 'b2b',
    status: 'producao',
    description:
      'SaaS multi-tenant de gestão de tarefas com um diferencial: subtarefas recursivas em 3 níveis + assistente de IA multimodal pra criar, editar e consultar tarefas + integração bidirecional com WhatsApp pra registrar tarefas pela conversa.',
    features: [
      'Subtarefas recursivas em 3 níveis (épico → tarefa → subtarefa)',
      'Assistente de IA multimodal (texto + imagem + áudio)',
      'WhatsApp bidirecional pra criar/atualizar tarefas',
      'Multi-tenant com workspaces isolados',
    ],
    updatedAt: '2026-07-14',
    cta: { label: 'Conhecer a plataforma', url: 'https://tasks.plexco.com.br' },
  },
  {
    slug: 'plexco-coach',
    title: 'Plexco Coach',
    tagline: 'Plataforma de coaching com IA assistente',
    icon: 'graduation-cap',
    category: 'b2b',
    status: 'producao',
    description:
      'SaaS pra coaches gerenciarem clientes, sessões, planos de ação e materiais. A IA assistente ajuda a sintetizar as sessões, gerar planos de ação e lembrar os clientes via WhatsApp. Multi-coach com workspaces isolados.',
    features: [
      'Gestão de clientes + sessões + planos de ação',
      'IA sintetiza as notas de sessão automaticamente',
      'Lembretes por WhatsApp pros clientes',
      'Material complementar versionado por cliente',
    ],
    updatedAt: '2026-07-14',
    cta: { label: 'Conhecer a plataforma', url: 'https://coach.plexco.com.br' },
  },
  {
    slug: 'plexco-tickets',
    title: 'Plexco Tickets',
    tagline: 'Sistema de tickets de suporte',
    icon: 'ticket',
    category: 'b2b',
    status: 'desenvolvimento',
    description:
      'Sistema multi-tenant de tickets de suporte com IA pra triagem automática + roteamento por especialidade + integração com WhatsApp pro cliente abrir e acompanhar tickets pela conversa. Em desenvolvimento ativo.',
    features: [
      'Tickets multi-tenant com SLA configurável',
      'Triagem automática por IA + roteamento',
      'WhatsApp bidirecional pro cliente',
      'Base de conhecimento integrada',
    ],
    updatedAt: '2026-07-14',
    cta: { label: 'Conhecer a plataforma', url: 'https://tickets.plexco.com.br' },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return PRODUCTS.map((p) => p.slug);
}
