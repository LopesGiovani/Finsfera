import Link from "next/link";
import { useRouter } from "next/router";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Logo } from "@/components/Logo";
import { useState, FormEvent } from "react";
import axios from "axios";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateForm = () => {
    let isValid = true;

    // Validação do nome
    if (!name) {
      setNameError("Nome é obrigatório");
      isValid = false;
    } else {
      setNameError("");
    }

    // Validação do email
    if (!email) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email inválido");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Validação da senha
    if (!password) {
      setPasswordError("Senha é obrigatória");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // Validação da confirmação de senha
    if (!confirmPassword) {
      setConfirmPasswordError("Confirmação de senha é obrigatória");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Limpa o erro geral
    setError("");

    // Valida o formulário
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Envia a requisição para a API
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      // Se o registro for bem-sucedido, redireciona para o dashboard
      if (response.data.success) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      // Exibe a mensagem de erro
      setError(
        err.response?.data?.message ||
          "Ocorreu um erro durante o registro. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-20">
        <Link href="/" className="inline-block mb-12">
          <Logo textColor="text-gray-900" />
        </Link>

        <h1 className="text-[2.5rem] font-bold text-[#1E293B] mb-12">
          Crie sua conta
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-[#0066FF] mb-2">
              Nome completo
            </label>
            <input
              type="text"
              className={`w-full px-4 py-3 rounded-lg border ${
                nameError ? "border-red-500" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-[#0066FF]`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {nameError && (
              <div className="text-xs text-red-500 mt-1">{nameError}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#0066FF] mb-2">Email</label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-lg border ${
                emailError ? "border-red-500" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-[#0066FF]`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {emailError && (
              <div className="text-xs text-red-500 mt-1">{emailError}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#0066FF] mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 rounded-lg border ${
                  passwordError ? "border-red-500" : "border-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-[#0066FF]`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <div className="text-xs text-red-500 mt-1">{passwordError}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#0066FF] mb-2">
              Confirmar senha
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className={`w-full px-4 py-3 rounded-lg border ${
                confirmPasswordError ? "border-red-500" : "border-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-[#0066FF]`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPasswordError && (
              <div className="text-xs text-red-500 mt-1">
                {confirmPasswordError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-gradient-to-r from-[#00E6CA] to-[#00A3FF] text-white rounded-lg ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
            } transition-opacity font-medium flex justify-center items-center`}
          >
            {loading ? "Registrando..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-[#0066FF] hover:text-blue-700 font-medium"
          >
            Entrar
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
