import z from "zod";

export const signupSchema = z.object({
  email: z.email(),
  name: z.string(),
  phone: z.string(),
  password: z.string(),
});

export type SignupT = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

export type LoginT = z.infer<typeof loginSchema>;
