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
  SimpleGrid,
  Card,
  CardBody,
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
  Icon,
} from '@chakra-ui/react'
import { Plus, Edit2, Trash2, Sparkles, Globe, Eye, EyeOff } from 'lucide-react'
import { productsApi } from '../../services/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import type { Showcase } from '../../types'

const STATUSES = ['In Development', 'Planned', 'Live', 'Beta']
const PREVIEW_TYPES = ['cloud', 'ai', 'studio']

export function ProductsPage() {
  const [products, setProducts] = useState<Showcase[]>([])
  const [loading, setLoading] = useState(true)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingProduct, setEditingProduct] = useState<Showcase | null>(null)
  const [formData, setFormData] = useState<Partial<Showcase>>({
    name: '',
    slug: '',
    category: 'Developer Ecosystem',
    status: 'In Development',
    previewType: 'cloud',
    description: '',
    tech: [],
    url: '',
  })
  const [techInput, setTechInput] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Showcase | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { isAdmin } = useAuth()
  const toast = useToast()

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await productsApi.getAllAdmin()
      setProducts(data)
    } catch (err: any) {
      toast({ title: 'Error loading products', description: err.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleOpenCreate = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      slug: '',
      category: 'Developer Platform',
      status: 'Planned',
      previewType: 'cloud',
      description: '',
      tech: ['React', 'TypeScript', 'Node.js'],
      url: '',
    })
    onOpen()
  }

  const handleOpenEdit = (prod: Showcase) => {
    setEditingProduct(prod)
    setFormData({
      ...prod,
      tech: prod.tech || [],
    })
    onOpen()
  }

  const handleAddTech = () => {
    if (!techInput.trim()) return
    const cur = formData.tech || []
    if (!cur.includes(techInput.trim())) {
      setFormData({ ...formData, tech: [...cur, techInput.trim()] })
    }
    setTechInput('')
  }

  const handleRemoveTech = (t: string) => {
    setFormData({ ...formData, tech: (formData.tech || []).filter((x) => x !== t) })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim() || !formData.description?.trim()) {
      toast({ title: 'Title & description required', status: 'warning' })
      return
    }

    setSaving(true)
    try {
      if (editingProduct && editingProduct.id) {
        await productsApi.update(editingProduct.id, formData)
        toast({ title: 'Product updated', status: 'success', duration: 2500 })
      } else {
        await productsApi.create(formData)
        toast({ title: 'Product created', status: 'success', duration: 2500 })
      }
      onClose()
      loadProducts()
    } catch (err: any) {
      toast({ title: 'Operation failed', description: err.message, status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return
    setDeleting(true)
    try {
      await productsApi.delete(deleteTarget.id)
      toast({ title: 'Product removed', status: 'info', duration: 2500 })
      setDeleteTarget(null)
      loadProducts()
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, status: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="lg" fontFamily="heading" color="white">
              VYNTRA Product Ecosystem
            </Heading>
            <Badge colorScheme="purple" borderRadius="full" px={2}>
              {products.length}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Internal SaaS, AI engines, and developer platforms under active research and development
          </Text>
        </Box>

        <Button variant="solid" colorScheme="brand" leftIcon={<Plus size={16} />} onClick={handleOpenCreate}>
          New Product
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {products.map((prod) => (
          <Card key={prod.id || prod.name} position="relative">
            <CardBody p={6}>
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bgGradient="linear(to-br, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.2))"
                  borderWidth="1px"
                  borderColor="rgba(255, 255, 255, 0.1)"
                >
                  <Icon as={Sparkles} color="cyan.400" boxSize={6} />
                </Box>
                <HStack spacing={2}>
                  <Badge
                    colorScheme={
                      prod.status === 'Live'
                        ? 'green'
                        : prod.status === 'In Development'
                        ? 'purple'
                        : 'cyan'
                    }
                    fontSize="2xs"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                  >
                    {prod.status}
                  </Badge>
                </HStack>
              </Flex>

              <Heading size="md" fontFamily="heading" color="white" mb={1}>
                {prod.name}
              </Heading>
              <Text fontSize="xs" color="brand.400" fontWeight="600" mb={3}>
                {prod.category}
              </Text>
              <Text fontSize="xs" color="gray.400" lineHeight="tall" mb={4}>
                {prod.description}
              </Text>

              <HStack spacing={1.5} wrap="wrap" mb={5}>
                {(prod.tech || []).map((t) => (
                  <Badge key={t} colorScheme="gray" fontSize="3xs" px={2} py={0.5}>
                    {t}
                  </Badge>
                ))}
              </HStack>

              <Flex justify="space-between" align="center" pt={3} borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
                <Text fontSize="2xs" color="gray.500">
                  Preview: {prod.previewType || 'cloud'}
                </Text>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Edit product"
                    icon={<Edit2 size={14} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => handleOpenEdit(prod)}
                  />
                  {isAdmin && (
                    <IconButton
                      aria-label="Delete product"
                      icon={<Trash2 size={14} />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setDeleteTarget(prod)}
                    />
                  )}
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* CREATE / EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSave}>
          <ModalHeader color="white" borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody py={5}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Product Name</FormLabel>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. VYNTRA Cloud"
                />
              </FormControl>

              <HStack w="full" spacing={3}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Status</FormLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Preview Widget Type</FormLabel>
                  <Select
                    value={formData.previewType}
                    onChange={(e) => setFormData({ ...formData, previewType: e.target.value as any })}
                  >
                    {PREVIEW_TYPES.map((p) => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
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
                  placeholder="Key capabilities and problem solved by this product."
                />
              </FormControl>

              {/* Technologies */}
              <FormControl>
                <FormLabel fontSize="xs">Tech Stack Tags</FormLabel>
                <HStack mb={2}>
                  <Input
                    size="sm"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                    placeholder="e.g. Kubernetes, Edge Runtime"
                  />
                  <Button size="sm" onClick={handleAddTech} variant="outline">Add</Button>
                </HStack>
                <HStack spacing={2} wrap="wrap">
                  {(formData.tech || []).map((t) => (
                    <Tag key={t} size="sm" colorScheme="cyan" borderRadius="full">
                      <TagLabel>{t}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTech(t)} />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">Verified Product URL (Optional)</FormLabel>
                <Input
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" colorScheme="brand" isLoading={saving}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}"?`}
        isLoading={deleting}
      />
    </Box>
  )
}
