import type { Languages, LocalizedText } from "@/lib/i18n/bilingual";
import { Bi } from "./Bi";

type Props = {
  text: LocalizedText;
  languages: Languages;
  /** id of the h2, which names its section (aria-labelledby) in the page's language. */
  id: string;
  /** Size of the Latin heading: "md" (18px, sections) or "sm" (16px, contact). */
  size?: "md" | "sm";
};

/** A section title: Bodoni caps in English with the Arabic in Amiri beneath. */
export function SectionHeading({ text, languages, id, size = "md" }: Props) {
  return (
    <div className="flex flex-col gap-0.5 text-center">
      <Bi
        text={text}
        languages={languages}
        id={id}
        as="h2"
        restAs="p"
        className="m-0 font-normal"
        en={`classic-caps ${size === "md" ? "text-lg" : "text-base"}`}
        ar={size === "md" ? "text-[1.375rem] font-bold" : "text-xl font-bold"}
        arDisplay
      />
    </div>
  );
}
