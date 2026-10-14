/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { VitareLogo } from "../../../../components/vitare-logo";
import { useAuth } from "../../../../src/context/use-auth";

export default function GoogleCallbackPage() {
  const { completeGoogleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasStarted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const code = new URLSearchParams(location.search).get("code");

    if (!code) {
      setError("Não foi poss�vel concluir o login com o Google.");
      return;
    }

    void (async () => {
      try {
        await completeGoogleLogin(code);
        navigate("/completar-cadastro", { replace: true });
      } catch {
        setError(
          "O código de autenticação do Google é inválido ou já expirou. Tente novamente.",
        );
      }
    })();
  }, [completeGoogleLogin, location.search, navigate]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm text-center">
        <VitareLogo className="mx-auto mb-6 h-16 w-16 object-contain" />

        <h1 className="text-2xl font-bold text-gray-900">Vitare</h1>

        {error ? (
          <>
            <p className="mt-3 text-sm text-red-600">{error}</p>
            <Link
              to="/login"
              className="mt-6 inline-block font-medium text-[#52AF7A] underline underline-offset-4"
            >
              Voltar para o login
            </Link>
          </>
        ) : (
          <p className="mt-3 text-sm text-gray-500">
            Concluindo seu login com o Google...
          </p>
        )}
      </div>
    </div>
  );
}