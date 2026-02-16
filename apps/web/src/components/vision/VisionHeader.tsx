'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Text,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { Search, User, Menu as MenuIcon, Settings, LogOut } from 'lucide-react';

type VisionHeaderProps = {
  onMenuClick?: () => void;
};

export function VisionHeader({ onMenuClick }: VisionHeaderProps) {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Usuário');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.name && setUserName(data.name))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    router.push('/login');
  };

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={30}
      py={{ base: 3, md: 4 }}
      px={{ base: 4, md: 6 }}
      borderBottom="1px solid"
      borderColor="nebula.border"
      bg="rgba(10,10,15,0.9)"
      backdropFilter="blur(12px)"
    >
      <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
        <Flex align="center" gap={3} flex={1} minW={0}>
          <Box
            as="button"
            type="button"
            onClick={onMenuClick}
            display={{ md: 'none' }}
            p={2}
            minH="44px"
            minW="44px"
            borderRadius="xl"
            _hover={{ bg: 'whiteAlpha.100' }}
            aria-label="Abrir menu"
          >
            <Icon as={MenuIcon} boxSize={6} color="gray.300" />
          </Box>
          <InputGroup maxW={{ base: '100%', sm: '280px', md: '400px' }} size="md" flex={1}>
            <InputLeftElement pointerEvents="none" height="100%">
              <Icon as={Search} color="gray.500" boxSize={4} />
            </InputLeftElement>
            <Input
              placeholder="Buscar..."
              variant="vision"
              pl={10}
              _placeholder={{ color: 'gray.500' }}
            />
          </InputGroup>
        </Flex>
        <Flex align="center" gap={2} flexShrink={0}>
          <Menu placement="bottom-end" strategy="fixed" gutter={8}>
            <MenuButton
              as={Box}
              cursor="pointer"
              minH="44px"
              borderRadius="xl"
              px={3}
              py={2}
              _hover={{ bg: 'whiteAlpha.100' }}
              _expanded={{ bg: 'whiteAlpha.150' }}
            >
              <Flex align="center" gap={3}>
                <Avatar size="sm" name={userName} bg="brand.500" icon={<User size={20} />} />
                <Box display={{ base: 'none', sm: 'block' }} textAlign="left">
                  <Text fontSize="sm" fontWeight="600" color="white" noOfLines={1}>
                    {userName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Minha conta
                  </Text>
                </Box>
              </Flex>
            </MenuButton>
            <MenuList
              bg="rgba(18,18,24,0.98)"
              borderColor="nebula.border"
              borderWidth="1px"
              borderRadius="xl"
              py={2}
              minW="200px"
              boxShadow="xl"
            >
              <MenuItem
                as={Link}
                href="/app/configuracoes"
                icon={<Settings size={18} />}
                color="gray.200"
                _hover={{ bg: 'whiteAlpha.100' }}
                _focus={{ bg: 'whiteAlpha.100' }}
              >
                Configurações
              </MenuItem>
              <MenuDivider borderColor="nebula.border" />
              <MenuItem
                icon={<LogOut size={18} />}
                color="red.300"
                _hover={{ color: 'white', bg: 'red.600' }}
                _focus={{ color: 'white', bg: 'red.600' }}
                onClick={handleLogout}
              >
                Sair
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
}
