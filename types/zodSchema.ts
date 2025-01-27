import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  username: z
    .string()
    .max(10, "Username must not exceed 50 characters")
    .nullable(),
  email: z
    .string()
    .email("Email must be valid")
    .max(15, "Email must not exceed 15 characters"),

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
