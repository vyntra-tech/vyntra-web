import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  HStack,
  Badge,
} from '@chakra-ui/react'
import { authApi } from '../../services/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('admin@vyntra.tech')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toast = useToast()
  const navigate = useNavigate()

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await authApi.forgotPassword(email)
      if (res.resetToken) {
        setResetToken(res.resetToken)
      }
      setStep('reset')
      toast({
        title: 'Reset Code Generated',
        description: res.message || 'Verification token is ready for password reset.',
        status: 'info',
        duration: 4000,
        isClosable: true,
      })
    } catch (err: any) {
      setError(err.message || 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword(resetToken, newPassword)
      toast({
        title: 'Password Updated',
        description: 'Your password was successfully updated. Please sign in.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/admin/login')
    } catch (err: any) {
      setError(err.message || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#04060B" px={4} py={12}>
      <Box
        w="full"
        maxW="420px"
        bg="#080D1A"
        p={{ base: 6, md: 8 }}
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.07)"
        boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 25px 50px -12px rgba(0, 0, 0, 0.85)"
      >
        <VStack spacing={3} align="center" mb={6}>
          <Heading size="md" fontFamily="heading" color="white">
            {step === 'request' ? 'Reset Password' : 'Set New Password'}
          </Heading>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            {step === 'request'
              ? 'Enter your registered administrator email address to generate a recovery key.'
              : 'Enter your verification token and your new secure password.'}
          </Text>
        </VStack>

        {error && (
          <Alert status="error" borderRadius="lg" mb={4} bg="rgba(239, 68, 68, 0.12)" borderColor="red.500" borderWidth="1px">
            <AlertIcon color="red.400" />
            <AlertDescription fontSize="xs" color="red.200">{error}</AlertDescription>
          </Alert>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequest}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" color="gray.300">Admin Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vyntra.tech"
                />
              </FormControl>
              <Button type="submit" w="full" variant="gradient" size="md" isLoading={loading}>
                Generate Reset Key
              </Button>
            </VStack>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" color="gray.300">Reset Token Key</FormLabel>
                <Input
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste reset token here"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" color="gray.300">New Password (8+ chars)</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              </FormControl>

              <Button type="submit" w="full" variant="gradient" size="md" isLoading={loading}>
                Update Password
              </Button>
            </VStack>
          </form>
        )}

        <Flex justify="center" mt={6}>
          <RouterLink to="/admin/login">
            <Text fontSize="xs" color="gray.400" _hover={{ color: 'cyan.400' }}>
              ← Back to Sign In
            </Text>
          </RouterLink>
        </Flex>
      </Box>
    </Flex>
  )
}
