import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  Select,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  Tag,
  TagLabel,
  TagCloseButton,
  useDisclosure,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Bot, Cloud, Code2, Terminal, Cpu, Layers } from 'lucide-react'
import { servicesApi } from '../../services/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import type { Offering } from '../../types'

const CATEGORIES = [
  'AI Solutions',
  'Web and Software Development',
  'Cloud Infrastructure',
  'DevOps and Automation',
  'UI/UX Design',
  'Technical Consulting',
]

const ICONS = ['Bot', 'Cloud', 'Code2', 'Terminal', 'Cpu', 'Layers']

export function ServicesPage() {
  const [services, setServices] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingService, setEditingService] = useState<Offering | null>(null)
  const [formData, setFormData] = useState<Partial<Offering>>({
    title: '',
    slug: '',
    category: 'AI Solutions',
    icon: 'Bot',
    description: '',
    capabilities: [],
    technologies: [],
    status: 'published',
  })
  const [capInput, setCapInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Offering | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { isAdmin } = useAuth()
  const toast = useToast()

  const loadServices = async () => {
    setLoading(true)
    try {
      const data = await servicesApi.getAllAdmin()
      setServices(data)
    } catch (err: any) {
      toast({ title: 'Error loading services', description: err.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const handleOpenCreate = () => {
    setEditingService(null)
    setFormData({
      title: '',
      slug: '',
      category: 'AI Solutions',
      icon: 'Bot',
      description: '',
      capabilities: ['Custom Architecture', 'Production Deployment'],
      technologies: ['Python', 'Docker'],
      status: 'published',
    })
    onOpen()
  }

  const handleOpenEdit = (srv: Offering) => {
    setEditingService(srv)
    setFormData({
      ...srv,
      capabilities: srv.capabilities || [],
      technologies: srv.technologies || [],
    })
    onOpen()
  }

  const handleAddCap = () => {
    if (!capInput.trim()) return
    const cur = formData.capabilities || []
    if (!cur.includes(capInput.trim())) {
      setFormData({ ...formData, capabilities: [...cur, capInput.trim()] })
    }
    setCapInput('')
  }

  const handleRemoveCap = (c: string) => {
    setFormData({ ...formData, capabilities: (formData.capabilities || []).filter((x) => x !== c) })
  }

  const handleAddTech = () => {
    if (!techInput.trim()) return
    const cur = formData.technologies || []
    if (!cur.includes(techInput.trim())) {
      setFormData({ ...formData, technologies: [...cur, techInput.trim()] })
    }
    setTechInput('')
  }

  const handleRemoveTech = (t: string) => {
    setFormData({ ...formData, technologies: (formData.technologies || []).filter((x) => x !== t) })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title?.trim() || !formData.description?.trim()) {
      toast({ title: 'Required Fields Missing', status: 'warning' })
      return
    }

    setSaving(true)
    try {
      if (editingService && editingService.id) {
        await servicesApi.update(editingService.id, formData)
        toast({ title: 'Service Updated', status: 'success', duration: 2500 })
      } else {
        await servicesApi.create(formData)
        toast({ title: 'Service Created', status: 'success', duration: 2500 })
      }
      onClose()
      loadServices()
    } catch (err: any) {
      toast({ title: 'Save Failed', description: err.message, status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return
    setDeleting(true)
    try {
      await servicesApi.delete(deleteTarget.id)
      toast({ title: 'Service Deleted', status: 'info', duration: 2500 })
      setDeleteTarget(null)
      loadServices()
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, status: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= services.length) return

    const reordered = [...services]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIdx, 0, moved)
    setServices(reordered)

    try {
      const ids = reordered.map((s) => s.id!).filter(Boolean)
      await servicesApi.reorder(ids)
    } catch (err: any) {
      toast({ title: 'Reorder error', description: err.message, status: 'warning' })
      loadServices()
    }
  }

  const handleToggleStatus = async (srv: Offering) => {
    if (!srv.id) return
    const next = srv.status === 'published' ? 'draft' : 'published'
    try {
      await servicesApi.update(srv.id, { status: next })
      toast({ title: `Service status set to ${next}`, status: 'success', duration: 2000 })
      loadServices()
    } catch (err: any) {
      toast({ title: 'Failed to update status', description: err.message, status: 'error' })
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="lg" fontFamily="heading" color="white">
              Service Offerings
            </Heading>
            <Badge colorScheme="cyan" borderRadius="full" px={2}>
              {services.length}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Define VYNTRA core technology capabilities and display arrangement
          </Text>
        </Box>

        <Button variant="solid" colorScheme="brand" leftIcon={<Plus size={16} />} onClick={handleOpenCreate}>
          Add Service
        </Button>
      </Flex>

      <Box bg="#11172A" borderRadius="xl" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.08)" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg="rgba(255, 255, 255, 0.02)">
              <Tr>
                <Th w="60px">Order</Th>
                <Th>Service Title</Th>
                <Th>Category</Th>
                <Th>Capabilities</Th>
                <Th>Status</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {services.map((srv, idx) => (
                <Tr key={srv.id || srv.title} _hover={{ bg: 'rgba(255, 255, 255, 0.02)' }}>
                  <Td>
                    <HStack spacing={1}>
                      <IconButton
                        aria-label="Move Up"
                        icon={<ArrowUp size={13} />}
                        size="xs"
                        variant="ghost"
                        isDisabled={idx === 0}
                        onClick={() => handleMove(idx, 'up')}
                      />
                      <IconButton
                        aria-label="Move Down"
                        icon={<ArrowDown size={13} />}
                        size="xs"
                        variant="ghost"
                        isDisabled={idx === services.length - 1}
                        onClick={() => handleMove(idx, 'down')}
                      />
                    </HStack>
                  </Td>
                  <Td>
                    <HStack spacing={2.5}>
                      <Box p={2} borderRadius="md" bg="rgba(124, 58, 237, 0.15)" color="brand.400">
                        <Code2 size={16} />
                      </Box>
                      <Box>
                        <Text fontWeight="600" color="white" fontSize="sm">
                          {srv.title}
                        </Text>
                        <Text fontSize="2xs" color="gray.400" maxW="260px" isTruncated>
                          {srv.description}
                        </Text>
                      </Box>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme="cyan" fontSize="2xs">
                      {srv.category || 'Engineering'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={1} wrap="wrap" maxW="260px">
                      {(srv.capabilities || []).slice(0, 2).map((c) => (
                        <Badge key={c} colorScheme="gray" fontSize="3xs">
                          {c}
                        </Badge>
                      ))}
                      {(srv.capabilities || []).length > 2 && (
                        <Text fontSize="3xs" color="gray.500">
                          +{srv.capabilities.length - 2}
                        </Text>
                      )}
                    </HStack>
                  </Td>
                  <Td>
                    <Tooltip label="Click to toggle publish status" hasArrow>
                      <Badge
                        cursor="pointer"
                        onClick={() => handleToggleStatus(srv)}
                        colorScheme={srv.status === 'published' ? 'green' : 'yellow'}
                        fontSize="2xs"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                      >
                        {srv.status === 'published' ? '● Published' : '○ Draft'}
                      </Badge>
                    </Tooltip>
                  </Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <IconButton
                        aria-label="Edit service"
                        icon={<Edit2 size={14} />}
                        size="xs"
                        variant="ghost"
                        onClick={() => handleOpenEdit(srv)}
                      />
                      {isAdmin && (
                        <IconButton
                          aria-label="Delete service"
                          icon={<Trash2 size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => setDeleteTarget(srv)}
                        />
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* CREATE / EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSave}>
          <ModalHeader color="white" borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody py={5}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Service Title</FormLabel>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AI Solutions & Integration"
                />
              </FormControl>

              <HStack w="full" spacing={3}>
                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="xs">Category</FormLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Icon Identifier</FormLabel>
                  <Select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  >
                    {ICONS.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Description</FormLabel>
                <Textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of engineering methodologies and client outcomes."
                />
              </FormControl>

              {/* Capabilities */}
              <FormControl>
                <FormLabel fontSize="xs">Capabilities / Key Deliverables</FormLabel>
                <HStack mb={2}>
                  <Input
                    size="sm"
                    value={capInput}
                    onChange={(e) => setCapInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCap())}
                    placeholder="e.g. Multi-Agent Autonomous Workflows"
                  />
                  <Button size="sm" onClick={handleAddCap} variant="outline">Add</Button>
                </HStack>
                <HStack spacing={2} wrap="wrap">
                  {(formData.capabilities || []).map((c) => (
                    <Tag key={c} size="sm" colorScheme="cyan" borderRadius="full">
                      <TagLabel>{c}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveCap(c)} />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              {/* Technologies */}
              <FormControl>
                <FormLabel fontSize="xs">Technologies Used</FormLabel>
                <HStack mb={2}>
                  <Input
                    size="sm"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                    placeholder="e.g. OpenAI, LangChain, PyTorch"
                  />
                  <Button size="sm" onClick={handleAddTech} variant="outline">Add</Button>
                </HStack>
                <HStack spacing={2} wrap="wrap">
                  {(formData.technologies || []).map((t) => (
                    <Tag key={t} size="sm" colorScheme="purple" borderRadius="full">
                      <TagLabel>{t}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTech(t)} />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              <FormControl display="flex" alignItems="center" pt={1}>
                <FormLabel fontSize="xs" mb="0">
                  Publish Offering
                </FormLabel>
                <Switch
                  colorScheme="purple"
                  isChecked={formData.status === 'published'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'published' : 'draft' })}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" colorScheme="brand" isLoading={saving}>
              {editingService ? 'Save Changes' : 'Create Service'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        isLoading={deleting}
      />
    </Box>
  )
}
