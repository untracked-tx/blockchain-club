'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

interface YouTubeEmbedProps {
  videoId: string
  title?: string
  className?: string
}

export function YouTubeEmbed({ videoId, title = "YouTube Video", className = "" }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

  return (
    <div className={`relative w-full ${className}`}>
      {!isLoaded ? (
        <div 
          className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => setIsLoaded(true)}
        >
          <img 
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
            <div className="bg-red-600 rounded-full p-4 group-hover:bg-red-700 transition-colors group-hover:scale-110 transform">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-semibold text-lg drop-shadow-lg">{title}</h3>
          </div>
        </div>
      ) : (
        <div className="w-full aspect-video rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}
