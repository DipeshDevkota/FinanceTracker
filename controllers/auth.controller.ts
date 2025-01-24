import { Request, Response, NextFunction } from 'express';
import { User } from './../types/userType';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface RequestWithUser extends Request {
  user?: User; // Use a stricter type if you know the structure of the user object
}

const prisma = new PrismaClient();

// Token generation function
const generateToken = (res: Response, user: User): void => {
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
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
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
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
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

// User Logout
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("Error in logging out user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Update User
export const updateUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const user = req.user;
    console.log("Requested User is:", user);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const { username, profilePic, email } = user;

    // Update logic here, if needed
    return res.status(200).json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Error in updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
