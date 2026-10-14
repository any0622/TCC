import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Heart } from "lucide-react"
import { Link } from "react-router-dom"


function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "")
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    e.target.value = formatted
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Logo Vitare */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#52AF7A]">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Vitare</h1>
        <p className="text-sm text-gray-500">Sua saúde em suas mãos</p>
      </div>

      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Criar uma conta</h2>
            <p className="text-sm text-gray-500 text-center">
              Preencha suas informações para criar sua conta
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-700">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Maria da Silva"
                required
                className="border-gray-300 focus:border-[#52AF7A] focus:ring-[#52AF7A]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-700">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="border-gray-300 focus:border-[#52AF7A] focus:ring-[#52AF7A]"
              />
              <p className="text-xs text-gray-500">
                Usaremos este e-mail para entrar em contato com você.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cpf" className="text-gray-700">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                onChange={handleCPFChange}
                required
                className="border-gray-300 focus:border-[#52AF7A] focus:ring-[#52AF7A]"
              />
              <p className="text-xs text-gray-500">
                Necessário para identificação no sistema de saúde.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-gray-700">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                className="border-gray-300 focus:border-[#52AF7A] focus:ring-[#52AF7A]"
              />
              <p className="text-xs text-gray-500">
                Deve ter no m�nimo 8 caracteres.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                className="border-gray-300 focus:border-[#52AF7A] focus:ring-[#52AF7A]"
              />
              <p className="text-xs text-gray-500">
                Por favor, confirme sua senha.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#52AF7A] hover:bg-[#469968] text-white font-medium"
            >
              Criar conta
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
  )
}