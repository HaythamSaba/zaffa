"use client";

import { useActionState } from "react";
import { submitInquiry } from "@/app/(marketing)/actions";
import { initialContactState } from "@/lib/contact/types";
import { ContactFormView } from "./ContactFormView";

/** Client container: binds the server action to the presentational form. */
export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitInquiry, initialContactState);

  return <ContactFormView state={state} formAction={formAction} isPending={isPending} />;
}
