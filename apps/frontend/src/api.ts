export interface Greeting {
  message: string;
}

export async function fetchGreeting(): Promise<Greeting> {
  const response = await fetch('/api/hello');

  if (!response.ok) {
    throw new Error(`Backend request failed with ${response.status}`);
  }

  return response.json() as Promise<Greeting>;
}
