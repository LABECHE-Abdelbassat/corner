export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  currency: string;
  phone: string | null;
  address: string | null;
  openingHours: string | null;
  isOpen: boolean;
}
