'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ApexOptions } from 'apexcharts';
import {
  Box,
  Flex,
  Grid,
  Text,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Skeleton,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
} from '@chakra-ui/react';
import { PremiumCard } from '@/components/dashboard/PremiumCard';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { InvestmentTipsCard } from '@/components/dashboard/InvestmentTipsCard';
import { DashboardClockOnly } from '@/components/dashboard/DashboardClockOnly';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const ChartLine = dynamic(() => import('react-apexcharts').then((m) => m.default), { ssr: false });
const ChartBar = dynamic(() => import('react-apexcharts').then((m) => m.default), { ssr: false });
const ChartDonut = dynamic(() => import('react-apexcharts').then((m) => m.default), { ssr: false });

type PeriodFilter = 'day' | 'month' | 'year';

type Summary = {
  saldoAtual: number;
  receitasMes: number;
  despesasMes: number;
  resultadoMes: number;
  comparativoPercentual: number;
  evolution: Array<{ label: string; receitas: number; despesas: number; saldo: number }>;
  expensesByCategory: Array<{ name: string; valor: number }>;
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
    categoryName: string | null;
    accountName: string;
  }>;
  billsPayable: Array<{
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
    categoryName: string | null;
  }>;
  billsReceivable: Array<{
    id: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
    categoryName: string | null;
  }>;
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const CHART_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ec4899', '#22c55e'];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch(`/api/dashboard/summary?period=${period}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Falha ao carregar dados');
      const json = await res.json();
      setData(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao carregar';
      setError(msg);
      setData(null);
      toast({ title: msg, status: 'error', isClosable: true });
    } finally {
      setLoading(false);
    }
  }, [period, toast]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const summary = data ?? {
    saldoAtual: 0,
    receitasMes: 0,
    despesasMes: 0,
    resultadoMes: 0,
    comparativoPercentual: 0,
    evolution: [],
    expensesByCategory: [],
    recentTransactions: [],
    billsPayable: [],
    billsReceivable: [],
  };

  const evolutionChart = summary.evolution.map((e) => ({
    ...e,
    receitas: Math.round(e.receitas * 100) / 100,
    despesas: Math.round(e.despesas * 100) / 100,
    saldo: Math.round(e.saldo * 100) / 100,
  }));

  const periodLabels: Record<PeriodFilter, string> = {
    day: 'Dia',
    month: 'Mês',
    year: 'Ano',
  };

  const lineOptions: ApexOptions = {
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false } },
    theme: { mode: 'dark' },
    colors: ['#7c3aed', '#8b5cf6', '#22c55e'],
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: 'rgba(124,58,237,0.15)', strokeDashArray: 3 },
    xaxis: {
      categories: evolutionChart.map((e) => e.label),
      labels: { style: { colors: '#a1a1aa' } },
    },
    yaxis: {
      labels: {
        formatter: (v) => formatCurrency(Number(v)),
        style: { colors: '#a1a1aa' },
      },
    },
    legend: { labels: { colors: '#d4d4d8' } },
    tooltip: {
      theme: 'dark',
      y: { formatter: (v) => formatCurrency(Number(v)) },
    },
  };

  const lineSeries = [
    { name: 'Receitas', data: evolutionChart.map((e) => e.receitas) },
    { name: 'Despesas', data: evolutionChart.map((e) => e.despesas) },
    { name: 'Resultado', data: evolutionChart.map((e) => e.saldo) },
  ];

  const barOptions: ApexOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    theme: { mode: 'dark' },
    colors: CHART_COLORS,
    plotOptions: { bar: { borderRadius: 8, columnWidth: '60%' } },
    grid: { borderColor: 'rgba(124,58,237,0.15)' },
    xaxis: {
      categories: summary.expensesByCategory.map((c) => c.name),
      labels: { style: { colors: '#a1a1aa' } },
    },
    yaxis: {
      labels: {
        formatter: (v) => `R$ ${Number(v) / 1000}k`,
        style: { colors: '#a1a1aa' },
      },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: (v) => formatCurrency(Number(v)) },
    },
  };

  const barSeries = [{ name: 'Despesas', data: summary.expensesByCategory.map((c) => c.valor) }];

  const donutSeries = [
    summary.receitasMes,
    summary.despesasMes,
    Math.max(0, summary.resultadoMes),
  ].filter((v) => v > 0);
  const donutLabels = ['Receitas', 'Despesas', 'Resultado'].slice(0, donutSeries.length);
  const donutOptions: ApexOptions = {
    chart: { type: 'donut' },
    theme: { mode: 'dark' },
    colors: ['#7c3aed', '#8b5cf6', '#22c55e'],
    labels: donutLabels,
    legend: { labels: { colors: '#d4d4d8' }, position: 'bottom' },
    dataLabels: { enabled: true },
    plotOptions: { pie: { donut: { size: '65%' } } },
    tooltip: { y: { formatter: (v) => formatCurrency(Number(v)) } },
  };

  if (loading && !data) {
    return (
      <Box>
        <Skeleton height="40px" width="200px" mb={4} />
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }} gap={4} mb={8}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="120px" borderRadius="16px" />
          ))}
        </Grid>
        <Skeleton height="320px" borderRadius="16px" mb={6} />
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
          <Skeleton height="280px" borderRadius="16px" />
          <Skeleton height="280px" borderRadius="16px" />
        </Grid>
      </Box>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ width: '100%' }}
    >
      <HeroSection />
      <Grid templateColumns={{ base: '1fr', lg: '1fr 320px' }} gap={6} mb={6} alignItems="start">
        <Box>
          <Heading size="lg" color="white" mb={1}>
            Dashboard
          </Heading>
          <Text color="gray.400" fontSize="sm" mb={4}>
            Visão geral das suas finanças em tempo real
          </Text>
          <Flex gap={2} p={1} borderRadius="12px" bg="whiteAlpha.100" borderWidth="1px" borderColor="nebula.border" flexWrap="wrap">
          {(['day', 'month', 'year'] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'solid' : 'ghost'}
              colorScheme={period === p ? 'brand' : 'gray'}
              leftIcon={<Calendar size={14} />}
              onClick={() => setPeriod(p)}
              minH="44px"
            >
              {periodLabels[p]}
            </Button>
          ))}
          </Flex>
        </Box>
        <Box minW={0}>
          <DashboardClockOnly />
        </Box>
      </Grid>

      {error && (
        <motion.div variants={item}>
          <Box
            p={4}
            borderRadius="12px"
            borderWidth="1px"
            borderColor="orange.400"
            bg="orange.500"
            bgGradient="linear(to-r, orange.500, orange.600)"
            color="white"
            mb={6}
          >
            {error}. Faça login para ver dados reais ou configure o banco.
          </Box>
        </motion.div>
      )}

      {/* Cards de resumo financeiro */}
      <Grid
        templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }}
        gap={4}
        mb={6}
      >
        {[
          {
            title: 'Saldo atual',
            value: summary.saldoAtual,
            subtitle: 'Contas consolidadas',
            icon: Wallet,
            color: 'brand.400',
          },
          {
            title: 'Receitas (mês)',
            value: summary.receitasMes,
            subtitle: 'Entradas',
            icon: TrendingUp,
            color: 'green.400',
          },
          {
            title: 'Despesas (mês)',
            value: summary.despesasMes,
            subtitle: 'Saídas',
            icon: TrendingDown,
            color: 'red.400',
          },
          {
            title: 'Resultado mensal',
            value: summary.resultadoMes,
            subtitle: summary.resultadoMes >= 0 ? 'Lucro' : 'Prejuízo',
            icon: summary.resultadoMes >= 0 ? ArrowUpRight : ArrowDownRight,
            color: summary.resultadoMes >= 0 ? 'green.400' : 'red.400',
          },
          {
            title: 'Comparativo',
            value: `${summary.comparativoPercentual >= 0 ? '+' : ''}${summary.comparativoPercentual.toFixed(1)}%`,
            subtitle: 'vs mês anterior',
            icon: Percent,
            color: 'brand.300',
          },
        ].map((card) => (
          <motion.div key={card.title} variants={item}>
            <PremiumCard hover>
              <Flex align="center" justify="space-between" mb={2}>
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600">
                  {card.title}
                </Text>
                <Icon as={card.icon} boxSize={5} color={card.color} />
              </Flex>
              <Text fontSize="xl" fontWeight="bold" color="white">
                {typeof card.value === 'number' ? formatCurrency(card.value) : card.value}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {card.subtitle}
              </Text>
            </PremiumCard>
          </motion.div>
        ))}
      </Grid>

      {/* Gráfico de linha - evolução do saldo */}
      <motion.div variants={item}>
        <PremiumCard className="mb-6" padding="lg">
          <Heading size="md" color="white" mb={4}>
            Evolução – Receitas, Despesas e Resultado
          </Heading>
          {evolutionChart.length === 0 ? (
            <Flex h="280px" align="center" justify="center" color="gray.500">
              Nenhum dado no período. Cadastre transações para visualizar.
            </Flex>
          ) : (
            <Box h="280px">
              <ChartLine options={lineOptions} series={lineSeries} type="line" height="100%" />
            </Box>
          )}
        </PremiumCard>
      </motion.div>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
        {/* Barras - despesas por categoria */}
        <motion.div variants={item}>
          <PremiumCard padding="lg">
            <Heading size="md" color="white" mb={4}>
              Despesas por categoria (mês)
            </Heading>
            {summary.expensesByCategory.length === 0 ? (
              <Flex h="260px" align="center" justify="center" color="gray.500">
                Nenhuma despesa no mês.
              </Flex>
            ) : (
              <Box h="260px">
                <ChartBar options={barOptions} series={barSeries} type="bar" height="100%" />
              </Box>
            )}
          </PremiumCard>
        </motion.div>

        {/* Donut - resumo do mês */}
        <motion.div variants={item}>
          <PremiumCard padding="lg">
            <Heading size="md" color="white" mb={4}>
              Resumo do mês
            </Heading>
            {donutSeries.length === 0 ? (
              <Flex h="260px" align="center" justify="center" color="gray.500">
                Sem dados para exibir.
              </Flex>
            ) : (
              <Box h="260px">
                <ChartDonut
                  options={donutOptions}
                  series={donutSeries}
                  type="donut"
                  height="100%"
                />
              </Box>
            )}
          </PremiumCard>
        </motion.div>
      </Grid>

      <Box mb={8}>
        <InvestmentTipsCard />
      </Box>

      {/* Tabelas financeiras */}
      <motion.div variants={item}>
        <Tabs variant="soft-rounded" colorScheme="brand">
          <TabList mb={4} gap={2} flexWrap="wrap">
            <Tab>Últimas movimentações</Tab>
            <Tab>Contas a pagar</Tab>
            <Tab>Contas a receber</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <PremiumCard padding="lg">
                <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th color="gray.400">Descrição</Th>
                          <Th color="gray.400" isNumeric>Valor</Th>
                          <Th color="gray.400">Data</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {summary.recentTransactions.length === 0 ? (
                          <Tr>
                            <Td colSpan={3} color="gray.500" textAlign="center" py={8}>
                              Nenhuma movimentação.
                            </Td>
                          </Tr>
                        ) : (
                          summary.recentTransactions.slice(0, 10).map((t) => (
                            <Tr key={t.id}>
                              <Td color="white">
                                {t.description}
                                {t.categoryName && (
                                  <Text as="span" color="gray.500" ml={2}>
                                    · {t.categoryName}
                                  </Text>
                                )}
                              </Td>
                              <Td
                                isNumeric
                                color={t.type === 'INCOME' ? 'green.400' : 'red.400'}
                                fontWeight="600"
                              >
                                {t.type === 'INCOME' ? '+' : '-'}
                                {formatCurrency(Math.abs(t.amount))}
                              </Td>
                              <Td color="gray.400">
                                {new Date(t.date).toLocaleDateString('pt-BR')}
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <Flex justify="flex-end" mt={3}>
                    <Link href="/app/contas">
                      <Button size="sm" variant="ghost" colorScheme="brand" rightIcon={<ArrowUpRight size={14} />}>
                        Ver todas
                      </Button>
                    </Link>
                  </Flex>
              </PremiumCard>
            </TabPanel>
            <TabPanel px={0}>
              <PremiumCard padding="lg">
                <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th color="gray.400">Descrição</Th>
                          <Th color="gray.400" isNumeric>Valor</Th>
                          <Th color="gray.400">Vencimento</Th>
                          <Th color="gray.400">Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {summary.billsPayable.length === 0 ? (
                          <Tr>
                            <Td colSpan={4} color="gray.500" textAlign="center" py={8}>
                              Nenhuma conta a pagar.
                            </Td>
                          </Tr>
                        ) : (
                          summary.billsPayable.slice(0, 10).map((b) => (
                            <Tr key={b.id}>
                              <Td color="white">{b.description}</Td>
                              <Td isNumeric color="red.400" fontWeight="600">
                                {formatCurrency(b.amount)}
                              </Td>
                              <Td color="gray.400">
                                {new Date(b.dueDate).toLocaleDateString('pt-BR')}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={b.status === 'OVERDUE' ? 'red' : 'yellow'}
                                  variant="subtle"
                                  borderRadius="full"
                                >
                                  {b.status === 'OVERDUE' ? 'Vencida' : 'Pendente'}
                                </Badge>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <Flex justify="flex-end" mt={3}>
                    <Link href="/app/contas-a-pagar">
                      <Button size="sm" variant="ghost" colorScheme="brand" rightIcon={<ArrowUpRight size={14} />}>
                        Ver todas
                      </Button>
                    </Link>
                  </Flex>
              </PremiumCard>
            </TabPanel>
            <TabPanel px={0}>
              <PremiumCard padding="lg">
                <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th color="gray.400">Descrição</Th>
                          <Th color="gray.400" isNumeric>Valor</Th>
                          <Th color="gray.400">Vencimento</Th>
                          <Th color="gray.400">Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {summary.billsReceivable.length === 0 ? (
                          <Tr>
                            <Td colSpan={4} color="gray.500" textAlign="center" py={8}>
                              Nenhuma conta a receber.
                            </Td>
                          </Tr>
                        ) : (
                          summary.billsReceivable.slice(0, 10).map((b) => (
                            <Tr key={b.id}>
                              <Td color="white">{b.description}</Td>
                              <Td isNumeric color="green.400" fontWeight="600">
                                {formatCurrency(b.amount)}
                              </Td>
                              <Td color="gray.400">
                                {new Date(b.dueDate).toLocaleDateString('pt-BR')}
                              </Td>
                              <Td>
                                <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                                  Pendente
                                </Badge>
                              </Td>
                            </Tr>
                          ))
                        )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <Flex justify="flex-end" mt={3}>
                    <Link href="/app/contas-a-receber">
                      <Button size="sm" variant="ghost" colorScheme="brand" rightIcon={<ArrowUpRight size={14} />}>
                        Ver todas
                      </Button>
                    </Link>
                  </Flex>
              </PremiumCard>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
