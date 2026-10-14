import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource-variable/geist/index.css";
import "leaflet/dist/leaflet.css";
import "../app/globals.css";
import App from "./App";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/monitoramento">
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);