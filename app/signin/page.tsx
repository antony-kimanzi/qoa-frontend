import { Metadata } from "next";
import SignInForm from "./components/SignInForm";

export const metadata: Metadata = {
  title: "Queen of Aroma | Sign In",
  description: "Sign in to your account",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignInForm />
    </div>
  );
}
