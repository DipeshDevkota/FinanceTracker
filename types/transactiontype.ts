export interface Transaction {
  id: number;
  price: string | null;
  quantity: number;
  brand: string | null;
  name : string | null;
  dateOfManufacture: string | null;
  dateOfExpiry: string | null;
  description: string | null;
  TransactionPic: string | null;
  Category: string | null;
  budgetId: number;

}


export interface GoogleGenerativeAI{
  model:any
}