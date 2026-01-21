export interface Category {
  _id: string;
  name: string;
  description: string | null;
  image: string | null;
  order: number;
}
