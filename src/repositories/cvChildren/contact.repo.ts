import { CvChildRepository } from "../cvChild.repo";
import { contacts } from "../../db/schema/contact.db";
import type { ContactInsert, ContactSelect } from "../../db/types/contact.type";
import type { Database } from "../../db";

export class ContactRepository extends CvChildRepository<
  typeof contacts,
  ContactInsert,
  ContactSelect,
  "id"
> {
  constructor(db: Database) {
    super(contacts, db, "id");
  }
}
