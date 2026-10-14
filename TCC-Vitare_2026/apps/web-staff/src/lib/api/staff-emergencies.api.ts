import { staffApiClient } from "./staff-client.api";
import type { EmergencyFeedItem } from "../types/api.types";

export const staffEmergenciesApi = {
  findRecent: (limit = 50) =>
    staffApiClient.get<EmergencyFeedItem[]>("/staff/emergencies", {
      params: { limit },
    }),
};