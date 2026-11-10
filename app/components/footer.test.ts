import { expect, it } from 'vitest';
import { company } from '@/lib/company';
import { Footer } from './footer';

it('AC-1: footer shows © current year and company name', () => {
  const json = JSON.stringify(Footer());
  expect(json).toContain(`"© ",${new Date().getFullYear()}," ",${JSON.stringify(company.name)}`);
});
