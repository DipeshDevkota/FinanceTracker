import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  username: z
    .string()
    .max(50, "Username must not exceed 50 characters")  // Updated to 50
    .nullable(),
  email: z
    .string()
    .email("Email must be valid")
    .max(255, "Email must not exceed 255 characters"),  // Increased max length to 255 for emails

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  profilePic: z.string().url("Profile picture must be a valid URL").nullable(),
});

export type UserValidationType = z.infer<typeof UserSchema>;

export const TransactionSchema = z.object({
  id: z.number().int().positive(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
  quantity: z.number().int().positive(),
  brand: z.string().min(1, "Brand must not be empty"),
  dateOfManufacture: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of manufacture must be in YYYY-MM-DD format"),
  dateOfExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of expiry must be in YYYY-MM-DD format"),
  description: z.string().max(200, "Description must not exceed 200 characters!"), // Fixed message
  TransactionPic: z.string().url("Transaction picture must be a valid URL"),  // Updated message
  category: z.string().min(1, "Category must not be empty"),
});

export type TransactionValidationType = z.infer<typeof TransactionSchema>;
