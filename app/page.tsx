import { company, describeHours, phoneHref } from '@/lib/company';

export default function Home() {
  return (
    <>
      <header>
        <h1>{company.name}</h1>
        <p className="tagline">{company.tagline}</p>
      </header>

      <section>
        <h2>About</h2>
        <p>{company.about}</p>
      </section>

      <section>
        <h2>Hours</h2>
        <ul>
          {company.hours.map((h) => (
            <li key={h.days}>{describeHours(h)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Questions</h2>
        <dl>
          {company.faqs.map((f) => (
            <div key={f.question}>
              <dt>{f.question}</dt>
              <dd>{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          <a href={`mailto:${company.contact.email}`}>{company.contact.email}</a> ·{' '}
          <a href={phoneHref(company.contact.phone)}>{company.contact.phone}</a>
        </p>
      </section>
    </>
  );
}
