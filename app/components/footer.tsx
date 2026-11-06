import { company } from '@/lib/company';

export function Footer() {
  return (
    <footer className="footer">
      <p>
        © 2025 {company.name}. {company.contact.address}
      </p>
    </footer>
  );
}
