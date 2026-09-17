import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const globalForDatabase = globalThis as unknown as {
  sdipSql?: ReturnType<typeof postgres>;
};

export const sql =
  globalForDatabase.sdipSql ??
  postgres(connectionString, {
    ssl: "require",
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.sdipSql = sql;
}
