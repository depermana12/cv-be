import type { ZodError } from "zod";

export const zFormatter = (error: ZodError) => {
  // field error group issues by key
  // form error issue on root schema
  const { fieldErrors, formErrors } = error.flatten();

  const formattedField = Object.entries(fieldErrors).reduce(
    (acc, [field, errors]) => {
      if (errors && errors.length > 0) {
        acc[field] = errors;
      }
      return acc;
    },
    {} as Record<string, string[]>,
  );
  return {
    fields: formattedField,
    form: formErrors.length > 0 ? formErrors : undefined,
  };
};
