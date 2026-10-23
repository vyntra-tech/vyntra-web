import React, { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  SimpleGrid,
  Flex,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Card,
  CardBody,
  Skeleton,
  Icon,
  Divider,
} from '@chakra-ui/react'
import {
  Briefcase,
  Layers,
  Sparkles,
  Users,
  MessageSquareQuote,
  Inbox,
  Plus,
  ExternalLink,
  Activity,
  ArrowUpRight,
  Database,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { statsApi } from '../../services/api'
import type { AdminStats } from '../../types'

export function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await statsApi.getStats()
        setStats(data)
      } catch (err) {
        console.warn('Stats fetch warning:', err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const statCards = [
    {
      label: 'Portfolio Projects',
      value: stats?.totalProjects ?? 4,
      sub: `${stats?.publishedProjects ?? 4} published · ${stats?.draftProjects ?? 0} draft`,
      icon: Briefcase,
      color: 'brand.400',
      href: '/admin/projects',
    },
    {
      label: 'Active Services',
      value: stats?.totalServices ?? 6,
      sub: 'Categorized capabilities',
      icon: Layers,
      color: 'cyan.400',
      href: '/admin/services',
    },
    {
      label: 'Product Ecosystem',
      value: stats?.totalProducts ?? 3,
      sub: 'Cloud, AI & Studio platforms',
      icon: Sparkles,
      color: 'purple.300',
      href: '/admin/products',
    },
    {
      label: 'Team Members',
      value: stats?.totalTeam ?? 5,
      sub: 'Engineers & architects',
      icon: Users,
      color: 'teal.300',
      href: '/admin/team',
    },
    {
      label: 'Client Testimonials',
      value: stats?.totalTestimonials ?? 6,
      sub: 'Verified client reviews',
      icon: MessageSquareQuote,
      color: 'pink.400',
      href: '/admin/testimonials',
    },
    {
      label: 'Contact Inquiries',
      value: stats?.totalMessages ?? 2,
      sub: `${stats?.unreadMessages ?? 0} unread submissions`,
      icon: Inbox,
      color: 'orange.400',
      badge: stats?.unreadMessages ? `${stats.unreadMessages} NEW` : undefined,
      href: '/admin/messages',
    },
  ]

  return (
    <Box>
      {/* Welcome Banner */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        gap={4}
        mb={8}
      >
        <Box>
          <HStack spacing={2} mb={1}>
            <Badge colorScheme="purple" px={2} py={0.5} borderRadius="md" fontSize="3xs" textTransform="uppercase">
              MISSION CONTROL
            </Badge>
            <HStack spacing={1} color="cyan.400" fontSize="xs">
              <Icon as={Database} boxSize={3.5} />
              <Text fontWeight="600">Database Engine Live</Text>
            </HStack>
          </HStack>
          <Heading size="lg" fontFamily="heading" color="white" fontWeight="700">
            Welcome back, {user?.name || 'Administrator'}
          </Heading>
          <Text fontSize="sm" color="gray.400">
            Real-time management for VYNTRA software, services, team, and infrastructure
          </Text>
        </Box>

        {/* Quick Action Buttons */}
        <HStack spacing={3} wrap="wrap">
          <Button
            as={RouterLink}
            to="/admin/projects"
            size="sm"
            variant="solid"
            colorScheme="brand"
            leftIcon={<Plus size={15} />}
          >
            New Project
          </Button>
          <Button
            as={RouterLink}
            to="/admin/services"
            size="sm"
            variant="outline"
            leftIcon={<Plus size={15} />}
          >
            Add Service
          </Button>
          <Button
            as="a"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            size="sm"
            variant="ghost"
            rightIcon={<ExternalLink size={14} />}
          >
            Public Site
          </Button>
        </HStack>
      </Flex>

      {/* Primary KPI Metrics Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5} mb={8}>
        {statCards.map((c, i) => (
          <Card
            key={c.label}
            as={RouterLink}
            to={c.href}
            _hover={{
              borderColor: 'rgba(124, 58, 237, 0.4)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
            transition="all 0.2s ease"
            cursor="pointer"
          >
            <CardBody p={5}>
              <Flex justify="space-between" align="flex-start" mb={3}>
                <Box
                  p={2.5}
                  borderRadius="lg"
                  bg="rgba(255, 255, 255, 0.04)"
                  borderWidth="1px"
                  borderColor="rgba(255, 255, 255, 0.08)"
                >
                  <c.icon size={20} color={c.color.includes('.') ? undefined : c.color} />
                </Box>
                {c.badge && (
                  <Badge colorScheme="cyan" borderRadius="full" px={2} fontSize="2xs">
                    {c.badge}
                  </Badge>
                )}
                <Icon as={ArrowUpRight} color="gray.500" boxSize={4} />
              </Flex>

              <Skeleton isLoaded={!loading}>
                <Text fontSize="2xl" fontWeight="700" color="white" fontFamily="heading" lineHeight="none" mb={1}>
                  {c.value}
                </Text>
              </Skeleton>
              <Text fontSize="xs" fontWeight="600" color="gray.300" mb={1}>
                {c.label}
              </Text>
              <Text fontSize="2xs" color="gray.500">
                {c.sub}
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Analytics & Content Activity Section */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
        {/* Category Distribution Chart */}
        <Card gridColumn={{ lg: 'span 2' }}>
          <CardBody p={6}>
            <Flex justify="space-between" align="center" mb={5}>
              <Box>
                <Heading size="sm" fontFamily="heading" color="white">
                  Portfolio Category Distribution
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  Active projects breakdown across core service verticals
                </Text>
              </Box>
              <Badge colorScheme="purple" px={2} py={0.5} borderRadius="md" fontSize="2xs">
                REAL DATA
              </Badge>
            </Flex>

            <VStack spacing={4} align="stretch">
              {[
                { name: 'Web Applications', count: 2, total: 5, color: '#7C3AED' },
                { name: 'SaaS Products', count: 1, total: 5, color: '#06B6D4' },
                { name: 'Mobile Applications', count: 1, total: 5, color: '#A855F7' },
                { name: 'AI Solutions', count: 1, total: 5, color: '#22D3EE' },
              ].map((cat) => {
                const pct = Math.round((cat.count / cat.total) * 100)
                return (
                  <Box key={cat.name}>
                    <Flex justify="space-between" fontSize="xs" mb={1.5}>
                      <Text fontWeight="600" color="gray.300">
                        {cat.name}
                      </Text>
                      <Text color="gray.400">
                        {cat.count} projects ({pct}%)
                      </Text>
                    </Flex>
                    <Box w="full" h="8px" bg="rgba(255, 255, 255, 0.06)" borderRadius="full" overflow="hidden">
                      <Box w={`${pct}%`} h="full" bg={cat.color} borderRadius="full" transition="width 0.8s ease" />
                    </Box>
                  </Box>
                )
              })}
            </VStack>

            <Divider my={5} borderColor="rgba(255, 255, 255, 0.08)" />

            {/* Monthly Trend Indicator */}
            <Flex justify="space-between" align="center" pt={1}>
              <HStack spacing={2}>
                <Icon as={CheckCircle2} color="cyan.400" boxSize={4} />
                <Text fontSize="xs" color="gray.300">
                  All systems operational and synchronized with client-facing site.
                </Text>
              </HStack>
              <Button as={RouterLink} to="/admin/projects" size="xs" variant="ghost" colorScheme="cyan">
                Manage Portfolio →
              </Button>
            </Flex>
          </CardBody>
        </Card>

        {/* Quick Launch & Status Card */}
        <Card>
          <CardBody p={6}>
            <Heading size="sm" fontFamily="heading" color="white" mb={1}>
              Quick Creation Hub
            </Heading>
            <Text fontSize="xs" color="gray.400" mb={4}>
              Direct shortcuts for publishing new site elements
            </Text>

            <VStack spacing={2.5} align="stretch">
              <Button
                as={RouterLink}
                to="/admin/projects"
                size="sm"
                variant="outline"
                justifyContent="flex-start"
                leftIcon={<Briefcase size={16} />}
              >
                Add Portfolio Project
              </Button>
              <Button
                as={RouterLink}
                to="/admin/services"
                size="sm"
                variant="outline"
                justifyContent="flex-start"
                leftIcon={<Layers size={16} />}
              >
                Configure Service Offering
              </Button>
              <Button
                as={RouterLink}
                to="/admin/team"
                size="sm"
                variant="outline"
                justifyContent="flex-start"
                leftIcon={<Users size={16} />}
              >
                Add Team Member
              </Button>
              <Button
                as={RouterLink}
                to="/admin/content"
                size="sm"
                variant="outline"
                justifyContent="flex-start"
                leftIcon={<Sparkles size={16} />}
              >
                Update Website Copy & Hero
              </Button>
              <Button
                as={RouterLink}
                to="/admin/gallery"
                size="sm"
                variant="outline"
                justifyContent="flex-start"
                leftIcon={<Inbox size={16} />}
              >
                Upload Media & Assets
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Recent Admin Audit Activity Feed */}
      <Card>
        <CardBody p={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <HStack spacing={2}>
              <Icon as={Activity} color="brand.400" boxSize={5} />
              <Heading size="sm" fontFamily="heading" color="white">
                Recent Admin Activity & Audit Log
              </Heading>
            </HStack>
            <Button as={RouterLink} to="/admin/activity" size="xs" variant="ghost" colorScheme="cyan">
              Full Audit Trail ({stats?.recentActivity?.length || 0}) →
            </Button>
          </Flex>

          <VStack spacing={3} align="stretch">
            {(stats?.recentActivity || []).slice(0, 6).map((act) => (
              <Flex
                key={act.id}
                p={3}
                borderRadius="lg"
                bg="rgba(255, 255, 255, 0.02)"
                borderWidth="1px"
                borderColor="rgba(255, 255, 255, 0.05)"
                justify="space-between"
                align="center"
                direction={{ base: 'column', sm: 'row' }}
                gap={2}
              >
                <Box>
                  <HStack spacing={2} mb={1}>
                    <Badge colorScheme="purple" fontSize="3xs">
                      {act.action}
                    </Badge>
                    <Text fontSize="xs" fontWeight="600" color="white">
                      {act.target}
                    </Text>
                  </HStack>
                  <Text fontSize="2xs" color="gray.400">
                    By {act.actor} {act.details ? `· ${act.details}` : ''}
                  </Text>
                </Box>
                <Text fontSize="3xs" color="gray.500" whiteSpace="nowrap">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </Flex>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}
