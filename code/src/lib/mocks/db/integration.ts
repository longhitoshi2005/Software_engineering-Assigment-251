// lib/mocks/db/integration.ts

export type Status = "Online" | "Degraded" | "Offline";

export interface Integration {
  name: string;
  status: Status;
  lastSync: string;
}

export interface IntegrationError {
  at: string;
  service: string;
  message: string;
}

/**
 * MOCK DATABASE — lưu trong RAM
 */

export let integrations: Integration[] = [
  { name: "HCMUT_SSO", status: "Online", lastSync: "2025-11-02 10:05" },
  { name: "DATACORE", status: "Online", lastSync: "2025-11-02 10:03" },
  {
    name: "HCMUT_LIBRARY",
    status: "Degraded",
    lastSync: "2025-11-02 09:58",
  },
];

export let integrationErrors: IntegrationError[] = [
  {
    at: "2025-11-02 09:58",
    service: "HCMUT_LIBRARY",
    message: "403 – access restricted for course resources",
  },
];

/**
 * Helpers
 */
export function updateIntegration(name: string, data: Partial<Integration>) {
  integrations = integrations.map((i) =>
    i.name === name ? { ...i, ...data } : i
  );
}

export function addIntegrationError(err: IntegrationError) {
  integrationErrors.unshift(err);
}

export function clearErrorsFor(service: string) {
  integrationErrors = integrationErrors.filter((e) => e.service !== service);
}
