import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Extend the Request interface to include a `user` field
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {  // Ensuring that the return type is `void`
  try {
    const token = req.cookies.token; // Access the token from cookies
    console.log("Token is:", token);

    if (!token) {
      res.status(401).json({ message: "Unauthorized access" });
      return; // Ensure the function exits after response
    }

    // Decode the token
    const decodedToken = jwt.verify(token, "dipesh78$") as jwt.JwtPayload;
    console.log("Decoded token is:", decodedToken);

    // Extract `_id` from the decoded token
    const { _id } = decodedToken as { _id: string };

    if (!_id) {
      res.status(401).json({ message: "Unauthorized access" });
      return; // Ensure the function exits after response
    }

    // Find the user in the database by ID
    const user = await prisma.user.findUnique({ where: { id: parseInt(_id, 10) } });
    if (!user) {
      res.status(401).json({ message: "Unauthorized access" });
      return; // Ensure the function exits after response
    }

    // Attach the user object to the request
    req.user = user;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in authUser middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
