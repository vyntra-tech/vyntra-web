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
  Tag,
  TagLabel,
  TagCloseButton,
  useDisclosure,
  useToast,
  Link,
} from '@chakra-ui/react'
import { Plus, Edit2, Trash2, Linkedin, Github, Globe } from 'lucide-react'
import { teamApi, galleryApi } from '../../services/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import type { TeamMember } from '../../types'
import { getImageUrl } from '../../lib/image'

export function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    specialty: '',
    bio: '',
    skills: [],
    linkedin: '',
    github: '',
    portfolio: '',
    image: '',
    size: 'medium',
    status: 'published',
  })
  const [skillInput, setSkillInput] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { isAdmin } = useAuth()
  const toast = useToast()

  const loadTeam = async () => {
    setLoading(true)
    try {
      const data = await teamApi.getAllAdmin()
      setTeam(data)
    } catch (err: any) {
      toast({ title: 'Error loading team', description: err.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeam()
  }, [])

  const handleOpenCreate = () => {
    setEditingMember(null)
    setFormData({
      name: '',
      role: '',
      specialty: 'Systems Engineering',
      bio: '',
      skills: ['TypeScript', 'Cloud'],
      linkedin: '',
      github: '',
      portfolio: '',
      image: '',
      size: 'medium',
      status: 'published',
    })
    onOpen()
  }

  const handleOpenEdit = (m: TeamMember) => {
    setEditingMember(m)
    setFormData({
      ...m,
      skills: m.skills || [],
    })
    onOpen()
  }

  const handleAddSkill = () => {
    if (!skillInput.trim()) return
    const cur = formData.skills || []
    if (!cur.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...cur, skillInput.trim()] })
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (s: string) => {
    setFormData({ ...formData, skills: (formData.skills || []).filter((x) => x !== s) })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetInput = e.target
    const file = targetInput.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File', description: 'Please select an image file.', status: 'warning' })
      targetInput.value = ''
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 25MB permitted', status: 'warning' })
      targetInput.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const res = await galleryApi.uploadMedia(file.name, reader.result as string)
        setFormData((prev) => ({ ...prev, image: res.url }))
        toast({ title: 'Photo uploaded', status: 'success', duration: 2500 })
      } catch (err: any) {
        toast({ title: 'Upload failed', description: err.message, status: 'error' })
      } finally {
        targetInput.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim() || !formData.role?.trim()) {
      toast({ title: 'Name and role are required', status: 'warning' })
      return
    }

    setSaving(true)
    try {
      if (editingMember && editingMember.id) {
        await teamApi.update(editingMember.id, formData)
        toast({ title: 'Profile Updated', status: 'success', duration: 2500 })
      } else {
        await teamApi.create(formData)
        toast({ title: 'Team Member Added', status: 'success', duration: 2500 })
      }
      onClose()
      loadTeam()
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
      await teamApi.delete(deleteTarget.id)
      toast({ title: 'Member removed', status: 'info', duration: 2500 })
      setDeleteTarget(null)
      loadTeam()
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
              Engineering Team & Architects
            </Heading>
            <Badge colorScheme="purple" borderRadius="full" px={2}>
              {team.length}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Manage founders, architects, and technical contributors displayed on public website
          </Text>
        </Box>

        <Button variant="solid" colorScheme="brand" leftIcon={<Plus size={16} />} onClick={handleOpenCreate}>
          Add Member
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {team.map((m) => (
          <Card key={m.id || m.name}>
            <CardBody p={6}>
              <Flex justify="space-between" align="flex-start" mb={4}>
                <HStack spacing={3.5}>
                  <Avatar
                    size="lg"
                    name={m.name}
                    src={getImageUrl(m.image)}
                    bg="brand.600"
                    borderWidth="2px"
                    borderColor="brand.400"
                  />
                  <Box>
                    <Heading size="sm" color="white" fontFamily="heading">
                      {m.name}
                    </Heading>
                    <Text fontSize="xs" color="cyan.400" fontWeight="600">
                      {m.role}
                    </Text>
                    {m.specialty && (
                      <Text fontSize="2xs" color="gray.400">
                        {m.specialty}
                      </Text>
                    )}
                  </Box>
                </HStack>

                <HStack spacing={1}>
                  <IconButton
                    aria-label="Edit member"
                    icon={<Edit2 size={14} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => handleOpenEdit(m)}
                  />
                  {isAdmin && (
                    <IconButton
                      aria-label="Delete member"
                      icon={<Trash2 size={14} />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => setDeleteTarget(m)}
                    />
                  )}
                </HStack>
              </Flex>

              {m.bio && (
                <Text fontSize="xs" color="gray.400" lineHeight="tall" mb={4} noOfLines={3}>
                  {m.bio}
                </Text>
              )}

              <HStack spacing={1.5} wrap="wrap" mb={4}>
                {(m.skills || []).map((s) => (
                  <Badge key={s} colorScheme="purple" fontSize="3xs" px={2} py={0.5}>
                    {s}
                  </Badge>
                ))}
              </HStack>

              <Flex justify="space-between" align="center" pt={3} borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
                <HStack spacing={3}>
                  {m.linkedin && (
                    <Link href={m.linkedin} isExternal color="gray.400" _hover={{ color: 'cyan.400' }}>
                      <Linkedin size={16} />
                    </Link>
                  )}
                  {m.github && (
                    <Link href={m.github} isExternal color="gray.400" _hover={{ color: 'white' }}>
                      <Github size={16} />
                    </Link>
                  )}
                  {m.portfolio && (
                    <Link href={m.portfolio} isExternal color="gray.400" _hover={{ color: 'brand.400' }}>
                      <Globe size={16} />
                    </Link>
                  )}
                </HStack>

                <Badge colorScheme={m.status === 'published' ? 'green' : 'gray'} fontSize="3xs">
                  {m.status || 'published'}
                </Badge>
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
            {editingMember ? 'Edit Team Member' : 'Add Team Member'}
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody py={5}>
            <VStack spacing={4}>
              <HStack w="full" spacing={3}>
                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="xs">Full Name</FormLabel>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Chandrabhan Gadeshwar"
                  />
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="xs">Designation / Role</FormLabel>
                  <Input
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Founder & CEO"
                  />
                </FormControl>
              </HStack>

              <HStack w="full" spacing={3}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Technical Specialty</FormLabel>
                  <Input
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Cloud & Distributed Systems"
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Display Card Size</FormLabel>
                  <Select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value as any })}
                  >
                    <option value="large">Large (Leadership)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="small">Small (Compact)</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontSize="xs">Biography</FormLabel>
                <Textarea
                  rows={2}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Short bio detailing engineering leadership and background."
                />
              </FormControl>

              {/* Skills */}
              <FormControl>
                <FormLabel fontSize="xs">Skills / Tags</FormLabel>
                <HStack mb={2}>
                  <Input
                    size="sm"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="e.g. React, Node.js, AWS"
                  />
                  <Button size="sm" onClick={handleAddSkill} variant="outline">Add</Button>
                </HStack>
                <HStack spacing={2} wrap="wrap">
                  {(formData.skills || []).map((s) => (
                    <Tag key={s} size="sm" colorScheme="purple" borderRadius="full">
                      <TagLabel>{s}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveSkill(s)} />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              {/* Social URLs */}
              <HStack w="full" spacing={3}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">LinkedIn URL</FormLabel>
                  <Input
                    value={formData.linkedin || ''}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel fontSize="xs">GitHub URL</FormLabel>
                  <Input
                    value={formData.github || ''}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </FormControl>
              </HStack>

              {/* Photo Upload */}
              <FormControl>
                <FormLabel fontSize="xs">Profile Photo</FormLabel>
                <HStack spacing={3}>
                  <Input type="file" accept="image/*" size="sm" p={1} onChange={handleImageUpload} />
                  {formData.image && <Avatar size="sm" src={getImageUrl(formData.image)} />}
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" colorScheme="brand" isLoading={saving}>
              {editingMember ? 'Save Profile' : 'Add Member'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Team Member"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from the active team roster?`}
        isLoading={deleting}
      />
    </Box>
  )
}
