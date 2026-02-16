'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  SimpleGrid,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, CalendarDays, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { PremiumCard } from '@/components/dashboard/PremiumCard';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export type CalendarEvent = {
  id: string;
  billId: string;
  title: string;
  amount: number;
  type: string;
  date: string;
  day: number;
  isRecurring: boolean;
  status: string;
  categoryName: string | null;
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(v);
}

export function CalendarioView() {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const month = `${viewDate.year}-${String(viewDate.month).padStart(2, '0')}`;
    try {
      const res = await fetch(`/api/calendar/events?month=${month}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [viewDate.year, viewDate.month]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const start = new Date(viewDate.year, viewDate.month - 1, 1);
  const end = new Date(viewDate.year, viewDate.month, 0);
  const firstDay = start.getDay();
  const daysInMonth = end.getDate();
  const today = new Date();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const eventsByDay: Record<number, CalendarEvent[]> = {};
  events.forEach((ev) => {
    if (!eventsByDay[ev.day]) eventsByDay[ev.day] = [];
    eventsByDay[ev.day].push(ev);
  });

  const prevMonth = () => {
    setViewDate((v) => {
      if (v.month === 1) return { year: v.year - 1, month: 12 };
      return { year: v.year, month: v.month - 1 };
    });
  };

  const nextMonth = () => {
    setViewDate((v) => {
      if (v.month === 12) return { year: v.year + 1, month: 1 };
      return { year: v.year, month: v.month + 1 };
    });
  };

  const isToday = (d: number | null) =>
    d !== null && today.getDate() === d && today.getMonth() === viewDate.month - 1 && today.getFullYear() === viewDate.year;

  return (
    <Box w="100%" maxW="1100px" mx="auto">
      <Flex align="center" gap={4} mb={6}>
        <Box
          p={4}
          borderRadius="2xl"
          bg="whiteAlpha.100"
          borderWidth="1px"
          borderColor="nebula.border"
        >
          <CalendarDays className="h-10 w-10 text-brand.400" aria-hidden />
        </Box>
        <Box flex={1}>
          <Heading size="lg" color="white">
            Calendário
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Contas a pagar e a receber por dia — fixas (todo mês) e variáveis. Notificações no dia do vencimento.
          </Text>
        </Box>
        <Button as={Link} href="/app/contas-a-pagar" size="sm" colorScheme="brand" borderRadius="xl" leftIcon={<ArrowUpCircle size={18} />}>
          A Pagar
        </Button>
        <Button as={Link} href="/app/contas-a-receber" size="sm" variant="outline" borderColor="nebula.border" color="green.400" borderRadius="xl" leftIcon={<ArrowDownCircle size={18} />}>
          A Receber
        </Button>
      </Flex>

      <PremiumCard padding="lg">
        <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={4}>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<ChevronLeft size={20} />}
              onClick={prevMonth}
              color="gray.400"
              _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
              borderRadius="xl"
            />
            <Heading size="md" color="white" minW="200px" textAlign="center">
              {MONTHS[viewDate.month - 1]} {viewDate.year}
            </Heading>
            <Button
              size="sm"
              variant="ghost"
              rightIcon={<ChevronRight size={20} />}
              onClick={nextMonth}
              color="gray.400"
              _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
              borderRadius="xl"
            />
          </HStack>
        </Flex>

        <SimpleGrid columns={7} spacing={2} mb={2}>
          {WEEKDAYS.map((w) => (
            <Text key={w} fontSize="xs" color="gray.500" fontWeight="700" textAlign="center" py={2}>
              {w}
            </Text>
          ))}
        </SimpleGrid>

        {loading ? (
          <Flex h="400px" align="center" justify="center" color="gray.500">
            Carregando...
          </Flex>
        ) : (
          <SimpleGrid columns={7} spacing={2}>
            {days.map((d, i) => {
              const dayEvents = d ? (eventsByDay[d] ?? []) : [];
              const todayCell = isToday(d);
              return (
                <Box
                  key={i}
                  minH={{ base: '80px', md: '100px' }}
                  p={2}
                  borderRadius="xl"
                  bg={todayCell ? 'brand.600' : d ? 'whiteAlpha.05' : 'transparent'}
                  borderWidth="1px"
                  borderColor={todayCell ? 'brand.500' : d ? 'whiteAlpha.08' : 'transparent'}
                >
                  <Text
                    fontSize="sm"
                    fontWeight={todayCell ? '800' : '600'}
                    color={todayCell ? 'white' : d ? 'gray.400' : 'transparent'}
                    mb={2}
                  >
                    {d ?? ''}
                  </Text>
                  <VStack align="stretch" spacing={1} overflow="hidden">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <Box
                        key={ev.id}
                        as={Link}
                        href={ev.type === 'PAYABLE' ? '/app/contas-a-pagar' : '/app/contas-a-receber'}
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="md"
                        bg={ev.type === 'PAYABLE' ? 'red.500' : 'green.600'}
                        bgOpacity={0.9}
                        color="white"
                        noOfLines={1}
                        title={`${ev.title} ${formatCurrency(ev.amount)}${ev.isRecurring ? ' (fixa)' : ''}`}
                        _hover={{ opacity: 0.9 }}
                      >
                        {ev.title}
                      </Box>
                    ))}
                    {dayEvents.length > 3 && (
                      <Text fontSize="xs" color="gray.500">+{dayEvents.length - 3}</Text>
                    )}
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        )}

        <Flex mt={6} gap={4} flexWrap="wrap" align="center">
          <Flex align="center" gap={2}>
            <Box w={3} h={3} borderRadius="md" bg="red.500" />
            <Text fontSize="sm" color="gray.400">A pagar</Text>
          </Flex>
          <Flex align="center" gap={2}>
            <Box w={3} h={3} borderRadius="md" bg="green.600" />
            <Text fontSize="sm" color="gray.400">A receber</Text>
          </Flex>
          <Text fontSize="xs" color="gray.500">
            Contas mensais fixas aparecem todo mês no mesmo dia. Ative notificações por WhatsApp em Configurações para lembrete no vencimento.
          </Text>
        </Flex>
      </PremiumCard>
    </Box>
  );
}
