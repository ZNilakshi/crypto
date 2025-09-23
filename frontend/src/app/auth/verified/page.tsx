"use client";
import Link from "next/link";

export default function VerifiedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold text-green-400">
          ✅ Your email has been verified
        </h2>
        <p className="text-gray-300">
          You can now sign in with your new account.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-blue-500 px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
