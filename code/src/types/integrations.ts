export type Integration = {
  id: number;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'pending' | string;
  lastSync: string;
};
