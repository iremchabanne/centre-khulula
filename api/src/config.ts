// Every environment variable the API needs, read in one place.
//
// Reading them here rather than sprinkling process.env through the code means
// a missing variable is caught at startup with a clear message, instead of
// becoming an "undefined" that fails somewhere far away an hour later.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Copy api/.env.example to api/.env and fill it in.`,
    );
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),

  // khulula_app, the restricted account. Migrations keep using DATABASE_URL
  // (khulula_admin) because creating tables needs full rights; the running API
  // does not create tables, so it does not get them.
  databaseUrl: required('DATABASE_URL_APP'),

  redisUrl: required('REDIS_URL'),

  // The secret that signs the session cookie. Required, never has a default:
  // a default secret in a committed file is the same as no secret at all.
  sessionSecret: required('SESSION_SECRET'),

  environment: process.env.NODE_ENV ?? 'development',
};
