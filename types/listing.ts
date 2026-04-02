export interface Merchant {
  id: number;
  business_name: string;
  location?: string;
  merchant_type?: string; // ✅ make optional (important)
}

export interface SubCategory {
  id: number;
  name: string;
  category_id: number;
}

export interface Listing {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  listing_type: "product" | "service";

  image_urls?: string[];
  video_url?: string;

  merchant: Merchant;
  subcategory: SubCategory;
}