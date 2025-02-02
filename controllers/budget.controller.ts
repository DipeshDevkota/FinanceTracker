import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { BudgetAllocationSchema, BudgetSchema } from "../types/zodSchema";
const prisma = new PrismaClient();
export const budgetAllocation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    console.log("BudgetAllocation route called!");
  
    if (!req.body || !req.body.budgetAllocation) {
        res.status(400).json({ message: "Budget allocation is required!" });
        return;
      }
      
    const validateData = BudgetAllocationSchema.parse(req.body);
    if (!validateData) {
      res.status(404).json({ message: "Error in validating input" });
      return;
    }
  
    const { amount } = validateData;
    const type = typeof(budgetAllocation);
    console.log("Type is:",type)
    if (!budgetAllocation) {
      res.status(404).json({ message: "BudgetAllocation field is required!" });
      return;
    }
  
    const newBudget = await prisma.budgetAllocation.create({
      data: {
        amount
      },
    });
  
    res.status(200).json({ message: "New Budget Allocated successfully!", newBudget });
    return;
  };
  
