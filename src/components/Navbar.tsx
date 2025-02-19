import Link from "next/link";
import { Button } from "./Button";
import { useRouter } from "next/router";

export function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-xl z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 bg-clip-text text-transparent">
                Finsfera
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-600 hover:text-primary-500 transition-all"
            >
              Product
            </Link>
            <Link
              href="#fiskl-ai"
              className="text-gray-600 hover:text-primary-500 transition-all"
            >
              Fiskl AI
            </Link>
            <Link
              href="#pricing"
              className="text-gray-600 hover:text-primary-500 transition-all"
            >
              Pricing
            </Link>
            <Link
              href="#accountants"
              className="text-gray-600 hover:text-primary-500 transition-all"
            >
              Accountants
            </Link>
            <Button
              variant="outline"
              className="hover:bg-primary-50"
              onClick={() => router.push("/login")}
            >
              Sign in
            </Button>
            <Button
              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:opacity-90"
              onClick={() => router.push("/login")}
            >
              Start for free
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
