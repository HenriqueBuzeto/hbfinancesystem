'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Heading, Button, Textarea } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { PlanGate } from '@/components/plans/PlanGate';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Message = { role: 'user' | 'assistant'; content: string };

export default function AssistenteIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou o Assistente Financeiro do HB Finance. Pergunte sobre orçamento, investimentos, reserva de emergência, dívidas ou metas financeiras. Como posso ajudar?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      refreshAccessToken().catch(() => {});
    }
  }, []);

  const getToken = () =>
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) return null;
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    const newAccess = data?.accessToken;
    if (newAccess && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', newAccess);
      return newAccess;
    }
    return null;
  };

  const sendMessage = async (retryWithText?: string) => {
    const text = (retryWithText ?? input.trim()).trim();
    if (!text || loading) return;

    if (!retryWithText) {
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: text }]);
    }
    setLoading(true);

    try {
      let token = getToken();
      if (!token && !retryWithText) {
        token = await refreshAccessToken();
      }
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401 && !retryWithText) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          setLoading(false);
          sendMessage(text);
          return;
        }
      }

      if (!res.ok) {
        const errMsg = data?.error || 'Erro ao enviar mensagem';
        const hint = data?.hint;
        const isUnauthorized = res.status === 401;
        const isQuotaOrConfig = res.status === 502 || res.status === 503;
        const content = isUnauthorized
          ? 'Sessão expirada ou não identificada. Faça login novamente para usar o Assistente IA.\n\nAcesse o menu e faça logout, depois entre de novo com seu e-mail e senha.'
          : hint
            ? `⚠️ ${errMsg}\n\n${hint}`
            : isQuotaOrConfig
              ? `⚠️ ${errMsg}\n\nTente novamente em alguns minutos. Se o problema continuar, o administrador do sistema precisa verificar a integração com a IA.`
              : `Não foi possível obter resposta: ${errMsg}.`;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Sem resposta.' },
      ]);
    } catch {
      toast.error('Falha na conexão');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro de conexão. Tente novamente em instantes.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlanGate feature="aiAssistant" requiredPlan="START">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}
    >
      <Flex align="center" gap={3} mb={6}>
        <Box
          p={3}
          borderRadius="2xl"
          bg="whiteAlpha.100"
          borderWidth="1px"
          borderColor="nebula.border"
        >
          <Sparkles className="h-8 w-8 text-nebula-violet" aria-hidden />
        </Box>
        <Box>
          <Heading size="lg" color="white">
            Assistente IA
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Dúvidas sobre finanças e investimentos? Pergunte aqui.
          </Text>
        </Box>
      </Flex>

      <Box
        className="card-premium card-premium-inner"
        borderRadius="2xl"
        overflow="hidden"
        minH="400px"
        display="flex"
        flexDirection="column"
      >
        <Box
          flex={1}
          overflowY="auto"
          p={4}
          display="flex"
          flexDirection="column"
          gap={4}
          minH="320px"
          maxH="60vh"
        >
          {messages.map((m, i) => (
            <Flex
              key={i}
              justify={m.role === 'user' ? 'flex-end' : 'flex-start'}
            >
              <Box
                maxW="85%"
                px={4}
                py={3}
                borderRadius="2xl"
                bg={m.role === 'user' ? 'brand.600' : 'whiteAlpha.100'}
                borderWidth="1px"
                borderColor={m.role === 'user' ? 'transparent' : 'nebula.border'}
              >
                <Text
                  fontSize="sm"
                  color={m.role === 'user' ? 'white' : 'gray.200'}
                  whiteSpace="pre-wrap"
                >
                  {m.content}
                </Text>
              </Box>
            </Flex>
          ))}
          {loading && (
            <Flex justify="flex-start">
              <Box
                px={4}
                py={3}
                borderRadius="2xl"
                bg="whiteAlpha.100"
                borderWidth="1px"
                borderColor="nebula.border"
              >
                <Loader2 className="h-5 w-5 animate-spin text-nebula-violet" aria-hidden />
              </Box>
            </Flex>
          )}
          <div ref={bottomRef} />
        </Box>

        <Box p={4} borderTopWidth="1px" borderColor="nebula.border">
          <Flex gap={3} align="flex-end">
            <Textarea
              placeholder="Digite sua pergunta sobre finanças..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              minH="100px"
              maxH="280px"
              rows={5}
              resize="vertical"
              borderRadius="xl"
              borderColor="nebula.border"
              bg="whiteAlpha.50"
              color="white"
              fontSize="md"
              _placeholder={{ color: 'gray.500' }}
              _focus={{ borderColor: 'brand.400', boxShadow: '0 0 0 1px var(--nebula-purple)' }}
              flex={1}
            />
            <Button
              leftIcon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={20} />}
              onClick={() => sendMessage()}
              isDisabled={loading || !input.trim()}
              colorScheme="brand"
              minH="100px"
              minW="56px"
              px={5}
              borderRadius="xl"
            >
              Enviar
            </Button>
          </Flex>
        </Box>
      </Box>
    </motion.div>
    </PlanGate>
  );
}
