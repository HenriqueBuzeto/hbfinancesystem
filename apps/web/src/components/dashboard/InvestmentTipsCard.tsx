'use client';

import Link from 'next/link';
import { Box, Flex, Text, Heading, Button, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';

const TIPS = [
  { label: 'Reserva de emergência', desc: 'Mantenha 6 meses de despesas em liquidez.' },
  { label: 'Diversificação', desc: 'Não coloque todos os ovos na mesma cesta.' },
  { label: 'Juros compostos', desc: 'Quanto antes começar, maior o efeito no longo prazo.' },
  { label: 'Custos baixos', desc: 'Taxas e corretagem impactam o retorno real.' },
];

export function InvestmentTipsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Box
        className="card-premium card-premium-inner"
        p={{ base: 5, md: 6 }}
        borderRadius="2xl"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          right={0}
          w="40%"
          h="100%"
          bgImage="url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80)"
          bgSize="cover"
          bgPosition="left center"
          opacity={0.12}
          aria-hidden
        />
        <Flex align="center" gap={2} mb={4} position="relative" zIndex={1}>
          <TrendingUp className="h-5 w-5 text-emerald-400" aria-hidden />
          <Text fontSize="xs" fontWeight="600" color="gray.400" textTransform="uppercase" letterSpacing="wider">
            Agente inteligente
          </Text>
        </Flex>
        <Heading size="md" color="white" mb={1}>
          Melhores práticas de investimento
        </Heading>
        <Text fontSize="sm" color="gray.500" mb={4}>
          Dicas atualizadas para você tomar decisões conscientes.
        </Text>
        <VStack as="ul" listStyleType="none" align="stretch" spacing={3} margin={0} padding={0}>
          {TIPS.map((tip, i) => (
            <Flex
              key={tip.label}
              as="li"
              align="flex-start"
              gap={3}
              p={3}
              borderRadius="xl"
              bg="whiteAlpha.50"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
            >
              <Box
                flexShrink={0}
                w={8}
                h={8}
                borderRadius="full"
                bg="brand.500"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="sm"
                fontWeight="bold"
              >
                {i + 1}
              </Box>
              <Box>
                <Text fontWeight="600" color="white" fontSize="sm">
                  {tip.label}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {tip.desc}
                </Text>
              </Box>
            </Flex>
          ))}
        </VStack>
        <Link href="/app/assistente-ia" className="block mt-4">
          <Button
            size="sm"
            rightIcon={<ArrowRight size={16} />}
            colorScheme="brand"
            variant="outline"
            borderColor="brand.400"
            color="brand.300"
            _hover={{ bg: 'brand.500', color: 'white', borderColor: 'brand.500' }}
            minH="44px"
            px={4}
          >
            Consultar Assistente IA
          </Button>
        </Link>
      </Box>
    </motion.div>
  );
}
