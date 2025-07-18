import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { contacts } from "../db/schema/contact.db";
import type {
  ContactInsert,
  ContactQueryOptions,
  ContactSelect,
  ContactUpdate,
} from "../db/types/contact.type";
import type { Database } from "../db/index";

export class ContactRepository extends CvChildRepository<
  typeof contacts,
  ContactInsert,
  ContactSelect,
  "id"
> {
  constructor(db: Database) {
    super(contacts, db, "id");
  }

  async getContact(
    cvId: number,
    contactId: number,
  ): Promise<ContactSelect | null> {
    return this.getByIdInCv(cvId, contactId);
  }

  async getAllContacts(
    cvId: number,
    options?: ContactQueryOptions,
  ): Promise<ContactSelect[]> {
    const whereClause = [eq(contacts.cvId, cvId)];

    if (options?.search) {
      const searchTerm = `%${options.search.toLowerCase()}%`;
      whereClause.push(
        sql`(
          lower(${contacts.firstName}) like ${searchTerm} OR
          lower(${contacts.lastName}) like ${searchTerm} OR
          lower(${contacts.email}) like ${searchTerm} OR
          lower(${contacts.bio}) like ${searchTerm}
        )`,
      );
    }

    return this.db
      .select()
      .from(contacts)
      .where(and(...whereClause))
      .orderBy(
        options?.sortBy
          ? options.sortOrder === "desc"
            ? desc(contacts[options.sortBy])
            : asc(contacts[options.sortBy])
          : asc(contacts.displayOrder ?? contacts.id),
      );
  }

  async createContact(
    cvId: number,
    contactData: ContactInsert,
  ): Promise<ContactSelect> {
    return this.createInCv(cvId, contactData);
  }

  async updateContact(
    cvId: number,
    contactId: number,
    contactData: ContactUpdate,
  ): Promise<ContactSelect> {
    return this.updateInCv(cvId, contactId, contactData);
  }

  async deleteContact(cvId: number, contactId: number): Promise<boolean> {
    return this.deleteInCv(cvId, contactId);
  }
}
