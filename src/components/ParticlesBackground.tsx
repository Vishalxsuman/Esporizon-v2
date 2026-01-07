import { useEffect, useRef } from 'react'

const ParticlesBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []
        let mouse = { x: 0, y: 0 }

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initParticles()
        }

        class Particle {
            x: number
            y: number
            size: number
            speedX: number
            speedY: number
            color: string
            baseX: number
            baseY: number
            density: number

            constructor() {
                this.x = Math.random() * canvas!.width
                this.y = Math.random() * canvas!.height
                this.baseX = this.x
                this.baseY = this.y
                this.size = Math.random() * 2 + 0.5
                this.speedX = Math.random() * 2 - 1
                this.speedY = Math.random() * 2 - 1
                this.color = Math.random() > 0.5 ? 'rgba(0, 255, 194, ' : 'rgba(124, 58, 237, '
                this.density = (Math.random() * 30) + 1
            }

            draw() {
                if (!ctx) return
                ctx.fillStyle = this.color + (this.size / 5) + ')'
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.closePath()
                ctx.fill()
            }

            update() {
                let dx = mouse.x - this.x
                let dy = mouse.y - this.y
                let distance = Math.sqrt(dx * dx + dy * dy)
                let forceDirectionX = dx / distance
                let forceDirectionY = dy / distance
                let maxDistance = 150
                let force = (maxDistance - distance) / maxDistance
                let directionX = forceDirectionX * force * this.density
                let directionY = forceDirectionY * force * this.density

                if (distance < maxDistance) {
                    this.x -= directionX
                    this.y -= directionY
                } else {
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX
                        this.x -= dx / 10
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY
                        this.y -= dy / 10
                    }
                }
                this.draw()
            }
        }

        const initParticles = () => {
            particles = []
            // Fewer particles for performance
            const particleCount = Math.min(window.innerWidth / 10, 100)
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle())
            }
        }

        const animate = () => {
            if (!ctx) return
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            for (let i = 0; i < particles.length; i++) {
                particles[i].update()
            }
            animationFrameId = requestAnimationFrame(animate)
        }

        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x
            mouse.y = e.y
        })

        resize()
        animate()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none opacity-40"
            style={{ zIndex: 0 }}
        />
    )
}

export default ParticlesBackground
