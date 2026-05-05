import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "spi_api_url";

/**
 * Resolve a URL do servidor seguindo esta prioridade:
 *   1. Override salvo pelo admin em Configurações (AsyncStorage)
 *   2. Variável de ambiente definida no build (EXPO_PUBLIC_API_URL)
 *   3. null — sem servidor configurado, modo offline
 */
export async function resolveApiUrl(): Promise<string | null> {
  const override = await AsyncStorage.getItem(STORAGE_KEY);
  if (override?.trim()) return override.trim().replace(/\/+$/, "");

  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl?.trim()) return envUrl.trim().replace(/\/+$/, "");

  return null;
}

/**
 * Retorna a URL do ambiente de build (sem consultar AsyncStorage).
 * Útil para exibir como placeholder na tela de Configurações.
 */
export function getEnvApiUrl(): string {
  return (process.env.EXPO_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "");
}

export { STORAGE_KEY as API_URL_STORAGE_KEY };
