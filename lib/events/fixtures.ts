/**
 * Test fixtures shaped like the rows Supabase returns for the demo couple
 * (supabase/migrations/20261117130000_seed_demo_event.sql).
 */
import type { EventRows } from "./build-invitation";

export function demoRows(): EventRows {
  return {
    event: {
      slug: "layla-and-adam",
      template_id: "classic",
      languages: "en+ar",
      package: "premium",
      starts_at: "2027-06-12T16:00:00+00:00",
      timezone: "Europe/Vienna",
      venue: "Rosengasse 12, 1010 Vienna",
      rsvp_deadline: "2027-05-01T21:59:59+00:00",
      contact_phone: "+43 660 000 0000",
      theme_settings: {
        demo: true,
        arabicLocale: "ar-EG",
        schedule: [
          { id: "welcome_drinks", time: "18:00" },
          { id: "zaffa", time: "18:30" },
          { id: "dinner", time: "19:30" },
          { id: "dancing", time: "21:00" },
        ],
      },
    },
    content: [
      { key: "names", text_en: "Layla & Adam", text_ar: "ليلى وآدم" },
      { key: "place", text_en: "Vienna, Austria", text_ar: "فيينا، النمسا" },
      { key: "welcome.hosts", text_en: "Together with their families", text_ar: "بحضور عائلتيهما الكريمتين" },
      { key: "welcome.message", text_en: "joyfully invite you", text_ar: "يتشرّفان بدعوتكم" },
      { key: "story", text_en: "We met in Vienna.", text_ar: "التقينا في فيينا." },
      { key: "venue.name", text_en: "Villa Rosa", text_ar: "فيلا روزا" },
      { key: "schedule.welcome_drinks.title", text_en: "Welcome drinks", text_ar: "الاستقبال" },
      { key: "schedule.zaffa.title", text_en: "The zaffa & ceremony", text_ar: "الزفّة والمراسم" },
      { key: "schedule.dinner.title", text_en: "Dinner", text_ar: "العشاء" },
      { key: "schedule.dancing.title", text_en: "Music & dancing", text_ar: "الموسيقى والرقص" },
      { key: "dress_code", text_en: "Formal attire", text_ar: "لباس رسمي" },
      { key: "contact.name", text_en: "Layla", text_ar: "ليلى" },
    ],
    media: [
      { kind: "gallery", url: "/images/venue.png", position: 1, alt_en: "A gazebo", alt_ar: "قبّة" },
      { kind: "hero", url: "/images/countdown.png", position: 0, alt_en: "The couple", alt_ar: "العروسان" },
      { kind: "gallery", url: "/images/story.png", position: 0, alt_en: "A bouquet", alt_ar: "باقة" },
    ],
  };
}
