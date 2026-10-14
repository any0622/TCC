/**
 * Validação de variáveis de ambiente obrigatórias no boot da aplicação —
 * falha rápida (fail-fast) em vez de erro tardio e obscuro na primeira
 * requisição que precisar de uma env ausente (ex.: JWT_ACCESS_SECRET
 * undefined só explodindo no primeiro login).
 *
 * Mantém chaves FLAT (JWT_ACCESS_SECRET, não jwt.accessSecret) para ser
 * compat�vel sem alterações com todo o código já constru�do, que chama
 * config.get<string>('JWT_ACCESS_SECRET') diretamente.
 */

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_ACCESS_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'RESEND_API_KEY',
] as const;

export default () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`,
    );
  }

  return {
    PORT: process.env.PORT ?? '3000',
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    APP_URL: process.env.APP_URL ?? 'http://localhost:5173',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MAIL_FROM: process.env.MAIL_FROM ?? 'Vitare <onboarding@resend.dev>',

    REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_TLS: process.env.REDIS_TLS === 'true',
    REDIS_KEY_PREFIX: process.env.REDIS_KEY_PREFIX ?? 'vitare:',
    REDIS_CONNECT_TIMEOUT: parseInt(
      process.env.REDIS_CONNECT_TIMEOUT ?? '5000',
      10,
    ),
    REDIS_COMMAND_TIMEOUT: parseInt(
      process.env.REDIS_COMMAND_TIMEOUT ?? '5000',
      10,
    ),
  };
};
