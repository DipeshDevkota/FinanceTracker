export interface Budget {
  id: number;
  budgetAllocation: number;
  budgetRemaining: number;
  budgetAddition: number;
}

export enum Category {
  Food = "Food",
  Electronics = "Electronics",
  Fashion = "Fashion",
  Healthcare = "Healthcare",
  Others = "Others",
}


export interface budgetAllocation {
  id: number;
  amount: string | null;
  category: string | null;
  notes: string;
  period: string | null;
  name :string | null;
}

export interface budgetRemaining {
  id: number;
  amount: string | null;
}

export interface budgetAddition {
  id: number;
  amount: string | null;
}
