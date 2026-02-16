'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, Text, Heading } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// Imagens de alta qualidade: Unsplash (finanças, negócios, crescimento)
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=85', // city finance
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=85', // growth
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85', // analytics
  'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=1200&q=85', // modern office
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=85', // savings plan
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=85', // charts
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=85', // business success
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=85', // professional
];

const FRASES_MOTIVACAO = [
  'Invista em você primeiro. O resto vem naturalmente.',
  'O dinheiro não traz felicidade, mas a organização financeira traz paz.',
  'Pequenos gastos hoje podem ser grandes sonhos amanhã.',
  'O melhor momento para começar foi ontem. O segundo melhor é agora.',
  'Controle suas finanças antes que elas controlem você.',
  'Cada real poupado é um passo em direção à liberdade.',
  'Orçamento não é restrição, é direção.',
  'Seu futuro financeiro é construído pelas decisões de hoje.',
];

function getQuoteOfDay(): string {
  const start = new Date(2025, 0, 1);
  const today = new Date();
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const index = diff % FRASES_MOTIVACAO.length;
  return FRASES_MOTIVACAO[index];
}

function getImageOfDay(): string {
  const day = new Date().getDate();
  return HERO_IMAGES[day % HERO_IMAGES.length];
}

export function HeroSection() {
  const [quote] = useState(() => getQuoteOfDay());
  const [imgSrc, setImgSrc] = useState(HERO_IMAGES[0]);

  useEffect(() => {
    setImgSrc(getImageOfDay());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 md:mb-8"
    >
      <Box
        position="relative"
        borderRadius="2xl"
        overflow="hidden"
        minH={{ base: '200px', sm: '240px', md: '280px' }}
        className="card-premium"
      >
        <Box
          position="absolute"
          inset={0}
          bgImage={`url(${imgSrc})`}
          bgSize="cover"
          bgPosition="center"
          opacity={0.35}
          aria-hidden
        />
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-br, rgba(5,5,5,0.92) 0%, rgba(30,20,50,0.85) 60%, rgba(124,58,237,0.25) 100%)"
          aria-hidden
        />
        <Flex
          position="relative"
          zIndex={1}
          direction="column"
          justify="flex-end"
          p={{ base: 5, md: 8 }}
          minH={{ base: '200px', sm: '240px', md: '280px' }}
        >
          <Flex align="center" gap={2} mb={3}>
            <Sparkles className="h-5 w-5 text-nebula-violet" aria-hidden />
            <Text fontSize="xs" fontWeight="600" color="brand.300" textTransform="uppercase" letterSpacing="wider">
              Imagem do dia · Suas finanças em foco
            </Text>
          </Flex>
          <Heading size="lg" color="white" mb={2} lineHeight="tall">
            {quote}
          </Heading>
          <Text fontSize="sm" color="gray.400" maxW="xl">
            Dica HB Finance — mantenha o controle e alcance seus objetivos.
          </Text>
        </Flex>
      </Box>
    </motion.div>
  );
}
