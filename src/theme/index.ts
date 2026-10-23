import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#7C3AED', // Primary VYNTRA Purple
    600: '#6D28D9',
    700: '#5B21B6',
    800: '#4C1D95',
    900: '#2E1065',
  },
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4', // Accent VYNTRA Cyan
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
  navy: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#334155',
    700: '#1E293B',
    800: '#0F172A',
    850: '#0F1626',
    900: '#080C16', // Dark Navy VYNTRA Secondary
    950: '#04060B', // Ultra-Dark Obsidian Background
  },
  cardBg: '#090D1A',
  cardBgHover: '#0E1424',
  cardBorder: 'rgba(255, 255, 255, 0.07)',
}

const fonts = {
  heading: `'Space Grotesk', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
}

const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === 'dark' ? '#04060B' : '#F8FAFC',
      color: props.colorMode === 'dark' ? '#F8FAFC' : '#0B1020',
      minHeight: '100vh',
    },
    '*::placeholder': {
      color: 'gray.500',
    },
    '*, *::before, &::after': {
      borderColor: 'rgba(255, 255, 255, 0.07)',
    },
  }),
}

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'lg',
      transition: 'all 0.2s ease-in-out',
      _focusVisible: {
        boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.4)',
      },
    },
    variants: {
      solid: (props: any) => {
        if (props.colorScheme === 'brand' || props.colorScheme === 'purple') {
          return {
            bg: 'brand.500',
            color: 'white',
            _hover: {
              bg: 'brand.600',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
            },
            _active: {
              bg: 'brand.700',
              transform: 'translateY(0)',
            },
          }
        }
        if (props.colorScheme === 'cyan') {
          return {
            bg: 'cyan.500',
            color: '#0B1020',
            fontWeight: '700',
            _hover: {
              bg: 'cyan.400',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
            },
          }
        }
        return {}
      },
      gradient: {
        bgGradient: 'linear(to-r, brand.500, cyan.500)',
        color: 'white',
        _hover: {
          bgGradient: 'linear(to-r, brand.600, cyan.400)',
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
        },
      },
      outline: {
        borderColor: 'rgba(255, 255, 255, 0.15)',
        color: 'white',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'cyan.400',
        },
      },
      ghost: {
        color: 'gray.300',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.06)',
          color: 'white',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: '#0D1322',
        borderRadius: 'xl',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        bg: '#0D1322',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 'xl',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
      },
      overlay: {
        backdropFilter: 'blur(8px)',
        bg: 'rgba(0, 0, 0, 0.75)',
      },
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: '#0E1326',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'lg',
          color: 'white',
          _hover: {
            bg: '#121933',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          _focusVisible: {
            bg: '#121933',
            borderColor: 'brand.400',
            boxShadow: '0 0 0 1px #7C3AED',
          },
        },
      },
      outline: {
        field: {
          bg: '#0E1326',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: 'lg',
          color: 'white',
          _hover: {
            borderColor: 'rgba(255, 255, 255, 0.25)',
          },
          _focusVisible: {
            borderColor: 'brand.400',
            boxShadow: '0 0 0 1px #7C3AED',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Textarea: {
    variants: {
      filled: {
        bg: '#0E1326',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 'lg',
        color: 'white',
        _hover: {
          bg: '#121933',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        _focusVisible: {
          bg: '#121933',
          borderColor: 'brand.400',
          boxShadow: '0 0 0 1px #7C3AED',
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Select: {
    variants: {
      filled: {
        field: {
          bg: '#0E1326',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 'lg',
          color: 'white',
          _hover: {
            bg: '#121933',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          color: 'gray.400',
          textTransform: 'uppercase',
          fontSize: 'xs',
          letterSpacing: 'wider',
        },
        td: {
          borderColor: 'rgba(255, 255, 255, 0.06)',
          color: 'gray.200',
        },
      },
    },
  },
  Menu: {
    baseStyle: {
      list: {
        bg: '#11172A',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 'lg',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        p: 2,
      },
      item: {
        bg: 'transparent',
        borderRadius: 'md',
        color: 'gray.300',
        _hover: {
          bg: 'rgba(255, 255, 255, 0.08)',
          color: 'white',
        },
        _focus: {
          bg: 'rgba(255, 255, 255, 0.08)',
          color: 'white',
        },
      },
    },
  },
}

export const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  components,
})

export default theme
