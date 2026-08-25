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

  // Note WHICH account this is: khulula_app, the restricted one.
  //
  // Prisma migrations keep using DATABASE_URL (khulula_admin), because creating
  // tables needs full rights. The running API does not create tables, so it
  // does not get those rights. See the migration
  // 20260822105239_application_database_account.
  databaseUrl: required('DATABASE_URL_APP'),

  // Redis holds the staff sessions. See src/session.ts for why they live there
  // rather than in PostgreSQL or in the cookie itself.
  redisUrl: required('REDIS_URL'),

  // The secret that signs the session cookie. Required, never has a default:
  // a default secret in a committed file is the same as no secret at all.
  sessionSecret: required('SESSION_SECRET'),

  environment: process.env.NODE_ENV ?? 'development',
};
