import { Request, Response, NextFunction } from "express";
import { User } from "./../types/userType";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserSchema } from "../types/zodSchema";
import { redisClient } from "../redis/client";


const prisma = new PrismaClient();

interface RequestWithUser extends Request {
  user?: User;
}


const CACHE_KEY = process.env.CACHE_KEY;
const CACHE_EXPIRATION =process.env.CACHE_EXPIRATION;
const generateToken = async (
  res: Response,
  user: User,
  rememberMe?: boolean
): Promise<void> => {
  try {
    const { id, email } = user;
    
    const cachedData= await redisClient.get(CACHE_KEY);
    console.log("CachedData is",cachedData);
    

    if(cachedData)
    {
      res.json(JSON.parse(cachedData));
      return;
    }
    const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN as string, {
      expiresIn: rememberMe ? "7min" : "15min",
    });
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN as string, {
      expiresIn: "30d",
    });

    const redis = await redisClient.set(
      `refreshToken:${user.id}`,
      refreshToken,
      "EX",
      30 * 24 * 60 * 60
    );
    console.log("Redis is:", redis);

    await redisClient.expire(CACHE_KEY,CACHE_EXPIRATION);

    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: rememberMe ? 15 * 60 * 1000 :1 * 30 * 1000,
    });

    console.log("Access token generated:", accessToken);
    console.log("Refresh token generated and stored in Redis:", refreshToken);

    res
      .status(200)
      .json({ message: "Token generated successfully", token: accessToken });
    return;
  } catch (error) {
    console.error("Error in generating token:", error);
    res.status(500).json({ message: "Error in generating token" });
  }
};

const verifyToken = async (res: Response, req: Request, next: NextFunction) => {
  console.log("Verify token controller called!");
  const token = req.cookies.token;
  console.log("Token is:", token);
  const validToken = jwt.verify(token, process.env.REFRESH_TOKEN as string);
  console.log("Valid token is:", validToken);
};

// User Registration
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("Register User called");

  const validateData = UserSchema.parse(req.body);

  const { username, email, password } = validateData;
  if (!username || !email || !password) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    console.log("New user created:", newUser);
    generateToken(res, newUser);
  } catch (error) {
    console.error("Error in registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User Login
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password, rememberMe } = req.body;
  console.log("email pw rmb are:", req.body);
  if (!email || !password) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }
  console.log("ok");
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (!userExists) {
      res.status(404).json({ message: "User doesn't exist" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }

    generateToken(res, userExists, rememberMe);
  } catch (error) {
    console.error("Error in logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User Logout
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Logout called!");
    res.clearCookie("token");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error in logging out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update User
export const updateUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("Update User called!");
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized access" });
    return;
  }

  const { username, profilePic } = req.body;
  if (!username || !profilePic) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { username, profilePic },
      select: { username: true, profilePic: true },
    });

    console.log("Updated user:", updatedUser);
    res
      .status(200)
      .json({ message: "User updated successfully", newUser: updatedUser });
  } catch (error) {
    console.error("Error in updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Recaptcha (placeholder)
export const recaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("Recaptcha called");
  res.status(200).json({ message: "Recaptcha validation completed" });
};
