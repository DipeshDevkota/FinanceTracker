import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
const prisma = new PrismaClient();

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("GETALLUSERS IS CALLED!");

    const user = await prisma.user.findMany({
      select: {
        username: true,
        profilePic: true,
      },
    });
    console.log("User is", user);
    if (!user) {
      res.status(400).json({ message: "There are no users existing!" });
    }
    res.status(400).json({ message: "All users fetched successfully!", user });
    return;
  } catch (error) {
    console.log("Server error while getting all users", error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  console.log("User id from params is:", req.params);
  const type = typeof userId;
  console.log("Type of userId is", type);

  try {
    console.log("Process for finding the user By Id called");
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
      select: {
        username: true,
        profilePic: true,
      },
    });
    console.log("User is:", user);

    if (!user) {
      res.status(404).json({ message: "User with this id doesn't exist" });
      return;
    }

    res.status(200).json({ message: "User with this id exists", user });
    return;
  } catch (error) {
    console.log("Server error while fetching user by Id", error);
    res.status(500).json({ message: "Server error while fetching user by Id" });
  }
};
