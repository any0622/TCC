// components/emergency-fab.tsx
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ShimmerButton } from "../components/ui/shimmer-button";
import { emergencyApi } from "../src/lib/api/emergency.api";
import { getCurrentLocation, GeolocationError } from "../src/lib/api/geolocation";
import { cn } from "../lib/utils";
import { toast } from "../hooks/use-toast";

interface EmergencyFabProps {
  size?: "default" | "lg";
}

const SIZE_CLASSES = {
  default: "h-20 w-20",
  lg: "h-28 w-28",
};

const ICON_SIZE_CLASSES = {
  default: "h-6 w-6",
  lg: "h-10 w-10",
};

export function EmergencyFab({ size = "default" }: EmergencyFabProps) {
  const [isTriggering, setIsTriggering] = useState(false);

  async function handleTrigger() {
    setIsTriggering(true);

    try {
      let coordinates: { latitude?: number; longitude?: number } = {};

      try {
        const position = await getCurrentLocation({
          timeoutMs: 15_000,
          maximumAgeMs: 0,
        });

        const { latitude, longitude } = position.coords;

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          throw new GeolocationError(
            "UNKNOWN",
            "O navegador retornou coordenadas inválidas.",
          );
        }

        coordinates = { latitude, longitude };
      } catch (error) {
        const message =
          error instanceof GeolocationError
            ? error.message
            : "Não foi poss�vel obter a localização do dispositivo.";

        console.error("Falha ao obter localização para emergência:", error);

        const continueWithoutLocation = window.confirm(
          `${message}\n\n` +
            "A emergência pode ser acionada mesmo sem coordenadas, mas o mapa não ficará dispon�vel para a equipe de atendimento.\n\n" +
            "Deseja continuar com a emergência?",
        );

        if (!continueWithoutLocation) {
          toast({
            title: "Emergência não acionada",
            description:
              "A localização não foi obtida e o acionamento foi cancelado.",
            variant: "destructive",
          });
          return;
        }
      }

      await emergencyApi.trigger(coordinates);

      toast({
        title: "Emergência acionada",
        description:
          coordinates.latitude !== undefined &&
          coordinates.longitude !== undefined
            ? "Sua localização foi enviada para a equipe de atendimento."
            : "A emergência foi enviada, mas a localização não estava dispon�vel.",
      });

      window.location.href = "tel:192";
    } catch (error) {
      console.error("Falha ao acionar emergência:", error);
      toast({
        title: "Falha ao acionar emergência",
        description:
          "Não foi poss�vel enviar o acionamento. Tente novamente ou ligue para 192 diretamente.",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ShimmerButton
        background="#A20202"
        shimmerColor="#ff6b6b"
        borderRadius="100%"
        shimmerDuration="2s"
        className={cn(
          SIZE_CLASSES[size],
          "p-0 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-60",
        )}
        aria-label="Emergência"
        onClick={handleTrigger}
        disabled={isTriggering}
      >
        <AlertTriangle className={ICON_SIZE_CLASSES[size]} />
      </ShimmerButton>
    </div>
  );
}