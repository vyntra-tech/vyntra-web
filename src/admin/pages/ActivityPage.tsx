import React, { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Heading,
  Text,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Card,
  CardBody,
  useToast,
  Select,
} from '@chakra-ui/react'
import { Search, Activity, User, Clock, Shield } from 'lucide-react'
import { statsApi } from '../../services/api'
import type { ActivityLog } from '../../types'

export function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const toast = useToast()

  useEffect(() => {
    async function loadActivity() {
      try {
        const data = await statsApi.getActivity()
        setActivities(data)
      } catch (err: any) {
        toast({ title: 'Error loading audit logs', description: err.message, status: 'error' })
      } finally {
        setLoading(false)
      }
    }
    loadActivity()
  }, [])

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.actor.toLowerCase().includes(search.toLowerCase()) ||
      act.action.toLowerCase().includes(search.toLowerCase()) ||
      act.target.toLowerCase().includes(search.toLowerCase()) ||
      (act.details || '').toLowerCase().includes(search.toLowerCase())
    const matchesAction = actionFilter === 'all' || act.action.includes(actionFilter)
    return matchesSearch && matchesAction
  })

  return (
    <Box>
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4} mb={6}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Heading size="lg" fontFamily="heading" color="white">
              System Audit Trail
            </Heading>
            <Badge colorScheme="purple" borderRadius="full" px={2}>
              {activities.length} Records
            </Badge>
          </HStack>
          <Text fontSize="sm" color="gray.400">
            Immutable log recording administrative access, publication events, and content mutations
          </Text>
        </Box>
      </Flex>

      {/* Filter and Search Bar */}
      <Flex direction={{ base: 'column', sm: 'row' }} gap={3} mb={6}>
        <InputGroup maxW={{ base: 'full', sm: '380px' }}>
          <InputLeftElement pointerEvents="none">
            <Search size={16} color="gray" />
          </InputLeftElement>
          <Input
            placeholder="Search by actor, action, or target item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Select maxW={{ base: 'full', sm: '200px' }} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">All Actions</option>
          <option value="AUTH">Authentication</option>
          <option value="PROJECT">Projects</option>
          <option value="SERVICE">Services</option>
          <option value="TEAM">Team Roster</option>
          <option value="MEDIA">Media</option>
          <option value="CONTENT">CMS Content</option>
          <option value="CONTACT">Inquiries</option>
        </Select>
      </Flex>

      {/* Audit Log Timeline */}
      <Card>
        <CardBody p={6}>
          {filtered.length === 0 ? (
            <Box textAlign="center" py={12} color="gray.400">
              No audit records match the search filter.
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {filtered.map((act) => (
                <Box
                  key={act.id}
                  p={4}
                  borderRadius="lg"
                  bg="rgba(255, 255, 255, 0.02)"
                  borderWidth="1px"
                  borderColor="rgba(255, 255, 255, 0.06)"
                >
                  <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={2} mb={2}>
                    <HStack spacing={2.5}>
                      <Badge
                        colorScheme={
                          act.action.includes('AUTH')
                            ? 'cyan'
                            : act.action.includes('DELETED')
                            ? 'red'
                            : 'purple'
                        }
                        fontSize="2xs"
                        px={2}
                      >
                        {act.action}
                      </Badge>
                      <Text fontWeight="700" color="white" fontSize="sm">
                        {act.target}
                      </Text>
                    </HStack>

                    <HStack spacing={1} color="gray.500" fontSize="2xs">
                      <Clock size={12} />
                      <Text>{new Date(act.timestamp).toLocaleString()}</Text>
                    </HStack>
                  </Flex>

                  <Text fontSize="xs" color="gray.300" mb={2}>
                    {act.details || 'System operation executed successfully.'}
                  </Text>

                  <HStack spacing={1.5} color="gray.500" fontSize="2xs">
                    <User size={12} />
                    <Text>Actor: {act.actor}</Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>
    </Box>
  )
}
