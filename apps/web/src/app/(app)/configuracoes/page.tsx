'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Box,
  Flex,
  Text,
  Heading,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  VStack,
  HStack,
  Skeleton,
  Select,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import {
  User,
  Mail,
  Phone,
  Bell,
  Save,
  Loader2,
  ArrowRight,
  CheckCircle,
  Settings,
  Shield,
  FileText,
  LogOut,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { PremiumCard } from '@/components/dashboard/PremiumCard';

const PREF_CURRENCY_KEY = 'hbfinance_pref_currency';
const PREF_DATE_FORMAT_KEY = 'hbfinance_pref_date_format';

const FINANCIAL_GOAL_OPTIONS = [
  { value: '', label: 'Selecione' },
  { value: 'controle_financeiro', label: 'Ter controle financeiro' },
  { value: 'guardar_dinheiro', label: 'Guardar dinheiro' },
  { value: 'investir', label: 'Investir' },
  { value: 'sair_das_dividas', label: 'Sair das dívidas' },
  { value: 'outros', label: 'Outros' },
];

type Profile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  tenantId: string;
  monthlyIncome?: number | null;
  financialGoal?: string | null;
  birthYear?: number | null;
  tenant?: { name: string; slug: string; type: string; currentPlan?: string };
  createdAt?: string;
};

type SettingsTab = 'perfil' | 'mais-dados';

function splitFullName(fullName: string): { nome: string; sobrenome: string } {
  const trimmed = (fullName ?? '').trim();
  if (!trimmed) return { nome: '', sobrenome: '' };
  const parts = trimmed.split(/\s+/);
  const nome = parts[0] ?? '';
  const sobrenome = parts.slice(1).join(' ') ?? '';
  return { nome, sobrenome };
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) return null;
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  const access = data?.accessToken;
  if (access && typeof window !== 'undefined') {
    localStorage.setItem('accessToken', access);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    return access;
  }
  return null;
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('perfil');

  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [financialGoal, setFinancialGoal] = useState('');
  const [birthYear, setBirthYear] = useState<string>('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [currency, setCurrency] = useState('BRL');
  const [dateFormat, setDateFormat] = useState('DD/MM/AAAA');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      let token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      let res = await fetch('/api/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          res = await fetch('/api/me', {
            headers: { Authorization: `Bearer ${newToken}` },
          });
        }
      }
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        const { nome, sobrenome } = splitFullName(data.name ?? '');
        setName(nome);
        setLastName(sobrenome);
        setEmail(data.email ?? '');
        setPhone(data.phone ?? '');
        setMonthlyIncome(data.monthlyIncome != null ? String(data.monthlyIncome) : '');
        setFinancialGoal(data.financialGoal ?? '');
        setBirthYear(data.birthYear != null ? String(data.birthYear) : '');
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
    if (typeof window !== 'undefined') {
      setCurrency(localStorage.getItem(PREF_CURRENCY_KEY) || 'BRL');
      setDateFormat(localStorage.getItem(PREF_DATE_FORMAT_KEY) || 'DD/MM/AAAA');
    }
  }, [loadProfile]);

  function fullName() {
    return [name.trim(), lastName.trim()].filter(Boolean).join(' ') || undefined;
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: fullName(),
          email: email.trim() || undefined,
          phone: phone.trim() || null,
          monthlyIncome: monthlyIncome ? Number(monthlyIncome) : null,
          financialGoal: financialGoal || null,
          birthYear: birthYear ? Number(birthYear) : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setProfile((p) => (p ? { ...p, ...data } : null));
        sonnerToast.success('Dados salvos com sucesso.');
      } else {
        sonnerToast.error(data?.error || 'Falha ao salvar.');
      }
    } catch {
      sonnerToast.error('Erro de conexão.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      sonnerToast.error('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      sonnerToast.error('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setSavingPassword(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
        sonnerToast.success('Senha alterada com sucesso.');
      } else {
        sonnerToast.error(data?.error || 'Falha ao alterar senha.');
      }
    } catch {
      sonnerToast.error('Erro de conexão.');
    } finally {
      setSavingPassword(false);
    }
  }

  function handleSavePreferences() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREF_CURRENCY_KEY, currency);
      localStorage.setItem(PREF_DATE_FORMAT_KEY, dateFormat);
      sonnerToast.success('Preferências salvas.');
    }
  }

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    router.push('/login');
  }

  if (loading) {
    return (
      <Box maxW="3xl" mx="auto">
        <Skeleton height="48px" width="240px" mb={8} borderRadius="xl" />
        <VStack align="stretch" spacing={6}>
          <Skeleton height="320px" borderRadius="2xl" />
          <Skeleton height="200px" borderRadius="2xl" />
        </VStack>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}
    >
      <Flex align="center" gap={4} mb={8}>
        <Box
          p={4}
          borderRadius="2xl"
          bg="whiteAlpha.100"
          borderWidth="1px"
          borderColor="nebula.border"
        >
          <Settings className="h-10 w-10 text-brand.400" aria-hidden />
        </Box>
        <Box>
          <Heading size="lg" color="white">
            Configurações
          </Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Perfil (dados pessoais e financeiros) e configurações do app
          </Text>
        </Box>
      </Flex>

      <VStack align="stretch" spacing={8}>
        {/* Abas: Perfil | Mais dados */}
        <PremiumCard padding="lg">
          <Tabs
            index={activeTab === 'perfil' ? 0 : 1}
            onChange={(i) => setActiveTab(i === 0 ? 'perfil' : 'mais-dados')}
            variant="unstyled"
          >
            <TabList
              gap={2}
              p={1}
              borderRadius="xl"
              bg="whiteAlpha.50"
              borderWidth="1px"
              borderColor="nebula.border"
              mb={6}
            >
              <Tab
                flex={1}
                borderRadius="lg"
                color="gray.400"
                _selected={{ bg: 'brand.500', color: 'white', fontWeight: '600' }}
                _hover={{ color: 'whiteAlpha.800' }}
                onClick={() => setActiveTab('perfil')}
              >
                <Flex align="center" gap={2} justify="center">
                  <User className="h-4 w-4" />
                  Perfil
                </Flex>
              </Tab>
              <Tab
                flex={1}
                borderRadius="lg"
                color="gray.400"
                _selected={{ bg: 'brand.500', color: 'white', fontWeight: '600' }}
                _hover={{ color: 'whiteAlpha.800' }}
                onClick={() => setActiveTab('mais-dados')}
              >
                <Flex align="center" gap={2} justify="center">
                  <TrendingUp className="h-4 w-4" />
                  Mais dados
                </Flex>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Aba Perfil: nome, sobrenome, e-mail, telefone */}
              <TabPanel px={0}>
                <Text color="gray.500" fontSize="sm" mb={4}>
                  Dados do cliente: nome, e-mail e telefone. Todas as informações vêm preenchidas com o que está salvo na sua conta.
                </Text>
                <form onSubmit={handleSaveProfile}>
                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">Nome</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" height="100%">
                          <User className="h-4 w-4 text-gray.500" />
                        </InputLeftElement>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome"
                          pl={10}
                          borderRadius="xl"
                          borderColor="nebula.border"
                          bg="whiteAlpha.50"
                          color="white"
                          _placeholder={{ color: 'gray.500' }}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">Sobrenome</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" height="100%">
                          <User className="h-4 w-4 text-gray.500" />
                        </InputLeftElement>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Seu sobrenome"
                          pl={10}
                          borderRadius="xl"
                          borderColor="nebula.border"
                          bg="whiteAlpha.50"
                          color="white"
                          _placeholder={{ color: 'gray.500' }}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">E-mail</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" height="100%">
                          <Mail className="h-4 w-4 text-gray.500" />
                        </InputLeftElement>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          pl={10}
                          borderRadius="xl"
                          borderColor="nebula.border"
                          bg="whiteAlpha.50"
                          color="white"
                          _placeholder={{ color: 'gray.500' }}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">Telefone (WhatsApp)</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" height="100%">
                          <Phone className="h-4 w-4 text-gray.500" />
                        </InputLeftElement>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+55 11 99999-9999"
                          pl={10}
                          borderRadius="xl"
                          borderColor="nebula.border"
                          bg="whiteAlpha.50"
                          color="white"
                          _placeholder={{ color: 'gray.500' }}
                        />
                      </InputGroup>
                    </FormControl>
                    <Button
                      type="submit"
                      leftIcon={savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      colorScheme="brand"
                      borderRadius="xl"
                      minH="48px"
                      isLoading={savingProfile}
                    >
                      Salvar perfil
                    </Button>
                  </VStack>
                </form>
              </TabPanel>

              {/* Aba Mais dados: renda, objetivo, ano, conta */}
              <TabPanel px={0}>
                <Text color="gray.500" fontSize="sm" mb={4}>
                  Dados avançados: renda mensal, foco financeiro e ano de nascimento. Use para relatórios e personalização.
                </Text>
                <form onSubmit={handleSaveProfile}>
                  <VStack align="stretch" spacing={4}>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">Renda mensal (R$)</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none" height="100%">
                          <DollarSign className="h-4 w-4 text-gray.500" />
                        </InputLeftElement>
                        <Input
                          type="number"
                          min={0}
                          step={0.01}
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(e.target.value)}
                          placeholder="Ex: 5000"
                          pl={10}
                          borderRadius="xl"
                          borderColor="nebula.border"
                          bg="whiteAlpha.50"
                          color="white"
                          _placeholder={{ color: 'gray.500' }}
                        />
                      </InputGroup>
                      <FormHelperText color="gray.500">Usada em relatórios e metas.</FormHelperText>
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">Objetivo ao usar o site</FormLabel>
                      <Select
                        value={financialGoal}
                        onChange={(e) => setFinancialGoal(e.target.value)}
                        borderRadius="xl"
                        borderColor="nebula.border"
                        bg="whiteAlpha.50"
                        color="white"
                        placeholder="Selecione"
                      >
                        {FINANCIAL_GOAL_OPTIONS.map((opt) => (
                          <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                        ))}
                      </Select>
                      <FormHelperText color="gray.500">Seu foco: controle, guardar, investir, etc.</FormHelperText>
                    </FormControl>
                    <FormControl>
                      <FormLabel color="gray.400" fontSize="sm">Ano de nascimento</FormLabel>
                      <Input
                        type="number"
                        min={1920}
                        max={2010}
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        placeholder="Ex: 1990"
                        borderRadius="xl"
                        borderColor="nebula.border"
                        bg="whiteAlpha.50"
                        color="white"
                        _placeholder={{ color: 'gray.500' }}
                      />
                    </FormControl>
                    {profile?.tenant && (
                      <Flex align="center" gap={2} p={3} borderRadius="xl" bg="whiteAlpha.50" borderWidth="1px" borderColor="nebula.border">
                        <Building2 className="h-4 w-4 text-brand.400" />
                        <Box>
                          <Text fontSize="xs" color="gray.500">Conta</Text>
                          <Text fontSize="sm" color="white" fontWeight="500">{profile.tenant.name}</Text>
                          {profile.tenant.currentPlan && (
                            <Text fontSize="xs" color="gray.400">Plano: {profile.tenant.currentPlan}</Text>
                          )}
                        </Box>
                      </Flex>
                    )}
                    <Button
                      type="submit"
                      leftIcon={savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      colorScheme="brand"
                      borderRadius="xl"
                      minH="48px"
                      isLoading={savingProfile}
                    >
                      Salvar dados
                    </Button>
                  </VStack>
                </form>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </PremiumCard>

        {/* Configurações do app — notificações, preferências, segurança */}
        <Heading size="sm" color="gray.400" mt={2} mb={2}>
          Configurações do app
        </Heading>
        <PremiumCard padding="lg">
          <Flex align="center" gap={2} mb={4}>
            <Bell className="h-5 w-5 text-brand.400" />
            <Heading size="sm" color="white">
              Notificações
            </Heading>
          </Flex>
          <Text color="gray.400" fontSize="sm" mb={4}>
            Configure alertas por e-mail e WhatsApp: vencimentos, resumos e lembretes.
          </Text>
          <Button
            as={Link}
            href="/app/notificacoes"
            rightIcon={<ArrowRight className="h-4 w-4" />}
            variant="outline"
            borderColor="nebula.border"
            color="brand.300"
            _hover={{ bg: 'whiteAlpha.100' }}
            borderRadius="xl"
            minH="44px"
          >
            Abrir central de notificações
          </Button>
        </PremiumCard>

        {/* Segurança */}
        <PremiumCard padding="lg">
          <Flex align="center" gap={2} mb={6}>
            <Shield className="h-5 w-5 text-brand.400" />
            <Heading size="sm" color="white">
              Segurança
            </Heading>
          </Flex>
          <form onSubmit={handleChangePassword}>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel color="gray.400" fontSize="sm">Senha atual</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  borderRadius="xl"
                  borderColor="nebula.border"
                  bg="whiteAlpha.50"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.400" fontSize="sm">Nova senha</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  borderRadius="xl"
                  borderColor="nebula.border"
                  bg="whiteAlpha.50"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="gray.400" fontSize="sm">Confirmar nova senha</FormLabel>
                <Input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
                  minLength={6}
                  borderRadius="xl"
                  borderColor="nebula.border"
                  bg="whiteAlpha.50"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                />
              </FormControl>
              <Button
                type="submit"
                leftIcon={savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                variant="outline"
                borderColor="nebula.border"
                color="brand.300"
                _hover={{ bg: 'whiteAlpha.100' }}
                borderRadius="xl"
                minH="48px"
                isLoading={savingPassword}
              >
                Alterar senha
              </Button>
            </VStack>
          </form>
        </PremiumCard>

        {/* Preferências da conta */}
        <PremiumCard padding="lg">
          <Flex align="center" gap={2} mb={6}>
            <Calendar className="h-5 w-5 text-brand.400" />
            <Heading size="sm" color="white">
              Preferências da conta
            </Heading>
          </Flex>
          <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel color="gray.400" fontSize="sm">Moeda padrão</FormLabel>
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                borderRadius="xl"
                borderColor="nebula.border"
                bg="whiteAlpha.50"
                color="white"
              >
                <option value="BRL">Real (BRL)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </Select>
              <FormHelperText color="gray.500">Usada em relatórios e resumos.</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel color="gray.400" fontSize="sm">Formato de data</FormLabel>
              <Select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                borderRadius="xl"
                borderColor="nebula.border"
                bg="whiteAlpha.50"
                color="white"
              >
                <option value="DD/MM/AAAA">DD/MM/AAAA</option>
                <option value="MM/DD/AAAA">MM/DD/AAAA</option>
                <option value="AAAA-MM-DD">AAAA-MM-DD</option>
              </Select>
            </FormControl>
            <Button
              onClick={handleSavePreferences}
              colorScheme="brand"
              borderRadius="xl"
              minH="44px"
            >
              Salvar preferências
            </Button>
          </VStack>
        </PremiumCard>

        {/* Dados e privacidade */}
        <PremiumCard padding="lg">
          <Flex align="center" gap={2} mb={4}>
            <FileText className="h-5 w-5 text-brand.400" />
            <Heading size="sm" color="white">
              Dados e privacidade
            </Heading>
          </Flex>
          <Text color="gray.400" fontSize="sm" mb={4}>
            Seus dados financeiros são armazenados de forma segura e utilizados apenas para exibir o controle no HB Finance.
            Você pode exportar ou excluir dados entrando em contato com o suporte.
          </Text>
          <HStack spacing={3} flexWrap="wrap">
            <Button as={Link} href="/termos" size="sm" variant="ghost" color="gray.400" _hover={{ color: 'white' }}>
              Termos de uso
            </Button>
            <Button as={Link} href="/privacidade" size="sm" variant="ghost" color="gray.400" _hover={{ color: 'white' }}>
              Privacidade
            </Button>
          </HStack>
        </PremiumCard>

        {/* Encerrar sessão */}
        <PremiumCard padding="lg">
          <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
            <Box>
              <Text fontWeight="600" color="white" mb={1}>
                Encerrar sessão
              </Text>
              <Text fontSize="sm" color="gray.500">
                Sai da sua conta neste dispositivo. Será necessário fazer login novamente.
              </Text>
            </Box>
            <Button
              leftIcon={<LogOut className="h-4 w-4" />}
              variant="outline"
              borderColor="red.500"
              color="red.300"
              _hover={{ bg: 'red.600', color: 'white', borderColor: 'red.600' }}
              borderRadius="xl"
              minH="48px"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </Flex>
        </PremiumCard>
      </VStack>

      <Flex mt={8} justify="center">
        <Button as={Link} href="/app/dashboard" variant="ghost" color="gray.500" _hover={{ color: 'brand.300' }}>
          Voltar ao Dashboard
        </Button>
      </Flex>
    </motion.div>
  );
}
