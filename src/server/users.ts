"use server";

import { auth } from "@/lib/auth";

export const signInEmail = async (email: string, password: string) => {
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });
    return { success: true, message: "Login successful!" };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const signUpEmail = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });
    return { success: true, message: "Signup successful!" };
  } catch (error: any) {
    return { error: error.message };
  }
};
