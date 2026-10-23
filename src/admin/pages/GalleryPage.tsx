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
  SimpleGrid,
  Card,
  CardBody,
  Image,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
import { Search, Upload, Copy, Trash2, Check, ExternalLink, ImageIcon } from 'lucide-react'
import { galleryApi } from '../../services/api'
import { ConfirmModal } from '../components/ConfirmModal'
import { useAuth } from '../../context/AuthContext'
import type { GalleryItem } from '../../types'

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { isAdmin } = useAuth()
  const toast = useToast()

  const loadGallery = async () => {
    setLoading(true)
    try {
      const data = await galleryApi.getAllAdmin()
      setItems(data)
    } catch (err: any) {
      toast({ title: 'Error loading media', description: err.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGallery()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetInput = e.target
    const file = targetInput.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid File', description: 'Please select an image file (PNG, JPG, WebP, SVG, GIF, AVIF).', status: 'warning' })
      targetInput.value = ''
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Maximum file size is 25MB.', status: 'warning' })
      targetInput.value = ''
      return
    }

    setUploading(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const uploadRes = await galleryApi.uploadMedia(file.name, reader.result as string)
        await galleryApi.create({
          title: file.name.replace(/\.[^/.]+$/, ''),
          category: 'community',
          type: 'image',
          image: uploadRes.url,
          tag: 'MEDIA UPLOAD',
          alt: file.name,
        })
        toast({
          title: 'Asset Uploaded',
          description: `${file.name} successfully saved to media library.`,
          status: 'success',
          duration: 3000,
        })
        loadGallery()
      } catch (err: any) {
        toast({ title: 'Upload Failed', description: err.message, status: 'error' })
      } finally {
        setUploading(false)
        targetInput.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCopyUrl = (url?: string, id?: string) => {
    if (!url) return
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id || url)
    toast({
      title: 'URL Copied to Clipboard',
      description: fullUrl,
      status: 'info',
      duration: 2000,
    })
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return
    setDeleting(true)
    try {
      await galleryApi.delete(deleteTarget.id)
      toast({ title: 'Item Deleted', status: 'info', duration: 2500 })
      setDeleteTarget(null)
      loadGallery()
    } catch (err: any) {
      toast({ title: 'Delete Failed', description: err.message, status: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || (item.caption || '').toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <Box>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="lg" fontFamily="heading" color="white">
              Media & Gallery Library
            </Heading>
            <Badge colorScheme="cyan" borderRadius="full" px={2}>
              {items.length} Assets
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Store, preview, copy URLs, and manage assets for portfolio case studies and community stories
          </Text>
        </Box>

        <Box position="relative">
          <Input
            type="file"
            id="media-file-input"
            accept="image/*"
            display="none"
            onChange={handleFileUpload}
          />
          <Button
            as="label"
            htmlFor="media-file-input"
            variant="solid"
            colorScheme="brand"
            leftIcon={<Upload size={16} />}
            isLoading={uploading}
            loadingText="Uploading..."
            cursor="pointer"
          >
            Upload Media
          </Button>
        </Box>
      </Flex>

      {/* Filter and Search Bar */}
      <Flex direction={{ base: 'column', sm: 'row' }} gap={3} mb={6}>
        <InputGroup maxW={{ base: 'full', sm: '360px' }}>
          <InputLeftElement pointerEvents="none">
            <Search size={16} color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Search media by title or caption..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Select maxW={{ base: 'full', sm: '220px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Media Categories</option>
          <option value="story">Stories</option>
          <option value="celebration">Celebrations</option>
          <option value="community">Community</option>
          <option value="mentorship">Mentorship</option>
          <option value="stat">Metrics & Stats</option>
        </Select>
      </Flex>

      {/* Media Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
        {filtered.map((item) => (
          <Card key={item.id || item.title} overflow="hidden">
            <Box position="relative" h="180px" bg="#0B1020">
              {item.image ? (
                <Image src={item.image} w="full" h="full" objectFit="cover" alt={item.alt || item.title} />
              ) : (
                <Flex w="full" h="full" align="center" justify="center" direction="column">
                  <ImageIcon size={32} color="#6D28D9" />
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    {item.statNumber ? `${item.statNumber} ${item.statUnit}` : 'Graphic Asset'}
                  </Text>
                </Flex>
              )}

              <Badge
                position="absolute"
                top={2.5}
                left={2.5}
                colorScheme="purple"
                fontSize="3xs"
                textTransform="uppercase"
                px={2}
              >
                {item.category}
              </Badge>
            </Box>

            <CardBody p={4}>
              <Text fontWeight="700" color="white" fontSize="xs" isTruncated mb={1}>
                {item.title}
              </Text>
              <Text fontSize="2xs" color="gray.400" isTruncated mb={3}>
                {item.caption || item.subtitle || 'Asset for public website'}
              </Text>

              <Flex justify="space-between" align="center" pt={2} borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
                <Tooltip label="Copy asset URL to clipboard" hasArrow>
                  <Button
                    size="xs"
                    variant="outline"
                    leftIcon={copiedId === (item.id || item.image) ? <Check size={12} color="#22D3EE" /> : <Copy size={12} />}
                    onClick={() => handleCopyUrl(item.image, item.id)}
                  >
                    {copiedId === (item.id || item.image) ? 'Copied' : 'Copy URL'}
                  </Button>
                </Tooltip>

                {isAdmin && (
                  <IconButton
                    aria-label="Delete media item"
                    icon={<Trash2 size={13} />}
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => setDeleteTarget(item)}
                  />
                )}
              </Flex>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Media Asset"
        message={`Are you sure you want to remove "${deleteTarget?.title}" from the media library?`}
        isLoading={deleting}
      />
    </Box>
  )
}
