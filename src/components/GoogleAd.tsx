'use client'

import { useEffect } from 'react'

interface GoogleAdProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
  className?: string
  style?: React.CSSProperties
}

const GoogleAd: React.FC<GoogleAdProps> = ({ 
  slot, 
  format = 'auto', 
  responsive = true,
  className = '',
  style = {}
}) => {
  useEffect(() => {
    try {
      // Verificar se o Google AdSense está disponível
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('Erro ao carregar Google Ad:', error)
    }
  }, [])

  return (
    <div className={`google-ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX" // Substitua pelo seu Publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  )
}

export default GoogleAd
