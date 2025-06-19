import { useEffect, useRef, useState } from "react"

export default function App() {
  const [PlayerX, setPlayerX] = useState<number>(0)
  const [PlayerY, setPlayerY] = useState<number>(20)
  const velocityY = useRef(0)
  const isJumping = useRef(false)
  const animationFrame = useRef<number | null>(null)
  const keysPressed = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  })
  const jumpQueued = useRef(false)

  const GRAVITY = -1
  const JUMP_FORCE = 20
  const MOVE_SPEED = 5
  const PLAYER_WIDTH = 50
  const PLAYER_HEIGHT = 120

  const [GroundLevel, setGroundLevel] = useState<number>(20)

  const playerXRef = useRef(PlayerX)
  const playerYRef = useRef(PlayerY)

  const setPlayerXWithRef = (x: number) => {
    playerXRef.current = x
    setPlayerX(x)
  }

  const setPlayerYWithRef = (y: number) => {
    playerYRef.current = y
    setPlayerY(y)
  }

  const GROUNDS = [
    { w: 1920, b: 0, l: 0, c: '', t: 'normal' },
    { w: 250, b: 100, l: 200, c: '', t: 'normal' },
    { w: 250, b: 200, l: 500, c: '', t: 'normal' }
  ]

  const findGroundUnderPlayer = (px: number, py: number): number | null => {
    const playerLeft = px
    const playerRight = px + PLAYER_WIDTH
    const playerFeet = py

    const candidates = GROUNDS.filter(g =>
      playerRight > g.l &&
      playerLeft < g.l + g.w &&
      playerFeet >= g.b - 10 && playerFeet <= g.b + 10 // tolerance
    )

    if (candidates.length === 0) return null

    return candidates.reduce((highest, g) => g.b > highest ? g.b : highest, 0)
  }

  const updatePosition = () => {
    velocityY.current += GRAVITY

    // Horizontal movement
    let newX = playerXRef.current
    if (keysPressed.current.left) newX -= MOVE_SPEED
    if (keysPressed.current.right) newX += MOVE_SPEED
    newX = Math.max(0, Math.min(window.innerWidth - PLAYER_WIDTH, newX))
    setPlayerXWithRef(newX)

    // Vertical movement
    let newY = playerYRef.current + velocityY.current
    const newGround = findGroundUnderPlayer(newX, newY)

    if (velocityY.current <= 0 && newGround !== null) {
      velocityY.current = 0
      isJumping.current = false
      setGroundLevel(newGround)
      newY = newGround
      if (jumpQueued.current) handleJump()
    }

    setPlayerYWithRef(newY)

    animationFrame.current = requestAnimationFrame(updatePosition)
  }

  const handleJump = () => {
    if (isJumping.current) return
    isJumping.current = true
    velocityY.current = JUMP_FORCE
    if (!animationFrame.current) {
      animationFrame.current = requestAnimationFrame(updatePosition)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      if (key === "w") {
        keysPressed.current.jump = true
        jumpQueued.current = true
        if (!isJumping.current) handleJump()
      }
      if (key === "a") {
        keysPressed.current.left = true
        if (!animationFrame.current) {
          animationFrame.current = requestAnimationFrame(updatePosition)
        }
      }
      if (key === "d") {
        keysPressed.current.right = true
        if (!animationFrame.current) {
          animationFrame.current = requestAnimationFrame(updatePosition)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      if (key === "w") {
        keysPressed.current.jump = false
        jumpQueued.current = false
      }
      if (key === "a") keysPressed.current.left = false
      if (key === "d") keysPressed.current.right = false

      if (
        !keysPressed.current.left &&
        !keysPressed.current.right &&
        !keysPressed.current.jump &&
        !isJumping.current
      ) {
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current)
          animationFrame.current = null
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    }
  }, [])

  return (
    <main>
      <section className="screen">
        <div
          className="player"
          style={{
            position: 'absolute',
            bottom: PlayerY,
            left: PlayerX,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            background: 'red',
          }}
        ></div>
        <aside className="border border-right"></aside>
        <aside className="border border-left"></aside>
        {GROUNDS.map((ground, i) => (
          <div
            key={i}
            className={`ground ${ground.c}`}
            style={{
              position: 'absolute',
              width: ground.w,
              height: 20,
              left: ground.l,
              bottom: ground.b,
              background: '#444',
            }}
          ></div>
        ))}
      </section>
    </main>
  )
}
