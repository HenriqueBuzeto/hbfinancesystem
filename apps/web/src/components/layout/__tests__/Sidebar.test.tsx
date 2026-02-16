import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/app/dashboard',
}));

describe('Sidebar', () => {
  it('renderiza o nome da aplicação e links de navegação', () => {
    render(<Sidebar />);
    expect(screen.getByText('HB Finance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /relatórios/i })).toBeInTheDocument();
  });

  it('tem região de navegação acessível', () => {
    render(<Sidebar />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: /menu principal/i })).toBeInTheDocument();
  });

  it('tem botão para expandir/recolher com label acessível', () => {
    render(<Sidebar />);
    const toggle = screen.getByRole('button', { name: /recolher menu/i });
    expect(toggle).toBeInTheDocument();
  });
});
