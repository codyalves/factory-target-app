import { company, formatPrice, hoursRange, phoneHref } from '@/lib/company';
import { ChatLauncher } from './components/chat-launcher';
import { Ridge } from './components/ridge';

export default function Home() {
  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <h1>{company.name}</h1>
          <p className="tagline">{company.tagline}</p>
        </div>
        <Ridge />
      </header>

      <div className="layout">
        {/* First in the page so a phone shows hours and contact straight away; beside the content on wide screens. */}
        <aside className="facts" aria-label="Hours and contact">
          <section className="panel">
            <h2>Hours</h2>
            <table className="hours">
              <tbody>
                {company.hours.map((h) => (
                  <tr key={h.days}>
                    <th scope="row">{h.days}</th>
                    <td className={h.open ? undefined : 'closed'}>{hoursRange(h)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="panel contact">
            <h2>Contact</h2>
            <address>
              <p>{company.contact.address}</p>
              <p>
                <a href={`mailto:${company.contact.email}`}>{company.contact.email}</a>
              </p>
              <p>
                <a href={phoneHref(company.contact.phone)}>{company.contact.phone}</a>
              </p>
            </address>
          </section>
        </aside>

        <main>
          <section className="prose">
            <h2>About</h2>
            <p>{company.about}</p>
          </section>

          <section id="menu" aria-labelledby="menu-heading">
            <h2 id="menu-heading">Menu</h2>
            {company.menu.map((s) => (
              <div className="menu-section" key={s.section}>
                <h3>{s.section}</h3>
                <ul className="menu-items">
                  {s.items.map((m) => (
                    <li key={m.name}>
                      <p className="menu-name">
                        <span>{m.name}</span>
                        {m.seasonal ? <span className="menu-seasonal">Seasonal</span> : null}
                      </p>
                      <p className="menu-price">{formatPrice(m.price)}</p>
                      <p className="menu-desc">{m.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section>
            <h2>Questions</h2>
            <dl className="faq">
              {company.faqs.map((f) => (
                <div key={f.question}>
                  <dt>{f.question}</dt>
                  <dd>{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </main>
      </div>
      <ChatLauncher />
    </>
  );
}
