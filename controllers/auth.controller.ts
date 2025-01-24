import { Request, Response, NextFunction } from 'express';
import { User } from './../types/userType';
import { PrismaClient } from '@prisma/client';
import { Jwt } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();


const generateToken = (req:Request,res:Response,next:NextFunction)=>{
  
}

export const registerUser = async(
  req:Request,
  res:Response,
  next:NextFunction
)=>{
  const {username, email,password} = req.body;
  if(!username || !email || !password)
  {
    return res.status(400).json({message:"Invalid ceredentials"});
  };

  try {
    const userExists= await prisma.user.findUnique({where:{email}});
    if(userExists)
    {
      return res.status(400).json({message:"User exists"});
    };

    const hashedPassword= await bcrypt.hash(password,10);
    if(!hashedPassword)
    {
      return res.status(400).json({message:"Error in hashing password"});
    }

    const newUser = await prisma.user.create({
      data:{
        username,
        email,
        password:hashedPassword
      }
    });

    if(!newUser){
      return res.status(400).json({message:"Error in creating user"});
    };




    
  } catch (error) {
    
  }
}
export const loginUser = async(
  req:Request,
  res:Response,
  next:NextFunction

)=>{
    try {

        const {email,password}= req.body;
        if(!email || !password)
        {
          return res.status(400).json({message:"Invalid ceredentials"})
        }

        const userExists = await prisma
        .user.findUnique({
          where: {
            email: email,
          },
        }) as User | null;

        if (!userExists) {
          return res.status(400).json({message:"User doesn't exist"});
        }

        console.log("User exists is:",userExists);
        if(!userExists)
        {
          return res.status(400).json({message:"User doesn't exist"});
        };

        const isMatch = userExists.password  === password;
        console.log("User matches is:",isMatch);

        if(!isMatch)
        {
          return res.status(400).json({message:"Invalid ceredentials"});
        };

        const token = jwt



        
        
    } catch (error) {
        
    }
}