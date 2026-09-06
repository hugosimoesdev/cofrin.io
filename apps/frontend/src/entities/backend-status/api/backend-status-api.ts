import { apiClient } from '@/shared/api';

export interface Greeting {
  message: string;
}

export async function fetchGreeting(): Promise<Greeting> {
  const response = await apiClient.get<Greeting>('/api/hello');

  return response.data;
}
