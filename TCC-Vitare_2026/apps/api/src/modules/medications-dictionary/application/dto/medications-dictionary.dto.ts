export interface SearchMedicationQuery {
  query?: string;
}

export interface FindMedicationByIdQuery {
  id: string;
}

export interface MedicationSearchResult {
  id: string;
  nome: string;
  laboratorio: string;
  substancias: string[];
  apresentacoes: string[];
  tarjas: string[];
}