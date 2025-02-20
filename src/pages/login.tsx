import Link from "next/link";
import { useRouter } from "next/router";
import { EyeIcon } from "@heroicons/react/24/outline";
import { Logo } from "@/components/Logo";

export default function Login() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-20">
        <Link href="/" className="inline-block mb-12">
          <Logo textColor="text-gray-900" />
        </Link>

        <h1 className="text-[2.5rem] font-bold text-[#1E293B] mb-12">
          Bem-vindo de volta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-[#0066FF] mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              required
            />
            <div className="text-xs text-red-500 mt-1">Obrigatório</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-[#0066FF]">Senha</label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#0066FF] hover:text-blue-700"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <EyeIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-red-500 mt-1">Obrigatório</div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-[#0066FF] border-gray-300 rounded focus:ring-[#0066FF]"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Lembrar de mim
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-[#00E6CA] to-[#00A3FF] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Entrar
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              With Google
            </button>

            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="black">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              Sign in with Apple
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="text-[#0066FF] hover:text-blue-700 font-medium"
          >
            Comece agora
          </Link>
        </p>
      </div>

      {/* Lado Direito - Hero */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#00E6CA] to-[#00A3FF] p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/wave-pattern.svg')] opacity-10"></div>
        <div className="h-full flex flex-col justify-between relative">
          <div></div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Contabilidade com IA para simplificar suas finanças
            </h2>
            <p className="text-lg text-white/90">
              Tudo que você precisa para gerenciar seu negócio de qualquer lugar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
