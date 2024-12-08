"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignupPage() {
  const searchParams = useSearchParams();
  const failed = searchParams.get("failed");

  return (
    <>
      <h2 className="text-2xl font-bold text-center">Sign Up</h2>
      {failed && (
        <p className="text-center text-red-500">
          Sign up failed. Please try again.
        </p>
      )}
      <form
        className="space-y-4"
        action="/api/user"
        method="post"
      >
        <div className="form-control">
          <label className="label">
            <span className="label-text dark:text-white">Username</span>
          </label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text dark:text-white">Password</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control mt-6">
          <button className="btn btn-primary w-full">Sign Up</button>
        </div>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Have an account?{" "}
        <Link href="/login" className="text-blue-500">
          Log in
        </Link>
      </p>
    </>
  );
}
const Signup = () => (
  <Suspense>
    <SignupPage />
  </Suspense>
);

export default Signup;
