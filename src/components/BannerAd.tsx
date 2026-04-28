'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string
  position: string
}

interface BannerAdProps {
  position: 'topo_artigo' | 'sidebar' | 'meio_artigo' | 'rodape_artigo'
  className?: string
}

export default function BannerAd({ position, className = '' }: BannerAdProps) {
  const [banner, setBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch(`/api/banners?position=${position}&active=true`)
        if (res.ok) {
          const { data } = await res.json()
          if (data && data.length > 0) {
            // Pegar um banner aleatório da posição
            const random = data[Math.floor(Math.random() * data.length)]
            setBanner(random)

            // Registrar impressão
            await fetch(`/api/banners/${random.id}/click`, { method: 'POST' })
              .catch(() => {}) // silencioso
          }
        }
      } catch (e) {
        // silencioso — banner é opcional
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [position])

  const handleClick = async () => {
    if (!banner) return
    try {
      await fetch(`/api/banners/${banner.id}/click`, { method: 'POST' })
    } catch (e) {}
  }

  if (loading || !banner) return null

  return (
    <div className={`banner-ad ${className}`}>
      <a
        href={banner.link_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        title={banner.title}
      >
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-auto rounded-lg shadow-sm"
          loading="lazy"
        />
      </a>
      <p className="text-xs text-neutral-400 text-center mt-1">Publicidade</p>
    </div>
  )
}
