import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Input,
  HStack,
  VStack,
  Badge,
  IconButton,
  SimpleGrid,
  Card,
  CardBody,
  Avatar,
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
  Select,
  useDisclosure,
  useToast,
  Icon,
} from '@chakra-ui/react'
import { Plus, Edit2, Trash2, Star } from 'lucide-react'
import { testimonialsApi } from '../../services/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import type { ClientReview } from '../../types'

export function TestimonialsPage() {
  const [reviews, setReviews] = useState<ClientReview[]>([])
  const [loading, setLoading] = useState(true)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingReview, setEditingReview] = useState<ClientReview | null>(null)
  const [formData, setFormData] = useState<Partial<ClientReview>>({
    name: '',
    role: 'Founder',
    company: '',
    rating: 5,
    review: '',
    project: '',
    tag: 'Client Review',
    status: 'published',
  })
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<ClientReview | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { isAdmin } = useAuth()
  const toast = useToast()

  const loadReviews = async () => {
    setLoading(true)
    try {
      const data = await testimonialsApi.getAllAdmin()
      setReviews(data)
    } catch (err: any) {
      toast({ title: 'Error loading testimonials', description: err.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleOpenCreate = () => {
    setEditingReview(null)
    setFormData({
      name: '',
      role: 'Founder & CEO',
      company: '',
      rating: 5,
      review: '',
      project: '',
      tag: 'Web Architecture',
      status: 'published',
    })
    onOpen()
  }

  const handleOpenEdit = (r: ClientReview) => {
    setEditingReview(r)
    setFormData(r)
    onOpen()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim() || !formData.review?.trim()) {
      toast({ title: 'Author name and review are required', status: 'warning' })
      return
    }

    setSaving(true)
    try {
      if (editingReview && editingReview.id) {
        await testimonialsApi.update(editingReview.id, formData)
        toast({ title: 'Testimonial updated', status: 'success', duration: 2500 })
      } else {
        await testimonialsApi.create(formData)
        toast({ title: 'Testimonial created', status: 'success', duration: 2500 })
      }
      onClose()
      loadReviews()
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return
    setDeleting(true)
    try {
      await testimonialsApi.delete(deleteTarget.id)
      toast({ title: 'Testimonial deleted', status: 'info', duration: 2500 })
      setDeleteTarget(null)
      loadReviews()
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
              Client Testimonials & Reviews
            </Heading>
            <Badge colorScheme="purple" borderRadius="full" px={2}>
              {reviews.length}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Manage genuine client testimonials and feedback featured on the public website
          </Text>
        </Box>

        <Button variant="solid" colorScheme="brand" leftIcon={<Plus size={16} />} onClick={handleOpenCreate}>
          Add Testimonial
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {reviews.map((r) => (
          <Card key={r.id || r.name}>
            <CardBody p={6}>
              <Flex justify="space-between" align="flex-start" mb={3}>
                <HStack spacing={1}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon
                      key={i}
                      as={Star}
                      boxSize={4}
                      color={i < (r.rating || 5) ? 'yellow.400' : 'gray.600'}
                      fill={i < (r.rating || 5) ? '#FBBF24' : 'none'}
                    />
                  ))}
                </HStack>

                <HStack spacing={1}>
                  <IconButton
                    aria-label="Edit review"
                    icon={<Edit2 size={14} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => handleOpenEdit(r)}
                  />
                  {isAdmin && (
                    <IconButton
                      aria-label="Delete review"
                      icon={<Trash2 size={14} />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setDeleteTarget(r)}
                    />
                  )}
                </HStack>
              </Flex>

              <Text fontSize="xs" color="gray.300" fontStyle="italic" lineHeight="tall" mb={4} noOfLines={4}>
                "{r.review}"
              </Text>

              <HStack spacing={3} pt={3} borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
                <Avatar size="sm" name={r.name} bg="brand.600" />
                <Box overflow="hidden">
                  <Text fontSize="xs" fontWeight="700" color="white" isTruncated>
                    {r.name}
                  </Text>
                  <Text fontSize="2xs" color="cyan.400" isTruncated>
                    {r.role} {r.company ? `· ${r.company}` : ''}
                  </Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* CREATE / EDIT MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSave}>
          <ModalHeader color="white" borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            {editingReview ? 'Edit Testimonial' : 'Add Testimonial'}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody py={5}>
            <VStack spacing={4}>
              <HStack w="full" spacing={3}>
                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="xs">Author Full Name</FormLabel>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Aarav Sharma"
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Role / Title</FormLabel>
                  <Input
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Founder & CEO"
                  />
                </FormControl>
              </HStack>

              <HStack w="full" spacing={3}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Company Name</FormLabel>
                  <Input
                    value={formData.company || ''}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Namaste Cafe"
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Rating</FormLabel>
                  <Select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Testimonial Quote</FormLabel>
                <Textarea
                  rows={4}
                  value={formData.review || ''}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  placeholder="Detailing project results, speed, and engineering quality."
                />
              </FormControl>

              <HStack w="full" spacing={3}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Project Delivered</FormLabel>
                  <Input
                    value={formData.project || ''}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="e.g. Restaurant Digital Platform"
                  />
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Category Tag</FormLabel>
                  <Input
                    value={formData.tag || ''}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="Web Architecture"
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
              {editingReview ? 'Save Changes' : 'Create Testimonial'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Testimonial"
        message={`Delete testimonial from "${deleteTarget?.name}"?`}
        isLoading={deleting}
      />
    </Box>
  )
}
