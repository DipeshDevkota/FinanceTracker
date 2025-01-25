import { Request, Response, NextFunction } from "express";
import { User } from "./../types/userType";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

interface RequestWithUser extends Request {
  user?: User; // Use a stricter type if you know the structure of the user object
}

const prisma = new PrismaClient();

// Token generation function
const generateToken = (res: Response, user: User): void => {
  try {
    const { email } = user;
    const token = jwt.sign({ email }, "dipesh78$", { expiresIn: "1d" });
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
): Promise<void> => {
  console.log("registerUser is called");
  const { username, email, password } = req.body;

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
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log("New user is",newUser);

    generateToken(res,newUser);
    res.status(201).json({ message: "User registered successfully" });
    return;
  } catch (error) {
    console.error("Error in creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User Login
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  try {
    console.log("Loggedin user is called");
    const userExists = (await prisma.user.findUnique({
      where: { email },
    })) as User | null;

    if (!userExists) {
      res.status(404).json({ message: "User doesn't exist" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    console.log("Password is",isPasswordValid);

    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid password" });
      return;
    }

    console.log("Userexists after loggedin is",userExists);



    generateToken(res, userExists);
    res.status(200).json({ message: "User logged in successfully" });
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
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const { username, profilePic, email } = user;

    // Add update logic if needed
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error in updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
