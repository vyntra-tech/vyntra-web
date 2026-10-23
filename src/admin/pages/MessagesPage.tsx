import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  Badge,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  Tab,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  SimpleGrid,
  useDisclosure,
  useToast,
  Divider,
} from '@chakra-ui/react'
import { Search, Mail, Archive, Trash2, MailOpen, Eye, ExternalLink, Building, DollarSign } from 'lucide-react'
import { contactApi } from '../../services/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import type { ContactMessage } from '../../types'

export function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<'all' | 'unread' | 'read' | 'archived'>('all')

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { isAdmin } = useAuth()
  const toast = useToast()

  const loadMessages = async () => {
    setLoading(true)
    try {
      const data = await contactApi.getAllAdmin()
      setMessages(data)
    } catch (err: any) {
      toast({ title: 'Error loading inquiries', description: err.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleOpenDetail = async (msg: ContactMessage) => {
    setSelectedMessage(msg)
    onOpen()
    if (msg.status === 'unread') {
      try {
        await contactApi.markRead(msg.id, 'read')
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: 'read' } : m)))
      } catch {}
    }
  }

  const handleToggleRead = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextStatus = msg.status === 'read' ? 'unread' : 'read'
    try {
      await contactApi.markRead(msg.id, nextStatus)
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: nextStatus } : m)))
      toast({ title: `Marked as ${nextStatus}`, status: 'info', duration: 1500 })
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.message, status: 'error' })
    }
  }

  const handleArchive = async (msg: ContactMessage, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await contactApi.archive(msg.id)
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: 'archived' } : m)))
      toast({ title: 'Message archived', status: 'info', duration: 2000 })
      if (selectedMessage?.id === msg.id) onClose()
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.message, status: 'error' })
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await contactApi.delete(deleteTarget.id)
      toast({ title: 'Message deleted', status: 'info', duration: 2000 })
      setDeleteTarget(null)
      if (selectedMessage?.id === deleteTarget.id) onClose()
      loadMessages()
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, status: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const filtered = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.company || '').toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusTab === 'all' || m.status === statusTab
    return matchesSearch && matchesStatus
  })

  const unreadCount = messages.filter((m) => m.status === 'unread').length

  return (
    <Box>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="lg" fontFamily="heading" color="white">
              Enquiries Inbox
            </Heading>
            {unreadCount > 0 && (
              <Badge colorScheme="cyan" borderRadius="full" px={2}>
                {unreadCount} Unread
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Client project proposals and consultation inquiries submitted via public contact form
          </Text>
        </Box>
      </Flex>

      {/* Filter and Tab Bar */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" gap={4} mb={6}>
        <Tabs
          variant="soft-rounded"
          colorScheme="purple"
          onChange={(idx) => {
            const tabs: ('all' | 'unread' | 'read' | 'archived')[] = ['all', 'unread', 'read', 'archived']
            setStatusTab(tabs[idx])
          }}
        >
          <TabList>
            <Tab fontSize="xs" color="gray.400">All ({messages.length})</Tab>
            <Tab fontSize="xs" color="gray.400">Unread ({unreadCount})</Tab>
            <Tab fontSize="xs" color="gray.400">Read</Tab>
            <Tab fontSize="xs" color="gray.400">Archived</Tab>
          </TabList>
        </Tabs>

        <InputGroup maxW={{ base: 'full', md: '340px' }}>
          <InputLeftElement pointerEvents="none">
            <Search size={16} color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </Flex>

      {/* Messages Table */}
      <Box bg="#11172A" borderRadius="xl" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.08)" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg="rgba(255, 255, 255, 0.02)">
              <Tr>
                <Th>Sender</Th>
                <Th>Type & Scope</Th>
                <Th>Budget</Th>
                <Th>Message Preview</Th>
                <Th>Received</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={12} color="gray.400">
                    No inquiries found in this category.
                  </Td>
                </Tr>
              ) : (
                filtered.map((msg) => (
                  <Tr
                    key={msg.id}
                    onClick={() => handleOpenDetail(msg)}
                    cursor="pointer"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.025)' }}
                    fontWeight={msg.status === 'unread' ? '600' : 'normal'}
                  >
                    <Td>
                      <HStack spacing={2.5}>
                        <Box
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg={msg.status === 'unread' ? 'cyan.400' : 'transparent'}
                        />
                        <Box>
                          <Text color={msg.status === 'unread' ? 'white' : 'gray.300'} fontSize="sm">
                            {msg.name}
                          </Text>
                          <Text fontSize="2xs" color="gray.500">
                            {msg.email}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple" fontSize="3xs">
                        {msg.type}
                      </Badge>
                      {msg.company && (
                        <Text fontSize="3xs" color="gray.400">
                          {msg.company}
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize="xs" color="gray.300">
                        {msg.budget || 'N/A'}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="xs" color="gray.400" maxW="280px" isTruncated>
                        {msg.description}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontSize="2xs" color="gray.500">
                        {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </Text>
                    </Td>
                    <Td textAlign="right" onClick={(e) => e.stopPropagation()}>
                      <HStack spacing={1} justify="flex-end">
                        <IconButton
                          aria-label="Toggle read status"
                          icon={msg.status === 'read' ? <Mail size={14} /> : <MailOpen size={14} />}
                          size="xs"
                          variant="ghost"
                          onClick={(e) => handleToggleRead(msg, e)}
                        />
                        <IconButton
                          aria-label="Archive"
                          icon={<Archive size={14} />}
                          size="xs"
                          variant="ghost"
                          onClick={(e) => handleArchive(msg, e)}
                        />
                        {isAdmin && (
                          <IconButton
                            aria-label="Delete"
                            icon={<Trash2 size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setDeleteTarget(msg)}
                          />
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* DETAIL MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="#11172A" borderColor="rgba(255, 255, 255, 0.1)" borderWidth="1px">
          <ModalHeader color="white" fontFamily="heading" borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            Inquiry from {selectedMessage?.name}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody py={5}>
            {selectedMessage && (
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center" bg="rgba(255, 255, 255, 0.02)" p={3} borderRadius="lg">
                  <Box>
                    <Text fontSize="xs" color="gray.400">Email Contact</Text>
                    <Text fontSize="sm" fontWeight="600" color="cyan.400">
                      {selectedMessage.email}
                    </Text>
                  </Box>
                  <Button
                    as="a"
                    href={`mailto:${selectedMessage.email}?subject=Regarding your VYNTRA inquiry: ${selectedMessage.type}`}
                    size="xs"
                    variant="solid"
                    colorScheme="brand"
                    leftIcon={<ExternalLink size={12} />}
                  >
                    Reply via Email
                  </Button>
                </Flex>

                <SimpleGrid columns={2} spacing={3}>
                  <Box p={3} borderRadius="md" bg="rgba(255, 255, 255, 0.02)">
                    <HStack spacing={1.5} color="gray.400" mb={1}>
                      <Building size={14} />
                      <Text fontSize="2xs">Company</Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="600" color="white">
                      {selectedMessage.company || 'Not Specified'}
                    </Text>
                  </Box>

                  <Box p={3} borderRadius="md" bg="rgba(255, 255, 255, 0.02)">
                    <HStack spacing={1.5} color="gray.400" mb={1}>
                      <DollarSign size={14} />
                      <Text fontSize="2xs">Budget Allocated</Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="600" color="white">
                      {selectedMessage.budget || 'Not Specified'}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text fontSize="2xs" color="gray.400" textTransform="uppercase" mb={1}>
                    Project Overview & Requirements
                  </Text>
                  <Box p={4} borderRadius="lg" bg="#0E1326" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.06)">
                    <Text fontSize="sm" color="gray.200" whiteSpace="pre-wrap" lineHeight="tall">
                      {selectedMessage.description}
                    </Text>
                  </Box>
                </Box>

                <Text fontSize="3xs" color="gray.500">
                  Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            <HStack spacing={2}>
              {selectedMessage && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Archive size={14} />}
                  onClick={(e) => handleArchive(selectedMessage, e)}
                >
                  Archive
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Inquiry"
        message={`Delete inquiry from "${deleteTarget?.name}"?`}
        isLoading={deleting}
      />
    </Box>
  )
}
