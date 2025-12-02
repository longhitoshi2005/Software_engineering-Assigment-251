export type Integration = {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'pending' | string;
  lastSync: string;
};
