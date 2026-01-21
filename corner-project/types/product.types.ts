export interface Product {
  _id?: string;
  categoryId?: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price?: number;
  hasOptions?: boolean;
  hasAddons?: boolean;
  hasVariants?: boolean;
  isAvailable?: boolean;
  tags?: string[];
  allergens?: string[];
  variants?: any[];
  optionGroups?: any[];
  addonGroups?: any[];
}
