'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Bell,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  Sparkles,
  X,
  Menu,
  GraduationCap,
  CalendarDays,
  Crown,
  CreditCard,
} from 'lucide-react';
import { cn } from '@hb-finance/ui';
import { usePlanAccess } from '@/lib/plans/usePlanAccess';

const navItemsBase = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/contas', label: 'Contas', icon: Wallet },
  { href: '/app/contas-a-receber', label: 'A Receber', icon: ArrowDownCircle },
  { href: '/app/contas-a-pagar', label: 'A Pagar', icon: ArrowUpCircle },
  { href: '/app/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/app/despesas', label: 'Despesas', icon: Receipt },
  { href: '/app/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/app/pro', labelKey: 'pro', icon: Crown, highlight: true },
  { href: '/app/educacao-financeira', label: 'Educação Financeira', icon: GraduationCap },
  { href: '/app/assistente-ia', label: 'Assistente IA', icon: Sparkles },
  { href: '/app/notificacoes', label: 'Notificações', icon: Bell },
  { href: '/app/planos', label: 'Planos', icon: CreditCard },
  { href: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

type SidebarProps = {
  onWidthChange?: (width: number) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function Sidebar({ onWidthChange, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const { plan, planLabel } = usePlanAccess();

  const navItems = navItemsBase.map((item) => ({
    ...item,
    label: 'labelKey' in item && item.labelKey === 'pro'
      ? (plan === 'PRO' ? '⭐ PRO' : 'Assinar PRO')
      : ('label' in item ? item.label : 'PRO'),
  }));

  // Notifica o layout sobre a largura atual (para padding do main)
  React.useEffect(() => {
    onWidthChange?.(width);
  }, [width, onWidthChange]);

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen w-[280px] max-w-[85vw] flex-col border-r border-nebula-purple/20 bg-[rgba(10,10,15,0.98)] backdrop-blur-xl',
        'md:w-[var(--sidebar-width)]',
        'translate-x-[-100%] md:translate-x-0 transition-transform duration-300 ease-out',
        mobileOpen && 'translate-x-0'
      )}
      style={{ '--sidebar-width': `${width}px` } as React.CSSProperties}
      aria-label="Menu principal"
    >
      {/* Logo / toggle */}
      <div className="flex h-16 min-h-[44px] items-center justify-between border-b border-nebula-purple/10 px-4">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 truncate"
            >
              <Image src="/logo.png" alt="HB Finance" width={40} height={40} className="shrink-0" priority />
              <span className="truncate text-lg font-semibold text-nebula-violet">HB Finance</span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
              aria-hidden
            >
              <Image src="/logo.png" alt="HB Finance" width={40} height={40} className="shrink-0" priority />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden rounded-lg p-2 min-h-[44px] min-w-[44px] text-zinc-400 transition hover:bg-nebula-purple/20 hover:text-nebula-violet"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="hidden md:block rounded-lg p-2 text-zinc-400 transition hover:bg-nebula-purple/20 hover:text-nebula-violet focus:outline-none focus:ring-2 focus:ring-nebula-purple"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-b border-nebula-purple/10 px-4 py-2">
          <p className="text-xs font-medium text-zinc-500">Plano atual</p>
          <p className="text-sm font-semibold text-nebula-violet">{planLabel}</p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto p-3" role="navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isHighlight = 'highlight' in item && item.highlight;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 min-h-[44px] text-sm font-medium transition',
                    isActive
                      ? 'bg-nebula-purple/20 text-nebula-violet'
                      : 'text-zinc-400 hover:bg-nebula-purple/10 hover:text-zinc-200',
                    isHighlight && 'border border-nebula-purple/30 hover:border-nebula-purple/50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={20} className="shrink-0" aria-hidden />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        key={item.label}
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
}
