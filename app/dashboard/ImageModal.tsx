"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import styles from "./ImageModal.module.css"
import { submitVote } from "@/app/actions/vote"

interface ImageModalProps {
  image?: string
  caption?: string
  captionId?: string | number
  isOpen: boolean
  onClose: () => void
  onTrash?: () => void
}

export default function ImageModal({ image, caption, captionId, isOpen, onClose, onTrash }: ImageModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose()
        }
      }
      
      window.addEventListener("keydown", handleEscape)
      return () => {
        document.body.style.overflow = "unset"
        window.removeEventListener("keydown", handleEscape)
      }
    }
  }, [isOpen, onClose])

  const handleTrashClick = async () => {
    if (!captionId || !onTrash) return
    
    setIsDeleting(true)
    try {
      // Optimistically trigger parent removal and close modal
      onTrash()
      onClose()
      
      // Perform server action in background
      await submitVote(captionId.toString(), -1)
    } catch (error) {
      console.error("Failed to trash caption:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Image Preview"
    >
      <div 
        className={styles.card} 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className={styles.closeBtn} 
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        {captionId && onTrash && (
          <button 
            className={styles.trashBtn} 
            onClick={handleTrashClick}
            disabled={isDeleting}
            aria-label="Trash caption"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
        
        {image && (
          <div className={styles.imageWrapper}>
            <Image
              src={image}
              alt={caption || "Humor item"}
              width={1200}
              height={1200}
              className={styles.modalImage}
              priority
            />
          </div>
        )}
        
        {caption && (
          <p className={styles.caption}>
            {caption}
          </p>
        )}
      </div>
    </div>
  )
}
