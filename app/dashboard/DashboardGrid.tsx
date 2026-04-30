"use client"

import { useState } from "react"
import Image from "next/image"
import ImageModal from "./ImageModal"

interface DashboardGridProps {
  items: any[]
}

export default function DashboardGrid({ items }: DashboardGridProps) {
  const [cards, setCards] = useState(items)
  const [selectedCard, setSelectedCard] = useState<{ id: string; imageUrl: string; caption: string } | null>(null)

  const handleTrash = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id))
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "2.5rem",
          marginTop: "2rem",
        }}
      >
        {cards.map((item: any) => (
          <div
            key={item.id}
            onClick={() => setSelectedCard({ id: item.id, imageUrl: item.image?.url, caption: item.content })}
            style={{
              backgroundColor: "#0d0d0d",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid #222",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              transition: "transform 0.2s ease, border-color 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)"
              e.currentTarget.style.borderColor = "#444"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.borderColor = "#222"
            }}
          >
            {item.image?.url && (
              <div style={{ width: "100%", aspectRatio: "1/1", position: "relative" }}>
                <Image
                  src={item.image.url}
                  alt="Humor item"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            <div style={{ padding: "1.5rem", textAlign: "center" }}>
              <p style={{ 
                margin: 0, 
                fontSize: "1.1rem", 
                fontWeight: "700", 
                color: "#fff", 
                lineHeight: "1.4",
                letterSpacing: "0.08em",
                fontFamily: "var(--font-display)"
              }}>
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ImageModal
        isOpen={!!selectedCard}
        image={selectedCard?.imageUrl}
        caption={selectedCard?.caption}
        captionId={selectedCard?.id}
        onClose={() => setSelectedCard(null)}
        onTrash={() => selectedCard && handleTrash(selectedCard.id)}
      />
    </>
  )
}
