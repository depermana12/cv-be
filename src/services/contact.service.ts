import type {
  ContactInsert,
  ContactQueryOptions,
  ContactSelect,
} from "../db/types/contact.type";
import { CvChildService } from "./cvChild.service";
import { ContactRepository } from "../repositories/contact.repo";

export interface IContactService {
  createContact(
    cvId: number,
    contactData: Omit<ContactInsert, "cvId">,
  ): Promise<ContactSelect>;
  getContact(cvId: number, contactId: number): Promise<ContactSelect>;
  getAllContacts(
    cvId: number,
    options?: ContactQueryOptions,
  ): Promise<ContactSelect[]>;
  updateContact(
    cvId: number,
    contactId: number,
    updateData: Omit<ContactInsert, "cvId">,
  ): Promise<ContactSelect>;
  deleteContact(cvId: number, contactId: number): Promise<boolean>;
}

export class ContactService
  extends CvChildService<ContactSelect, ContactInsert>
  implements IContactService
{
  constructor(private readonly contactRepository: ContactRepository) {
    super(contactRepository);
  }

  async createContact(cvId: number, contactData: Omit<ContactInsert, "cvId">) {
    return this.createInCv(cvId, { ...contactData, cvId });
  }

  async getContact(cvId: number, contactId: number) {
    return this.getByIdInCv(cvId, contactId);
  }

  async getAllContacts(cvId: number, options?: ContactQueryOptions) {
    return this.contactRepository.getAllContacts(cvId, options);
  }

  async updateContact(
    cvId: number,
    contactId: number,
    updateData: Omit<ContactInsert, "cvId">,
  ) {
    return this.updateInCv(cvId, contactId, updateData);
  }

  async deleteContact(cvId: number, contactId: number) {
    return this.deleteInCv(cvId, contactId);
  }
}
