import { and, asc, desc, eq, sql } from "drizzle-orm";
import { CvChildRepository } from "./cvChild.repo";
import { contacts } from "../db/schema/contact.db";
import type {
  ContactInsert,
  ContactQueryOptions,
  ContactSelect,
  ContactUpdate,
} from "../db/types/contact.type";

export interface IContactRepository {
  getContact(cvId: number, contactId: number): Promise<ContactSelect | null>;
  getAllContacts(
    cvId: number,
    options?: ContactQueryOptions,
  ): Promise<ContactSelect[]>;
  createContact(
    cvId: number,
    contactData: ContactInsert,
  ): Promise<ContactSelect>;
  updateContact(
    cvId: number,
    contactId: number,
    contactData: ContactUpdate,
  ): Promise<ContactSelect>;
  deleteContact(cvId: number, contactId: number): Promise<boolean>;
}
import type { Database } from "../db/index";

export class ContactRepository
  extends CvChildRepository<typeof contacts, ContactInsert, ContactSelect, "id">
  implements IContactRepository
{
  constructor(db: Database) {
    super(contacts, db, "id");
  }

  async getContact(cvId: number, contactId: number) {
    return this.getByIdInCv(cvId, contactId);
  }

  async getAllContacts(cvId: number, options?: ContactQueryOptions) {
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

  async createContact(cvId: number, contactData: ContactInsert) {
    return this.createInCv(cvId, contactData);
  }

  async updateContact(
    cvId: number,
    contactId: number,
    contactData: ContactUpdate,
  ) {
    return this.updateInCv(cvId, contactId, contactData);
  }

  async deleteContact(cvId: number, contactId: number) {
    return this.deleteInCv(cvId, contactId);
  }
}
