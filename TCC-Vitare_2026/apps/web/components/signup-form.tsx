/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { VitareLogo } from "./vitare-logo";
import { useAuth } from "../src/context/use-auth";
import { authApi } from "../src/lib/api/auth.api";

const ALLOWED_EMAIL_DOMAINS = [
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.com.br",
  "icloud.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
];

const EMAIL_DOMAIN_REGEX = new RegExp(
  `^[^\\s@]+@(${ALLOWED_EMAIL_DOMAINS.map((d) => d.replace(".", "\\.")).join("|")})$`,
  "i",
);

const PASSWORD_COMPLEXITY_REGEX =
  /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\\/\\*\-\\+\\.\\)\\(\\&\\%\\$\\#\\@\\!]).{8})$/;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_DOMAIN_REGEX.test(email.trim())) {
      setError(
        email.trim().toLowerCase().endsWith("@gmail.com")
          ? 'Contas Gmail devem se cadastrar com "Cadastrar com Google", abaixo.'
          : `Use um e-mail de um destes provedores: ${ALLOWED_EMAIL_DOMAINS.join(", ")}.`,
      );
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter no m�nimo 8 caracteres");
      return;
    }

    if (!PASSWORD_COMPLEXITY_REGEX.test(password)) {
      setError("A senha deve conter ao menos uma letra e um número");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      await register(fullName, email, password);
      navigate("/completar-cadastro");
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message[0]
          : (message ?? "Não foi poss�vel criar a conta. Tente novamente."),
      );
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2">
        <VitareLogo className="h-16 w-16 object-contain" />
        <h1 className="text-2xl font-bold text-gray-900">Vitare</h1>
        <p className="text-sm text-gray-500">Sua saúde em suas mãos</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Criar uma conta
            </h2>
            <p className="text-sm text-gray-500 text-center">
              Preencha suas informações para criar sua conta
            </p>
          </div>

          <div className="grid gap-4">
            {error && (
              <p className="text-sm text-red-600 text-center bg-red-50 border border-red-100 rounded-md py-2 px-3">
                {error}
              </p>
            )}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Maria da Silva"
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border-gray-300 focus:border-[#52AF7A] focus:ring-[#52AF7A]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@hotmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:border-[#52AF7A] focus:ring-[#52AF7A]"
              />
              <p className="text-xs text-gray-500">
                Aceitamos Hotmail, Outlook, Yahoo, iCloud, UOL, entre outros.
                Contas Gmail devem usar o botão "Cadastrar com Google" abaixo.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-gray-300 focus:border-[#52AF7A] focus:ring-[#52AF7A] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Máximo de 8 caracteres, com pelo menos uma letra maiúscula, uma
                letra minúscula, um número e um caractere especial
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-gray-300 focus:border-[#52AF7A] focus:ring-[#52AF7A] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={
                    showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Por favor, confirme sua senha.
              </p>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#52AF7A] hover:bg-[#469968] text-white font-medium disabled:opacity-70"
            >
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">
                  Ou continue com
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.href = authApi.googleLoginUrl();
              }}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Cadastrar com Google
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="font-medium text-[#52AF7A] hover:text-[#469968] underline underline-offset-4"
            >
              Entrar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}