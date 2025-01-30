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
    res
      .status(500)
      .json({ message: "Server error while creating transaction." });
  }
};

export const categorizeTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Key is", process.env.OPENAI_API);
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
        messages: [{ role: "system", content: "Hello!" }],
        max_tokens: 50,
      },

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`, // Replace with your key
        },
      }
    );

    const category = response.data.choices[0].message.content.trim();
    res
      .status(200)
      .json({ message: "Transaction categorized successfully.", category });
  } catch (error) {
    console.error("Error categorizing transaction:", error);
    res
      .status(500)
      .json({ message: "Server error while categorizing transaction." });
  }
};

export const allTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("AllTransactions route is  called!");
  const allTransactions = await prisma.transaction.findMany();
  console.log("Alltranactions are:",allTransactions)
  res.status(200).json({message:"All transactions fetched successfully",allTransactions})
  return;
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("DeleteTransaction called!");

  const { id } = req.body;

  if (!id) {
    res.status(400).json({ message: "Fill the ceredentials!" });
  }
  const existingTransaction = await prisma.transaction.findUnique({
    where: { id },
  });
  console.log("Existing transaction is :", existingTransaction);

  if (!existingTransaction) {
    res.status(404).json({ message: "Transaction with this id doesn't exist" });
    return;

  }
  await prisma.transaction.delete({
    where: { id },
  });

  res.status(200).json({ message: "Item deleted successfully!" });
  return;
};
