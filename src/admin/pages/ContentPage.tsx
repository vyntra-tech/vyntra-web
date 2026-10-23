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
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Icon,
} from '@chakra-ui/react'
import { Save, Eye, Sparkles, Globe, FileText, Info } from 'lucide-react'
import { contentApi } from '../../services/api'
import type { WebsiteContent } from '../../types'

export function ContentPage() {
  const [content, setContent] = useState<WebsiteContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const loadContent = async () => {
    setLoading(true)
    try {
      const data = await contentApi.get()
      setContent(data)
    } catch (err: any) {
      toast({ title: 'Error loading website copy', description: err.message, status: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContent()
  }, [])

  const handleSave = async () => {
    if (!content) return
    setSaving(true)
    try {
      await contentApi.update(content)
      toast({
        title: 'Website Content Saved',
        description: 'Updates will reflect dynamically across public web pages.',
        status: 'success',
        duration: 3500,
      })
    } catch (err: any) {
      toast({ title: 'Save Failed', description: err.message, status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !content) {
    return (
      <Box p={8} textAlign="center" color="gray.400">
        Loading CMS sections...
      </Box>
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="lg" fontFamily="heading" color="white">
              Website Content Management (CMS)
            </Heading>
            <Badge colorScheme="purple" px={2} borderRadius="full">
              LIVE SYNC
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Control brand headlines, value propositions, stats, and SEO metadata
          </Text>
        </Box>

        <HStack spacing={3}>
          <Button variant="outline" leftIcon={<Eye size={16} />} onClick={onOpen}>
            Preview Content
          </Button>
          <Button
            variant="solid"
            colorScheme="brand"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
            isLoading={saving}
          >
            Publish Updates
          </Button>
        </HStack>
      </Flex>

      <Card>
        <CardBody p={6}>
          <Tabs variant="soft-rounded" colorScheme="purple">
            <TabList mb={6} overflowX="auto" pb={2}>
              <Tab color="gray.400" _selected={{ color: 'white', bg: 'brand.500' }}>
                Hero & Brand Intro
              </Tab>
              <Tab color="gray.400" _selected={{ color: 'white', bg: 'brand.500' }}>
                About & Impact Stats
              </Tab>
              <Tab color="gray.400" _selected={{ color: 'white', bg: 'brand.500' }}>
                Vision & Mission
              </Tab>
              <Tab color="gray.400" _selected={{ color: 'white', bg: 'brand.500' }}>
                SEO & Social Meta
              </Tab>
            </TabList>

            <TabPanels>
              {/* TAB 1: HERO */}
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch" maxW="800px">
                  <FormControl>
                    <FormLabel fontSize="xs">Hero Tagline / Badge</FormLabel>
                    <Input
                      value={content.hero?.tagline || ''}
                      onChange={(e) =>
                        setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })
                      }
                      placeholder="BUILD. DEPLOY. SCALE."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs">Hero Main Heading (H1)</FormLabel>
                    <Input
                      value={content.hero?.title || ''}
                      onChange={(e) =>
                        setContent({ ...content, hero: { ...content.hero, title: e.target.value } })
                      }
                      placeholder="We turn ambitious ideas into digital reality."
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs">Hero Subtitle</FormLabel>
                    <Textarea
                      rows={3}
                      value={content.hero?.subtitle || ''}
                      onChange={(e) =>
                        setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })
                      }
                      placeholder="High impact introductory description."
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl flex={1}>
                      <FormLabel fontSize="xs">Primary CTA Label</FormLabel>
                      <Input
                        value={content.hero?.primaryCtaLabel || ''}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, primaryCtaLabel: e.target.value },
                          })
                        }
                      />
                    </FormControl>
                    <FormControl flex={1}>
                      <FormLabel fontSize="xs">Primary CTA Target</FormLabel>
                      <Input
                        value={content.hero?.primaryCtaUrl || ''}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, primaryCtaUrl: e.target.value },
                          })
                        }
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing={4}>
                    <FormControl flex={1}>
                      <FormLabel fontSize="xs">Secondary CTA Label</FormLabel>
                      <Input
                        value={content.hero?.secondaryCtaLabel || ''}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, secondaryCtaLabel: e.target.value },
                          })
                        }
                      />
                    </FormControl>
                    <FormControl flex={1}>
                      <FormLabel fontSize="xs">Secondary CTA Target</FormLabel>
                      <Input
                        value={content.hero?.secondaryCtaUrl || ''}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            hero: { ...content.hero, secondaryCtaUrl: e.target.value },
                          })
                        }
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              </TabPanel>

              {/* TAB 2: ABOUT */}
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch" maxW="800px">
                  <FormControl>
                    <FormLabel fontSize="xs">Section Label</FormLabel>
                    <Input
                      value={content.about?.label || ''}
                      onChange={(e) =>
                        setContent({ ...content, about: { ...content.about, label: e.target.value } })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs">About Heading</FormLabel>
                    <Input
                      value={content.about?.heading || ''}
                      onChange={(e) =>
                        setContent({ ...content, about: { ...content.about, heading: e.target.value } })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs">About Description</FormLabel>
                    <Textarea
                      rows={4}
                      value={content.about?.description || ''}
                      onChange={(e) =>
                        setContent({ ...content, about: { ...content.about, description: e.target.value } })
                      }
                    />
                  </FormControl>

                  <Heading size="xs" color="cyan.400" pt={2}>
                    Key Performance Metrics & Stats
                  </Heading>

                  {(content.about?.stats || []).map((stat, idx) => (
                    <HStack key={idx} spacing={4}>
                      <FormControl flex={1}>
                        <FormLabel fontSize="2xs">Metric Number</FormLabel>
                        <Input
                          value={stat.value}
                          onChange={(e) => {
                            const newStats = [...content.about.stats]
                            newStats[idx].value = e.target.value
                            setContent({ ...content, about: { ...content.about, stats: newStats } })
                          }}
                        />
                      </FormControl>
                      <FormControl flex={2}>
                        <FormLabel fontSize="2xs">Metric Label</FormLabel>
                        <Input
                          value={stat.label}
                          onChange={(e) => {
                            const newStats = [...content.about.stats]
                            newStats[idx].label = e.target.value
                            setContent({ ...content, about: { ...content.about, stats: newStats } })
                          }}
                        />
                      </FormControl>
                    </HStack>
                  ))}
                </VStack>
              </TabPanel>

              {/* TAB 3: VISION */}
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch" maxW="800px">
                  <FormControl>
                    <FormLabel fontSize="xs">Vision Statement Heading</FormLabel>
                    <Input
                      value={content.vision?.heading || ''}
                      onChange={(e) =>
                        setContent({ ...content, vision: { ...content.vision, heading: e.target.value } })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs">Mission Statement Body</FormLabel>
                    <Textarea
                      rows={4}
                      value={content.vision?.statement || ''}
                      onChange={(e) =>
                        setContent({ ...content, vision: { ...content.vision, statement: e.target.value } })
                      }
                    />
                  </FormControl>
                </VStack>
              </TabPanel>

              {/* TAB 4: SEO */}
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch" maxW="800px">
                  <FormControl>
                    <FormLabel fontSize="xs">Meta Page Title</FormLabel>
                    <Input
                      value={content.seo?.title || ''}
                      onChange={(e) =>
                        setContent({ ...content, seo: { ...content.seo, title: e.target.value } })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs">Meta Description</FormLabel>
                    <Textarea
                      rows={3}
                      value={content.seo?.description || ''}
                      onChange={(e) =>
                        setContent({ ...content, seo: { ...content.seo, description: e.target.value } })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="xs">Target Keywords</FormLabel>
                    <Input
                      value={content.seo?.keywords || ''}
                      onChange={(e) =>
                        setContent({ ...content, seo: { ...content.seo, keywords: e.target.value } })
                      }
                    />
                  </FormControl>

                  <HStack spacing={4}>
                    <FormControl flex={1}>
                      <FormLabel fontSize="xs">OpenGraph Title</FormLabel>
                      <Input
                        value={content.seo?.ogTitle || ''}
                        onChange={(e) =>
                          setContent({ ...content, seo: { ...content.seo, ogTitle: e.target.value } })
                        }
                      />
                    </FormControl>
                    <FormControl flex={1}>
                      <FormLabel fontSize="xs">OpenGraph Description</FormLabel>
                      <Input
                        value={content.seo?.ogDescription || ''}
                        onChange={(e) =>
                          setContent({ ...content, seo: { ...content.seo, ogDescription: e.target.value } })
                        }
                      />
                    </FormControl>
                  </HStack>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>

      {/* LIVE PREVIEW MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="#0B1020" borderColor="rgba(255, 255, 255, 0.1)" borderWidth="1px">
          <ModalHeader color="white" fontFamily="heading" borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            Live Content Preview
          </ModalHeader>
          <ModalCloseButton color="gray.400" />
          <ModalBody py={6}>
            <VStack spacing={6} align="stretch">
              <Box p={5} borderRadius="xl" bg="#11172A" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
                <Badge colorScheme="cyan" mb={2}>
                  {content.hero?.tagline}
                </Badge>
                <Heading size="md" color="white" mb={2}>
                  {content.hero?.title}
                </Heading>
                <Text fontSize="xs" color="gray.300" mb={4}>
                  {content.hero?.subtitle}
                </Text>
                <HStack spacing={3}>
                  <Button size="xs" variant="solid" colorScheme="brand">
                    {content.hero?.primaryCtaLabel}
                  </Button>
                  <Button size="xs" variant="outline">
                    {content.hero?.secondaryCtaLabel}
                  </Button>
                </HStack>
              </Box>

              <Box p={5} borderRadius="xl" bg="#11172A" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
                <Text fontSize="2xs" color="cyan.400" fontWeight="700">
                  {content.about?.label}
                </Text>
                <Heading size="sm" color="white" my={1}>
                  {content.about?.heading}
                </Heading>
                <Text fontSize="xs" color="gray.400" mb={4}>
                  {content.about?.description}
                </Text>

                <HStack spacing={6}>
                  {(content.about?.stats || []).map((s, i) => (
                    <Box key={i}>
                      <Text fontSize="lg" fontWeight="700" color="white">
                        {s.value}
                      </Text>
                      <Text fontSize="2xs" color="gray.400">
                        {s.label}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            <Button variant="ghost" onClick={onClose}>
              Close Preview
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
