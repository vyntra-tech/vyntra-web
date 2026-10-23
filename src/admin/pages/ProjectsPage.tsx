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
  Image,
  Tooltip,
} from '@chakra-ui/react'
import { Search, Plus, Edit2, Trash2, Globe, Github, ExternalLink, CheckCircle, Clock } from 'lucide-react'
import { projectsApi, galleryApi } from '../../services/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import type { Showcase } from '../../types'

const CATEGORIES = [
  'Web Applications',
  'AI Solutions',
  'Cloud and DevOps',
  'SaaS Products',
  'Mobile Applications',
]

export function ProjectsPage() {
  const [projects, setProjects] = useState<Showcase[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modal & form states
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingProject, setEditingProject] = useState<Showcase | null>(null)
  const [formData, setFormData] = useState<Partial<Showcase>>({
    name: '',
    slug: '',
    category: 'Web Applications',
    description: '',
    tech: [],
    features: [],
    image: '',
    url: '',
    githubUrl: '',
    status: 'published',
    completionDate: new Date().toISOString().slice(0, 10),
    featured: false,
  })
  const [techInput, setTechInput] = useState<string>('')
  const [featureInput, setFeatureInput] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Showcase | null>(null)
  const [deleting, setDeleting] = useState<boolean>(false)

  const { isAdmin } = useAuth()
  const toast = useToast()

  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await projectsApi.getAllAdmin()
      setProjects(data)
    } catch (err: any) {
      toast({
        title: 'Error loading projects',
        description: err.message,
        status: 'error',
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleOpenCreate = () => {
    setEditingProject(null)
    setFormData({
      name: '',
      slug: '',
      category: 'Web Applications',
      description: '',
      tech: ['React', 'TypeScript'],
      features: ['Responsive UI', 'Sub-second Latency'],
      image: '',
      url: '',
      githubUrl: '',
      status: 'published',
      completionDate: new Date().toISOString().slice(0, 10),
      featured: false,
    })
    onOpen()
  }

  const handleOpenEdit = (proj: Showcase) => {
    setEditingProject(proj)
    setFormData({
      ...proj,
      tech: proj.tech || [],
      features: proj.features || [],
    })
    onOpen()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }))
  }

  const handleAddTech = () => {
    if (!techInput.trim()) return
    const current = formData.tech || []
    if (!current.includes(techInput.trim())) {
      setFormData({ ...formData, tech: [...current, techInput.trim()] })
    }
    setTechInput('')
  }

  const handleRemoveTech = (item: string) => {
    setFormData({ ...formData, tech: (formData.tech || []).filter((t) => t !== item) })
  }

  const handleAddFeature = () => {
    if (!featureInput.trim()) return
    const current = formData.features || []
    if (!current.includes(featureInput.trim())) {
      setFormData({ ...formData, features: [...current, featureInput.trim()] })
    }
    setFeatureInput('')
  }

  const handleRemoveFeature = (item: string) => {
    setFormData({ ...formData, features: (formData.features || []).filter((f) => f !== item) })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 10MB permitted', status: 'warning' })
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const res = await galleryApi.uploadMedia(file.name, reader.result as string)
        setFormData((prev) => ({ ...prev, image: res.url }))
        toast({ title: 'Thumbnail uploaded', status: 'success', duration: 2500 })
      } catch (err: any) {
        toast({ title: 'Upload failed', description: err.message, status: 'error' })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim() || !formData.description?.trim()) {
      toast({ title: 'Required Fields Missing', description: 'Please fill name and description.', status: 'warning' })
      return
    }

    setSaving(true)
    try {
      if (editingProject && editingProject.id) {
        await projectsApi.update(editingProject.id, formData)
        toast({ title: 'Project Updated', status: 'success', duration: 3000 })
      } else {
        await projectsApi.create(formData)
        toast({ title: 'Project Created', status: 'success', duration: 3000 })
      }
      onClose()
      loadProjects()
    } catch (err: any) {
      toast({ title: 'Operation Failed', description: err.message, status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return
    setDeleting(true)
    try {
      await projectsApi.delete(deleteTarget.id)
      toast({ title: 'Project Deleted', status: 'info', duration: 3000 })
      setDeleteTarget(null)
      loadProjects()
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, status: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (proj: Showcase) => {
    if (!proj.id) return
    const nextStatus = proj.status === 'published' ? 'draft' : 'published'
    try {
      await projectsApi.update(proj.id, { status: nextStatus })
      toast({
        title: `Project set to ${nextStatus}`,
        status: 'success',
        duration: 2500,
      })
      loadProjects()
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, status: 'error' })
    }
  }

  // Filtered dataset
  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.tech || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="lg" fontFamily="heading" color="white">
              Portfolio Projects
            </Heading>
            <Badge colorScheme="purple" borderRadius="full" px={2}>
              {filtered.length}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Manage showcase applications, client case studies, and digital products
          </Text>
        </Box>

        <Button variant="solid" colorScheme="brand" leftIcon={<Plus size={16} />} onClick={handleOpenCreate}>
          Add Project
        </Button>
      </Flex>

      {/* Filter and Search Bar */}
      <Flex direction={{ base: 'column', sm: 'row' }} gap={3} mb={6}>
        <InputGroup maxW={{ base: 'full', sm: '360px' }}>
          <InputLeftElement pointerEvents="none">
            <Search size={16} color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Search by title, description, or tech..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Select maxW={{ base: 'full', sm: '220px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <Select maxW={{ base: 'full', sm: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      </Flex>

      {/* Data Table */}
      <Box bg="#11172A" borderRadius="xl" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.08)" overflow="hidden">
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg="rgba(255, 255, 255, 0.02)">
              <Tr>
                <Th>Project Name</Th>
                <Th>Category</Th>
                <Th>Tech Stack</Th>
                <Th>Status</Th>
                <Th>Links</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={12} color="gray.400">
                    No projects found matching the filter criteria.
                  </Td>
                </Tr>
              ) : (
                filtered.map((proj) => (
                  <Tr key={proj.id || proj.slug} _hover={{ bg: 'rgba(255, 255, 255, 0.02)' }}>
                    <Td>
                      <HStack spacing={3}>
                        {proj.image ? (
                          <Image src={proj.image} boxSize="36px" borderRadius="md" objectFit="cover" alt={proj.name} />
                        ) : (
                          <Box boxSize="36px" borderRadius="md" bg="brand.900" display="flex" alignItems="center" justifyContent="center">
                            <Text fontSize="xs" fontWeight="700" color="brand.300">
                              {proj.name.slice(0, 2).toUpperCase()}
                            </Text>
                          </Box>
                        )}
                        <Box>
                          <Text fontWeight="600" color="white" fontSize="sm">
                            {proj.name}
                          </Text>
                          <Text fontSize="2xs" color="gray.400" isTruncated maxW="240px">
                            {proj.description}
                          </Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple" variant="subtle" fontSize="2xs">
                        {proj.category}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={1} wrap="wrap" maxW="220px">
                        {(proj.tech || []).slice(0, 3).map((t) => (
                          <Badge key={t} colorScheme="gray" fontSize="3xs" px={1.5}>
                            {t}
                          </Badge>
                        ))}
                        {(proj.tech || []).length > 3 && (
                          <Text fontSize="3xs" color="gray.500">
                            +{proj.tech.length - 3}
                          </Text>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Tooltip label="Click to toggle publish status" hasArrow>
                        <Badge
                          cursor="pointer"
                          onClick={() => handleToggleStatus(proj)}
                          colorScheme={proj.status === 'published' ? 'green' : 'yellow'}
                          fontSize="2xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                        >
                          {proj.status === 'published' ? '● Published' : '○ Draft'}
                        </Badge>
                      </Tooltip>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        {proj.url && (
                          <IconButton
                            as="a"
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Live Demo"
                            icon={<Globe size={14} />}
                            size="xs"
                            variant="ghost"
                          />
                        )}
                        {proj.githubUrl && (
                          <IconButton
                            as="a"
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub Repo"
                            icon={<Github size={14} />}
                            size="xs"
                            variant="ghost"
                          />
                        )}
                      </HStack>
                    </Td>
                    <Td textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <IconButton
                          aria-label="Edit project"
                          icon={<Edit2 size={14} />}
                          size="xs"
                          variant="ghost"
                          onClick={() => handleOpenEdit(proj)}
                        />
                        {isAdmin && (
                          <IconButton
                            aria-label="Delete project"
                            icon={<Trash2 size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => setDeleteTarget(proj)}
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

      {/* CREATE / EDIT PROJECT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSave}>
          <ModalHeader color="white" fontFamily="heading" borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody py={5}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Project Title</FormLabel>
                <Input value={formData.name || ''} onChange={handleNameChange} placeholder="e.g. Purulia Travels" />
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
                  <FormLabel fontSize="xs">URL Slug</FormLabel>
                  <Input
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="project-slug"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Description</FormLabel>
                <Textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed summary of the architecture, goals, and user benefits."
                />
              </FormControl>

              {/* Technologies Tag Input */}
              <FormControl>
                <FormLabel fontSize="xs">Technologies (Press Enter or Add)</FormLabel>
                <HStack mb={2}>
                  <Input
                    size="sm"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                    placeholder="e.g. React, Node.js, Docker"
                  />
                  <Button size="sm" onClick={handleAddTech} variant="outline">Add</Button>
                </HStack>
                <HStack spacing={2} wrap="wrap">
                  {(formData.tech || []).map((t) => (
                    <Tag key={t} size="sm" colorScheme="purple" borderRadius="full">
                      <TagLabel>{t}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTech(t)} />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              {/* Features List */}
              <FormControl>
                <FormLabel fontSize="xs">Core Features (Press Enter or Add)</FormLabel>
                <HStack mb={2}>
                  <Input
                    size="sm"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    placeholder="e.g. Automated GST Billing"
                  />
                  <Button size="sm" onClick={handleAddFeature} variant="outline">Add</Button>
                </HStack>
                <HStack spacing={2} wrap="wrap">
                  {(formData.features || []).map((f) => (
                    <Tag key={f} size="sm" colorScheme="cyan" borderRadius="full">
                      <TagLabel>{f}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveFeature(f)} />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              {/* URLs */}
              <HStack w="full" spacing={3}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Live URL</FormLabel>
                  <Input
                    value={formData.url || ''}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                  />
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">GitHub URL</FormLabel>
                  <Input
                    value={formData.githubUrl || ''}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </FormControl>
              </HStack>

              {/* Thumbnail Upload */}
              <FormControl>
                <FormLabel fontSize="xs">Project Thumbnail</FormLabel>
                <HStack spacing={3}>
                  <Input
                    type="file"
                    accept="image/*"
                    size="sm"
                    p={1}
                    onChange={handleImageUpload}
                  />
                  {formData.image && (
                    <Image src={formData.image} boxSize="40px" borderRadius="md" objectFit="cover" />
                  )}
                </HStack>
              </FormControl>

              <HStack w="full" justify="space-between" pt={2}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="xs" mb="0">
                    Publish Immediately
                  </FormLabel>
                  <Switch
                    colorScheme="purple"
                    isChecked={formData.status === 'published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'published' : 'draft' })}
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="xs" mb="0">
                    Featured
                  </FormLabel>
                  <Switch
                    colorScheme="cyan"
                    isChecked={Boolean(formData.featured)}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" colorScheme="brand" isLoading={saving}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be reversed.`}
        confirmText="Delete Project"
        isLoading={deleting}
      />
    </Box>
  )
}
