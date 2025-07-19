import type {
  ContactInsert,
  ContactSelect,
  ContactUpdate,
} from "../db/types/contact.type";
import { CvChildService } from "./cvChild.service";
import { ContactRepository } from "../repositories/contact.repo";

export interface IContactService {
  updateContact(
    cvId: number,
    contactId: number,
    updateData: ContactUpdate,
  ): Promise<ContactSelect>;
}

export class ContactService
  extends CvChildService<ContactSelect, ContactInsert>
  implements IContactService
{
  constructor(private readonly contactRepository: ContactRepository) {
    super(contactRepository);
  }

  // Custom method: specific updateData type (removes cvId from updateData)
  async updateContact(
    cvId: number,
    contactId: number,
    updateData: ContactUpdate,
  ) {
    return this.updateInCv(cvId, contactId, updateData);
  }
}
