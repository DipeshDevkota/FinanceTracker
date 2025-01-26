import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Extend the Request interface to include a `user` field
interface AuthenticatedRequest extends Request {
  user?: any;
  cookie?:any;
}

export const authUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Ensuring that the return type is `void`
  try {
    console.log("AUthmiddleware called");
    console.log("Request is:",req);
    const cookie = req?.cookies;
    console.log("Cookies is:", cookie);
    const token = req.cookies.token;
    console.log("Token  inauthmiddleware is ", token); // Access the token from cookies

    if (!token) {
      res.status(401).json({ message: "Unauthorized access" });
      return; // Ensure the function exits after response
    }

    // Decode the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN as string) as jwt.JwtPayload;
    console.log("Decoded token is:", decodedToken);

    // Extract `_id` from the decoded token
    const { id } = decodedToken as { id: string };

    if (!id) {
      res.status(401).json({ message: "Unauthorized access" });
      return; // Ensure the function exits after response
    }

    // Find the user in the database by ID
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!user) {
      res.status(401).json({ message: "Unauthorized access" });
      return; // Ensure the function exits after response
    }

    // Attach the user object to the request
    req.user = user;
    console.log("User in auth middleware is:",req.user);

    // Call the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in authUser middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
