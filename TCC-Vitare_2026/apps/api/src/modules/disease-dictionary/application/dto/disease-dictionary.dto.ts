export interface SearchDiseaseQuery {
  query?: string;
}

export interface FindDiseaseByIdQuery {
  id: string;
}

export interface DiseaseSearchResult {
  id: string;
  code: string;
  name: string;
  groupName: string | null;
}