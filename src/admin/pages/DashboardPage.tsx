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
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { statsApi } from '../../services/api'
import type { AdminStats } from '../../types'
import {
  VelocityDualBarChart,
  CategoryVerticalBarChart,
  ClusterTelemetryBarChart,
  MiniBarSparkline,
} from '../components/DashboardCharts'

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
      trend: '+25% this month',
      icon: Briefcase,
      color: '#A78BFA',
      sparkScheme: 'purple' as const,
      sparkValues: [2, 3, 3, 4, 4, 5, 5],
      href: '/admin/projects',
    },
    {
      label: 'Active Services',
      value: stats?.totalServices ?? 6,
      sub: 'Categorized technical capabilities',
      trend: '100% capacity',
      icon: Layers,
      color: '#22D3EE',
      sparkScheme: 'cyan' as const,
      sparkValues: [4, 4, 5, 5, 6, 6, 6],
      href: '/admin/services',
    },
    {
      label: 'Product Ecosystem',
      value: stats?.totalProducts ?? 3,
      sub: 'Cloud, AI & Studio platforms',
      trend: '+1 upcoming beta',
      icon: Sparkles,
      color: '#C084FC',
      sparkScheme: 'purple' as const,
      sparkValues: [1, 2, 2, 2, 3, 3, 3],
      href: '/admin/products',
    },
    {
      label: 'Team Members',
      value: stats?.totalTeam ?? 5,
      sub: 'Engineers & leadership',
      trend: '2 Co-founders active',
      icon: Users,
      color: '#34D399',
      sparkScheme: 'green' as const,
      sparkValues: [3, 3, 4, 4, 5, 5, 5],
      href: '/admin/team',
    },
    {
      label: 'Client Testimonials',
      value: stats?.totalTestimonials ?? 6,
      sub: 'Verified 5.0★ reviews',
      trend: '+2 new endorsements',
      icon: MessageSquareQuote,
      color: '#F472B6',
      sparkScheme: 'pink' as const,
      sparkValues: [2, 3, 4, 4, 5, 6, 6],
      href: '/admin/testimonials',
    },
    {
      label: 'Contact Inquiries',
      value: stats?.totalMessages ?? 2,
      sub: `${stats?.unreadMessages ?? 0} unread submissions`,
      trend: stats?.unreadMessages ? `${stats.unreadMessages} NEW ACTION` : 'Inbox clear',
      icon: Inbox,
      color: '#FB923C',
      sparkScheme: 'orange' as const,
      sparkValues: [10, 14, 18, 22, 28, 35, 42],
      badge: stats?.unreadMessages ? `${stats.unreadMessages} NEW` : undefined,
      href: '/admin/messages',
    },
  ]

  return (
    <Box maxW="1600px" mx="auto" pb={12}>
      {/* Welcome Banner & Command Center Status */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        gap={4}
        mb={8}
      >
        <Box>
          <HStack spacing={2} mb={1.5} wrap="wrap">
            <Badge
              bg="rgba(124, 58, 237, 0.2)"
              color="#C084FC"
              borderWidth="1px"
              borderColor="rgba(124, 58, 237, 0.4)"
              px={2.5}
              py={0.5}
              borderRadius="full"
              fontSize="3xs"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              MISSION CONTROL
            </Badge>
            <HStack spacing={1.5} color="cyan.400" fontSize="xs">
              <Icon as={Database} boxSize={3.5} />
              <Text fontWeight="600">MongoDB Atlas Connected</Text>
            </HStack>
            <HStack spacing={1.5} color="emerald.400" fontSize="xs">
              <Box w="6px" h="6px" borderRadius="full" bg="emerald.400" boxShadow="0 0 8px #10B981" />
              <Text fontWeight="600">Services Active</Text>
            </HStack>
          </HStack>

          <Heading size="lg" fontFamily="heading" color="white" fontWeight="700" letterSpacing="-0.02em">
            Welcome back, {user?.name || 'Administrator'}
          </Heading>
          <Text fontSize="sm" color="gray.400" mt={0.5}>
            Real-time management for VYNTRA software, services, team, and infrastructure
          </Text>
        </Box>

        {/* Quick Action Navigation Buttons */}
        <HStack spacing={3} wrap="wrap">
          <Button
            as={RouterLink}
            to="/admin/projects"
            size="sm"
            variant="solid"
            colorScheme="brand"
            leftIcon={<Plus size={15} />}
            boxShadow="0 4px 14px rgba(124, 58, 237, 0.4)"
          >
            New Project
          </Button>
          <Button
            as={RouterLink}
            to="/admin/services"
            size="sm"
            variant="outline"
            borderColor="rgba(255, 255, 255, 0.15)"
            _hover={{ bg: 'rgba(255, 255, 255, 0.05)', borderColor: 'cyan.400' }}
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
            color="gray.300"
            _hover={{ color: 'white', bg: 'rgba(255, 255, 255, 0.05)' }}
            rightIcon={<ExternalLink size={14} />}
          >
            Public Site
          </Button>
        </HStack>
      </Flex>

      {/* Primary KPI Metrics Grid with Mini Bar Sparklines */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5} mb={8}>
        {statCards.map((c) => (
          <Card
            key={c.label}
            as={RouterLink}
            to={c.href}
            bg="#080D1A"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="rgba(255, 255, 255, 0.06)"
            boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 20px rgba(0, 0, 0, 0.4)"
            _hover={{
              borderColor: 'rgba(124, 58, 237, 0.5)',
              transform: 'translateY(-3px)',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.6), 0 0 20px rgba(124, 58, 237, 0.15)',
            }}
            transition="all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
            cursor="pointer"
          >
            <CardBody p={5}>
              <Flex justify="space-between" align="flex-start" mb={3}>
                <Box
                  p={2.5}
                  borderRadius="lg"
                  bg="rgba(255, 255, 255, 0.03)"
                  borderWidth="1px"
                  borderColor="rgba(255, 255, 255, 0.08)"
                >
                  <c.icon size={20} color={c.color} />
                </Box>

                <HStack spacing={2} align="center">
                  {c.badge ? (
                    <Badge colorScheme="cyan" borderRadius="full" px={2} fontSize="2xs">
                      {c.badge}
                    </Badge>
                  ) : (
                    <MiniBarSparkline values={c.sparkValues} colorScheme={c.sparkScheme} />
                  )}
                  <Icon as={ArrowUpRight} color="gray.500" boxSize={4} />
                </HStack>
              </Flex>

              <Skeleton isLoaded={!loading}>
                <Flex align="baseline" justify="space-between" mb={1}>
                  <Text fontSize="3xl" fontWeight="700" color="white" fontFamily="heading" lineHeight="none">
                    {c.value}
                  </Text>
                  <Text fontSize="3xs" color="gray.400" fontWeight="600">
                    {c.trend}
                  </Text>
                </Flex>
              </Skeleton>

              <Text fontSize="xs" fontWeight="600" color="gray.200" mb={0.5}>
                {c.label}
              </Text>
              <Text fontSize="2xs" color="gray.500">
                {c.sub}
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* FEATURED: FULL MODERN DUAL-SERIES VELOCITY BAR CHART */}
      <Card
        mb={8}
        bg="#080D1A"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.07)"
        boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 32px rgba(0, 0, 0, 0.5)"
      >
        <CardBody p={{ base: 5, md: 7 }}>
          <VelocityDualBarChart />
        </CardBody>
      </Card>

      {/* SECTION 2: VERTICAL CATEGORY BAR CHART & QUICK ACTIONS */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} mb={8}>
        {/* Full Vertical Category Volume Bar Chart */}
        <Card
          gridColumn={{ lg: 'span 2' }}
          bg="#080D1A"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="rgba(255, 255, 255, 0.07)"
          boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.05)"
        >
          <CardBody p={{ base: 5, md: 7 }}>
            <CategoryVerticalBarChart />
          </CardBody>
        </Card>

        {/* Quick Launch & Publishing Hub */}
        <Card
          bg="#080D1A"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="rgba(255, 255, 255, 0.07)"
          boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.05)"
        >
          <CardBody p={{ base: 5, md: 6 }}>
            <Heading size="sm" fontFamily="heading" color="white" mb={1}>
              Quick Creation Hub
            </Heading>
            <Text fontSize="xs" color="gray.400" mb={4}>
              Direct shortcuts for publishing site elements
            </Text>

            <VStack spacing={2.5} align="stretch">
              <Button
                as={RouterLink}
                to="/admin/projects"
                size="sm"
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.08)"
                justifyContent="flex-start"
                _hover={{ bg: 'rgba(124, 58, 237, 0.15)', borderColor: 'brand.400', color: 'white' }}
                leftIcon={<Briefcase size={16} color="#A78BFA" />}
              >
                Add Portfolio Project
              </Button>
              <Button
                as={RouterLink}
                to="/admin/services"
                size="sm"
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.08)"
                justifyContent="flex-start"
                _hover={{ bg: 'rgba(6, 182, 212, 0.15)', borderColor: 'cyan.400', color: 'white' }}
                leftIcon={<Layers size={16} color="#22D3EE" />}
              >
                Configure Service Offering
              </Button>
              <Button
                as={RouterLink}
                to="/admin/team"
                size="sm"
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.08)"
                justifyContent="flex-start"
                _hover={{ bg: 'rgba(52, 211, 153, 0.15)', borderColor: 'emerald.400', color: 'white' }}
                leftIcon={<Users size={16} color="#34D399" />}
              >
                Manage Team Members
              </Button>
              <Button
                as={RouterLink}
                to="/admin/content"
                size="sm"
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.08)"
                justifyContent="flex-start"
                _hover={{ bg: 'rgba(192, 132, 252, 0.15)', borderColor: 'purple.400', color: 'white' }}
                leftIcon={<Sparkles size={16} color="#C084FC" />}
              >
                Update Website Copy & Hero
              </Button>
              <Button
                as={RouterLink}
                to="/admin/gallery"
                size="sm"
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.08)"
                justifyContent="flex-start"
                _hover={{ bg: 'rgba(251, 146, 60, 0.15)', borderColor: 'orange.400', color: 'white' }}
                leftIcon={<Inbox size={16} color="#FB923C" />}
              >
                Upload Media & Assets
              </Button>
            </VStack>

            <Divider my={4} borderColor="rgba(255, 255, 255, 0.08)" />

            <HStack spacing={2} color="cyan.400" fontSize="xs">
              <Icon as={CheckCircle2} boxSize={4} />
              <Text fontWeight="600">All modules auto-sync to CDN</Text>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* SECTION 3: CLUSTER TELEMETRY 24H BAR STRIP */}
      <Box mb={8}>
        <ClusterTelemetryBarChart />
      </Box>

      {/* SECTION 4: RECENT AUDIT LOG & ACTIVITY */}
      <Card
        bg="#080D1A"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.07)"
        boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.05)"
      >
        <CardBody p={{ base: 5, md: 6 }}>
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
                p={3.5}
                borderRadius="lg"
                bg="rgba(255, 255, 255, 0.02)"
                borderWidth="1px"
                borderColor="rgba(255, 255, 255, 0.05)"
                justify="space-between"
                align="center"
                direction={{ base: 'column', sm: 'row' }}
                gap={2}
                _hover={{ bg: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(124, 58, 237, 0.2)' }}
                transition="all 0.15s ease"
              >
                <Box>
                  <HStack spacing={2} mb={1}>
                    <Badge colorScheme="purple" fontSize="3xs" px={2} py={0.5} borderRadius="full">
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
