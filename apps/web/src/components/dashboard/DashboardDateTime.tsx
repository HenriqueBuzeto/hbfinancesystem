'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, Text, SimpleGrid } from '@chakra-ui/react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatTime(d: Date): string {
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function DashboardDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ width: '100%' }}
    >
      <Box
        position="relative"
        borderRadius="2xl"
        overflow="hidden"
        bg="linear-gradient(145deg, rgba(20,20,30,0.95) 0%, rgba(15,15,22,0.98) 100%)"
        borderWidth="1px"
        borderColor="rgba(124, 58, 237, 0.4)"
        boxShadow="0 0 0 1px rgba(255,255,255,0.04), 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 60px -15px rgba(124, 58, 237, 0.2)"
      >
        {/* Relógio — destaque luxuoso */}
        <Flex
          position="relative"
          direction="column"
          p={6}
          pb={5}
          bgGradient="linear(to-b, rgba(124,58,237,0.12) 0%, transparent 60%)"
          borderBottomWidth="1px"
          borderColor="rgba(124, 58, 237, 0.2)"
        >
          <Flex align="center" gap={3} mb={2}>
            <Flex
              align="center"
              justify="center"
              w={12}
              h={12}
              borderRadius="xl"
              bg="rgba(124, 58, 237, 0.2)"
              borderWidth="1px"
              borderColor="rgba(167, 139, 250, 0.3)"
              boxShadow="0 0 24px -4px rgba(124, 58, 237, 0.4)"
            >
              <Clock className="h-6 w-6" style={{ color: 'var(--chakra-colors-brand-400)' }} />
            </Flex>
            <Box>
              <Text
                fontSize="3xl"
                fontWeight="800"
                color="white"
                fontFamily="system-ui, sans-serif"
                letterSpacing="-0.02em"
                lineHeight="1.1"
                textShadow="0 0 40px rgba(167, 139, 250, 0.3)"
              >
                {formatTime(now)}
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="500" mt={0.5}>
                Horário local
              </Text>
            </Box>
          </Flex>
          <Flex align="center" gap={2} color="gray.400" fontSize="sm" textTransform="capitalize" pl={15}>
            <CalendarIcon className="h-4 w-4 text-brand.500" />
            <Text>{formatDate(now)}</Text>
          </Flex>
        </Flex>

        {/* Calendário do mês */}
        <Box p={5} pt={4}>
          <Text
            fontSize="xs"
            fontWeight="700"
            color="brand.300"
            textTransform="uppercase"
            letterSpacing="0.2em"
            mb={4}
          >
            {MONTHS[month]} {year}
          </Text>
          <SimpleGrid columns={7} spacing={2} textAlign="center">
            {WEEKDAYS.map((w) => (
              <Text key={w} fontSize="xs" color="gray.500" fontWeight="600" letterSpacing="0.05em">
                {w}
              </Text>
            ))}
            {days.map((d, i) => (
              <motion.div
                key={i}
                style={{ minHeight: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                whileHover={d ? { scale: 1.05 } : undefined}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Box
                  py={2}
                  px={1}
                  borderRadius="xl"
                  bg={d === today ? 'linear-gradient(135deg, var(--chakra-colors-brand-500), var(--chakra-colors-brand-600))' : d ? 'rgba(255,255,255,0.06)' : 'transparent'}
                  color={d === today ? 'white' : d ? 'gray.300' : 'transparent'}
                  fontSize="sm"
                  fontWeight={d === today ? '800' : '500'}
                  boxShadow={d === today ? '0 4px 14px -2px rgba(124, 58, 237, 0.5)' : 'none'}
                  borderWidth={d === today ? '0' : '1px'}
                  borderColor={d && d !== today ? 'rgba(255,255,255,0.06)' : 'transparent'}
                >
                  {d ?? ''}
                  {d === today && (
                    <Text as="span" display="block" fontSize="xs" color="whiteAlpha.900" fontWeight="600" mt={0.5}>
                      Hoje
                    </Text>
                  )}
                </Box>
              </motion.div>
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </motion.div>
  );
}
