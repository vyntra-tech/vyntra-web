import React, { useState, useEffect } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  Badge,
  Image,
  useToast,
} from '@chakra-ui/react'
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import vyntraLogo from '../../assets/vyntra-logo.png'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()

  // If already authenticated, redirect immediately to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Please provide both your administrator email and password.')
      return
    }

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      toast({
        title: 'Authentication Successful',
        description: 'Welcome to the VYNTRA Command Center.',
        status: 'success',
        duration: 2500,
        isClosable: true,
        position: 'top-right',
      })
      navigate('/admin/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  const fillCredentials = (type: 'admin' | 'editor') => {
    if (type === 'admin') {
      setEmail('admin@vyntra.tech')
      setPassword('VyntraAdmin@2026!')
    } else {
      setEmail('editor@vyntra.tech')
      setPassword('VyntraEditor@2026!')
    }
    setError(null)
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#04060B" px={4} py={12} position="relative" overflow="hidden">
      {/* Decorative ambient glowing backdrops */}
      <Box
        position="absolute"
        top="-10%"
        left="20%"
        w="450px"
        h="450px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(124, 58, 237, 0.22) 0%, transparent 70%)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="20%"
        w="450px"
        h="450px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Box
        w="full"
        maxW="440px"
        bg="#080D1A"
        p={{ base: 6, md: 8 }}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.07)"
        boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 25px 50px -12px rgba(0, 0, 0, 0.85)"
        position="relative"
        zIndex={1}
      >
        {/* Brand Header with Official 3D Glowing V Logo */}
        <VStack spacing={3} align="center" mb={6}>
          <Box position="relative" display="flex" alignItems="center" justifyContent="center">
            {/* Ambient Purple-Cyan Glow */}
            <Box
              position="absolute"
              w="90px"
              h="90px"
              borderRadius="full"
              bg="radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, rgba(6, 182, 212, 0.25) 50%, transparent 75%)"
              filter="blur(18px)"
              pointerEvents="none"
            />
            <Image
              src={vyntraLogo}
              alt="VYNTRA 3D Emblem"
              w="78px"
              h="78px"
              objectFit="contain"
              position="relative"
              zIndex={1}
              filter="drop-shadow(0 10px 24px rgba(124, 58, 237, 0.45))"
              transition="transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              _hover={{ transform: 'scale(1.06)' }}
            />
          </Box>
          <Box textAlign="center">
            <Heading size="lg" fontFamily="heading" color="white" fontWeight="700" letterSpacing="-0.02em">
              VYNTRA Admin
            </Heading>
            <Text fontSize="xs" color="gray.400" mt={1}>
              Secure sign-in for content and infrastructure operations
            </Text>
          </Box>
        </VStack>

        {error && (
          <Alert status="error" borderRadius="lg" mb={5} bg="rgba(239, 68, 68, 0.12)" borderColor="red.500" borderWidth="1px">
            <AlertIcon color="red.400" />
            <AlertDescription fontSize="xs" color="red.200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired isInvalid={Boolean(error)}>
              <FormLabel fontSize="xs" color="gray.300" fontWeight="600">
                Email Address
              </FormLabel>
              <InputGroup size="md">
                <Input
                  type="email"
                  placeholder="admin@vyntra.tech"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </InputGroup>
            </FormControl>

            <FormControl isRequired isInvalid={Boolean(error)}>
              <Flex justify="space-between" align="center" mb={1}>
                <FormLabel fontSize="xs" color="gray.300" fontWeight="600" mb={0}>
                  Password
                </FormLabel>
                <RouterLink to="/admin/forgot-password">
                  <Text fontSize="xs" color="cyan.400" _hover={{ textDecoration: 'underline' }}>
                    Forgot password?
                  </Text>
                </RouterLink>
              </Flex>
              <InputGroup size="md">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <InputRightElement>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    color="gray.400"
                    _hover={{ color: 'white' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              w="full"
              variant="gradient"
              size="md"
              mt={2}
              isLoading={submitting}
              loadingText="Verifying..."
              rightIcon={<ArrowRight size={16} />}
            >
              Sign In to Dashboard
            </Button>
          </VStack>
        </form>

        <Divider my={6} borderColor="rgba(255, 255, 255, 0.1)" />

        {/* Quick Demo Credentials Autofill */}
        <Box bg="rgba(255, 255, 255, 0.03)" p={3} borderRadius="lg" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.06)">
          <HStack justify="space-between" mb={2}>
            <HStack spacing={1.5} color="cyan.400">
              <ShieldCheck size={14} />
              <Text fontSize="2xs" fontWeight="700" letterSpacing="wider">
                QUICK ACCESS PROFILES
              </Text>
            </HStack>
          </HStack>
          <HStack spacing={2}>
            <Button
              size="xs"
              variant="outline"
              flex={1}
              onClick={() => fillCredentials('admin')}
              borderColor="brand.400"
              color="white"
            >
              Admin Lead
            </Button>
            <Button
              size="xs"
              variant="outline"
              flex={1}
              onClick={() => fillCredentials('editor')}
              borderColor="cyan.400"
              color="white"
            >
              Content Editor
            </Button>
          </HStack>
        </Box>

        <Flex justify="center" mt={4}>
          <RouterLink to="/">
            <Text fontSize="xs" color="gray.400" _hover={{ color: 'cyan.400' }}>
              ← Return to VYNTRA Public Website
            </Text>
          </RouterLink>
        </Flex>
      </Box>
    </Flex>
  )
}
