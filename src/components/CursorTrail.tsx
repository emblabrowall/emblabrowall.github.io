import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

interface TrailParticle {
  id: number
  x: number
  y: number
}

export function CursorTrail() {
  const [particles, setParticles] = useState<TrailParticle[]>([])
  const [isMoving, setIsMoving] = useState(false)
  
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  
  // Remove spring animation for instant cursor response
  // const springConfig = { damping: 25, stiffness: 150 }
  // const cursorXSpring = useSpring(cursorX, springConfig)
  // const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    let particleId = 0
    let lastTime = Date.now()
    let timeoutId: NodeJS.Timeout

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      setIsMoving(true)
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setIsMoving(false), 100)

      const now = Date.now()
      // Create particles every 50ms
      if (now - lastTime > 50) {
        const newParticle: TrailParticle = {
          id: particleId++,
          x: e.clientX,
          y: e.clientY,
        }

        setParticles((prev) => [...prev.slice(-20), newParticle])
        lastTime = now
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    // Auto-remove old particles
    const interval = setInterval(() => {
      setParticles((prev) => prev.slice(-15))
    }, 100)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(interval)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <>
      {/* Custom cursor - removed due to delay, using standard cursor */}

      {/* Trail particles */}
      {particles.map((particle, index) => (
        <motion.div
          key={particle.id}
          className="fixed top-0 left-0 pointer-events-none z-[9998]"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: 1,
            opacity: 0.6,
          }}
          animate={{
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
          style={{
            translateX: '-50%',
            translateY: '-50%',
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, rgb(99, 102, 241, ${0.6 - index * 0.03}), rgb(139, 92, 246, ${0.6 - index * 0.03}))`,
            }}
          />
        </motion.div>
      ))}
    </>
  )
}
