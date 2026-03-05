import { getData } from "@/lib/getData";
import { Info } from "lucide-react";
import React from "react";
import axios from "axios";

type VerifyMailPageProps = {
  searchParams: Promise<{ userId?: string }>;
};

export default async function VerifyMail({ searchParams }: VerifyMailPageProps) {
  const { userId } = await searchParams;

  if (!userId) {
    return (
      <div className="max-w-2xl mx-auto min-h-screen mt-8">
        <div
          className="p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
          role="alert"
        >
          <div className="flex items-center">
            <Info className="flex-shrink-0 w-4 h-4 me-2" />
            <span className="sr-only">Info</span>
            <h3 className="text-lg font-medium">Invalid verification link</h3>
          </div>
          <div className="mt-2 mb-4 text-sm">
            The verification link is missing a user id. Please register again or
            request a new verification email.
          </div>
        </div>
      </div>
    );
  }

  let email = "";
  try {
    const user = await getData<{ email: string }>(`users/${userId}`);
    email = user.email;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return (
        <div className="max-w-2xl mx-auto min-h-screen mt-8">
          <div
            className="p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
            role="alert"
          >
            <div className="flex items-center">
              <Info className="flex-shrink-0 w-4 h-4 me-2" />
              <span className="sr-only">Info</span>
              <h3 className="text-lg font-medium">User not found</h3>
            </div>
            <div className="mt-2 mb-4 text-sm">
              This verification link is no longer valid. Please register again.
            </div>
          </div>
        </div>
      );
    }

    throw error;
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen mt-8">
      <div
        id="alert-additional-content-1"
        className="p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
        role="alert"
      >
        <div className="flex items-center">
          <Info className="flex-shrink-0 w-4 h-4 me-2" />
          <span className="sr-only">Info</span>
          <h3 className="text-lg font-medium">
            Email Sent - Verify Your Account
          </h3>
        </div>
        <div className="mt-2 mb-4 text-sm">
          Thank you for creating an account with us. We have sent a verification
          email to <span className="font-bold">{email}</span>. Please check your
          inbox and click the link to complete your onboarding process.
          <button className="mx-4 text-white">Change email</button>
        </div>
      </div>
    </div>
  );
}
