import { z } from "zod";

export const UserSchema = z.object({
  username: z
    .string()
    .max(50, "Username must not exceed 50 characters") // Updated to 50
    .nullable(),
  email: z
    .string()
    .email("Email must be valid")
    .max(255, "Email must not exceed 255 characters"), // Increased max length to 255 for emails

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  profilePic: z
    .string()
    .url("Profile picture must be a valid URL")
    .nullable()
    .optional(),
});

export type UserValidationType = z.infer<typeof UserSchema>;

export const TransactionSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
  quantity: z.number().int().positive(),
  brand: z.string().min(1, "Brand must not be empty"),
  dateOfManufacture: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date of manufacture must be in YYYY-MM-DD format"
    ),
  dateOfExpiry: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date of expiry must be in YYYY-MM-DD format"
    ),
  description: z
    .string()
    .max(200, "Description must not exceed 200 characters!"), // Fixed message
  TransactionPic: z.string().url("Transaction picture must be a valid URL"), // Updated message
  Category: z.string().min(1, "Category must not be empty"),
  budgetId: z.number().int().positive(),
});

export type TransactionValidationType = z.infer<typeof TransactionSchema>;
export const BudgetSchema = z.object({
  id: z.number().int().positive().optional(),
  budgetAllocation: z
    .number()
    .refine((val) => val >= 10, "Budget allocation must not be less than 10$")
    .refine((val) => val <= 1000, "Budget allocation must not be more than 1000$"),
  budgetRemaining: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number")
    .optional(),
  budgetAddition: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number")
    .optional(),
});
export type BudgetValidationSchema = z.infer<typeof BudgetSchema>;



export const BudgetAllocationSchema = z.object({
  id:z.number().int().positive(),
  amount:z.string().
  regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
})

export type BudgetAllocationValidateSchema = z.infer<typeof BudgetAllocationSchema>;


export const BudgetRemainingSchema = z.object({
  id:z.number().int().positive(),
  amount:z.string().
  regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
})

export type BudgetRemainingValidationSchema = z.infer<typeof BudgetRemainingSchema>;


export const BudgetAdditionSchema = z.object({
  id:z.number().int().positive(),
  amount:z.string().
  regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
})
export type BudgetAdditionValidationSchema = z.infer<typeof BudgetAdditionSchema>;






