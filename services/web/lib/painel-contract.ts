// Checked-in mirror of what the Painel's public endpoints accept (Pydantic
// extra='forbid'). NOT a live contract — update this when the /public/* contract
// changes. Guards against frontend-side payload drift (renamed/removed/extra field).

export type EndpointContract = {
  /** Fields that must always be present in the serialized body. */
  required: readonly string[];
  /** Fields that may be present. */
  optional: readonly string[];
};

// `tracking` is attached by every builder and is always allowed on top of these.
export const CONTRACTS = {
  leads: {
    required: ['name', 'email', 'message'],
    optional: ['whatsapp'],
  },
  affiliate: {
    required: ['name', 'email', 'whatsapp'],
    optional: [],
  },
  newClient: {
    required: [
      'country', 'company_name', 'tax_id', 'owner_name', 'owner_email',
      'owner_phone', 'fin_is_owner', 'payment_method', 'lang',
    ],
    optional: [
      'tax_regime', 'address_full', 'street', 'complement', 'city', 'state',
      'zip', 'owner_birthdate', 'fin_name', 'fin_whatsapp', 'fin_email', 'ref_code',
    ],
  },
} satisfies Record<string, EndpointContract>;

/** Returns a list of contract problems (empty = payload conforms). */
export function contractProblems(body: Record<string, unknown>, c: EndpointContract): string[] {
  const problems: string[] = [];
  const allowed = new Set<string>([...c.required, ...c.optional, 'tracking']);
  for (const key of Object.keys(body)) {
    if (!allowed.has(key)) problems.push(`unexpected field: ${key}`);
  }
  for (const key of c.required) {
    if (!(key in body)) problems.push(`missing required field: ${key}`);
  }
  return problems;
}
