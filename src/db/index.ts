import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// export async function initializeDb() {
//   const pool = mysql.createPool({
//     uri: process.env.DATABASE_URL,
//     connectionLimit: 10,
//   });

//   return drizzle(pool);
// }

// Singleton function to ensure only one db instance is created
function singleton<Value>(name: string, value: () => Value): Value {
  const globalAny: any = global;
  globalAny.__singletons = globalAny.__singletons || {};

  if (!globalAny.__singletons[name]) {
    globalAny.__singletons[name] = value();
  }

  return globalAny.__singletons[name];
}

// Function to create the database connection and apply migrations if needed
function createDatabaseConnection() {
  const poolConnection = mysql.createPool(process.env.DATABASE_URL!);
  return drizzle(poolConnection);
}

export const db = singleton("db", createDatabaseConnection);
