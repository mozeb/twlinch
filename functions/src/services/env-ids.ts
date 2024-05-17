export interface EnvironmentVariables {
  API_KEY: string;
}

export const getEnv = (): EnvironmentVariables =>
  process.env as unknown as EnvironmentVariables;
