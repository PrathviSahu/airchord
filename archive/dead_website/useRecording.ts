// ── useRecording Hook ─────────────────────────────────────────────────────────
//
// Manages MediaRecorder state for performance recording.
// Separated from LivePerformanceScreen for clean orchestration.

import { useState, useRef, useCallback, useEffect } from 'react'
import { eventBus } from '../core/EventBus'
import {
  createPerformanceRecordingStream,
  disconnectMicrophoneFromRecording,
} from '../engines/AudioEngine/guitarSound'

export function useRecording(songTitle: string) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)

  const mountedRef = useRef(true)
  const recordedUrlRef = useRef<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const updateRecordedUrl = useCallback((url: string | null) => {
    setRecordedUrl(prev => {
      if (prev && prev !== url) URL.revokeObjectURL(prev)
      recordedUrlRef.current = url
      return url
    })
  }, [])

  useEffect(() => () => {
    mountedRef.current = false
    if (recordedUrlRef.current) URL.revokeObjectURL(recordedUrlRef.current)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recTimerRef.current) {
        clearInterval(recTimerRef.current)
        recTimerRef.current = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop() } catch {}
      }
      disconnectMicrophoneFromRecording()
    }
  }, [])

  const startRecording = useCallback((cameraStream: MediaStream | null, canvas: HTMLCanvasElement | null) => {
    streamRef.current = cameraStream
    canvasRef.current = canvas

    try {
      recordedChunksRef.current = []
      let recStream: MediaStream | null = createPerformanceRecordingStream(cameraStream)

      if (!recStream && canvas && typeof (canvas as any).captureStream === 'function') {
        recStream = createPerformanceRecordingStream((canvas as any).captureStream(30))
      }

      if (!recStream || recStream.getTracks().length === 0) return

      const mimeTypes = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4', '']
      let selectedMime = ''
      for (const m of mimeTypes) {
        if (!m || (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m))) {
          selectedMime = m
          break
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : undefined
      const recorder = new MediaRecorder(recStream, options)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        disconnectMicrophoneFromRecording()
        const mime = selectedMime || 'video/webm'
        const blob = new Blob(recordedChunksRef.current, { type: mime })
        const url = URL.createObjectURL(blob)

        if (!mountedRef.current) {
          URL.revokeObjectURL(url)
          return
        }

        setRecordedBlob(blob)
        updateRecordedUrl(url)
        setIsRecording(false)
        eventBus.emit('recording:complete', blob)
      }

      recorder.onerror = () => {
        disconnectMicrophoneFromRecording()
        if (recTimerRef.current) {
          clearInterval(recTimerRef.current)
          recTimerRef.current = null
        }
        setIsRecording(false)
      }

      mediaRecorderRef.current = recorder
      recorder.start(200)
      setIsRecording(true)
      setRecordingTime(0)

      recTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)

      eventBus.emit('recording:start')
    } catch {
      setIsRecording(false)
    }
  }, [updateRecordedUrl])

  const stopRecording = useCallback(() => {
    if (recTimerRef.current) {
      clearInterval(recTimerRef.current)
      recTimerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    eventBus.emit('recording:stop')
  }, [])

  const closePreview = useCallback(() => {
    updateRecordedUrl(null)
    setRecordedBlob(null)
  }, [updateRecordedUrl])

  const downloadVideo = useCallback(() => {
    if (!recordedUrl) return
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = recordedUrl
    const ext = recordedBlob?.type.includes('mp4') ? 'mp4' : 'webm'
    const safeTitle = songTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')
    a.download = `airchord_${safeTitle}_performance.${ext}`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => document.body.removeChild(a), 100)
  }, [recordedUrl, recordedBlob, songTitle])

  return {
    isRecording,
    recordingTime,
    recordedUrl,
    recordedBlob,
    startRecording,
    stopRecording,
    closePreview,
    downloadVideo,
  }
}
