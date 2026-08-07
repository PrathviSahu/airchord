// ── Recording Preview Modal ───────────────────────────────────────────────────
// Shows after recording stops — preview video + download/discard.

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface RecordingPreviewProps {
  recordedUrl: string | null
  songTitle: string
  onClose: () => void
  onDownload: () => void
}

export function RecordingPreview({ recordedUrl, songTitle, onClose, onDownload }: RecordingPreviewProps) {
  return (
    <AnimatePresence>
      {recordedUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg bg-[#0a0a0a] border rounded-[4px] p-6 space-y-5"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="studio-label-gold mb-1.5">Take complete</p>
                <h3 className="text-lg font-light text-white">{songTitle} — Performance</h3>
              </div>
              <button onClick={onClose} className="studio-icon !w-8 !h-8">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Video player */}
            <div className="relative rounded-[3px] overflow-hidden bg-black aspect-video border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <video src={recordedUrl} controls autoPlay className="w-full h-full object-cover" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={onDownload} className="studio-btn studio-btn-primary flex-1 !text-[12px]">
                <Download className="w-3.5 h-3.5" /> Download performance
              </button>
              <button onClick={onClose} className="studio-btn studio-btn-ghost !text-[12px]">
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
