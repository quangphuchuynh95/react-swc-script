import dotenv from "dotenv";
import path from "path";

/**
 * Load .env files into process.env corresponding to mode
 * @param mode
 */
export function loadEnvFiles(mode = "production") {
  for (const envFile of [
    ".env",
    `.env.${mode}`,
    `.env.local`,
    `.env.${mode}.local`,
  ]) {
    dotenv.config({
      override: true,
      path: path.join(process.cwd(), envFile),
    });
  }
}
