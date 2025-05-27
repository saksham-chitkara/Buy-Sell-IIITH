export interface CartItem {
  id: string;
  name: string;
  price: number;
  bargainedPrice: number | null;
  quantity: number;
  images: { url: string; public_id: string }[];
  seller: {
    id: string;
    name: string;
    email: string;
  };
  bargainStatus: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED";
}
