// Bilingual dictionary for the /new-client wizard (pt-br / en).
// Server component picks the dict by slug and passes it to the client wizard.
// No i18n lib — a plain typed dictionary keyed by Lang (spec v0.3 decision).

export type Lang = 'pt-br' | 'en';

export const LANGS: Lang[] = ['pt-br', 'en'];

export function isLang(value: string): value is Lang {
  return (LANGS as string[]).includes(value);
}

export type PaymentMethod = 'credit_card' | 'boleto_pix' | 'bank_transfer';

export type NewClientDict = {
  meta: { title: string; description: string };
  common: {
    next: string;
    back: string;
    start: string;
    submit: string;
    submitting: string;
    step: string; // "Etapa" / "Step" — composed on client as `${step} ${n} ${of} ${total}`
    of: string; // "de" / "of"
    optional: string;
    yes: string;
    no: string;
  };
  welcome: { title: string; subtitle: string; brandsLabel: string; startBtn: string };
  country: { question: string; br: string; us: string };
  company: {
    title: string;
    companyName: string;
    taxId: string; // resolved by country before render
    street: string;
    complement: string;
    city: string;
    state: string;
    zip: string; // resolved by country
    regime: string;
    regimeOptions: string[];
    countryLabel: string;
  };
  owner: { title: string; name: string; email: string; phone: string; birthdate: string };
  finance: {
    title: string;
    whoQuestion: string;
    isOwner: string;
    isOther: string;
    finName: string;
    finWhatsapp: string;
    finEmail: string;
    paymentTitle: string;
    methods: Record<PaymentMethod, string>;
  };
  thanks: { title: string; body: string; backHome: string };
  errors: { required: string; email: string; selectCountry: string; selectPayment: string; generic: string };
};

const PT: NewClientDict = {
  meta: {
    title: 'Cadastro de cliente — Hub Operacional',
    description: 'Preencha o cadastro da sua empresa para começar com o Hub Operacional.',
  },
  common: {
    next: 'Avançar',
    back: 'Voltar',
    start: 'Começar',
    submit: 'Enviar cadastro',
    submitting: 'Enviando...',
    step: 'Etapa',
    of: 'de',
    optional: '(opcional)',
    yes: 'Sim',
    no: 'Não',
  },
  welcome: {
    title: 'Bem-vindo(a) ao Hub Operacional',
    subtitle:
      'Vamos cadastrar a sua empresa em poucos passos. Leva menos de 3 minutos e seus dados vão direto para o nosso time.',
    brandsLabel: 'Um ecossistema de soluções',
    startBtn: 'Começar',
  },
  country: {
    question: 'Onde sua empresa está registrada?',
    br: 'Brasil',
    us: 'Estados Unidos',
  },
  company: {
    title: 'Dados da empresa',
    companyName: 'Nome da empresa',
    taxId: 'CNPJ',
    street: 'Rua / Logradouro',
    complement: 'Complemento',
    city: 'Cidade',
    state: 'Estado',
    zip: 'CEP',
    regime: 'Regime tributário',
    regimeOptions: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'],
    countryLabel: 'País',
  },
  owner: {
    title: 'Responsável',
    name: 'Nome do responsável',
    email: 'E-mail',
    phone: 'Telefone / WhatsApp',
    birthdate: 'Data de nascimento',
  },
  finance: {
    title: 'Financeiro e pagamento',
    whoQuestion: 'Quem cuida do financeiro?',
    isOwner: 'O próprio responsável',
    isOther: 'Outra pessoa',
    finName: 'Nome do financeiro',
    finWhatsapp: 'WhatsApp do financeiro',
    finEmail: 'E-mail do financeiro',
    paymentTitle: 'Método de pagamento',
    methods: {
      credit_card: 'Cartão de crédito',
      boleto_pix: 'Boleto / Pix',
      bank_transfer: 'Transferência bancária',
    },
  },
  thanks: {
    title: 'Cadastro enviado! 🎉',
    body: 'Recebemos os dados da sua empresa. Nosso time vai revisar e entrar em contato em breve pelo WhatsApp ou e-mail informado.',
    backHome: 'Voltar ao início',
  },
  errors: {
    required: 'Campo obrigatório',
    email: 'E-mail inválido',
    selectCountry: 'Selecione um país',
    selectPayment: 'Selecione um método de pagamento',
    generic: 'Não foi possível enviar. Tente novamente.',
  },
};

const EN: NewClientDict = {
  meta: {
    title: 'Client registration — Hub Operacional',
    description: 'Fill in your company details to get started with Hub Operacional.',
  },
  common: {
    next: 'Next',
    back: 'Back',
    start: 'Start',
    submit: 'Submit registration',
    submitting: 'Submitting...',
    step: 'Step',
    of: 'of',
    optional: '(optional)',
    yes: 'Yes',
    no: 'No',
  },
  welcome: {
    title: 'Welcome to Hub Operacional',
    subtitle:
      "Let's register your company in a few steps. It takes under 3 minutes and your details go straight to our team.",
    brandsLabel: 'An ecosystem of solutions',
    startBtn: 'Start',
  },
  country: {
    question: 'Where is your company registered?',
    br: 'Brazil',
    us: 'United States',
  },
  company: {
    title: 'Company details',
    companyName: 'Company name',
    taxId: 'EIN',
    street: 'Street',
    complement: 'Suite / Unit',
    city: 'City',
    state: 'State',
    zip: 'ZIP code',
    regime: 'Tax regime',
    regimeOptions: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'],
    countryLabel: 'Country',
  },
  owner: {
    title: 'Owner',
    name: 'Owner name',
    email: 'E-mail',
    phone: 'Phone / WhatsApp',
    birthdate: 'Date of birth',
  },
  finance: {
    title: 'Finance and payment',
    whoQuestion: 'Who handles finance?',
    isOwner: 'The owner',
    isOther: 'Someone else',
    finName: 'Finance contact name',
    finWhatsapp: 'Finance contact WhatsApp',
    finEmail: 'Finance contact e-mail',
    paymentTitle: 'Payment method',
    methods: {
      credit_card: 'Credit card',
      boleto_pix: 'Boleto / Pix',
      bank_transfer: 'Bank transfer',
    },
  },
  thanks: {
    title: 'Registration submitted! 🎉',
    body: "We received your company details. Our team will review and reach out shortly via the WhatsApp or e-mail you provided.",
    backHome: 'Back to home',
  },
  errors: {
    required: 'Required field',
    email: 'Invalid e-mail',
    selectCountry: 'Select a country',
    selectPayment: 'Select a payment method',
    generic: 'Could not submit. Please try again.',
  },
};

const DICTS: Record<Lang, NewClientDict> = { 'pt-br': PT, en: EN };

export function getDict(lang: Lang): NewClientDict {
  return DICTS[lang];
}

// Payment methods available per country (spec v0.3).
export function paymentMethodsFor(country: 'BR' | 'US'): PaymentMethod[] {
  return country === 'BR' ? ['credit_card', 'boleto_pix'] : ['credit_card', 'bank_transfer'];
}

// The four brand logos shown on the welcome page. First entry is the hero
// (Hub Operacional / HOPE); the rest render side by side below it.
export type BrandLogo = { name: string; src: string };
export const WELCOME_BRANDS: BrandLogo[] = [
  { name: 'Hub Operacional', src: '/logos/hub-operacional.png' },
  { name: 'Edifica Express', src: '/logos/edifica-express.png' },
  { name: 'V4 Company', src: '/logos/v4-company.png' },
  { name: 'Micro Investors', src: '/logos/micro-investors.png' },
  { name: 'ADS4Pros', src: '/logos/ads4pros.png' },
];
