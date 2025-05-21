import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Maximize2, Minimize2, X, Save, Folder, Trash2, Square, Circle, Minus } from "lucide-react"

export default function BffPaint() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [activeColor, setActiveColor] = useState("#ff00ff")
  const [activeTool, setActiveTool] = useState("pencil")
  const [brushSize, setBrushSize] = useState(5)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const [windowPosition, setWindowPosition] = useState({ x: 50, y: 50 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 })
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 })

  // Cyberpunk/Vaporwave color palette
  const colorPalette = [
    "#ff00ff", // Magenta
    "#00ffff", // Cyan
    "#ff00aa", // Hot Pink
    "#aa00ff", // Purple
    "#0000ff", // Blue
    "#00ff00", // Green
    "#ffff00", // Yellow
    "#ff0000", // Red
    "#ffffff", // White
    "#000000", // Black
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = windowSize.width - 10
    canvas.height = windowSize.height - 100

    // Get context
    const context = canvas.getContext("2d")
    if (!context) return

    // Set default styles
    context.lineCap = "round"
    context.lineJoin = "round"
    context.strokeStyle = activeColor
    context.lineWidth = brushSize

    // Fill with white background
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)

    contextRef.current = context
  }, [windowSize, activeColor, brushSize])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setLastPosition({ x, y })

    if (activeTool === "fill") {
      // Perform fill operation
      if (contextRef.current) {
        floodFill(canvas, contextRef.current, x, y, activeColor)
      }
      return
    }

    contextRef.current.beginPath()
    contextRef.current.moveTo(x, y)
    setIsDrawing(true)

    // For spray tool, start spraying immediately
    if (activeTool === "spray") {
      spray(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (activeTool === "pencil") {
      contextRef.current.lineTo(x, y)
      contextRef.current.stroke()
    } else if (activeTool === "eraser") {
      contextRef.current.save()
      contextRef.current.strokeStyle = "#ffffff"
      contextRef.current.lineTo(x, y)
      contextRef.current.stroke()
      contextRef.current.restore()
    } else if (activeTool === "spray") {
      spray(x, y)
    } else if (["rectangle", "circle", "line"].includes(activeTool)) {
      // For shape tools, we'll preview the shape during mouse move
      // First, save the current canvas state
      const imageData = contextRef.current.getImageData(0, 0, canvas.width, canvas.height)

      // Clear the canvas and redraw the saved state
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height)
      contextRef.current.putImageData(imageData, 0, 0)

      // Draw the shape preview
      drawShape(lastPosition.x, lastPosition.y, x, y)
    }
  }

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !canvasRef.current) return

    if (isDrawing && ["rectangle", "circle", "line"].includes(activeTool)) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = lastPosition.x
      const y = lastPosition.y

      // Get current mouse position
      let mouseX = x
      let mouseY = y
      
      if (e) {
        mouseX = e.clientX - rect.left
        mouseY = e.clientY - rect.top
      }

      // Draw the final shape
      drawShape(x, y, mouseX, mouseY)
    }

    contextRef.current.closePath()
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return
    contextRef.current.fillStyle = "#ffffff"
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const saveImage = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = "bffpaint-masterpiece.png"
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - windowPosition.x,
      y: e.clientY - windowPosition.y,
    })
  }

  const onDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setWindowPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const stopDragging = () => {
    setIsDragging(false)
  }

  const toggleMaximize = () => {
    if (isMaximized) {
      setWindowSize({ width: 800, height: 600 })
    } else {
      setWindowSize({ width: window.innerWidth - 100, height: window.innerHeight - 100 })
    }
    setIsMaximized(!isMaximized)
  }

  // Helper function for spray tool
  const spray = (x: number, y: number) => {
    if (!contextRef.current) return

    const density = brushSize * 2
    const radius = brushSize * 2

    for (let i = 0; i < density; i++) {
      const offsetX = getRandomInt(-radius, radius)
      const offsetY = getRandomInt(-radius, radius)

      // Only draw points within the circular spray area
      if (offsetX * offsetX + offsetY * offsetY <= radius * radius) {
        const sprayX = x + offsetX
        const sprayY = y + offsetY

        contextRef.current.beginPath()
        contextRef.current.moveTo(sprayX, sprayY)
        contextRef.current.lineTo(sprayX, sprayY)
        contextRef.current.stroke()
      }
    }
  }

  // Helper function for random integer
  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Helper function for drawing shapes
  const drawShape = (startX: number, startY: number, endX: number, endY: number) => {
    if (!contextRef.current) return

    contextRef.current.beginPath()

    if (activeTool === "rectangle") {
      const width = endX - startX
      const height = endY - startY
      contextRef.current.rect(startX, startY, width, height)
    } else if (activeTool === "circle") {
      const radiusX = Math.abs(endX - startX)
      const radiusY = Math.abs(endY - startY)
      const radius = Math.max(radiusX, radiusY)
      contextRef.current.arc(startX, startY, radius, 0, 2 * Math.PI)
    } else if (activeTool === "line") {
      contextRef.current.moveTo(startX, startY)
      contextRef.current.lineTo(endX, endY)
    }

    if (activeTool === "rectangle" || activeTool === "circle") {
      contextRef.current.stroke()
    } else {
      contextRef.current.stroke()
    }
  }

  // Flood fill algorithm
  const floodFill = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    fillColor: string,
  ) => {
    // Get the pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    // No need to explicitly store data as we access it through imageData.data

    // Convert fill color from hex to RGBA
    const fillColorRGB = hexToRgb(fillColor)
    if (!fillColorRGB) return

    // Get the color of the clicked pixel
    const targetColor = getPixelColor(imageData, x, y)

    // Don't fill if the target color is the same as the fill color
    if (colorsMatch(targetColor, [fillColorRGB.r, fillColorRGB.g, fillColorRGB.b, 255])) {
      return
    }

    // Stack for flood fill algorithm
    const stack: [number, number][] = [[x, y]]
    const width = canvas.width
    const height = canvas.height

    while (stack.length > 0) {
      const [curX, curY] = stack.pop()!

      // Check if the current pixel is within bounds and has the target color
      if (
        curX < 0 ||
        curX >= width ||
        curY < 0 ||
        curY >= height ||
        !colorsMatch(getPixelColor(imageData, curX, curY), targetColor)
      ) {
        continue
      }

      // Set the color of the current pixel
      setPixelColor(imageData, curX, curY, [fillColorRGB.r, fillColorRGB.g, fillColorRGB.b, 255])

      // Add neighboring pixels to the stack
      stack.push([curX + 1, curY])
      stack.push([curX - 1, curY])
      stack.push([curX, curY + 1])
      stack.push([curX, curY - 1])
    }

    // Update the canvas with the new image data
    ctx.putImageData(imageData, 0, 0)
  }

  // Helper function to get pixel color
  const getPixelColor = (imageData: ImageData, x: number, y: number): [number, number, number, number] => {
    const index = (y * imageData.width + x) * 4
    return [imageData.data[index], imageData.data[index + 1], imageData.data[index + 2], imageData.data[index + 3]]
  }

  // Helper function to set pixel color
  const setPixelColor = (imageData: ImageData, x: number, y: number, color: [number, number, number, number]) => {
    const index = (y * imageData.width + x) * 4
    imageData.data[index] = color[0]
    imageData.data[index + 1] = color[1]
    imageData.data[index + 2] = color[2]
    imageData.data[index + 3] = color[3]
  }

  // Helper function to check if two colors match
  const colorsMatch = (color1: [number, number, number, number], color2: [number, number, number, number]): boolean => {
    const threshold = 5 // Allow for small differences in color
    return (
      Math.abs(color1[0] - color2[0]) <= threshold &&
      Math.abs(color1[1] - color2[1]) <= threshold &&
      Math.abs(color1[2] - color2[2]) <= threshold &&
      Math.abs(color1[3] - color2[3]) <= threshold
    )
  }

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  return (
    <div
      className="absolute shadow-[0_0_20px_rgba(255,0,255,0.7)]"
      style={{
        left: windowPosition.x,
        top: windowPosition.y,
        width: windowSize.width,
        height: windowSize.height,
      }}
      onMouseMove={onDrag}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      {/* Window Title Bar */}
      <div
        className="h-10 bg-gradient-to-r from-[#ff00ff] to-[#00ffff] flex items-center justify-between px-2 cursor-move"
        onMouseDown={startDragging}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff00aa]"></div>
          <div className="w-3 h-3 rounded-full bg-[#00ffff]"></div>
          <div className="w-3 h-3 rounded-full bg-[#aa00ff]"></div>
          <span className="text-white font-bold ml-2 text-shadow-glow">BFFPaint.exe</span>
        </div>
        <div className="flex gap-2">
          <button
            className="w-6 h-6 flex items-center justify-center text-white hover:bg-[#aa00ff]/50 rounded"
            onClick={toggleMaximize}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button 
            type="button"
            title="Close"
            className="w-6 h-6 flex items-center justify-center text-white hover:bg-[#ff00aa]/50 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="h-8 bg-[#1a1a2e] text-[#00ffff] flex items-center px-2 text-xs border-b border-[#ff00ff]/30">
        <button className="px-2 py-1 hover:bg-[#aa00ff]/30 mr-2 flex items-center gap-1">
          <Save size={12} />
          <span onClick={saveImage}>Save</span>
        </button>
        <button className="px-2 py-1 hover:bg-[#aa00ff]/30 mr-2 flex items-center gap-1">
          <Folder size={12} />
          <span>Open</span>
        </button>
        <button className="px-2 py-1 hover:bg-[#aa00ff]/30 flex items-center gap-1" onClick={clearCanvas}>
          <Trash2 size={12} />
          <span>Clear</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex">
        <div className="w-[80px] bg-[#1a1a2e] p-2 border-r border-[#ff00ff]/30">
          {/* Tool buttons */}
          <div className="grid grid-cols-2 gap-1">
            <button
              className={`w-9 h-9 flex items-center justify-center rounded ${activeTool === "pencil" ? "bg-[#ff00ff]/50" : "hover:bg-[#aa00ff]/30"}`}
              onClick={() => setActiveTool("pencil")}
              title="Pencil"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17 3C17.2626 2.73735 17.5744 2.52901 17.9176 2.38687C18.2608 2.24473 18.6286 2.17157 19 2.17157C19.3714 2.17157 19.7392 2.24473 20.0824 2.38687C20.4256 2.52901 20.7374 2.73735 21 3C21.2626 3.26264 21.471 3.57444 21.6131 3.9176C21.7553 4.26077 21.8284 4.62856 21.8284 5C21.8284 5.37143 21.7553 5.73923 21.6131 6.08239C21.471 6.42555 21.2626 6.73735 21 7L7.5 20.5L2 22L3.5 16.5L17 3Z"
                  stroke="#00ffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded ${activeTool === "eraser" ? "bg-[#ff00ff]/50" : "hover:bg-[#aa00ff]/30"}`}
              onClick={() => setActiveTool("eraser")}
              title="Eraser"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 13L11 20L4 13L13 4L18 9V13Z"
                  stroke="#00ffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded ${activeTool === "spray" ? "bg-[#ff00ff]/50" : "hover:bg-[#aa00ff]/30"}`}
              onClick={() => setActiveTool("spray")}
              title="Spray"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="1.5" fill="#00ffff" />
                <circle cx="14" cy="9" r="1" fill="#00ffff" />
                <circle cx="9" cy="10" r="1" fill="#00ffff" />
                <circle cx="15" cy="14" r="1" fill="#00ffff" />
                <circle cx="10" cy="15" r="1" fill="#00ffff" />
                <circle cx="8" cy="13" r="0.5" fill="#00ffff" />
                <circle cx="16" cy="11" r="0.5" fill="#00ffff" />
                <circle cx="13" cy="16" r="0.5" fill="#00ffff" />
              </svg>
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded ${activeTool === "fill" ? "bg-[#ff00ff]/50" : "hover:bg-[#aa00ff]/30"}`}
              onClick={() => setActiveTool("fill")}
              title="Fill"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 11H5C5 11 9 3 12 3C15 3 19 11 19 11Z"
                  stroke="#00ffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 11C19 17 12 21 12 21C12 21 5 17 5 11"
                  stroke="#00ffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded ${activeTool === "rectangle" ? "bg-[#ff00ff]/50" : "hover:bg-[#aa00ff]/30"}`}
              onClick={() => setActiveTool("rectangle")}
              title="Rectangle"
            >
              <Square size={16} className="text-[#00ffff]" />
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded ${activeTool === "circle" ? "bg-[#ff00ff]/50" : "hover:bg-[#aa00ff]/30"}`}
              onClick={() => setActiveTool("circle")}
              title="Circle"
            >
              <Circle size={16} className="text-[#00ffff]" />
            </button>
            <button
              className={`w-9 h-9 flex items-center justify-center rounded ${activeTool === "line" ? "bg-[#ff00ff]/50" : "hover:bg-[#aa00ff]/30"}`}
              onClick={() => setActiveTool("line")}
              title="Line"
            >
              <Minus size={16} className="text-[#00ffff] rotate-45" />
            </button>
          </div>

          {/* Brush size */}
          <div className="mt-4">
            <label htmlFor="brush-size-input" className="text-[#00ffff] text-xs block mb-1">Size</label>
            <input
              id="brush-size-input"
              type="range"
              min="1"
              max="30"
              value={brushSize}
              onChange={(e) => setBrushSize(Number.parseInt(e.target.value))}
              className="w-full accent-[#ff00ff]"
              title="Brush size"
              aria-valuemin={1}
              aria-valuemax={30}
              aria-valuenow={brushSize}
            />
          </div>

          {/* Color palette */}
          <div className="mt-4">
            <label className="text-[#00ffff] text-xs block mb-1">Colors</label>
            <div className="grid grid-cols-5 gap-1">
              {colorPalette.map((color, index) => (
                <button
                  type="button"
                  key={index}
                  className={`w-6 h-6 rounded-sm color-button ${activeColor === color ? "ring-2 ring-[#00ffff]" : ""}`}
                  data-color={color}
                  title={`Select color: ${color}`}
                  onClick={() => setActiveColor(color)}
                  aria-label={`Select color: ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-[#2a2a3a] flex-1 p-1 overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="bg-white cursor-crosshair"
          />
          
          {/* Status Bar */}
          <div className="h-6 bg-[#1a1a2e] text-[#00ffff] flex items-center justify-between px-2 text-xs border-t border-[#ff00ff]/30">
            <div>Tool: {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}</div>
            <div>Size: {brushSize}px</div>
            <div>Color: {activeColor}</div>
          </div>
        </div>
      </div>
      
      {/* Custom styles for color buttons */}
      <style>{`
        .color-button[data-color="#ff00ff"] { background-color: #ff00ff; }
        .color-button[data-color="#00ffff"] { background-color: #00ffff; }
        .color-button[data-color="#ff00aa"] { background-color: #ff00aa; }
        .color-button[data-color="#aa00ff"] { background-color: #aa00ff; }
        .color-button[data-color="#0000ff"] { background-color: #0000ff; }
        .color-button[data-color="#00ff00"] { background-color: #00ff00; }
        .color-button[data-color="#ffff00"] { background-color: #ffff00; }
        .color-button[data-color="#ff0000"] { background-color: #ff0000; }
        .color-button[data-color="#ffffff"] { background-color: #ffffff; }
        .color-button[data-color="#000000"] { background-color: #000000; }
      `}</style>
    </div>
  )
}
