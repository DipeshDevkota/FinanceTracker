import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const prisma = new PrismaClient();

export const addTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      price,
      name,
      quantity,
      brand,
      dateOfManufacture,
      dateOfExpiry,
      description,
      TransactionPic,
      Category,
    } = req.body;

    if (!price || !quantity || !name || !brand || !Category) {
      res.status(400).json({ message: "All fields are required!" });
      return;
    }

    const existingTransaction = await prisma.transaction.findFirst({
      where: { name, Category },
    });

    if (existingTransaction) {
      res.status(200).json({
        message: "This transaction has already been recorded.",
        existingTransaction,
      });
      return;
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        price,
        name,
        quantity,
        brand,
        dateOfManufacture,
        dateOfExpiry,
        description,
        TransactionPic,
        Category,
      },
    });

    res.status(200).json({
      message: "New transaction added successfully.",
      newTransaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Server error while creating transaction." });
  }
};

export const Category = async (
  
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Key is",process.env.OPENAI_API)
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ message: "Product name is required!" });
      return;
    }

    const prompt = `
      Categorize this transaction based on its details:
      Name: ${name || "N/A"}

      Categories: Food, Electronics, Fashion, Healthcare, Others.
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "system", content: prompt }],
        max_tokens: 50,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API}`,
        },
      }
    );

    const category = response.data.choices[0].message.content.trim();
    res.status(200).json({ message: "Transaction categorized successfully.", category });
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    res.status(500).json({ message: "Server error while categorizing transaction." });
  }
};
