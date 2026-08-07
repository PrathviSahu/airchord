// ── Recording Preview Modal ───────────────────────────────────────────────────
// Shows after recording stops — preview video + download/discard

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-lg rounded-3xl bg-[#0c0c18] border border-white/10 p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  🎬 Performance Recorded!
                </span>
                <h3 className="text-lg font-black text-white mt-1">{songTitle} Performance</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-white/10 shadow-lg">
              <video
                src={recordedUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onDownload}
                className="flex-1 py-3.5 rounded-xl font-black text-xs text-black shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' }}
              >
                Download Performance Video 💾
              </button>
              <button
                onClick={onClose}
                className="py-3.5 px-5 rounded-xl text-xs font-mono text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
