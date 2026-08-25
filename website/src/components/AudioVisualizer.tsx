import React, { useEffect, useRef } from 'react'
import { getAudioAnalyser } from '../utils/guitarSound'

interface AudioVisualizerProps {
  barCount?: number
  height?: number
  accentColor?: string
}

export default function AudioVisualizer({
  barCount = 16,
  height = 48,
  accentColor = '#06b6d4'
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dataArray = new Uint8Array(32)

    const render = () => {
      const analyser = getAudioAnalyser()
      if (analyser) {
        analyser.getByteFrequencyData(dataArray)
      } else {
        // Subtle ambient idle motion
        const time = Date.now() * 0.003
        for (let i = 0; i < 32; i++) {
          dataArray[i] = Math.floor(20 + Math.sin(time + i * 0.4) * 15)
        }
      }

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const barWidth = (w - (barCount - 1) * 3) / barCount

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * 2] || 0
        const barHeight = Math.max(4, (val / 255) * h)

        const x = i * (barWidth + 3)
        const y = h - barHeight

        // Gradient for bar
        const grad = ctx.createLinearGradient(0, y, 0, h)
        grad.addColorStop(0, accentColor)
        grad.addColorStop(1, '#8b5cf6')

        ctx.fillStyle = grad
        ctx.shadowColor = accentColor
        ctx.shadowBlur = val > 100 ? 8 : 2
        ctx.fillRect(x, y, barWidth, barHeight)
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [barCount, accentColor])

  return (
    <div className="relative flex items-center justify-center p-2 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
      <canvas
        ref={canvasRef}
        width={180}
        height={height}
        className="w-full h-full rounded"
      />
    </div>
  )
}
