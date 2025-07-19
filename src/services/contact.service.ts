import type { ContactInsert, ContactSelect } from "../db/types/contact.type";
import { CvChildService } from "./cvChild.service";
import { ContactRepository } from "../repositories/contact.repo";
import { NotFoundError } from "../errors/not-found.error";

export interface IContactService {
  updateContact(
    cvId: number,
    contactId: number,
    updateData: Omit<ContactInsert, "cvId">,
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
    updateData: Omit<ContactInsert, "cvId">,
  ) {
    return this.updateInCv(cvId, contactId, updateData);
  }
}
