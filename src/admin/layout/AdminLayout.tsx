import React, { useState, useEffect } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Sparkles,
  Users,
  MessageSquareQuote,
  Image as ImageIcon,
  FileEdit,
  Inbox,
  Activity,
  Settings,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  Shield,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { contactApi } from '../../services/api'

interface NavItem {
  label: string
  href: string
  icon: any
  badge?: number | string
  adminOnly?: boolean
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [unreadCount, setUnreadCount] = useState<number>(0)

  // Fetch unread count for messages badge
  useEffect(() => {
    async function fetchUnread() {
      try {
        const msgs = await contactApi.getAllAdmin()
        const unread = msgs.filter((m) => m.status === 'unread').length
        setUnreadCount(unread)
      } catch {}
    }
    fetchUnread()
    const timer = setInterval(fetchUnread, 30000)
    return () => clearInterval(timer)
  }, [location.pathname])

  const navItems: NavItem[] = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Projects', href: '/admin/projects', icon: Briefcase },
    { label: 'Services', href: '/admin/services', icon: Layers },
    { label: 'Products', href: '/admin/products', icon: Sparkles },
    { label: 'Team', href: '/admin/team', icon: Users },
    { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
    { label: 'Media Library', href: '/admin/gallery', icon: ImageIcon },
    { label: 'Website CMS', href: '/admin/content', icon: FileEdit },
    { label: 'Enquiries Inbox', href: '/admin/messages', icon: Inbox, badge: unreadCount || undefined },
    { label: 'Audit Log', href: '/admin/activity', icon: Activity },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    toast({
      title: 'Logged Out',
      description: 'You have been securely signed out of the admin console.',
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    })
    navigate('/admin/login')
  }

  // Quick role switcher demo helper to test RBAC
  const toggleRole = () => {
    if (!user) return
    const newRole = user.role === 'admin' ? 'editor' : 'admin'
    const updated = { ...user, role: newRole as 'admin' | 'editor' }
    localStorage.setItem('vyntra_admin_user', JSON.stringify(updated))
    window.location.reload()
  }

  const renderNavLinks = (isMobile = false) => (
    <VStack spacing={1} align="stretch" w="full" px={isMobile ? 0 : 3} py={2}>
      {navItems.map((item) => {
        const active = location.pathname === item.href || (item.href === '/admin/dashboard' && location.pathname === '/admin')
        const content = (
          <HStack
            as={RouterLink}
            to={item.href}
            onClick={isMobile ? onClose : undefined}
            py={2.5}
            px={collapsed && !isMobile ? 2.5 : 3.5}
            justify={collapsed && !isMobile ? 'center' : 'space-between'}
            borderRadius="lg"
            bg={active ? 'rgba(124, 58, 237, 0.16)' : 'transparent'}
            color={active ? 'brand.400' : 'gray.400'}
            borderLeftWidth={active ? '3px' : '0px'}
            borderColor="brand.400"
            _hover={{
              bg: active ? 'rgba(124, 58, 237, 0.22)' : 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              transform: 'translateX(2px)',
            }}
            transition="all 0.15s ease"
            cursor="pointer"
          >
            <HStack spacing={3}>
              <item.icon size={19} color={active ? '#A78BFA' : 'currentColor'} />
              {(!collapsed || isMobile) && (
                <Text fontSize="sm" fontWeight={active ? '600' : '500'}>
                  {item.label}
                </Text>
              )}
            </HStack>
            {(!collapsed || isMobile) && item.badge && (
              <Badge colorScheme="cyan" borderRadius="full" px={2} fontSize="xs">
                {item.badge}
              </Badge>
            )}
          </HStack>
        )

        return collapsed && !isMobile ? (
          <Tooltip key={item.href} label={item.label} placement="right" hasArrow bg="#11172A" color="white">
            <Box>{content}</Box>
          </Tooltip>
        ) : (
          <Box key={item.href}>{content}</Box>
        )
      })}
    </VStack>
  )

  return (
    <Flex minH="100vh" bg="#04060B" color="white" position="relative">
      {/* DESKTOP SIDEBAR */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        flexDirection="column"
        w={collapsed ? '76px' : '260px'}
        bg="#080D1A"
        borderRightWidth="1px"
        borderColor="rgba(255, 255, 255, 0.07)"
        transition="width 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        position="sticky"
        top={0}
        h="100vh"
        zIndex={40}
      >
        {/* Brand Header */}
        <Flex
          h="68px"
          align="center"
          justify={collapsed ? 'center' : 'space-between'}
          px={collapsed ? 2 : 5}
          borderBottomWidth="1px"
          borderColor="rgba(255, 255, 255, 0.08)"
        >
          <HStack as={RouterLink} to="/admin/dashboard" spacing={3}>
            <Box
              w="34px"
              h="34px"
              borderRadius="lg"
              bgGradient="linear(to-br, brand.500, cyan.500)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 12px rgba(124, 58, 237, 0.35)"
            >
              <svg width="20" height="20" viewBox="0 0 32 32">
                <path d="M16 2 29 9.5v13L16 30 3 22.5v-13z" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                <path d="M12 12l4 9 4-9" fill="none" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Box>
            {!collapsed && (
              <Box>
                <Text fontFamily="heading" fontWeight="700" fontSize="md" letterSpacing="tight" lineHeight="shorter">
                  VYNTRA
                </Text>
                <Text fontSize="2xs" color="cyan.400" fontWeight="600" letterSpacing="wider">
                  ADMIN CONSOLE
                </Text>
              </Box>
            )}
          </HStack>

          {!collapsed && (
            <IconButton
              aria-label="Collapse sidebar"
              icon={<ChevronLeft size={16} />}
              size="xs"
              variant="ghost"
              onClick={() => setCollapsed(true)}
            />
          )}
        </Flex>

        {/* Scrollable Nav Area */}
        <Box flex={1} overflowY="auto" py={3}>
          {renderNavLinks()}
        </Box>

        {/* Expand button if collapsed */}
        {collapsed && (
          <Flex justify="center" p={2} borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            <IconButton
              aria-label="Expand sidebar"
              icon={<ChevronRight size={16} />}
              size="xs"
              variant="ghost"
              onClick={() => setCollapsed(false)}
            />
          </Flex>
        )}

        {/* User Footer Card */}
        <Box p={collapsed ? 2 : 3} borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
          <Flex
            align="center"
            justify={collapsed ? 'center' : 'space-between'}
            p={collapsed ? 1 : 2}
            borderRadius="lg"
            bg="rgba(255, 255, 255, 0.03)"
          >
            <HStack spacing={2.5}>
              <Avatar
                size="sm"
                name={user?.name || 'Admin'}
                src={user?.avatar}
                bg="brand.600"
                borderWidth="1.5px"
                borderColor="brand.400"
              />
              {!collapsed && (
                <Box overflow="hidden" maxW="120px">
                  <Text fontSize="xs" fontWeight="600" isTruncated color="white">
                    {user?.name || 'Administrator'}
                  </Text>
                  <HStack spacing={1}>
                    <Badge colorScheme={isAdmin ? 'purple' : 'cyan'} fontSize="3xs" textTransform="uppercase">
                      {user?.role || 'admin'}
                    </Badge>
                  </HStack>
                </Box>
              )}
            </HStack>

            {!collapsed && (
              <IconButton
                aria-label="Logout"
                icon={<LogOut size={15} />}
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'red.400', bg: 'rgba(239, 68, 68, 0.1)' }}
                onClick={handleLogout}
              />
            )}
          </Flex>
        </Box>
      </Box>

      {/* MOBILE DRAWER */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay backdropFilter="blur(6px)" />
        <DrawerContent bg="#080D1A" maxW="280px" borderRightWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
          <DrawerCloseButton color="gray.400" top={4} />
          <Box p={5} borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.08)">
            <HStack spacing={3}>
              <Box
                w="32px"
                h="32px"
                borderRadius="lg"
                bgGradient="linear(to-br, brand.500, cyan.500)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <svg width="18" height="18" viewBox="0 0 32 32">
                  <path d="M16 2 29 9.5v13L16 30 3 22.5v-13z" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                  <path d="M12 12l4 9 4-9" fill="none" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Box>
              <Box>
                <Text fontFamily="heading" fontWeight="700" fontSize="md">
                  VYNTRA
                </Text>
                <Text fontSize="2xs" color="cyan.400" fontWeight="600">
                  ADMIN CONSOLE
                </Text>
              </Box>
            </HStack>
          </Box>
          <DrawerBody p={3}>{renderNavLinks(true)}</DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* MAIN CONTENT AREA */}
      <Flex flex={1} flexDirection="column" minW={0} overflowX="hidden">
        {/* TOP NAVBAR */}
        <Flex
          as="header"
          h="68px"
          align="center"
          justify="space-between"
          px={{ base: 4, md: 8 }}
          bg="rgba(10, 14, 26, 0.88)"
          backdropFilter="blur(16px)"
          borderBottomWidth="1px"
          borderColor="rgba(255, 255, 255, 0.07)"
          position="sticky"
          top={0}
          zIndex={30}
        >
          {/* Left: Mobile hamburger & breadcrumbs */}
          <HStack spacing={3}>
            <IconButton
              display={{ base: 'flex', lg: 'none' }}
              aria-label="Open navigation menu"
              icon={<MenuIcon size={20} />}
              size="sm"
              variant="outline"
              onClick={onOpen}
            />

            <HStack spacing={2} color="gray.400" fontSize="sm">
              <Text as={RouterLink} to="/admin/dashboard" _hover={{ color: 'white' }}>
                Admin
              </Text>
              <Text>/</Text>
              <Text color="brand.400" fontWeight="600" textTransform="capitalize">
                {location.pathname.replace('/admin/', '').replace('/admin', 'Dashboard') || 'Dashboard'}
              </Text>
            </HStack>
          </HStack>

          {/* Right: Quick actions & profile menu */}
          <HStack spacing={{ base: 2, md: 4 }}>
            {/* View live website */}
            <Button
              as="a"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              variant="outline"
              leftIcon={<ExternalLink size={14} />}
              fontSize="xs"
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              Live Site
            </Button>

            {/* Quick RBAC Role Switcher */}
            <Tooltip label={`Switch role to test ${isAdmin ? 'Editor' : 'Admin'} permissions`} hasArrow>
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleRole}
                leftIcon={<Shield size={14} />}
                fontSize="xs"
                colorScheme={isAdmin ? 'purple' : 'cyan'}
              >
                Role: <Badge ml={1} colorScheme={isAdmin ? 'purple' : 'cyan'}>{user?.role || 'admin'}</Badge>
              </Button>
            </Tooltip>

            {/* User Profile Menu */}
            <Menu>
              <MenuButton as={Button} variant="ghost" p={1} borderRadius="full">
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={user?.name || 'Admin'}
                    src={user?.avatar}
                    bg="brand.600"
                    borderWidth="1.5px"
                    borderColor="cyan.400"
                  />
                  <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                    <Text fontSize="xs" fontWeight="600" color="white" lineHeight="shorter">
                      {user?.name || 'Administrator'}
                    </Text>
                    <Text fontSize="2xs" color="gray.400">
                      {user?.email || 'admin@vyntra.tech'}
                    </Text>
                  </Box>
                </HStack>
              </MenuButton>

              <MenuList bg="#11172A" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="xl">
                <Box px={3} py={2}>
                  <Text fontSize="xs" fontWeight="700" color="white">
                    {user?.name}
                  </Text>
                  <Text fontSize="2xs" color="gray.400">
                    {user?.email}
                  </Text>
                  <Badge mt={1} colorScheme={isAdmin ? 'purple' : 'cyan'} fontSize="3xs">
                    {user?.role?.toUpperCase()}
                  </Badge>
                </Box>
                <MenuDivider borderColor="rgba(255, 255, 255, 0.08)" />
                <MenuItem as={RouterLink} to="/admin/settings" icon={<Settings size={15} />}>
                  Admin Settings
                </MenuItem>
                <MenuItem as={RouterLink} to="/admin/activity" icon={<Activity size={15} />}>
                  Audit Trail
                </MenuItem>
                <MenuItem onClick={toggleRole} icon={<UserCheck size={15} />}>
                  Switch to {isAdmin ? 'Editor' : 'Admin'}
                </MenuItem>
                <MenuDivider borderColor="rgba(255, 255, 255, 0.08)" />
                <MenuItem onClick={handleLogout} icon={<LogOut size={15} />} color="red.400" _hover={{ bg: 'rgba(239, 68, 68, 0.1)' }}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* PAGE CONTENT CONTAINER */}
        <Box as="main" flex={1} p={{ base: 4, md: 8 }} maxW="1600px" w="full" mx="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  )
}
