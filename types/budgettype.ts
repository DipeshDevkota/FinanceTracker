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
  amount:number;
  category: string | null;
  notes: string;
  period: string | null;
  name :string | null;
}

export interface budgetRemaining {
  id: number;
  amount:number;
}

export interface budgetAddition {
  id: number;
  amount:number;
}
