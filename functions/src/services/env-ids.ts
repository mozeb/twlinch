export interface EnvironmentVariables {
  API_KEY: string;
  WOOCOMMERCE_KEY: string;
  WOOCOMMERCE_SECRET: string;
}

export const getEnv = (): EnvironmentVariables =>
  process.env as unknown as EnvironmentVariables;
