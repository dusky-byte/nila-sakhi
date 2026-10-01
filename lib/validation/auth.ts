import { z } from "zod";
export const credentials = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});
export const signupSchema = credentials.extend({ name: z.string().trim().min(1, "Enter your name.").max(80) });
export const otpSchema = z.object({
  email: z.string().trim().email(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});
export const resetSchema = otpSchema.extend({ password: credentials.shape.password });
