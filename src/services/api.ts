const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  auth: {
    login: async (email: string, password?: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return response.json();
    },
    register: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    forgotPassword: async (email: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return response.json();
    },
    resetPassword: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onboarding: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
  user: {
    get: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/user/${id}`);
      return response.json();
    },
    update: async (id: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/user/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
  metrics: {
    get: async (userId: number) => {
      const response = await fetch(`${API_BASE_URL}/metrics/${userId}`);
      return response.json();
    },
    log: async (userId: number, type: string, value: number) => {
      const response = await fetch(`${API_BASE_URL}/metrics/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, value }),
      });
      return response.json();
    },
  },
  visionLogs: {
    getAll: async (userId: number) => {
      const response = await fetch(`${API_BASE_URL}/vision-logs/${userId}`);
      return response.json();
    },
    create: async (data: any) => {
      const response = await fetch(`${API_BASE_URL}/vision-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    delete: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/vision-logs/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  },
  workouts: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/workouts`);
      return response.json();
    },
    getConsultations: async () => {
      const response = await fetch(`${API_BASE_URL}/workouts/consultations`);
      return response.json();
    },
  },
};
