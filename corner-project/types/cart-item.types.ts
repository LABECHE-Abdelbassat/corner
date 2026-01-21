export interface CartItem {
  productId: string;
  name: string;
  basePrice: number;
  quantity: number;
  selectedVariant?: any;
  selectedOptions: any[];
  selectedAddons: any[];
  totalPrice: number;
  image?: string | null;
}
