import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewClientWizard } from '@/components/NewClientWizard';
import { getDict, isLang, LANGS, type Lang } from '@/lib/new-client-i18n';

type Params = { lang: string };

// Only pt-br and en are pre-rendered; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams(): { lang: Lang }[] {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return { title: 'Not found' };
  const dict = getDict(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    robots: { index: false, follow: false }, // funnel page — keep out of the index
  };
}

export default async function NewClientPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDict(lang);
  return <NewClientWizard lang={lang} dict={dict} />;
}
