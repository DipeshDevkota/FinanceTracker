//addTransaction getTransaction updateTransaction deleteTransaction transactionbycategory

import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const addTransaction= async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try {
          const {price,name,quantity,brand,dateOfManufacture,dateOfExpiry,description,TransactionPic,Category}= req.body;
          if(!price || !quantity || !name || !brand  || !Category)
          {
            res.status(401).json({message:"All fields are required!"})
            return;
          }


          const existingTransaction = await prisma.transaction.findFirst({
            where:{
                name:name,
                Category:Category

            }
          });

          if(existingTransaction)
          {
            res.status(200).json({message:"The transaction that you are going to perform has already been placed by you",existingTransaction})
            return;
          }

          const  newTransaction = await prisma.transaction.create({
            data:{
                price,name,quantity,brand,dateOfManufacture,dateOfExpiry,description,TransactionPic,Category 
            }
          });


          console.log("NewTransaction is:",newTransaction)
        
       res.status(200).json({message:"New transaction added successfully",newTransaction})
       return;

        
    } catch (error) {

        console.log("Server error while adding transaction",error);
        res.status(400).json({message:'Server error while creating transaction',error})
        return;
        
    }
};




// export const Category = async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
//     try {
//         console.log("Categoriedfunctioncalled");
//         //use of ai //

        
//     } catch (error) {
//         console.log("Server error while adding transaction",error);
//         res.status(400).json({message:'Server error while creating transaction',error})
//         return;

        
//     }

// }










