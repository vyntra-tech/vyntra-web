import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(8px)" bg="rgba(0, 0, 0, 0.75)" />
      <ModalContent bg="#11172A" borderColor="rgba(255, 255, 255, 0.1)" borderWidth="1px" borderRadius="xl">
        <ModalHeader borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.08)" py={4}>
          <HStack spacing={3}>
            {isDestructive && <Icon as={AlertTriangle} color="red.400" boxSize={5} />}
            <Text fontSize="lg" fontWeight="700" color="white" fontFamily="heading">
              {title}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalBody py={6}>
          <Text color="gray.300" fontSize="sm" lineHeight="tall">
            {message}
          </Text>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)" py={3}>
          <HStack spacing={3}>
            <Button variant="ghost" size="sm" onClick={onClose} isDisabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              colorScheme={isDestructive ? 'red' : 'brand'}
              size="sm"
              onClick={onConfirm}
              isLoading={isLoading}
              fontWeight="600"
            >
              {confirmText}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
