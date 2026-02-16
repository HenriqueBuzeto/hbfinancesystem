'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function formatTime(d: Date): { hours: string; minutes: string; seconds: string } {
  const h = d.getHours();
  const m = d.getMinutes();
  const s = d.getSeconds();
  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

export function DashboardClockOnly() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const weekday = WEEKDAY_SHORT[now.getDay()];
  const day = now.getDate();
  const month = MONTH_SHORT[now.getMonth()];
  const time = formatTime(now);

  return (
    <Box
      className="dashboard-clock-luxury"
      w="100%"
      minW="200px"
      position="relative"
      overflow="hidden"
      borderRadius="2xl"
      bg="linear-gradient(145deg, rgba(12,12,18,0.98) 0%, rgba(20,18,32,0.98) 50%, rgba(14,12,22,0.98) 100%)"
      border="1px solid"
      borderColor="rgba(148, 163, 255, 0.12)"
      boxShadow="0 0 0 1px rgba(255,255,255,0.03) inset, 0 24px 48px -12px rgba(0,0,0,0.5), 0 0 80px -20px rgba(124, 58, 237, 0.15)"
      p={{ base: 5, md: 6 }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        h: '1px',
        bg: 'linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.25), transparent)',
        opacity: 0.8,
      }}
      sx={{
        fontFeatureSettings: '"tnum"',
      }}
    >
      <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
        {/* Hora — tipografia premium, dígitos tabulares */}
        <Flex align="baseline" gap={{ base: 0.5, md: 1 }} flexWrap="nowrap">
          <Text
            as="span"
            fontSize={{ base: '2.5rem', md: '3.5rem', lg: '4rem' }}
            fontWeight="200"
            color="white"
            letterSpacing={{ base: '-0.04em', md: '-0.05em' }}
            lineHeight="1"
            fontFamily="var(--font-inter), system-ui, -apple-system, sans-serif"
            textShadow="0 0 40px rgba(255,255,255,0.06)"
          >
            {time.hours}
          </Text>
          <Text
            as="span"
            fontSize={{ base: '2.5rem', md: '3.5rem', lg: '4rem' }}
            fontWeight="200"
            color="white"
            letterSpacing={{ base: '-0.04em', md: '-0.05em' }}
            lineHeight="1"
            opacity={0.9}
            sx={{
              animation: 'clock-colon 1s ease-in-out infinite',
              '@keyframes clock-colon': { '0%, 100%': { opacity: 0.9 }, '50%': { opacity: 0.3 } },
            }}
          >
            :
          </Text>
          <Text
            as="span"
            fontSize={{ base: '2.5rem', md: '3.5rem', lg: '4rem' }}
            fontWeight="200"
            color="white"
            letterSpacing={{ base: '-0.04em', md: '-0.05em' }}
            lineHeight="1"
            fontFamily="var(--font-inter), system-ui, -apple-system, sans-serif"
            textShadow="0 0 40px rgba(255,255,255,0.06)"
          >
            {time.minutes}
          </Text>
          <Text
            as="span"
            fontSize={{ base: '2.5rem', md: '3.5rem', lg: '4rem' }}
            fontWeight="200"
            color="white"
            letterSpacing={{ base: '-0.04em', md: '-0.05em' }}
            lineHeight="1"
            opacity={0.9}
            sx={{
              animation: 'clock-colon 1s ease-in-out infinite',
              '@keyframes clock-colon': { '0%, 100%': { opacity: 0.9 }, '50%': { opacity: 0.3 } },
            }}
          >
            :
          </Text>
          <Text
            as="span"
            fontSize={{ base: '2.5rem', md: '3.5rem', lg: '4rem' }}
            fontWeight="200"
            color="rgba(255,255,255,0.88)"
            letterSpacing={{ base: '-0.04em', md: '-0.05em' }}
            lineHeight="1"
            fontFamily="var(--font-inter), system-ui, -apple-system, sans-serif"
          >
            {time.seconds}
          </Text>
        </Flex>

        {/* Data — card refinado */}
        <Box
          textAlign="center"
          py={2.5}
          px={4}
          borderRadius="xl"
          bg="rgba(255,255,255,0.04)"
          border="1px solid"
          borderColor="rgba(255,255,255,0.08)"
          boxShadow="0 4px 12px -4px rgba(0,0,0,0.3) inset"
        >
          <Text
            fontSize="sm"
            fontWeight="600"
            color="rgba(255,255,255,0.95)"
            letterSpacing="0.05em"
          >
            {weekday} {day}
          </Text>
          <Text
            fontSize="xs"
            fontWeight="500"
            color="rgba(255,255,255,0.5)"
            letterSpacing="0.1em"
            mt={0.5}
          >
            {month}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
