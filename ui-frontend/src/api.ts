export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export type CountrySummary = {
  iso_code: string;
  name: string;
  readiness_score?: number | null;
  policy_score?: number | null;
  infra_score?: number | null;
  language_score?: number | null;
  risk_score?: number | null;
};

export type PolicyIndicator = {
  policy_name: string;
  key: string;
  value: string;
  source_url?: string | null;
};

export type Policy = {
  id: number;
  name: string;
  source_url?: string | null;
  category?: string | null;
  status?: string | null;
  indicators: PolicyIndicator[];
};

export type CountryDetail = {
  iso_code: string;
  name: string;
  readiness_score?: number | null;
  policy_score?: number | null;
  infra_score?: number | null;
  language_score?: number | null;
  risk_score?: number | null;
  computed_at?: string | null;
  policies: Policy[];
  methodology: any;
};

export async function fetchCountries(): Promise<CountrySummary[]> {
  const res = await fetch(`${API_BASE}/countries`);
  if (!res.ok) throw new Error('Failed to fetch countries');
  return res.json();
}

export async function fetchCountry(iso: string): Promise<CountryDetail> {
  const res = await fetch(`${API_BASE}/country/${iso}`);
  if (!res.ok) throw new Error('Failed to fetch country');
  return res.json();
}

export async function fetchCompare(isos: string[]): Promise<CountrySummary[]> {
  const params = new URLSearchParams();
  for (const i of isos) params.append('iso', i);
  const res = await fetch(`${API_BASE}/compare?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch comparison');
  return res.json();
}

export async function fetchMethodology(): Promise<any> {
  const res = await fetch(`${API_BASE}/methodology`);
  if (!res.ok) throw new Error('Failed to fetch methodology');
  return res.json();
}

