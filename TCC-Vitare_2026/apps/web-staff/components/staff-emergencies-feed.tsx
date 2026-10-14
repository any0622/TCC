import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Pill,
  AlertCircle,
  Phone,
  Droplets,
  User,
  MapPinOff,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { LocationMap } from "./location-map";
import { staffEmergenciesApi } from "../src/lib/api/staff-emergencies.api";
import type { EmergencyFeedItem } from "../src/lib/types/api.types";

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("pt-BR");
}

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return "Idade não informada";
  const years = Math.floor(
    (Date.now() - new Date(birthDate).getTime()) /
      (365.25 * 24 * 60 * 60 * 1000),
  );
  return `${years} anos`;
}

function formatCpf(value: string | null | undefined): string {
  if (!value) return "CPF não informado";

  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function StaffEmergenciesFeed() {
  const {
    data: events,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["staff-emergencies"],
    queryFn: async () => (await staffEmergenciesApi.findRecent(50)).data,
    refetchInterval: 15_000,
  });

  if (isLoading)
    return <p className="text-gray-500 text-sm p-6">Carregando chamados...</p>;
  if (isError)
    return (
      <p className="text-red-600 text-sm p-6">
        Não foi poss�vel carregar o feed de emergências.
      </p>
    );

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <AlertTriangle className="h-10 w-10 mb-3 opacity-40 text-gray-400" />
        <p className="text-sm font-medium text-gray-500">
          Nenhum chamado de emergência registrado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 max-w-5xl mx-auto">
      {events.map((event: EmergencyFeedItem) => {
        const { patient, conditions, medications, contacts, allergies } =
          event.patientSnapshot;
        const primaryContact = contacts.find((c) => c.isPrimary) ?? contacts[0];

        return (
          <Card
            key={event.id}
            className={`border transition-colors shadow-sm ${
              event.status === "TRIGGERED"
                ? "border-red-300 bg-red-50/40"
                : "border-gray-200 bg-white"
            }`}
          >
            <CardContent className="p-4 md:p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {patient.fullName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-0.5 text-sm text-gray-500">
                      <span>{calculateAge(patient.birthDate)}</span>
                      <span>CPF: {formatCpf(patient.cpf)}</span>
                      {patient.bloodType && (
                        <span className="flex items-center gap-1 font-medium text-red-600">
                          <Droplets className="h-3.5 w-3.5" />
                          {patient.bloodType}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge
                  className={
                    event.status === "TRIGGERED"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                  }
                  variant={event.status === "TRIGGERED" ? "default" : "outline"}
                >
                  {event.status === "TRIGGERED"
                    ? "Ativo"
                    : event.status === "NOTIFIED"
                      ? "Notificado"
                      : "Resolvido"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                Acionado em {formatTimestamp(event.triggeredAt)}
              </div>

              {/* Seção de Localização (Tratamento para quando não há GPS) */}
              <div className="pt-2">
                {event.latitude && event.longitude ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <MapPin className="h-4 w-4 text-red-600 shrink-0" />
                      Localização da Emergência ({event.latitude},{" "}
                      {event.longitude})
                    </div>
                    <div className="w-full">
                      <LocationMap
                        latitude={Number(event.latitude)}
                        longitude={Number(event.longitude)}
                        patientName={patient.fullName}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500 italic bg-gray-50 p-3 rounded-md border border-gray-100">
                    <MapPinOff className="h-4 w-4 text-gray-400 shrink-0" />
                    As coordenadas de GPS não foram capturadas no momento deste
                    acionamento.
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-gray-100">
                {allergies.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-red-600 font-semibold flex items-center gap-1 mb-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Alergias
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {allergies.map((a, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border-red-200 bg-red-50 text-red-700 text-xs font-medium"
                        >
                          {a.name}
                          {a.severity ? ` · ${a.severity}` : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {medications.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-700 font-semibold flex items-center gap-1 mb-2">
                      <Pill className="h-3.5 w-3.5" />
                      Medicamentos em uso
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {medications.map((m, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium"
                        >
                          {m.name} {m.dosage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {conditions.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                    Condições crônicas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {conditions.map((c, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-gray-200 bg-gray-50 text-gray-700 text-xs"
                      >
                        {c.name} ({c.code})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {primaryContact && (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200/80 rounded-lg p-3 mt-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {primaryContact.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Contato de emergência
                    </p>
                  </div>

                  <a
                    href={`tel:${primaryContact.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <Phone className="h-4 w-4" />
                    Ligar
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}