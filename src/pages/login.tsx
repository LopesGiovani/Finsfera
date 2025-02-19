import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const handleSocialLogin = (provider: string) => {
    // Aqui você adicionaria a lógica de autenticação social
    // Por enquanto, vamos apenas redirecionar para o dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-20">
        <Link href="/" className="inline-block mb-12">
          <Image
            src="/logo.svg"
            alt="Finsfera"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        <h1 className="text-4xl text-gray-900 font-semibold mb-8">
          Welcome back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm text-primary-500">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-sm text-primary-500"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Log In
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={() => handleSocialLogin("google")}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5 mr-3"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23.766 12.277c0-.844-.076-1.654-.218-2.434H12.24v4.606h6.482c-.28 1.5-1.13 2.77-2.406 3.623v3.01h3.897c2.28-2.1 3.593-5.19 3.593-8.805z"
                  fill="#4285F4"
                />
                <path
                  d="M12.24 24c3.259 0 5.987-1.077 7.983-2.918l-3.897-3.01c-1.08.724-2.463 1.152-4.086 1.152-3.142 0-5.804-2.123-6.752-4.973H1.49v3.11C3.475 21.333 7.553 24 12.24 24z"
                  fill="#34A853"
                />
                <path
                  d="M5.488 14.25c-.242-.723-.38-1.496-.38-2.29 0-.795.138-1.568.38-2.291V6.558H1.49A11.944 11.944 0 000 11.96c0 1.936.47 3.77 1.49 5.392l3.998-3.102z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.24 4.756c1.77 0 3.361.608 4.61 1.804l3.458-3.458C18.247 1.19 15.519 0 12.24 0 7.553 0 3.475 2.667 1.49 6.558l3.998 3.11c.948-2.85 3.61-4.973 6.752-4.973z"
                  fill="#EA4335"
                />
              </svg>
              With Google
            </button>
            <button
              onClick={() => handleSocialLogin("apple")}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <svg
                className="w-5 h-5 mr-3"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Sign in with Apple
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Get started
          </Link>
        </p>
      </div>

      {/* Lado Direito - Hero */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-500 to-secondary-500 p-12">
        <div className="h-full flex flex-col justify-between text-white">
          <div></div>
          <div>
            <h2 className="text-4xl font-bold mb-4">
              AI-powered accounting to simplify your finances
            </h2>
            <p className="text-lg opacity-90">
              Everything you'll ever need to manage your business from anywhere
            </p>

            <div className="mt-8 flex space-x-4">
              <Link href="#" className="opacity-90 hover:opacity-100">
                <Image
                  src="/app-store.png"
                  alt="Download on App Store"
                  width={140}
                  height={42}
                />
              </Link>
              <Link href="#" className="opacity-90 hover:opacity-100">
                <Image
                  src="/google-play.png"
                  alt="Get it on Google Play"
                  width={140}
                  height={42}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
