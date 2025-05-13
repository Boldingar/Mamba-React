// This file defines the types needed for EditProject components

export interface Product {
  url: string;
  name: string;
  language?: string;
  priority: number;
  description: string;
}

export interface Persona {
  name: string;
  description: string;
  priority: number;
}

export interface Competitor {
  name: string;
  description: string;
}

export interface FormDataType {
  id?: string;
  name: string;
  website_url: string;
  target_market: string;
  products: Product[];
  personas: Persona[];
  competitors: Competitor[];
  company_summary: string;
  gsc_site_url?: string | null;
}
