'use client'

import { useState, useEffect } from 'react'

export type ColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange'
export type FontFamily = 'inter' | 'roboto' | 'opensans' | 'poppins'

interface ThemeConfig {
  colorScheme: ColorScheme
  fontFamily: FontFamily
  darkMode: boolean
  animations: boolean
}

interface ColorTheme {
  primary: {
    50: string
    100: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  secondary: {
    500: string
    600: string
    700: string
  }
  accent: {
    500: string
    600: string
  }
}

const colorSchemes: Record<ColorScheme, ColorTheme> = {
  default: {
    primary: {
      50: '239 246 255',
      100: '219 234 254', 
      500: '59 130 246',
      600: '37 99 235',
      700: '29 78 216',
      800: '30 64 175',
      900: '30 58 138'
    },
    secondary: {
      500: '16 185 129',
      600: '22 163 74',
      700: '21 128 61'
    },
    accent: {
      500: '16 185 129',
      600: '5 150 105'
    }
  },
  blue: {
    primary: {
      50: '239 246 255',
      100: '219 234 254',
      500: '59 130 246',
      600: '37 99 235',
      700: '29 78 216',
      800: '30 64 175',
      900: '30 58 138'
    },
    secondary: {
      500: '14 165 233',
      600: '2 132 199',
      700: '3 105 161'
    },
    accent: {
      500: '56 189 248',
      600: '14 165 233'
    }
  },
  green: {
    primary: {
      50: '240 253 244',
      100: '220 252 231',
      500: '34 197 94',
      600: '22 163 74',
      700: '21 128 61',
      800: '22 101 52',
      900: '20 83 45'
    },
    secondary: {
      500: '16 185 129',
      600: '5 150 105',
      700: '4 120 87'
    },
    accent: {
      500: '52 211 153',
      600: '16 185 129'
    }
  },
  purple: {
    primary: {
      50: '250 245 255',
      100: '243 232 255',
      500: '168 85 247',
      600: '147 51 234',
      700: '126 34 206',
      800: '107 33 168',
      900: '88 28 135'
    },
    secondary: {
      500: '139 92 246',
      600: '124 58 237',
      700: '109 40 217'
    },
    accent: {
      500: '196 181 253',
      600: '167 139 250'
    }
  },
  orange: {
    primary: {
      50: '255 247 237',
      100: '254 237 213',
      500: '249 115 22',
      600: '234 88 12',
      700: '194 65 12',
      800: '154 52 18',
      900: '124 45 18'
    },
    secondary: {
      500: '251 146 60',
      600: '249 115 22',
      700: '234 88 12'
    },
    accent: {
      500: '251 191 36',
      600: '245 158 11'
    }
  }
}

const fontFamilies: Record<FontFamily, string> = {
  inter: 'Inter, system-ui, sans-serif',
  roboto: 'Roboto, system-ui, sans-serif',
  opensans: '"Open Sans", system-ui, sans-serif',
  poppins: 'Poppins, system-ui, sans-serif'
}

const defaultTheme: ThemeConfig = {
  colorScheme: 'default',
  fontFamily: 'inter',
  darkMode: false,
  animations: true
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme)
  const [loading, setLoading] = useState(true)

  // Aplicar tema no DOM
  const applyTheme = (themeConfig: ThemeConfig) => {
    const root = document.documentElement
    const colors = colorSchemes[themeConfig.colorScheme]
    
    // Aplicar variáveis de cor CSS
    root.style.setProperty('--primary-50', colors.primary[50])
    root.style.setProperty('--primary-100', colors.primary[100])
    root.style.setProperty('--primary-500', colors.primary[500])
    root.style.setProperty('--primary-600', colors.primary[600])
    root.style.setProperty('--primary-700', colors.primary[700])
    root.style.setProperty('--primary-800', colors.primary[800])
    root.style.setProperty('--primary-900', colors.primary[900])
    
    root.style.setProperty('--secondary-500', colors.secondary[500])
    root.style.setProperty('--secondary-600', colors.secondary[600])
    root.style.setProperty('--secondary-700', colors.secondary[700])
    
    root.style.setProperty('--accent-500', colors.accent[500])
    root.style.setProperty('--accent-600', colors.accent[600])
    
    // Aplicar fonte
    root.style.setProperty('--font-family', fontFamilies[themeConfig.fontFamily])
    document.body.style.fontFamily = fontFamilies[themeConfig.fontFamily]
    
    // Aplicar modo escuro (se necessário)
    if (themeConfig.darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    // Aplicar/remover animações
    if (!themeConfig.animations) {
      root.style.setProperty('--animation-duration', '0s')
      root.classList.add('no-animations')
    } else {
      root.style.removeProperty('--animation-duration')
      root.classList.remove('no-animations')
    }
  }

  // Carregar tema salvo
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('site-theme')
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme)
        setTheme(parsedTheme)
        applyTheme(parsedTheme)
      } else {
        applyTheme(defaultTheme)
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error)
      applyTheme(defaultTheme)
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar tema
  const updateTheme = (updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates }
    setTheme(newTheme)
    applyTheme(newTheme)
    
    // Salvar no localStorage
    try {
      localStorage.setItem('site-theme', JSON.stringify(newTheme))
    } catch (error) {
      console.error('Erro ao salvar tema:', error)
    }
  }

  // Resetar para tema padrão
  const resetTheme = () => {
    setTheme(defaultTheme)
    applyTheme(defaultTheme)
    
    try {
      localStorage.removeItem('site-theme')
    } catch (error) {
      console.error('Erro ao resetar tema:', error)
    }
  }

  // Obter cores do esquema atual
  const getCurrentColors = () => colorSchemes[theme.colorScheme]

  // Obter fonte atual
  const getCurrentFont = () => fontFamilies[theme.fontFamily]

  return {
    theme,
    loading,
    updateTheme,
    resetTheme,
    getCurrentColors,
    getCurrentFont,
    colorSchemes,
    fontFamilies
  }
}
