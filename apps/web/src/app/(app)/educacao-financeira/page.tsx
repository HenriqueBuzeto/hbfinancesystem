'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlanGate } from '@/components/plans/PlanGate';
import {
  Box,
  Flex,
  Text,
  Heading,
  SimpleGrid,
  Icon,
  Collapse,
  Button,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  ChevronDown,
  ChevronUp,
  BookOpen,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Target,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { PremiumCard } from '@/components/dashboard/PremiumCard';

type Modulo = {
  id: string;
  titulo: string;
  subtitulo: string;
  icon: React.ElementType;
  badge?: string;
  passos: string[];
  dica: string;
};

const MODULOS: Modulo[] = [
  {
    id: 'orcamento',
    titulo: 'Orçamento pessoal',
    subtitulo: 'Controle de receitas e despesas',
    icon: BookOpen,
    badge: 'Base',
    passos: [
      'Anote todas as receitas e despesas por pelo menos um mês.',
      'Classifique os gastos em fixos (aluguel, contas) e variáveis (lazer, alimentação fora).',
      'Defina limites por categoria e acompanhe no HB Finance.',
      'Revise semanalmente e ajuste o que passar do planejado.',
    ],
    dica: 'A regra 50-30-20 sugere: 50% necessidades, 30% desejos, 20% poupança e investimentos.',
  },
  {
    id: 'reserva',
    titulo: 'Reserva de emergência',
    subtitulo: 'Segurança financeira antes de investir',
    icon: Shield,
    badge: 'Prioridade',
    passos: [
      'Calcule seu gasto mensal médio (despesas fixas + variáveis essenciais).',
      'Meta: acumular de 6 a 12 meses desse valor em aplicação de liquidez diária.',
      'Mantenha o valor em conta que permita resgate rápido (ex.: CDB ou Tesouro Selic).',
      'Só use em situações reais de emergência (doença, desemprego, reparo urgente).',
    ],
    dica: 'Quem tem renda instável deve mirar 12 meses; quem tem emprego estável, 6 meses.',
  },
  {
    id: 'dividas',
    titulo: 'Saída de dívidas',
    subtitulo: 'Estratégias para quitar e não voltar a dever',
    icon: CreditCard,
    badge: 'Urgente',
    passos: [
      'Liste todas as dívidas com valor, taxa de juros e parcela mínima.',
      'Priorize as de maior juro (cartão, cheque especial) ou use o método bola de neve (menor saldo primeiro).',
      'Negocie refinanciamento ou parcelamento com menor custo quando possível.',
      'Evite novas dívidas: corte gastos supérfluos até estabilizar.',
    ],
    dica: 'Pagar o mínimo do cartão mantém a dívida viva por anos. Priorize quitar o rotativo.',
  },
  {
    id: 'investimentos',
    titulo: 'Investimentos básicos',
    subtitulo: 'Renda fixa e variável de forma consciente',
    icon: TrendingUp,
    badge: 'Próximo passo',
    passos: [
      'Só invista depois de ter reserva de emergência e orçamento controlado.',
      'Entenda o perfil: conservador, moderado ou arrojado, e o prazo do objetivo.',
      'Comece por renda fixa (CDB, LCI/LCA, Tesouro Direto) e fundos de baixo risco.',
      'Se for para renda variável, estude e diversifique; não invista em o que não entende.',
    ],
    dica: 'Diversificação e prazos longos reduzem risco. Evite decisões por impulso ou notícia.',
  },
  {
    id: 'metas',
    titulo: 'Metas financeiras',
    subtitulo: 'Objetivos claros e planejamento',
    icon: Target,
    badge: 'Planejamento',
    passos: [
      'Defina metas específicas: valor, prazo e propósito (ex.: viagem, carro, aposentadoria).',
      'Calcule quanto poupar por mês e use a área de orçamento do HB Finance.',
      'Separe o valor das metas assim que receber (antes de gastar com o resto).',
      'Revise as metas a cada trimestre e celebre pequenas conquistas.',
    ],
    dica: 'Metas curtas (até 1 ano) mantêm a motivação; metas longas exigem disciplina e revisão.',
  },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function EducacaoFinanceiraPage() {
  const [aberto, setAberto] = useState<string | null>(null);

  return (
    <PlanGate feature="educationFinancial" requiredPlan="PRO">
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}
    >
      <Flex align="center" gap={4} mb={6}>
        <Box
          p={4}
          borderRadius="2xl"
          bg="whiteAlpha.100"
          borderWidth="1px"
          borderColor="nebula.border"
        >
          <GraduationCap className="h-10 w-10 text-nebula-violet" aria-hidden />
        </Box>
        <Box>
          <Heading size="lg" color="white">
            Educação Financeira
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Conteúdo estruturado para você tomar decisões com segurança
          </Text>
        </Box>
      </Flex>

      <Box
        mb={8}
        borderRadius="2xl"
        overflow="hidden"
        position="relative"
        minH="180px"
        className="card-premium"
      >
        <Box
          position="absolute"
          inset={0}
          bgImage="url(https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=85)"
          bgSize="cover"
          bgPosition="center"
          opacity={0.4}
          aria-hidden
        />
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-r, rgba(10,10,15,0.92) 0%, rgba(30,20,50,0.75) 70%, transparent 100%)"
          aria-hidden
        />
        <Flex position="relative" zIndex={1} p={6} align="center" minH="180px">
          <Box maxW="md">
            <Text fontSize="xs" fontWeight="600" color="brand.300" textTransform="uppercase" letterSpacing="wider" mb={2}>
              Conhecimento que transforma
            </Text>
            <Heading size="md" color="white" mb={2}>
              Invista no seu futuro com educação financeira de qualidade
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Módulos práticos sobre orçamento, reserva de emergência, investimentos e metas.
            </Text>
          </Box>
        </Flex>
      </Box>

      <Box mb={8} p={5} borderRadius="2xl" bg="brand.600" borderWidth="1px" borderColor="whiteAlpha.200">
        <Flex align="center" gap={3} flexWrap="wrap">
          <PiggyBank className="h-8 w-8 text-white shrink-0" aria-hidden />
          <Box>
            <Text fontWeight="600" color="white" fontSize="sm">
              Aprendizado contínuo
            </Text>
            <Text color="whiteAlpha.900" fontSize="sm">
              Siga os módulos na ordem sugerida e use o Assistente IA para tirar dúvidas sobre qualquer tema.
            </Text>
          </Box>
          <Link href="/app/assistente-ia" className="ml-auto">
            <Button
              size="sm"
              rightIcon={<Sparkles size={16} />}
              colorScheme="whiteAlpha"
              variant="outline"
              borderColor="whiteAlpha.400"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              minH="44px"
            >
              Perguntar à IA
            </Button>
          </Link>
        </Flex>
      </Box>

      <VStack align="stretch" spacing={4}>
        {MODULOS.map((mod, index) => {
          const isOpen = aberto === mod.id;
          const IconMod = mod.icon;
          return (
            <motion.div key={mod.id} variants={item}>
              <PremiumCard padding="normal" hover>
                <Box
                  as="button"
                  type="button"
                  width="100%"
                  textAlign="left"
                  onClick={() => setAberto(isOpen ? null : mod.id)}
                  py={2}
                >
                  <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
                    <Flex align="center" gap={4} minW={0}>
                      <Flex
                        w={12}
                        h={12}
                        borderRadius="xl"
                        bg="whiteAlpha.100"
                        align="center"
                        justify="center"
                        flexShrink={0}
                      >
                        <Icon as={IconMod} boxSize={6} color="brand.400" />
                      </Flex>
                      <Box minW={0}>
                        <Flex align="center" gap={2} flexWrap="wrap">
                          <Heading size="sm" color="white">
                            {index + 1}. {mod.titulo}
                          </Heading>
                          {mod.badge && (
                            <Badge
                              colorScheme="brand"
                              variant="subtle"
                              borderRadius="full"
                              fontSize="xs"
                            >
                              {mod.badge}
                            </Badge>
                          )}
                        </Flex>
                        <Text fontSize="sm" color="gray.500" mt={0.5}>
                          {mod.subtitulo}
                        </Text>
                      </Box>
                    </Flex>
                    <Icon
                      as={isOpen ? ChevronUp : ChevronDown}
                      boxSize={5}
                      color="gray.400"
                      flexShrink={0}
                    />
                  </Flex>
                </Box>
                <Collapse in={isOpen} animateOpacity>
                  <Box
                    pt={4}
                    mt={4}
                    borderTopWidth="1px"
                    borderColor="whiteAlpha.100"
                    pl={{ base: 0, sm: 16 }}
                  >
                    <Text fontWeight="600" color="gray.300" fontSize="sm" mb={3}>
                      Passo a passo
                    </Text>
                    <VStack align="stretch" spacing={2} mb={4}>
                      {mod.passos.map((passo, i) => (
                        <Flex key={i} align="flex-start" gap={3}>
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                          <Text fontSize="sm" color="gray.300">
                            {passo}
                          </Text>
                        </Flex>
                      ))}
                    </VStack>
                    <Box
                      p={3}
                      borderRadius="lg"
                      bg="whiteAlpha.50"
                      borderLeftWidth="4px"
                      borderLeftColor="brand.400"
                    >
                      <Text fontSize="sm" color="gray.300">
                        <Text as="span" fontWeight="600" color="brand.300">
                          Dica:
                        </Text>{' '}
                        {mod.dica}
                      </Text>
                    </Box>
                    <Flex justify="flex-end" mt={3}>
                      <Link href="/app/assistente-ia">
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="brand"
                          rightIcon={<ArrowRight size={14} />}
                          minH="40px"
                        >
                          Tirar dúvida com a IA
                        </Button>
                      </Link>
                    </Flex>
                  </Box>
                </Collapse>
              </PremiumCard>
            </motion.div>
          );
        })}
      </VStack>

      <Box mt={10} p={6} borderRadius="2xl" borderWidth="1px" borderColor="nebula.border" bg="whiteAlpha.30">
        <Heading size="sm" color="white" mb={2}>
          Próximos passos
        </Heading>
        <Text fontSize="sm" color="gray.400" mb={4}>
          Use o Dashboard para acompanhar saldo e metas, as telas de Contas a pagar e a receber para não perder prazos, e o Assistente IA sempre que quiser aprofundar em algum tema.
        </Text>
        <Flex gap={3} flexWrap="wrap">
          <Link href="/app/dashboard">
            <Button size="sm" colorScheme="brand" variant="outline" minH="44px">
              Ir ao Dashboard
            </Button>
          </Link>
          <Link href="/app/assistente-ia">
            <Button size="sm" colorScheme="brand" minH="44px">
              Abrir Assistente IA
            </Button>
          </Link>
        </Flex>
      </Box>
    </motion.div>
    </PlanGate>
  );
}
