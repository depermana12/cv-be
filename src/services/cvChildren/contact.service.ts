import { CvChildService } from "../cvChild.service";
import type { ContactInsert, ContactSelect } from "../../db/types/contact.type";
import { ContactRepository } from "../../repositories/cvChildren/contact.repo";

export class ContactService extends CvChildService<
  ContactSelect,
  ContactInsert
> {
  constructor(private readonly contactRepository: ContactRepository) {
    super(contactRepository);
  }
}
