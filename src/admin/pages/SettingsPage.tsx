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
  useToast,
  Divider,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react'
import { Save, Shield, Lock, User, Globe } from 'lucide-react'
import { settingsApi, authApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import type { SiteSettings } from '../../types'

export function SettingsPage() {
  const { user, refreshUser, isAdmin } = useAuth()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  // Profile & Password states
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileTitle, setProfileTitle] = useState(user?.title || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const toast = useToast()

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await settingsApi.get()
        setSettings(data)
      } catch (err: any) {
        toast({ title: 'Error loading settings', description: err.message, status: 'error' })
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    if (user) {
      setProfileName(user.name)
      setProfileTitle(user.title || '')
    }
  }, [user])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSavingSettings(true)
    try {
      await settingsApi.update(settings)
      toast({
        title: 'Settings Updated',
        description: 'Brand metadata and contact channels saved.',
        status: 'success',
        duration: 3000,
      })
    } catch (err: any) {
      toast({ title: 'Save Failed', description: err.message, status: 'error' })
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await authApi.updateProfile({
        name: profileName,
        title: profileTitle,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      })
      await refreshUser()
      setCurrentPassword('')
      setNewPassword('')
      toast({
        title: 'Profile Updated',
        description: 'Personal details and security credentials updated.',
        status: 'success',
        duration: 3000,
      })
    } catch (err: any) {
      toast({ title: 'Profile Update Failed', description: err.message, status: 'error' })
    } finally {
      setSavingProfile(false)
    }
  }

  if (loading || !settings) {
    return (
      <Box p={8} textAlign="center" color="gray.400">
        Loading system settings...
      </Box>
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="lg" fontFamily="heading" color="white">
              System & Brand Settings
            </Heading>
            <Badge colorScheme="purple" px={2} borderRadius="full">
              GLOBAL CONFIG
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Configure company branding, official communication channels, and account security
          </Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* BRAND & CONTACT SETTINGS */}
        <Card as="form" onSubmit={handleSaveSettings}>
          <CardBody p={6}>
            <HStack spacing={2} mb={4}>
              <Globe size={18} color="#06B6D4" />
              <Heading size="sm" fontFamily="heading" color="white">
                Brand & Contact Configuration
              </Heading>
            </HStack>

            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Company Name</FormLabel>
                <Input
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs">Brand Tagline</FormLabel>
                <Input
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                />
              </FormControl>

              <HStack w="full" spacing={3}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Contact Email</FormLabel>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Support Email</FormLabel>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <HStack w="full" spacing={3}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Phone Number</FormLabel>
                  <Input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">WhatsApp Support</FormLabel>
                  <Input
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontSize="xs">Headquarters / Studio Address</FormLabel>
                <Input
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </FormControl>

              {isAdmin && (
                <Button
                  type="submit"
                  variant="solid"
                  colorScheme="brand"
                  size="sm"
                  w="full"
                  mt={2}
                  leftIcon={<Save size={15} />}
                  isLoading={savingSettings}
                >
                  Save Global Configuration
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* ADMIN PROFILE & SECURITY */}
        <Card as="form" onSubmit={handleSaveProfile}>
          <CardBody p={6}>
            <HStack spacing={2} mb={4}>
              <Shield size={18} color="#A78BFA" />
              <Heading size="sm" fontFamily="heading" color="white">
                Admin Profile & Password
              </Heading>
            </HStack>

            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs">Your Full Name</FormLabel>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </FormControl>

              <HStack w="full" spacing={3}>
                <FormControl flex={1}>
                  <FormLabel fontSize="xs">Title / Specialty</FormLabel>
                  <Input
                    value={profileTitle}
                    onChange={(e) => setProfileTitle(e.target.value)}
                    placeholder="Chief Architect"
                  />
                </FormControl>
                <FormControl flex={1} isDisabled>
                  <FormLabel fontSize="xs">Email (Read Only)</FormLabel>
                  <Input value={user?.email || ''} isReadOnly />
                </FormControl>
              </HStack>

              <Divider my={2} borderColor="rgba(255, 255, 255, 0.08)" />

              <Heading size="2xs" color="gray.400" alignSelf="flex-start" textTransform="uppercase">
                Change Password (Optional)
              </Heading>

              <FormControl>
                <FormLabel fontSize="xs">Current Password</FormLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Required only when setting a new password"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="xs">New Password</FormLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                />
              </FormControl>

              <Button
                type="submit"
                variant="solid"
                colorScheme="cyan"
                size="sm"
                w="full"
                mt={2}
                leftIcon={<Lock size={15} />}
                isLoading={savingProfile}
              >
                Update Profile & Credentials
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  )
}
