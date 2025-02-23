import { Request, Response, NextFunction } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

interface TXN {
    date: Date;    
    price: number;
} 

export const HUGGINGFACE_API_KEY = process.env.HUGGING_FACE_API;
if (!HUGGINGFACE_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY environment variable is not set");
}

export const predictSpending = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("Predict Spending is called")
        const transactions = await prisma.transaction.findMany();
        if (!transactions || transactions.length === 0) {
            res.status(404).json({ message: "No transactions found" });
            return;
        }

        // Ensure data consistency
        const formattedData = transactions.map((txn): TXN => ({
            date: txn.dateOfManufacture || txn.dateOfExpiry || new Date(),// Provide a default date if both are null
            price: Number(txn.price),   // Convert price to number if needed
        }));

        res.json({ data: formattedData });
    } catch (error) {
        next(error);
    }
};
