import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

// Sample data only (labelled on screen): not real clients or statistics.
const stats = [
  { value: "42", label: "households replied" },
  { value: "118", label: "people attending" },
  { value: "6", label: "declined" },
  { value: "9", label: "left a note" },
] as const;

const rows = [
  { name: "The Haddad family", guests: 4, note: "One vegetarian" },
  { name: "Lena Novak", guests: 2, note: "—" },
  { name: "Marco & Giulia", guests: 2, note: "Arriving after dinner" },
] as const;

export function DashboardPreview() {
  return (
    <section id="dashboard" aria-labelledby="dashboard-title" className="py-24 nav:py-32">
      <Container className="relative">
        {/* Sand block offset behind the framed preview (desktop only). */}
        <div aria-hidden="true" className="absolute start-10 top-15 hidden h-[78%] w-[46%] bg-sand nav:block" />

        <div className="relative grid items-center gap-14 nav:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal className="flex flex-col gap-4.5 nav:ps-10 nav:py-10">
            <SectionHeading id="dashboard-title" eyebrow="For the two of you">
              Every reply <b>in one place</b>
            </SectionHeading>
            <p className="max-w-105 text-[0.9375rem] leading-[1.85] text-taupe">
              No more chasing answers on WhatsApp. Your private dashboard shows
              who&rsquo;s coming, how many, and every note, ready to export for the
              caterer.
            </p>
          </Reveal>

          <Reveal index={1} className="min-w-0 bg-white p-2.5 shadow-frame">
            <div className="flex flex-col gap-5 border border-sand p-5 nav:p-6.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-[1.375rem] tracking-[0.1em] uppercase">
                  Sara &amp; Omar · Guests
                </p>
                <span className="border border-linen px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.08em] text-mocha">
                  Sample data
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse bg-ivory p-3.5">
                    <dt className="text-[0.6875rem] text-mocha">{stat.label}</dt>
                    <dd className="font-display text-[2rem] leading-tight font-medium">{stat.value}</dd>
                  </div>
                ))}
              </dl>

              <table className="w-full text-start text-[0.8125rem]">
                <caption className="sr-only">Sample guest list</caption>
                <thead>
                  <tr className="border-b border-sand text-[0.6875rem] font-semibold tracking-[0.12em] text-mocha uppercase">
                    <th scope="col" className="px-1 py-2.5 text-start font-semibold">Name</th>
                    <th scope="col" className="px-1 py-2.5 text-start font-semibold">Guests</th>
                    <th scope="col" className="px-1 py-2.5 text-start font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.name} className="border-b border-sand last:border-0">
                      <td className="px-1 py-3">{row.name}</td>
                      <td className="px-1 py-3">{row.guests}</td>
                      <td className="px-1 py-3 text-mocha">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
