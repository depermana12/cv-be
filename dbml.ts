import { schema } from "./src/db/index";

import { mysqlGenerate } from "drizzle-dbml-generator";

const out = "./schema.dbml";
const relational = true;

mysqlGenerate({
  schema,
  out,
  relational,
});

console.log("DBML file generated successfully.");
