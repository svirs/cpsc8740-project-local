import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-center">Log In</h2>
      <form className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text dark:text-white">Username</span>
          </label>
          <input
            type="text"
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
            placeholder="Password"
            className="input input-bordered w-full"
          />
        </div>
        <div className="form-control mt-6">
          <button className="btn btn-primary w-full">Log In</button>
        </div>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-500">
          Sign Up
        </Link>
      </p>
    </>
  );
}
