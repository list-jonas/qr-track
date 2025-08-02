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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      return { error: (error as { message: string }).message };
    } else {
      return { error: "An unknown error occurred." };
    }
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
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error
    ) {
      return { error: (error as { message: string }).message };
    } else {
      return { error: "An unknown error occurred." };
    }
  }
};
