
export interface Budget {
  id: number;
  budgetAllocation: number;
  budgetRemaining: number;
  budgetAddition: number;
}


export interface budgetAllocation{
  id: number;
  amount: string | null;
}


export interface budgetRemaining{
  id: number;
  amount: string | null;
}


export interface budgetAddition{
  id: number;
  amount: string | null;
}