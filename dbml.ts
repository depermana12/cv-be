import { schema } from "./src/db/index";
import { pgGenerate } from "drizzle-dbml-generator";

const out = "./schema.dbml";
const relational = true;

pgGenerate({
  schema,
  out,
  relational,
});

console.log("DBML file generated successfully.");
