import React, { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Heading,
  HStack,
  VStack,
  Badge,
  Button,
  ButtonGroup,
  Icon,
  Tooltip,
} from '@chakra-ui/react'
import {
  TrendingUp,
  Briefcase,
  Layers,
  Sparkles,
  Cpu,
  Server,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react'

// --- 1. DUAL-SERIES INTERACTIVE MONTHLY VELOCITY BAR CHART ---

interface MonthlyDataPoint {
  period: string
  releases: number
  inquiries: number
  label: string
  note: string
}

const DATA_6M: MonthlyDataPoint[] = [
  { period: 'Nov', releases: 4, inquiries: 16, label: 'November', note: '+12% month-on-month' },
  { period: 'Dec', releases: 7, inquiries: 22, label: 'December', note: 'Year-end enterprise surge' },
  { period: 'Jan', releases: 6, inquiries: 28, label: 'January', note: 'Q1 product sprint' },
  { period: 'Feb', releases: 9, inquiries: 32, label: 'February', note: 'AI solution onboarding' },
  { period: 'Mar', releases: 11, inquiries: 38, label: 'March', note: 'Cloud migrations launched' },
  { period: 'Apr', releases: 14, inquiries: 46, label: 'April', note: 'Current peak sprint' },
]

const DATA_1Y: MonthlyDataPoint[] = [
  { period: 'May', releases: 3, inquiries: 12, label: 'May', note: 'Core framework init' },
  { period: 'Jun', releases: 5, inquiries: 15, label: 'June', note: 'MVP rollout' },
  { period: 'Jul', releases: 4, inquiries: 14, label: 'July', note: 'Infra scaling' },
  { period: 'Aug', releases: 6, inquiries: 18, label: 'August', note: 'Client pilot launch' },
  { period: 'Sep', releases: 5, inquiries: 20, label: 'September', note: 'SaaS module v1' },
  { period: 'Oct', releases: 6, inquiries: 24, label: 'October', note: 'Enterprise expansion' },
  { period: 'Nov', releases: 8, inquiries: 26, label: 'November', note: 'Global release' },
  { period: 'Dec', releases: 10, inquiries: 30, label: 'December', note: 'Holiday scale test' },
  { period: 'Jan', releases: 9, inquiries: 32, label: 'January', note: 'Q1 client intake' },
  { period: 'Feb', releases: 12, inquiries: 36, label: 'February', note: 'AI agent pipeline' },
  { period: 'Mar', releases: 13, inquiries: 40, label: 'March', note: 'Platform redesign' },
  { period: 'Apr', releases: 16, inquiries: 48, label: 'April', note: 'Record throughput' },
]

const DATA_QUARTER: MonthlyDataPoint[] = [
  { period: 'Q1 2025', releases: 12, inquiries: 41, label: 'Q1 (Jan-Mar 2025)', note: 'Foundation phase' },
  { period: 'Q2 2025', releases: 15, inquiries: 47, label: 'Q2 (Apr-Jun 2025)', note: 'Growth & client pilots' },
  { period: 'Q3 2025', releases: 17, inquiries: 54, label: 'Q3 (Jul-Sep 2025)', note: 'SaaS ecosystem rollout' },
  { period: 'Q4 2025', releases: 24, inquiries: 70, label: 'Q4 (Oct-Dec 2025)', note: 'Multi-tenant scale' },
  { period: 'Q1 2026', releases: 32, inquiries: 96, label: 'Q1 (Jan-Mar 2026)', note: '+42% YoY expansion' },
]

export function VelocityDualBarChart() {
  const [timeframe, setTimeframe] = useState<'6M' | '1Y' | 'Q'>('6M')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const dataset = timeframe === '6M' ? DATA_6M : timeframe === '1Y' ? DATA_1Y : DATA_QUARTER
  const maxVal = Math.max(...dataset.flatMap((d) => [d.releases, d.inquiries])) * 1.15 || 50

  const hoveredData = hoveredIndex !== null ? dataset[hoveredIndex] : null

  return (
    <Box position="relative">
      {/* Top Header & Filter Bar */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        gap={4}
        mb={6}
      >
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="sm" fontFamily="heading" color="white" fontWeight="700">
              Engineering Velocity & Inquiries
            </Heading>
            <Badge colorScheme="purple" fontSize="3xs" px={2} py={0.5} borderRadius="full">
              LIVE TELEMETRY
            </Badge>
          </HStack>
          <Text fontSize="xs" color="gray.400">
            Dual-series volume analysis: Deliveries vs Inbound client inquiries
          </Text>
        </Box>

        {/* Legend + Timeframe Buttons */}
        <Flex align="center" gap={4} wrap="wrap">
          {/* Legend */}
          <HStack spacing={4} fontSize="xs">
            <HStack spacing={1.5}>
              <Box w="10px" h="10px" borderRadius="sm" bg="linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)" boxShadow="0 0 8px rgba(124, 58, 237, 0.6)" />
              <Text color="gray.300">Deliveries</Text>
            </HStack>
            <HStack spacing={1.5}>
              <Box w="10px" h="10px" borderRadius="sm" bg="linear-gradient(180deg, #22D3EE 0%, #06B6D4 100%)" boxShadow="0 0 8px rgba(6, 182, 212, 0.6)" />
              <Text color="gray.300">Inquiries</Text>
            </HStack>
          </HStack>

          {/* Timeframe Filter Buttons */}
          <ButtonGroup size="xs" isAttached variant="outline" borderColor="rgba(255, 255, 255, 0.1)">
            {(['6M', '1Y', 'Q'] as const).map((t) => (
              <Button
                key={t}
                onClick={() => {
                  setTimeframe(t)
                  setHoveredIndex(null)
                }}
                bg={timeframe === t ? 'rgba(124, 58, 237, 0.25)' : 'transparent'}
                color={timeframe === t ? 'white' : 'gray.400'}
                borderColor="rgba(255, 255, 255, 0.1)"
                _hover={{ bg: 'rgba(124, 58, 237, 0.15)', color: 'white' }}
              >
                {t === '6M' ? 'Last 6 Months' : t === '1Y' ? '12 Months' : 'Quarterly'}
              </Button>
            ))}
          </ButtonGroup>
        </Flex>
      </Flex>

      {/* Quick Summary Pill Row */}
      <HStack spacing={4} mb={5} wrap="wrap">
        <HStack spacing={2} bg="rgba(255, 255, 255, 0.03)" px={3} py={1.5} borderRadius="lg" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.05)">
          <Icon as={TrendingUp} color="brand.400" boxSize={3.5} />
          <Text fontSize="xs" color="gray.400">Delivery Growth:</Text>
          <Text fontSize="xs" fontWeight="700" color="brand.300">+28.4% MoM</Text>
        </HStack>
        <HStack spacing={2} bg="rgba(255, 255, 255, 0.03)" px={3} py={1.5} borderRadius="lg" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.05)">
          <Icon as={Zap} color="cyan.400" boxSize={3.5} />
          <Text fontSize="xs" color="gray.400">Inquiry Conversion:</Text>
          <Text fontSize="xs" fontWeight="700" color="cyan.300">41.8% to Active Scope</Text>
        </HStack>
        <HStack spacing={2} bg="rgba(255, 255, 255, 0.03)" px={3} py={1.5} borderRadius="lg" borderWidth="1px" borderColor="rgba(255, 255, 255, 0.05)">
          <Icon as={CheckCircle2} color="emerald.400" boxSize={3.5} />
          <Text fontSize="xs" color="gray.400">SLA Adherence:</Text>
          <Text fontSize="xs" fontWeight="700" color="green.300">99.4% On Schedule</Text>
        </HStack>
      </HStack>

      {/* Main Chart Canvas Area */}
      <Box
        position="relative"
        h={{ base: '260px', md: '290px' }}
        w="full"
        bg="rgba(4, 6, 11, 0.6)"
        borderRadius="xl"
        p={4}
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.05)"
      >
        {/* Horizontal Dotted Reference Grid Lines */}
        <VStack
          position="absolute"
          top={4}
          left={12}
          right={4}
          bottom={10}
          justify="space-between"
          align="stretch"
          pointerEvents="none"
          spacing={0}
        >
          {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
            <Flex key={ratio} align="center" w="full" position="relative">
              <Text
                position="absolute"
                left="-38px"
                fontSize="3xs"
                color="gray.600"
                fontFamily="mono"
              >
                {Math.round(maxVal * ratio)}
              </Text>
              <Box w="full" borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.05)" borderStyle="dashed" />
            </Flex>
          ))}
        </VStack>

        {/* Dynamic Interactive Tooltip */}
        {hoveredData && (
          <Box
            position="absolute"
            top={3}
            right={4}
            bg="#080D1A"
            p={3}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="rgba(124, 58, 237, 0.35)"
            boxShadow="0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(124, 58, 237, 0.2)"
            zIndex={10}
            minW="180px"
          >
            <Text fontSize="xs" fontWeight="700" color="white" mb={1.5}>
              {hoveredData.label}
            </Text>
            <HStack justify="space-between" fontSize="2xs" mb={1}>
              <HStack spacing={1.5}>
                <Box w="7px" h="7px" borderRadius="full" bg="#A78BFA" />
                <Text color="gray.400">Deliveries:</Text>
              </HStack>
              <Text fontWeight="700" color="#A78BFA">
                {hoveredData.releases} Projects
              </Text>
            </HStack>
            <HStack justify="space-between" fontSize="2xs" mb={1.5}>
              <HStack spacing={1.5}>
                <Box w="7px" h="7px" borderRadius="full" bg="#22D3EE" />
                <Text color="gray.400">Inquiries:</Text>
              </HStack>
              <Text fontWeight="700" color="#22D3EE">
                {hoveredData.inquiries} Leads
              </Text>
            </HStack>
            <Text fontSize="3xs" color="gray.500" pt={1} borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
              {hoveredData.note}
            </Text>
          </Box>
        )}

        {/* Bars Container */}
        <Flex
          position="absolute"
          top={4}
          left={12}
          right={4}
          bottom={10}
          align="flex-end"
          justify="space-around"
          gap={{ base: 1, md: 3 }}
        >
          {dataset.map((d, idx) => {
            const hReleases = Math.max(8, (d.releases / maxVal) * 100)
            const hInquiries = Math.max(12, (d.inquiries / maxVal) * 100)
            const isHovered = hoveredIndex === idx

            return (
              <Flex
                key={d.period}
                direction="column"
                align="center"
                justify="flex-end"
                h="full"
                flex={1}
                position="relative"
                cursor="pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                px={{ base: 0.5, md: 1 }}
                borderRadius="md"
                bg={isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent'}
                transition="all 0.2s ease"
              >
                {/* Dual Bars Side-by-Side */}
                <HStack
                  spacing={{ base: 1, md: 1.5 }}
                  align="flex-end"
                  h="full"
                  w="full"
                  justify="center"
                >
                  {/* Bar 1: Deliveries (Purple) */}
                  <Box
                    w={{ base: '8px', sm: '12px', md: '16px' }}
                    h={`${hReleases}%`}
                    bg="linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)"
                    borderRadius="t-md"
                    position="relative"
                    boxShadow={isHovered ? '0 0 14px rgba(124, 58, 237, 0.8)' : '0 2px 6px rgba(0,0,0,0.4)'}
                    transition="height 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease"
                    transform={isHovered ? 'scaleY(1.03)' : 'none'}
                    transformOrigin="bottom"
                  >
                    {/* Glowing Top Cap */}
                    <Box
                      position="absolute"
                      top="-2px"
                      left="0"
                      right="0"
                      h="3px"
                      borderRadius="full"
                      bg="#E9D5FF"
                      boxShadow="0 0 6px #C084FC"
                    />
                  </Box>

                  {/* Bar 2: Inquiries (Cyan) */}
                  <Box
                    w={{ base: '8px', sm: '12px', md: '16px' }}
                    h={`${hInquiries}%`}
                    bg="linear-gradient(180deg, #22D3EE 0%, #06B6D4 100%)"
                    borderRadius="t-md"
                    position="relative"
                    boxShadow={isHovered ? '0 0 14px rgba(6, 182, 212, 0.8)' : '0 2px 6px rgba(0,0,0,0.4)'}
                    transition="height 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease"
                    transform={isHovered ? 'scaleY(1.03)' : 'none'}
                    transformOrigin="bottom"
                  >
                    {/* Glowing Top Cap */}
                    <Box
                      position="absolute"
                      top="-2px"
                      left="0"
                      right="0"
                      h="3px"
                      borderRadius="full"
                      bg="#CFFAFE"
                      boxShadow="0 0 6px #67E8F9"
                    />
                  </Box>
                </HStack>

                {/* X-Axis Month Label */}
                <Text
                  position="absolute"
                  bottom="-24px"
                  fontSize={{ base: '3xs', sm: '2xs' }}
                  fontWeight={isHovered ? '700' : '500'}
                  color={isHovered ? 'white' : 'gray.400'}
                  transition="color 0.15s ease"
                >
                  {d.period}
                </Text>
              </Flex>
            )
          })}
        </Flex>
      </Box>
    </Box>
  )
}

// --- 2. VERTICAL PORTFOLIO CATEGORY DISTRIBUTION BAR CHART ---

interface CategoryBarItem {
  name: string
  short: string
  count: number
  total: number
  pct: number
  color: string
  gradient: string
  glowColor: string
  icon: any
  trend: string
}

const CATEGORY_DATA: CategoryBarItem[] = [
  {
    name: 'Web Applications',
    short: 'Web Apps',
    count: 24,
    total: 58,
    pct: 42,
    color: '#7C3AED',
    gradient: 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)',
    glowColor: 'rgba(124, 58, 237, 0.7)',
    icon: Briefcase,
    trend: '+18% this quarter',
  },
  {
    name: 'AI & Automation Solutions',
    short: 'AI Systems',
    count: 16,
    total: 58,
    pct: 28,
    color: '#06B6D4',
    gradient: 'linear-gradient(180deg, #22D3EE 0%, #06B6D4 100%)',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    icon: Sparkles,
    trend: '+34% rapid growth',
  },
  {
    name: 'Cloud & DevOps Architecture',
    short: 'Cloud Infra',
    count: 11,
    total: 58,
    pct: 18,
    color: '#8B5CF6',
    gradient: 'linear-gradient(180deg, #C084FC 0%, #8B5CF6 100%)',
    glowColor: 'rgba(139, 92, 246, 0.7)',
    icon: Server,
    trend: 'High SLA stability',
  },
  {
    name: 'SaaS Platforms & Studio',
    short: 'SaaS Products',
    count: 7,
    total: 58,
    pct: 12,
    color: '#10B981',
    gradient: 'linear-gradient(180deg, #34D399 0%, #059669 100%)',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    icon: Layers,
    trend: 'Emerging MRR driver',
  },
]

export function CategoryVerticalBarChart() {
  const [activeCat, setActiveCat] = useState<number | null>(null)

  return (
    <Box position="relative">
      <Flex justify="space-between" align="center" mb={5}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="sm" fontFamily="heading" color="white" fontWeight="700">
              Capability & Workload Volume
            </Heading>
            <Badge colorScheme="cyan" fontSize="3xs" px={2} py={0.5} borderRadius="full">
              4 VERTICALS
            </Badge>
          </HStack>
          <Text fontSize="xs" color="gray.400">
            Vertical distribution of active deployments and technical scope
          </Text>
        </Box>
        <Text fontSize="xs" color="gray.400" fontWeight="600">
          58 Total Workloads
        </Text>
      </Flex>

      {/* Vertical Bar Columns Area */}
      <Box
        h="240px"
        bg="rgba(4, 6, 11, 0.6)"
        borderRadius="xl"
        p={4}
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.05)"
        position="relative"
      >
        {/* Horizontal Guide Lines */}
        <VStack
          position="absolute"
          top={4}
          left={4}
          right={4}
          bottom={14}
          justify="space-between"
          align="stretch"
          pointerEvents="none"
          spacing={0}
        >
          {[50, 25, 0].map((val) => (
            <Flex key={val} align="center" w="full" position="relative">
              <Box w="full" borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.04)" borderStyle="dashed" />
            </Flex>
          ))}
        </VStack>

        {/* Columns Grid */}
        <Flex
          position="absolute"
          top={4}
          left={4}
          right={4}
          bottom={14}
          align="flex-end"
          justify="space-around"
          gap={3}
        >
          {CATEGORY_DATA.map((cat, idx) => {
            const isHovered = activeCat === idx
            // Scale pct relative to 50% max height
            const barHeightPct = Math.min(100, Math.max(15, (cat.pct / 50) * 100))

            return (
              <Flex
                key={cat.name}
                direction="column"
                align="center"
                justify="flex-end"
                h="full"
                flex={1}
                cursor="pointer"
                onMouseEnter={() => setActiveCat(idx)}
                onMouseLeave={() => setActiveCat(null)}
                transition="all 0.2s ease"
              >
                {/* Percentage Chip on Top of Bar */}
                <Badge
                  colorScheme={cat.pct > 30 ? 'purple' : cat.pct > 20 ? 'cyan' : 'green'}
                  fontSize="3xs"
                  mb={2}
                  borderRadius="full"
                  px={2}
                  transform={isHovered ? 'scale(1.1)' : 'none'}
                  transition="transform 0.15s ease"
                >
                  {cat.pct}%
                </Badge>

                {/* Vertical Column Bar */}
                <Box
                  w={{ base: '24px', sm: '38px', md: '52px' }}
                  h={`${barHeightPct}%`}
                  bg={cat.gradient}
                  borderRadius="t-lg"
                  position="relative"
                  boxShadow={isHovered ? `0 0 20px ${cat.glowColor}` : '0 4px 12px rgba(0,0,0,0.5)'}
                  transition="height 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease"
                  transform={isHovered ? 'scaleY(1.02)' : 'none'}
                  transformOrigin="bottom"
                >
                  {/* Glowing Top Edge */}
                  <Box
                    position="absolute"
                    top="-2px"
                    left="0"
                    right="0"
                    h="3px"
                    borderRadius="full"
                    bg="white"
                    opacity={0.8}
                    boxShadow={`0 0 8px ${cat.glowColor}`}
                  />
                </Box>

                {/* Bottom Label and Icon */}
                <HStack
                  position="absolute"
                  bottom="-36px"
                  spacing={1.5}
                  align="center"
                  color={isHovered ? 'white' : 'gray.400'}
                >
                  <Icon as={cat.icon} boxSize={3.5} color={cat.color} />
                  <Text
                    fontSize="2xs"
                    fontWeight={isHovered ? '700' : '600'}
                    whiteSpace="nowrap"
                  >
                    {cat.short}
                  </Text>
                </HStack>
              </Flex>
            )
          })}
        </Flex>
      </Box>

      {/* Category Details Bar */}
      <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3} mt={12}>
        {CATEGORY_DATA.map((c) => (
          <Box
            key={c.name}
            p={3}
            borderRadius="lg"
            bg="rgba(255, 255, 255, 0.02)"
            borderWidth="1px"
            borderColor="rgba(255, 255, 255, 0.05)"
          >
            <Text fontSize="3xs" color="gray.400" mb={0.5}>
              {c.name}
            </Text>
            <HStack justify="space-between" align="baseline">
              <Text fontSize="sm" fontWeight="700" color="white" fontFamily="heading">
                {c.count} Units
              </Text>
              <Text fontSize="3xs" color={c.color} fontWeight="600">
                {c.pct}%
              </Text>
            </HStack>
            <Text fontSize="3xs" color="gray.500" mt={1}>
              {c.trend}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}

// Helper SimpleGrid import for the category details
import { SimpleGrid } from '@chakra-ui/react'

// --- 3. CLUSTER TELEMETRY 24-HOUR ACTIVITY BAR STRIP ---

const HOURLY_LATENCY = [
  16, 18, 14, 15, 17, 21, 24, 28, 35, 42, 38, 32, 29, 31, 36, 44, 48, 40, 34, 27, 22, 19, 17, 15,
]

export function ClusterTelemetryBarChart() {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)
  const maxLatency = Math.max(...HOURLY_LATENCY) * 1.1

  return (
    <Box
      p={5}
      borderRadius="xl"
      bg="#080D1A"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.06)"
      boxShadow="inset 0 1px 0 rgba(255, 255, 255, 0.05)"
    >
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'flex-start', sm: 'center' }}
        gap={2}
        mb={4}
      >
        <HStack spacing={3}>
          <Box p={2} borderRadius="lg" bg="rgba(6, 182, 212, 0.1)" color="cyan.400">
            <Cpu size={18} />
          </Box>
          <Box>
            <HStack spacing={2}>
              <Text fontSize="xs" fontWeight="700" color="white">
                Cluster 0 — MongoDB Atlas Throughput
              </Text>
              <Box w="7px" h="7px" borderRadius="full" bg="emerald.400" boxShadow="0 0 8px #10B981" />
            </HStack>
            <Text fontSize="3xs" color="gray.400">
              24-Hour continuous health telemetry & latency profile
            </Text>
          </Box>
        </HStack>

        <HStack spacing={4} fontSize="xs">
          <Box textAlign={{ base: 'left', sm: 'right' }}>
            <Text fontSize="3xs" color="gray.500">
              Avg Latency
            </Text>
            <Text fontSize="xs" fontWeight="700" color="cyan.300">
              {hoveredHour !== null ? `${HOURLY_LATENCY[hoveredHour]} ms` : '18.4 ms'}
            </Text>
          </Box>
          <Box textAlign={{ base: 'left', sm: 'right' }}>
            <Text fontSize="3xs" color="gray.500">
              Cluster Uptime
            </Text>
            <Text fontSize="xs" fontWeight="700" color="green.300">
              99.98%
            </Text>
          </Box>
        </HStack>
      </Flex>

      {/* 24-Bar Strip */}
      <Flex
        h="64px"
        align="flex-end"
        gap="3px"
        p={2}
        bg="rgba(4, 6, 11, 0.7)"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="rgba(255, 255, 255, 0.04)"
      >
        {HOURLY_LATENCY.map((lat, idx) => {
          const hPct = Math.max(14, (lat / maxLatency) * 100)
          const isHigh = lat > 35
          const isHovered = hoveredHour === idx

          return (
            <Tooltip
              key={idx}
              label={`${idx.toString().padStart(2, '0')}:00 — ${lat}ms latency`}
              placement="top"
              hasArrow
              bg="#11172A"
              fontSize="3xs"
            >
              <Box
                flex={1}
                h={`${hPct}%`}
                bg={
                  isHigh
                    ? 'linear-gradient(180deg, #C084FC 0%, #7C3AED 100%)'
                    : 'linear-gradient(180deg, #67E8F9 0%, #06B6D4 100%)'
                }
                borderRadius="t-xs"
                opacity={isHovered ? 1 : 0.8}
                boxShadow={isHovered ? '0 0 10px rgba(6, 182, 212, 0.8)' : 'none'}
                transition="all 0.15s ease"
                cursor="pointer"
                onMouseEnter={() => setHoveredHour(idx)}
                onMouseLeave={() => setHoveredHour(null)}
              />
            </Tooltip>
          )
        })}
      </Flex>

      <Flex justify="space-between" mt={2} fontSize="3xs" color="gray.500">
        <Text>00:00 (Midnight)</Text>
        <Text>12:00 (Noon)</Text>
        <Text>23:59 (Current)</Text>
      </Flex>
    </Box>
  )
}

// --- 4. MINI SPARKLINE BAR VISUALIZER FOR KPI CARDS ---

interface SparklineProps {
  values?: number[]
  colorScheme?: 'purple' | 'cyan' | 'green' | 'orange' | 'pink'
}

export function MiniBarSparkline({
  values = [30, 45, 60, 40, 75, 90, 85],
  colorScheme = 'purple',
}: SparklineProps) {
  const max = Math.max(...values) || 100

  const gradient =
    colorScheme === 'cyan'
      ? 'linear-gradient(180deg, #22D3EE 0%, #06B6D4 100%)'
      : colorScheme === 'green'
      ? 'linear-gradient(180deg, #34D399 0%, #059669 100%)'
      : colorScheme === 'orange'
      ? 'linear-gradient(180deg, #FB923C 0%, #EA580C 100%)'
      : colorScheme === 'pink'
      ? 'linear-gradient(180deg, #F472B6 0%, #DB2777 100%)'
      : 'linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)'

  return (
    <HStack spacing="3px" align="flex-end" h="24px" w="50px">
      {values.map((v, i) => {
        const hPct = Math.max(15, (v / max) * 100)
        return (
          <Box
            key={i}
            flex={1}
            h={`${hPct}%`}
            bg={gradient}
            borderRadius="t-xs"
            opacity={i === values.length - 1 ? 1 : 0.65}
            transition="height 0.3s ease"
          />
        )
      })}
    </HStack>
  )
}
