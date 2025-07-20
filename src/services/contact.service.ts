import type { ContactInsert, ContactSelect } from "../db/types/contact.type";
import { CvChildService } from "./cvChild.service";
import { ContactRepository } from "../repositories/contact.repo";

export class ContactService extends CvChildService<
  ContactSelect,
  ContactInsert
> {
  constructor(private readonly contactRepository: ContactRepository) {
    super(contactRepository);
  }
}
