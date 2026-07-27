import { useRef, useEffect, useState } from 'react';

interface CameraProps {
  onFrame?: (video: HTMLVideoElement) => void;
  onFps?: (fps: number) => void;
  onReady?: () => void;
}

export function Camera({ onFrame, onFps, onReady }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fpsRef = useRef({ frames: 0, lastTime: performance.now() });
  const [lowLight, setLowLight] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animFrame: number;

    async function startCamera() {
      try {
        console.log('📷 Requesting camera...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
            // Request minimum brightness
            advanced: [{ brightness: 1.5 }] as any,
          },
          audio: false,
        });
        console.log('✅ Camera stream acquired');

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log('✅ Video playing');
          onReady?.();
          measureFps();
        }
      } catch (err: any) {
        console.error('❌ Camera error:', err);
      }
    }

    function measureFps() {
      const now = performance.now();
      fpsRef.current.frames++;

      if (now - fpsRef.current.lastTime >= 1000) {
        onFps?.(fpsRef.current.frames);
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;
      }

      if (videoRef.current && onFrame) {
        // Check brightness every 30 frames
        if (fpsRef.current.frames % 30 === 0) {
          checkBrightness(videoRef.current);
        }
        onFrame(videoRef.current);
      }

      animFrame = requestAnimationFrame(measureFps);
    }

    function checkBrightness(video: HTMLVideoElement) {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 64;
      canvas.height = 48;
      ctx.drawImage(video, 0, 0, 64, 48);

      const imageData = ctx.getImageData(0, 0, 64, 48);
      const data = imageData.data;

      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const avgBrightness = sum / (data.length / 4);

      setLowLight(avgBrightness < 40);
    }

    startCamera();

    return () => {
      cancelAnimationFrame(animFrame);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '12px',
          transform: 'scaleX(-1)', // Mirror
        }}
      />
      {/* Hidden canvas for brightness check */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {/* Low light warning */}
      {lowLight && (
        <div style={{
          position: 'absolute',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(245, 158, 11, 0.9)',
          color: '#000',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          zIndex: 150,
        }}>
          ⚠️ Low light — improve lighting for better detection
        </div>
      )}
    </div>
  );
}
