import { company } from '@/lib/company';
import { currentYear } from '@/lib/year';

export function Footer() {
  return (
    <footer className="footer">
      <p>
        © {currentYear()} {company.name}. {company.contact.address}
      </p>
    </footer>
  );
}
