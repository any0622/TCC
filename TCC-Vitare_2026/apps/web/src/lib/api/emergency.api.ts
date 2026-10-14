import { apiClient } from "./client";

export const emergencyApi = {
  trigger: (data: { latitude?: number; longitude?: number }) =>
    apiClient.post("/emergency/trigger", data),
};