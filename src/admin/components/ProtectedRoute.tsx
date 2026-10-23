import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'editor'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#0B1020">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="4px" speed="0.75s" />
          <Text color="gray.400" fontSize="sm" fontFamily="heading">
            Authenticating VYNTRA Admin Portal...
          </Text>
        </VStack>
      </Flex>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return (
      <Box p={8} maxW="600px" mx="auto" my={20} textAlign="center">
        <Text fontSize="xl" fontWeight="bold" color="red.400" mb={2}>
          403 — Unauthorized Access
        </Text>
        <Text color="gray.300">
          Your current role (Editor) does not have permission to access this module. Please contact an administrator.
        </Text>
      </Box>
    )
  }

  return <>{children}</>
}
