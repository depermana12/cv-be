import { z } from "zod";

// Create contact validation schema
export const createContactSchema = z.object({
  firstName: z
    .string()
    .max(100, { message: "First name must be 100 characters or fewer" })
    .optional(),
  lastName: z
    .string()
    .max(100, { message: "Last name must be 100 characters or fewer" })
    .optional(),
  bio: z
    .string()
    .max(255, { message: "Bio must be 255 characters or fewer" })
    .optional(),
  email: z
    .string()
    .email({ message: "Please provide a valid email address" })
    .max(255, { message: "Email must be 255 characters or fewer" })
    .optional(),
  phone: z
    .string()
    .max(20, { message: "Phone must be 20 characters or fewer" })
    .optional(),
  city: z
    .string()
    .max(100, { message: "City must be 100 characters or fewer" })
    .optional(),
  state: z
    .string()
    .max(100, { message: "State must be 100 characters or fewer" })
    .optional(),
  country: z
    .string()
    .max(100, { message: "Country must be 100 characters or fewer" })
    .optional(),
  website: z
    .string()
    .url({ message: "Please provide a valid website URL" })
    .max(255, { message: "Website must be 255 characters or fewer" })
    .optional(),
  linkedin: z
    .string()
    .max(255, { message: "LinkedIn must be 255 characters or fewer" })
    .optional(),
  github: z
    .string()
    .max(255, { message: "GitHub must be 255 characters or fewer" })
    .optional(),
  portfolio: z
    .string()
    .url({ message: "Please provide a valid portfolio URL" })
    .max(255, { message: "Portfolio must be 255 characters or fewer" })
    .optional(),
  summary: z
    .string()
    .max(1000, { message: "Summary must be 1000 characters or fewer" })
    .optional(),
  profileImage: z
    .string()
    .max(255, { message: "Profile image URL must be 255 characters or fewer" })
    .optional(),
  socialLinks: z
    .array(z.string().url({ message: "Each social link must be a valid URL" }))
    .optional(),
  displayOrder: z
    .number()
    .int({ message: "Display order must be an integer" })
    .optional(),
});

// Update contact validation schema
export const updateContactSchema = createContactSchema.partial();

// Parameters schema for CV ID and Contact ID
export const contactParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
  contactId: z.coerce
    .number()
    .int()
    .positive({ message: "Contact ID must be a positive integer" }),
});

// Parameters schema for CV ID only (for create/get single contact)
export const cvIdParamsSchema = z.object({
  cvId: z.coerce
    .number()
    .int()
    .positive({ message: "CV ID must be a positive integer" }),
});
