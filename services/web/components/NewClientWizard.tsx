'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { submitNewClient, type NewClientPayload } from '@/lib/api';
import {
  paymentMethodsFor,
  WELCOME_BRANDS,
  type Lang,
  type NewClientDict,
  type PaymentMethod,
} from '@/lib/new-client-i18n';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const INPUT =
  'w-full px-4 py-2.5 border border-paper-3 rounded-lg focus:outline-none focus:border-brand-500 transition-colors bg-white';
const TOTAL_STEPS = 4; // country, company, owner, finance (welcome/thanks excluded)

type Country = '' | 'BR' | 'US';

type WizardData = {
  country: Country;
  company_name: string;
  tax_id: string;
  tax_regime: string;
  address_full: string;
  street: string;
  complement: string;
  city: string;
  state: string;
  zip: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  owner_birthdate: string;
  fin_is_owner: boolean;
  fin_name: string;
  fin_whatsapp: string;
  fin_email: string;
  payment_method: '' | PaymentMethod;
};

const EMPTY: WizardData = {
  country: '',
  company_name: '',
  tax_id: '',
  tax_regime: '',
  address_full: '',
  street: '',
  complement: '',
  city: '',
  state: '',
  zip: '',
  owner_name: '',
  owner_email: '',
  owner_phone: '',
  owner_birthdate: '',
  fin_is_owner: true,
  fin_name: '',
  fin_whatsapp: '',
  fin_email: '',
  payment_method: '',
};

export function NewClientWizard({ lang, dict }: { lang: Lang; dict: NewClientDict }) {
  const [step, setStep] = useState(0); // 0 welcome · 1 country · 2 company · 3 owner · 4 finance · 5 thanks
  const [data, setData] = useState<WizardData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [refCode, setRefCode] = useState('');

  // Capture ?ref=CODE from the URL (window, not useSearchParams — avoids the
  // static-render Suspense bailout on a pre-rendered page). Redundant with the
  // hidden field per spec (anti-error).
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) setRefCode(ref.slice(0, 64));
    } catch {
      /* noop */
    }
  }, []);

  function set<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: '' } : e));
  }

  function validateStep(current: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (current === 1 && !data.country) e.country = dict.errors.selectCountry;
    if (current === 2) {
      if (data.company_name.trim().length < 2) e.company_name = dict.errors.required;
      if (data.tax_id.trim().length < 2) e.tax_id = dict.errors.required;
    }
    if (current === 3) {
      if (data.owner_name.trim().length < 2) e.owner_name = dict.errors.required;
      if (!EMAIL_RE.test(data.owner_email.trim())) e.owner_email = dict.errors.email;
      if (data.owner_phone.replace(/\D/g, '').length < 8) e.owner_phone = dict.errors.required;
    }
    if (current === 4) {
      if (!data.payment_method) e.payment_method = dict.errors.selectPayment;
      if (!data.fin_is_owner) {
        if (data.fin_name.trim().length < 2) e.fin_name = dict.errors.required;
        if (data.fin_whatsapp.replace(/\D/g, '').length < 8) e.fin_whatsapp = dict.errors.required;
        if (!EMAIL_RE.test(data.fin_email.trim())) e.fin_email = dict.errors.email;
      }
    }
    return e;
  }

  function goNext() {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setStep((s) => s + 1);
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }

  function chooseCountry(country: 'BR' | 'US') {
    setData((d) => ({
      ...d,
      country,
      // reset country-specific selections that may no longer be valid
      payment_method: '',
      tax_regime: country === 'BR' ? d.tax_regime : '',
    }));
    setErrors({});
    setStep(2);
  }

  function buildPayload(): NewClientPayload {
    const composedAddress =
      data.address_full.trim() ||
      [data.street, data.complement, data.city, data.state, data.zip]
        .map((v) => v.trim())
        .filter(Boolean)
        .join(', ');
    return {
      country: data.country as 'BR' | 'US',
      company_name: data.company_name.trim(),
      tax_id: data.tax_id.trim(),
      tax_regime: data.country === 'BR' ? data.tax_regime || undefined : undefined,
      address_full: composedAddress || undefined,
      street: data.street.trim() || undefined,
      complement: data.complement.trim() || undefined,
      city: data.city.trim() || undefined,
      state: data.state.trim() || undefined,
      zip: data.zip.trim() || undefined,
      owner_name: data.owner_name.trim(),
      owner_email: data.owner_email.trim().toLowerCase(),
      owner_phone: data.owner_phone.trim(),
      owner_birthdate: data.owner_birthdate || undefined,
      fin_is_owner: data.fin_is_owner,
      fin_name: data.fin_is_owner ? undefined : data.fin_name.trim() || undefined,
      fin_whatsapp: data.fin_is_owner ? undefined : data.fin_whatsapp.trim() || undefined,
      fin_email: data.fin_is_owner ? undefined : data.fin_email.trim().toLowerCase() || undefined,
      payment_method: data.payment_method as PaymentMethod,
      lang,
      ref_code: refCode || undefined,
    };
  }

  async function handleSubmit() {
    const e = validateStep(4);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setSubmitState('loading');
    setSubmitError('');
    const result = await submitNewClient(buildPayload());
    if (result.ok) {
      setStep(5);
      setSubmitState('idle');
    } else {
      setSubmitState('error');
      setSubmitError(result.error || dict.errors.generic);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* hidden ref field — redundancy with URL capture (spec) */}
      <input type="hidden" name="ref" value={refCode} readOnly />

      {step >= 1 && step <= 4 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-xs text-steel-500 uppercase tracking-wider">
              {dict.common.step} {step} {dict.common.of} {TOTAL_STEPS}
            </span>
          </div>
          <div className="h-1.5 bg-paper-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      )}

      {step === 0 && <WelcomeStep dict={dict} onStart={() => setStep(1)} />}

      {step === 1 && (
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">{dict.country.question}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => chooseCountry('BR')}
              className="flex flex-col items-center gap-3 p-8 bg-white border border-paper-3 hover:border-brand-500 rounded-xl transition-colors"
            >
              <span className="text-5xl" aria-hidden>🇧🇷</span>
              <span className="font-semibold">{dict.country.br}</span>
            </button>
            <button
              type="button"
              onClick={() => chooseCountry('US')}
              className="flex flex-col items-center gap-3 p-8 bg-white border border-paper-3 hover:border-brand-500 rounded-xl transition-colors"
            >
              <span className="text-5xl" aria-hidden>🇺🇸</span>
              <span className="font-semibold">{dict.country.us}</span>
            </button>
          </div>
          {errors.country && <FieldError msg={errors.country} />}
          <NavRow dict={dict} onBack={goBack} />
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">{dict.company.title}</h1>
          <div className="space-y-4">
            <TextField
              label={dict.company.companyName}
              value={data.company_name}
              onChange={(v) => set('company_name', v)}
              error={errors.company_name}
              required
            />
            <TextField
              label={data.country === 'BR' ? 'CNPJ' : 'EIN'}
              value={data.tax_id}
              onChange={(v) => set('tax_id', v)}
              error={errors.tax_id}
              mono
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label={dict.company.street} value={data.street} onChange={(v) => set('street', v)} optional={dict.common.optional} />
              <TextField label={dict.company.complement} value={data.complement} onChange={(v) => set('complement', v)} optional={dict.common.optional} />
              <TextField label={dict.company.city} value={data.city} onChange={(v) => set('city', v)} optional={dict.common.optional} />
              <TextField label={dict.company.state} value={data.state} onChange={(v) => set('state', v)} optional={dict.common.optional} />
              <TextField
                label={data.country === 'BR' ? 'CEP' : 'ZIP'}
                value={data.zip}
                onChange={(v) => set('zip', v)}
                mono
                optional={dict.common.optional}
              />
              {data.country === 'BR' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {dict.company.regime} <span className="text-steel-500 font-normal">{dict.common.optional}</span>
                  </label>
                  <select className={INPUT} value={data.tax_regime} onChange={(e) => set('tax_regime', e.target.value)}>
                    <option value="">—</option>
                    {dict.company.regimeOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <p className="text-sm text-steel-500">
              {dict.company.countryLabel}: <strong>{data.country === 'BR' ? dict.country.br : dict.country.us}</strong>
            </p>
          </div>
          <NavRow dict={dict} onBack={goBack} onNext={goNext} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">{dict.owner.title}</h1>
          <div className="space-y-4">
            <TextField label={dict.owner.name} value={data.owner_name} onChange={(v) => set('owner_name', v)} error={errors.owner_name} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField label={dict.owner.email} type="email" value={data.owner_email} onChange={(v) => set('owner_email', v)} error={errors.owner_email} required />
              <TextField label={dict.owner.phone} type="tel" mono value={data.owner_phone} onChange={(v) => set('owner_phone', v)} error={errors.owner_phone} required />
            </div>
            <TextField label={dict.owner.birthdate} type="date" value={data.owner_birthdate} onChange={(v) => set('owner_birthdate', v)} optional={dict.common.optional} />
          </div>
          <NavRow dict={dict} onBack={goBack} onNext={goNext} />
        </div>
      )}

      {step === 4 && (
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">{dict.finance.title}</h1>

          <fieldset className="mb-6">
            <legend className="text-sm font-medium mb-2">{dict.finance.whoQuestion}</legend>
            <div className="flex flex-col sm:flex-row gap-3">
              <RadioCard checked={data.fin_is_owner} onClick={() => set('fin_is_owner', true)} label={dict.finance.isOwner} />
              <RadioCard checked={!data.fin_is_owner} onClick={() => set('fin_is_owner', false)} label={dict.finance.isOther} />
            </div>
          </fieldset>

          {!data.fin_is_owner && (
            <div className="space-y-4 mb-6 border-l-2 border-paper-3 pl-4">
              <TextField label={dict.finance.finName} value={data.fin_name} onChange={(v) => set('fin_name', v)} error={errors.fin_name} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField label={dict.finance.finWhatsapp} type="tel" mono value={data.fin_whatsapp} onChange={(v) => set('fin_whatsapp', v)} error={errors.fin_whatsapp} required />
                <TextField label={dict.finance.finEmail} type="email" value={data.fin_email} onChange={(v) => set('fin_email', v)} error={errors.fin_email} required />
              </div>
            </div>
          )}

          <fieldset className="mb-2">
            <legend className="text-sm font-medium mb-2">{dict.finance.paymentTitle}</legend>
            <div className="flex flex-col sm:flex-row gap-3">
              {data.country &&
                paymentMethodsFor(data.country).map((m) => (
                  <RadioCard
                    key={m}
                    checked={data.payment_method === m}
                    onClick={() => set('payment_method', m)}
                    label={dict.finance.methods[m]}
                  />
                ))}
            </div>
            {errors.payment_method && <FieldError msg={errors.payment_method} />}
          </fieldset>

          {submitState === 'error' && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{submitError}</div>
          )}

          <div className="flex items-center justify-between mt-8">
            <button type="button" onClick={goBack} className="text-steel-500 hover:text-brand-500 font-medium">
              ← {dict.common.back}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitState === 'loading'}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-steel-500 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {submitState === 'loading' ? dict.common.submitting : dict.common.submit}
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-emerald-700 mb-3">{dict.thanks.title}</h1>
          <p className="text-emerald-700/80 mb-6">{dict.thanks.body}</p>
          <Link href="/" className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg no-underline hover:no-underline transition-colors">
            {dict.thanks.backHome}
          </Link>
        </div>
      )}
    </div>
  );
}

function WelcomeStep({ dict, onStart }: { dict: NewClientDict; onStart: () => void }) {
  const [hero, ...rest] = WELCOME_BRANDS;
  return (
    <div className="text-center">
      {/* Hero brand logo (Hub Operacional / HOPE) */}
      <div className="flex justify-center mb-6">
        <Image
          src={hero.src}
          alt={hero.name}
          width={0}
          height={0}
          sizes="200px"
          priority
          className="h-16 w-auto object-contain"
        />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{dict.welcome.title}</h1>
      <p className="text-steel-700 max-w-prose mx-auto mb-8">{dict.welcome.subtitle}</p>
      <div className="mb-10">
        <div className="font-mono text-xs text-steel-500 uppercase tracking-wider mb-4">{dict.welcome.brandsLabel}</div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {rest.map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-center h-16 w-36 px-4 bg-white border border-paper-3 rounded-xl"
            >
              <Image
                src={b.src}
                alt={b.name}
                width={0}
                height={0}
                sizes="144px"
                className="max-h-10 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-10 py-3.5 rounded-lg transition-colors"
      >
        {dict.welcome.startBtn}
      </button>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  required,
  optional,
  type = 'text',
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  optional?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required ? '*' : optional && <span className="text-steel-500 font-normal">{optional}</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT}${mono ? ' font-mono text-sm' : ''}`}
      />
      {error && <FieldError msg={error} />}
    </div>
  );
}

function RadioCard({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
        checked ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-paper-3 bg-white hover:border-brand-500'
      }`}
    >
      {label}
    </button>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="text-sm text-red-600 mt-1">{msg}</p>;
}

function NavRow({ dict, onBack, onNext }: { dict: NewClientDict; onBack: () => void; onNext?: () => void }) {
  return (
    <div className="flex items-center justify-between mt-8">
      <button type="button" onClick={onBack} className="text-steel-500 hover:text-brand-500 font-medium">
        ← {dict.common.back}
      </button>
      {onNext && (
        <button type="button" onClick={onNext} className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          {dict.common.next} →
        </button>
      )}
    </div>
  );
}
