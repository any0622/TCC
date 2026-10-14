export interface CreateForbiddenMedicationCommand {
  userId: string;
  medicationsDictionaryId: string;
  reason: string;
}

export interface RemoveForbiddenMedicationCommand {
  id: string;
  userId: string;
}

export interface GetForbiddenMedicationsQuery {
  userId: string;
}

export interface ForbiddenMedicationResult {
  id: string;
  userId: string;
  medicationsDictionaryId: string;
  reason: string;
  createdAt: Date;
  medication: {
    id: string;
    nome: string;
    laboratorio: string;
    substancias: string[];
    apresentacoes: string[];
    tarjas: string[];
  };
}