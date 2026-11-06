import type { ComponentType } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ChartIcon,
  PinIcon,
  RsvpIcon,
  ScriptIcon,
  ShieldIcon,
  TranslateIcon,
} from "./icons";

type Feature = {
  title: string;
  body: string;
  Icon: ComponentType<{ className?: string }>;
};

const features: readonly Feature[] = [
  {
    title: "Every guest reads it in their language",
    body: "Each line with its translation directly beneath. No switching, nobody left out. Or keep it to a single language.",
    Icon: TranslateIcon,
  },
  {
    title: "Every script done properly",
    body: "Right-to-left languages and non-Latin scripts get proper layout and typography, tested with real text. Never an afterthought.",
    Icon: ScriptIcon,
  },
  {
    title: "RSVP in seconds",
    body: "Name, number of guests, attending or not, and a note for meal preferences. One link you share however you like.",
    Icon: RsvpIcon,
  },
  {
    title: "Your private guest dashboard",
    body: "See who's coming, total guests and notes at a glance. Search, filter and export a CSV for your caterer.",
    Icon: ChartIcon,
  },
  {
    title: "Story, countdown, venue and map",
    body: "Your story, the date with a live countdown, the venue with directions, and in Premium a schedule, gallery and music.",
    Icon: PinIcon,
  },
  {
    title: "Private by design",
    body: "Guest data stays in the EU and is deleted after your wedding. Your dashboard is password-protected.",
    Icon: ShieldIcon,
  },
];

export function WhatWeDo() {
  return (
    <section id="what" aria-labelledby="what-title" className="py-20 md:py-26">
      <Container className="flex flex-col gap-12 md:gap-14">
        <SectionHeading id="what-title" eyebrow="What we do">
          Everything your guests need, on one beautiful page
        </SectionHeading>

        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,18.75rem),1fr))] gap-6">
          {features.map(({ title, body, Icon }) => (
            <li
              key={title}
              className="flex flex-col gap-3.5 rounded-card border border-line bg-white p-7 md:p-8 motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_color-mix(in_oklab,var(--color-indigo)_25%,transparent)]"
            >
              <Icon className="size-8 text-coral-deep" />
              <h3 className="text-h4 font-bold text-indigo">{title}</h3>
              <p className="text-dusk">{body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
