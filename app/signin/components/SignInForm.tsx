"use client";

import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const SignInForm = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [passwordType, setPasswordType] = useState<string>("password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  useEffect(() => {
    if (user && !isLoading && !isSubmitting) {
      const timer = setTimeout(() => {
        if (user.role === "Admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, isSubmitting, router]);

  const handlePasswordType = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await login(email, password);
      if (!result.success) {
        setLocalError(result.error || "Invalid email or password");
        setIsSubmitting(false);
      }
      setIsSubmitting(false);
    } catch (err) {
      console.error("Login error:", err);
      setLocalError("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          <Image
            src="https://res.cloudinary.com/dhnyfifkc/image/upload/v1784716087/Queen-of-aroma-logo_j9alhn.png"
            alt="queen-of-aroma-logo"
            loading="eager"
            priority={true}
            width={70}
            height={70}
          />
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-center mb-2">Sign In</h1>
      <p className="text-center text-gray-600 mb-8">Welcome back!</p>

      {displayError && (
        <div
          className="mb-4 p-3 bg-red-100 text-red-700 rounded-md"
          role="alert"
        >
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            disabled={isSubmitting || isLoading}
            autoComplete="on"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={passwordType}
              id="password"
              name="password"
              placeholder="Enter your password"
              disabled={isSubmitting || isLoading}
              autoComplete="on"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black pr-10"
            />
            <button
              type="button"
              onClick={handlePasswordType}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={
                passwordType === "password" ? "Show password" : "Hide password"
              }
            >
              {passwordType === "password" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full py-2 px-4 bg-black text-white font-semibold rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting || isLoading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-black hover:underline">
            Sign Up
          </a>
        </p>
        <Link
          href={"/products"}
          className="flex flex-row justify-center gap-2 text-black text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 21 21"
            height="21"
            width="21"
          >
            <g id="Arrow-Top-Right">
              <path
                id="Union"
                fill="#000000"
                d="M17.243625 7.256243749999999c0.34168750000000003 0.34169625000000003 0.34168750000000003 0.89558875 0 1.2373025000000002l-4.8125 4.812491250000001 -1.23725 -1.2373375 3.3187875 -3.3188050000000002H6.125V17.4999125H4.375V7.8748949999999995c0.000035 -0.452935 0.34419 -0.82581625 0.7852775000000001 -0.87073L5.25 6.999895h9.262662500000001L11.193874999999998 3.6810462499999996l1.23725 -1.2373025000000002z"
                stroke-width="0.875"
              ></path>
            </g>
          </svg>
          <span className="underline hover:text-sky-400 hover:underline-sky-400 transition delay-150 duration-300 ease-in-out">
            Go back to shopping.
          </span>
        </Link>
      </form>
    </div>
  );
};

export default SignInForm;
