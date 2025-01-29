export interface Transaction {
  id: number;
  price: string | null;
  quantity: number;
  brand: string | null;
  dateOfManufacture: string | null;
  dateOfExpiry: string | null;
  description: string | null;
  TransactionPic: string | null;
  category: string | null;
}
