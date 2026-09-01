import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../formatCurrency';

describe('formatCurrency (Utilidad de Formateo Monetario en COP)', () => {
  it('formatea montos positivos estándar en pesos colombianos con separador de miles', () => {
    const formatted = formatCurrency(500000);
    // In es-CO Intl formats as "$ 500.000" or "$\u00A0500.000"
    expect(formatted).toMatch(/\$\s?500\.000/);
  });

  it('formatea correctamente el valor cero ($ 0)', () => {
    const formatted = formatCurrency(0);
    expect(formatted).toMatch(/\$\s?0/);
  });

  it('formatea montos negativos con signo menos explícito (-$ 200.000)', () => {
    const formatted = formatCurrency(-200000);
    expect(formatted).toMatch(/-\s?\$\s?200\.000/);
  });

  it('maneja cifras monetarias de gran volumen sin pérdida de formato', () => {
    const formatted = formatCurrency(4850000);
    expect(formatted).toMatch(/\$\s?4\.850\.000/);
  });
});
