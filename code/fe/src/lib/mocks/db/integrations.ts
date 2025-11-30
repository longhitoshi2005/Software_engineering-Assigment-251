import type { Integration } from "@/types/integrations";

export const INTEGRATIONS: Integration[] = [
  {
    id: "inte-1",
    name: "Google Calendar",
    description: "Sync sessions with Google Calendar",
    status: "connected",
    lastSync: "2024-01-15 08:00:00"
  },
  {
    id: "inte-2",
    name: "Zoom",
    description: "Create and manage video sessions",
    status: "connected",
    lastSync: "2024-01-15 09:30:00"
  },
  {
    id: "inte-3",
    name: "Slack",
    description: "Send notifications to coordinators",
    status: "disconnected",
    lastSync: "Never"
  },
  {
    id: "inte-4",
    name: "Microsoft Teams",
    description: "Integration with Teams for meetings",
    status: "pending",
    lastSync: "Setup required"
  },
];
