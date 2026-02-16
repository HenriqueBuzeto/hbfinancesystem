'use client';

import {
  Box,
  Flex,
  Icon,
  Image,
  Link,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  Settings,
  BarChart3,
  Bell,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  Sparkles,
  X,
  GraduationCap,
  CalendarDays,
  Crown,
  CreditCard,
} from 'lucide-react';

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/contas', label: 'Contas', icon: Wallet },
  { href: '/app/contas-a-receber', label: 'A Receber', icon: ArrowDownCircle },
  { href: '/app/contas-a-pagar', label: 'A Pagar', icon: ArrowUpCircle },
  { href: '/app/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/app/despesas', label: 'Despesas', icon: Receipt },
  { href: '/app/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/app/pro', label: '⭐ PRO', icon: Crown },
  { href: '/app/educacao-financeira', label: 'Educação Financeira', icon: GraduationCap },
  { href: '/app/assistente-ia', label: 'Assistente IA', icon: Sparkles },
  { href: '/app/notificacoes', label: 'Notificações', icon: Bell },
  { href: '/app/planos', label: 'Planos', icon: CreditCard },
  { href: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

const SIDEBAR_W = 260;

type VisionSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: () => void;
};

export function VisionSidebar({ isOpen = false, onClose, onNavigate }: VisionSidebarProps) {
  const pathname = usePathname();
  const activeBg = useColorModeValue('brand.500', 'whiteAlpha.200');
  const activeColor = useColorModeValue('white', 'brand.200');
  const hoverBg = useColorModeValue('brand.50', 'whiteAlpha.100');

  const handleClick = (e: React.MouseEvent) => {
    onNavigate?.();
  };

  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top={0}
      w={{ base: 'min(320px, 85vw)', md: `${SIDEBAR_W}px` }}
      h="100vh"
      zIndex={40}
      bg="rgba(10,10,15,0.98)"
      backdropFilter="blur(20px)"
      borderRight="1px solid"
      borderColor="nebula.border"
      aria-label="Menu principal"
      transform={{ base: isOpen ? 'translateX(0)' : 'translateX(-100%)', md: 'translateX(0)' }}
      transition="transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)"
      boxShadow={{ base: isOpen ? '2xl' : 'none', md: 'none' }}
    >
      <Flex h="16" align="center" justify="space-between" px="4" borderBottomWidth="1px" borderColor="nebula.border">
        <Flex align="center" gap={2} minW={0}>
          <Image src="/logo.png" alt="HB Finance" boxSize="40px" flexShrink={0} />
          <Text fontSize="lg" fontWeight="semibold" color="brand.400" isTruncated>
            HB Finance
          </Text>
        </Flex>
        <Box
          as="button"
          type="button"
          onClick={onClose}
          display={{ md: 'none' }}
          p={2}
          borderRadius="lg"
          _hover={{ bg: 'whiteAlpha.100' }}
          aria-label="Fechar menu"
        >
          <Icon as={X} boxSize={5} color="gray.400" />
        </Box>
      </Flex>
      <VStack as="nav" align="stretch" spacing={1} p={3} overflowY="auto" flex={1}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              _hover={{ textDecoration: 'none' }}
              onClick={handleClick}
              minH="44px"
              display="flex"
              alignItems="center"
            >
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ width: '100%' }}
              >
                <Flex
                  align="center"
                  gap={3}
                  px={4}
                  py={3}
                  borderRadius="12px"
                  bg={isActive ? activeBg : 'transparent'}
                  color={isActive ? activeColor : 'gray.400'}
                  _hover={{ bg: isActive ? undefined : hoverBg, color: isActive ? undefined : 'gray.200' }}
                  transition="all 0.2s"
                >
                  <Icon as={item.icon} boxSize={5} flexShrink={0} />
                  <Text fontSize="sm" fontWeight={isActive ? '600' : 'normal'}>
                    {item.label}
                  </Text>
                </Flex>
              </motion.div>
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
}

export const SIDEBAR_WIDTH = SIDEBAR_W;
