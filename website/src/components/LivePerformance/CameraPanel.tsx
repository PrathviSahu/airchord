// ── Camera Panel ──────────────────────────────────────────────────────────────
// Owns: video feed, hand skeleton canvas, camera startup/error states

import React, { useRef, useEffect } from 'react'

interface CameraPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  cameraReady: boolean
  cameraError: string | null
  onEnd: () => void
}

export function CameraPanel({ videoRef, canvasRef, cameraReady, cameraError, onEnd }: CameraPanelProps) {
  return (
    <>
      {/* Full-bleed camera background */}
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
        style={{ opacity: cameraReady ? 1 : 0, transition: 'opacity 0.5s' }}
      />

      {/* AI hand skeleton canvas */}
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none"
      />

      {/* Gradient darkening overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,0.92) 100%)',
        }}
      />

      {/* Camera offline fallback */}
      {!cameraReady && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
          <div className="text-center">
            <div
              className="w-14 h-14 border rounded-full animate-spin mx-auto mb-5"
              style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'var(--gold)' }}
            />
            <p className="studio-label">Starting camera</p>
          </div>
        </div>
      )}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
          <div className="text-center max-w-xs px-6">
            <p className="text-[#F0A3A6] text-sm font-light mb-5">{cameraError}</p>
            <button onClick={onEnd} className="studio-btn studio-btn-ghost !text-[11px] mx-auto">← Go back</button>
          </div>
        </div>
      )}
    </>
  )
}
