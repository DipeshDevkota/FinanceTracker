import { Request, Response, NextFunction } from 'express';
import { User } from './../types/userType';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Token generation function
const generateToken = (res: Response, user: User) => {
  try {
    const { email } = user;
    const token = jwt.sign({ email }, "dipesh78$", { expiresIn: "1d" }); // Set expiration time for better security
    console.log("Token is:", token);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  } catch (error) {
    console.error("Error in generating token:", error);
    res.status(500).json({ message: "Error in generating token" });
  }
};

// User Registration
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
      username,
      email,
      password: hashedPassword,
      },
    });


    generateToken(res, newUser);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error in creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// User Login
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  try {
    const userExists = (await prisma.user.findUnique({
      where: { email },
    })) as User | null;

    if (!userExists) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, userExists.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    generateToken(res, userExists);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.log("Error in logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const logoutUser = async(req:Request ,res:Response,next:NextFunction)=>{
  try {
    res.clearCookie("token");
    return res.status(200).json({message:"User loggedout successfully"});
    
  } catch (error) {
    console.log("Error in logging in user:", error);

    
  }

}

export const updateProfile = async(req:Request , res:Response , next:NextFunction)=>{
  
}




