import { Metadata } from "next";
import SignUpForm from "./components/SignUpForm";

export const metadata: Metadata = {
  title: "Queen of Aroma | Sign Up",
  description: "Create your account",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUpForm />
    </div>
  );
}
