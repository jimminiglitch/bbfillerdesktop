"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import {
  Maximize2,
  Minimize2,
  X,
  Save,
  Folder,
  Play,
  Pause,
  Square,
  Mic,
  FastForward,
  Rewind,
  Scissors,
  BarChart2,
  Download,
  AudioWaveformIcon as Waveform,
  Sliders,
  BookmarkIcon,
  PlusCircle,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import WaveformVisualizer from "@/components/waveform-visualizer"
import SpectrumVisualizer from "@/components/spectrum-visualizer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

// Define preset type
interface AudioPreset {
  id: string
  name: string
  effects: {
    reverb: boolean
    delay: boolean
    distortion: boolean
    lowpass: boolean
    bitcrusher: boolean
    lofi: boolean
  }
  params: {
    reverbDecay: number
    delayTime: number
    delayFeedback: number
    distortionAmount: number
    lowpassFreq: number
    bitcrusherBits: number
    lofiSampleRate: number
  }
}

// Default presets
const DEFAULT_PRESETS: AudioPreset[] = [
  {
    id: "preset-1",
    name: "VAPORWAVE",
    effects: {
      reverb: true,
      delay: false,
      distortion: false,
      lowpass: true,
      bitcrusher: false,
      lofi: true,
    },
    params: {
      reverbDecay: 3.0,
      delayTime: 0.5,
      delayFeedback: 0.4,
      distortionAmount: 20,
      lowpassFreq: 2000,
      bitcrusherBits: 4,
      lofiSampleRate: 0.5,
    },
  },
  {
    id: "preset-2",
    name: "CYBERPUNK",
    effects: {
      reverb: false,
      delay: true,
      distortion: true,
      lowpass: false,
      bitcrusher: true,
      lofi: false,
    },
    params: {
      reverbDecay: 2.0,
      delayTime: 0.3,
      delayFeedback: 0.6,
      distortionAmount: 50,
      lowpassFreq: 1000,
      bitcrusherBits: 3,
      lofiSampleRate: 0.5,
    },
  },
  {
    id: "preset-3",
    name: "RETRO",
    effects: {
      reverb: false,
      delay: false,
      distortion: false,
      lowpass: true,
      bitcrusher: true,
      lofi: true,
    },
    params: {
      reverbDecay: 2.0,
      delayTime: 0.5,
      delayFeedback: 0.4,
      distortionAmount: 20,
      lowpassFreq: 3000,
      bitcrusherBits: 6,
      lofiSampleRate: 0.7,
    },
  },
  {
    id: "preset-4",
    name: "ECHO",
    effects: {
      reverb: true,
      delay: true,
      distortion: false,
      lowpass: false,
      bitcrusher: false,
      lofi: false,
    },
    params: {
      reverbDecay: 4.0,
      delayTime: 0.8,
      delayFeedback: 0.7,
      distortionAmount: 20,
      lowpassFreq: 1000,
      bitcrusherBits: 4,
      lofiSampleRate: 0.5,
    },
  },
]

export default function BffRecorder() {
  const [isMaximized, setIsMaximized] = useState(false)
  const [windowPosition, setWindowPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [windowSize, setWindowSize] = useState({ width: 500, height: 380 })
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [audioData, setAudioData] = useState<Float32Array | null>(null)
  const [visualizationMode, setVisualizationMode] = useState<"waveform" | "spectrum">("waveform")
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [isTrimming, setIsTrimming] = useState(false)
  const [exportFormat, setExportFormat] = useState<"wav" | "mp3" | "ogg">("wav")
  const [activeEffects, setActiveEffects] = useState<{
    reverb: boolean
    delay: boolean
    distortion: boolean
    lowpass: boolean
    bitcrusher: boolean
    lofi: boolean
  }>({
    reverb: false,
    delay: false,
    distortion: false,
    lowpass: false,
    bitcrusher: false,
    lofi: false,
  })
  const [effectParams, setEffectParams] = useState({
    reverbDecay: 2.0,
    delayTime: 0.5,
    delayFeedback: 0.4,
    distortionAmount: 20,
    lowpassFreq: 1000,
    bitcrusherBits: 4,
    lofiSampleRate: 0.5,
  })
  const [presets, setPresets] = useState<AudioPreset[]>(DEFAULT_PRESETS)
  const [newPresetName, setNewPresetName] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const effectNodesRef = useRef<{
    reverbNode?: ConvolverNode
    delayNode?: DelayNode
    distortionNode?: WaveShaperNode
    lowpassNode?: BiquadFilterNode
    bitcrusherNode?: ScriptProcessorNode | AudioWorkletNode
    lofiNode?: ScriptProcessorNode | AudioWorkletNode
  }>({})

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    analyserRef.current = audioContextRef.current.createAnalyser()
    analyserRef.current.fftSize = 2048

    // Create impulse response for reverb
    createReverbImpulseResponse()

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Create reverb impulse response
  const createReverbImpulseResponse = async () => {
    if (!audioContextRef.current) return

    const sampleRate = audioContextRef.current.sampleRate
    const length = sampleRate * effectParams.reverbDecay
    const impulse = audioContextRef.current.createBuffer(2, length, sampleRate)
    const leftChannel = impulse.getChannelData(0)
    const rightChannel = impulse.getChannelData(1)

    for (let i = 0; i < length; i++) {
      const n = i / sampleRate
      // Decay exponentially
      const decay = Math.exp(-n / effectParams.reverbDecay)
      // Random noise
      leftChannel[i] = (Math.random() * 2 - 1) * decay
      rightChannel[i] = (Math.random() * 2 - 1) * decay
    }

    effectNodesRef.current.reverbNode = audioContextRef.current.createConvolver()
    effectNodesRef.current.reverbNode.buffer = impulse
  }

  // Create distortion curve for distortion effect
  const createDistortionCurve = (amount: number) => {
    const samples = 44100
    const curve = new Float32Array(samples)
    const deg = Math.PI / 180

    for (let i = 0; i < samples; ++i) {
      const x = (i * 2) / samples - 1
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x))
    }
    return curve
  }

  // Handle audio element creation when blob changes
  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      // Create audio element
      const audioEl = new Audio(url)
      audioElementRef.current = audioEl

      // Get duration when metadata is loaded
      audioEl.addEventListener("loadedmetadata", () => {
        setTotalDuration(audioEl.duration)
        setTrimEnd(audioEl.duration)
      })

      // Connect to analyzer for visualization
      if (audioContextRef.current && analyserRef.current) {
        if (sourceNodeRef.current) {
          sourceNodeRef.current.disconnect()
        }
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioEl)

        // Create audio processing chain
        setupAudioProcessingChain()
      }

      // Process audio for waveform visualization
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target?.result && audioContextRef.current) {
          const arrayBuffer = e.target.result as ArrayBuffer
          try {
            const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
            setAudioBuffer(decodedBuffer)

            // Get audio data for visualization
            const channelData = decodedBuffer.getChannelData(0)
            setAudioData(channelData)
          } catch (err) {
            console.error("Error decoding audio data", err)
          }
        }
      }
      reader.readAsArrayBuffer(audioBlob)

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [audioBlob])

  // Setup audio processing chain
  const setupAudioProcessingChain = () => {
    if (!audioContextRef.current || !analyserRef.current || !sourceNodeRef.current) return

    // Disconnect any existing connections
    sourceNodeRef.current.disconnect()

    // Create effect nodes if they don't exist
    if (!effectNodesRef.current.delayNode) {
      effectNodesRef.current.delayNode = audioContextRef.current.createDelay(5.0)
    }

    if (!effectNodesRef.current.distortionNode) {
      effectNodesRef.current.distortionNode = audioContextRef.current.createWaveShaper()
    }

    if (!effectNodesRef.current.lowpassNode) {
      effectNodesRef.current.lowpassNode = audioContextRef.current.createBiquadFilter()
      effectNodesRef.current.lowpassNode.type = "lowpass"
    }

    // Update effect parameters
    if (effectNodesRef.current.delayNode) {
      effectNodesRef.current.delayNode.delayTime.value = effectParams.delayTime
    }

    if (effectNodesRef.current.distortionNode) {
      effectNodesRef.current.distortionNode.curve = createDistortionCurve(effectParams.distortionAmount)
      effectNodesRef.current.distortionNode.oversample = "4x"
    }

    if (effectNodesRef.current.lowpassNode) {
      effectNodesRef.current.lowpassNode.frequency.value = effectParams.lowpassFreq
    }

    // Create the audio processing chain based on active effects
    let lastNode: AudioNode = sourceNodeRef.current

    // Apply effects in chain if they are active
    if (activeEffects.reverb && effectNodesRef.current.reverbNode) {
      lastNode.connect(effectNodesRef.current.reverbNode)
      lastNode = effectNodesRef.current.reverbNode
    }

    if (activeEffects.delay && effectNodesRef.current.delayNode) {
      lastNode.connect(effectNodesRef.current.delayNode)
      lastNode = effectNodesRef.current.delayNode
    }

    if (activeEffects.distortion && effectNodesRef.current.distortionNode) {
      lastNode.connect(effectNodesRef.current.distortionNode)
      lastNode = effectNodesRef.current.distortionNode
    }

    if (activeEffects.lowpass && effectNodesRef.current.lowpassNode) {
      lastNode.connect(effectNodesRef.current.lowpassNode)
      lastNode = effectNodesRef.current.lowpassNode
    }

    // Connect to analyzer and destination
    lastNode.connect(analyserRef.current)
    analyserRef.current.connect(audioContextRef.current.destination)
  }

  // Update audio processing chain when effects change
  useEffect(() => {
    setupAudioProcessingChain()
  }, [activeEffects, effectParams])

  // Update playback time during playback
  useEffect(() => {
    if (isPlaying && audioElementRef.current) {
      const updatePlaybackTime = () => {
        if (audioElementRef.current) {
          setPlaybackTime(audioElementRef.current.currentTime)

          // Stop playback if we reach the trim end point
          if (isTrimming && audioElementRef.current.currentTime >= trimEnd) {
            audioElementRef.current.pause()
            audioElementRef.current.currentTime = trimStart
            setIsPlaying(false)
          }

          animationFrameRef.current = requestAnimationFrame(updatePlaybackTime)
        }
      }
      animationFrameRef.current = requestAnimationFrame(updatePlaybackTime)

      // Handle playback ended
      const handleEnded = () => {
        setIsPlaying(false)
        setPlaybackTime(trimStart)
        if (audioElementRef.current) {
          audioElementRef.current.currentTime = trimStart
        }
      }
      audioElementRef.current.addEventListener("ended", handleEnded)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (audioElementRef.current) {
          audioElementRef.current.removeEventListener("ended", handleEnded)
        }
      }
    }
  }, [isPlaying, isTrimming, trimStart, trimEnd])

  // Apply playback rate changes
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // Apply volume changes
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = volume
    }
  }, [volume])

  // Apply trim settings when changed
  useEffect(() => {
    if (audioElementRef.current && isTrimming) {
      audioElementRef.current.currentTime = trimStart
      setPlaybackTime(trimStart)
    }
  }, [trimStart, isTrimming])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        setRecordingTime(0)
        setTrimStart(0)
        setTrimEnd(0) // Will be updated when audio metadata loads
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)

      // Update recording time
      let seconds = 0
      recordingIntervalRef.current = setInterval(() => {
        seconds++
        setRecordingTime(seconds)
      }, 1000)
    } catch (err) {
      console.error("Error accessing microphone", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop all tracks on the stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      // Clear recording interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const togglePlayback = () => {
    if (!audioElementRef.current || !audioUrl) return

    if (isPlaying) {
      audioElementRef.current.pause()
    } else {
      // If trimming is active, ensure we start from the trim start point
      if (isTrimming && audioElementRef.current.currentTime < trimStart) {
        audioElementRef.current.currentTime = trimStart
      }
      audioElementRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const saveRecording = async () => {
    if (!audioBlob || !audioBuffer || !audioContextRef.current) return

    try {
      let processedBlob: Blob

      // If trimming is active, create a new trimmed audio buffer
      if (isTrimming && (trimStart > 0 || trimEnd < totalDuration)) {
        const startSample = Math.floor(trimStart * audioBuffer.sampleRate)
        const endSample = Math.floor(trimEnd * audioBuffer.sampleRate)
        const trimmedLength = endSample - startSample

        const trimmedBuffer = audioContextRef.current.createBuffer(
          audioBuffer.numberOfChannels,
          trimmedLength,
          audioBuffer.sampleRate,
        )

        // Copy the trimmed portion of each channel
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          const originalData = audioBuffer.getChannelData(channel)
          const trimmedData = trimmedBuffer.getChannelData(channel)

          for (let i = 0; i < trimmedLength; i++) {
            trimmedData[i] = originalData[startSample + i]
          }
        }

        // Convert the trimmed buffer to a blob
        processedBlob = await audioBufferToBlob(trimmedBuffer, exportFormat)
      } else {
        // If no trimming, just convert the current audio blob to the desired format
        if (exportFormat === "wav") {
          processedBlob = audioBlob
        } else {
          processedBlob = await convertFormat(audioBlob, exportFormat)
        }
      }

      // Create download link
      const link = document.createElement("a")
      link.href = URL.createObjectURL(processedBlob)
      link.download = `bffrecorder-audio.${exportFormat}`
      link.click()

      // Clean up
      URL.revokeObjectURL(link.href)
    } catch (err) {
      console.error("Error saving audio:", err)
    }
  }

  // Convert audio buffer to blob with specified format
  const audioBufferToBlob = (buffer: AudioBuffer, format: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!audioContextRef.current) {
        reject(new Error("Audio context not available"))
        return
      }

      // Create an offline audio context for rendering
      const offlineContext = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate)

      // Create a buffer source
      const source = offlineContext.createBufferSource()
      source.buffer = buffer

      // Connect the source to the offline context destination
      source.connect(offlineContext.destination)
      source.start(0)

      // Render the audio
      offlineContext
        .startRendering()
        .then((renderedBuffer) => {
          // Convert the rendered buffer to the desired format
          const mimeType = format === "mp3" ? "audio/mpeg" : `audio/${format}`

          // Use MediaRecorder to encode to the desired format
          const stream = new MediaStream()
          const dest = audioContextRef.current!.createMediaStreamDestination()
          const bufferSource = audioContextRef.current!.createBufferSource()
          bufferSource.buffer = renderedBuffer
          bufferSource.connect(dest)
          bufferSource.start(0)

          const recorder = new MediaRecorder(dest.stream, { mimeType })
          const chunks: Blob[] = []

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data)
            }
          }

          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType })
            resolve(blob)
          }

          recorder.start()
          setTimeout(() => recorder.stop(), renderedBuffer.duration * 1000 + 100)
        })
        .catch(reject)
    })
  }

  // Convert blob from one format to another
  const convertFormat = async (blob: Blob, format: string): Promise<Blob> => {
    // Read the blob as an array buffer
    const arrayBuffer = await blob.arrayBuffer()

    // Decode the audio data
    const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer)

    // Convert to the desired format
    return audioBufferToBlob(audioBuffer, format)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number.parseFloat(e.target.value)
    setPlaybackTime(seekTime)
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = seekTime
    }
  }

  const handleTrimStartChange = (value: number[]) => {
    const newTrimStart = value[0]
    if (newTrimStart < trimEnd) {
      setTrimStart(newTrimStart)
      if (audioElementRef.current && isPlaying) {
        audioElementRef.current.currentTime = newTrimStart
      }
    }
  }

  const handleTrimEndChange = (value: number[]) => {
    const newTrimEnd = value[0]
    if (newTrimEnd > trimStart) {
      setTrimEnd(newTrimEnd)
    }
  }

  const applyTrim = () => {
    if (!audioElementRef.current) return

    // Set playback position to trim start
    audioElementRef.current.currentTime = trimStart
    setPlaybackTime(trimStart)
    setIsTrimming(true)
  }

  const resetTrim = () => {
    setTrimStart(0)
    setTrimEnd(totalDuration)
    setIsTrimming(false)
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = 0
      setPlaybackTime(0)
    }
  }

  const toggleEffect = (effect: keyof typeof activeEffects) => {
    setActiveEffects((prev) => ({
      ...prev,
      [effect]: !prev[effect],
    }))
  }

  const updateEffectParam = (param: keyof typeof effectParams, value: number) => {
    setEffectParams((prev) => ({
      ...prev,
      [param]: value,
    }))
  }

  // Preset functions
  const savePreset = () => {
    if (!newPresetName.trim()) return

    const newPreset: AudioPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.toUpperCase(),
      effects: { ...activeEffects },
      params: { ...effectParams },
    }

    setPresets([...presets, newPreset])
    setNewPresetName("")
  }

  const loadPreset = (preset: AudioPreset) => {
    setActiveEffects({ ...preset.effects })
    setEffectParams({ ...preset.params })
  }

  const deletePreset = (presetId: string) => {
    // Don't delete default presets
    if (presetId.startsWith("preset-") && Number.parseInt(presetId.split("-")[1]) <= 4) return

    setPresets(presets.filter((p) => p.id !== presetId))
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
      setWindowSize({ width: 500, height: 380 })
    } else {
      setWindowSize({ width: window.innerWidth - 100, height: window.innerHeight - 100 })
    }
    setIsMaximized(!isMaximized)
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
        className="h-8 bg-gradient-to-r from-[#ff00ff] to-[#00ffff] flex items-center justify-between px-2 cursor-move"
        onMouseDown={startDragging}
      >
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#ff00aa]"></div>
          <div className="w-2 h-2 rounded-full bg-[#00ffff]"></div>
          <div className="w-2 h-2 rounded-full bg-[#aa00ff]"></div>
          <span className="text-white font-bold ml-2 text-xs text-shadow-glow font-pixel">BFFRecorder.exe</span>
        </div>
        <div className="flex gap-1">
          <button
            className="w-5 h-5 flex items-center justify-center text-white hover:bg-[#aa00ff]/50 rounded"
            onClick={toggleMaximize}
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
          <button 
            type="button"
            aria-label="Close"
            title="Close"
            className="w-5 h-5 flex items-center justify-center text-white hover:bg-[#ff00aa]/50 rounded"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-6 bg-[#1a1a2e] text-[#00ffff] flex items-center px-2 text-xs border-b border-[#ff00ff]/30">
        <Popover>
          <PopoverTrigger asChild>
            <button className="px-1 py-0.5 hover:bg-[#aa00ff]/30 mr-1 flex items-center gap-1">
              <Save size={10} />
              <span className="text-[10px] font-pixel">SAVE</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 bg-[#1a1a2e] border border-[#ff00ff]/30 p-2">
            <div className="space-y-2">
              <h3 className="text-[#00ffff] font-bold text-xs font-pixel">EXPORT OPTIONS</h3>
              <div className="space-y-1">
                <Label htmlFor="format" className="text-[#00ffff] text-xs font-pixel">
                  FORMAT
                </Label>
                <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as any)}>
                  <SelectTrigger className="bg-[#2a2a3a] border-[#ff00ff]/30 text-[#00ffff] h-7 text-xs font-pixel">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2a2a3a] border border-[#ff00ff]/30 font-pixel">
                    <SelectItem value="wav">WAV</SelectItem>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="ogg">OGG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-[#ff00ff] hover:bg-[#ff00ff]/80 text-white h-7 text-xs font-pixel"
                onClick={saveRecording}
                disabled={!audioBlob}
              >
                <Download size={12} className="mr-1" />
                EXPORT
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <button className="px-1 py-0.5 hover:bg-[#aa00ff]/30 mr-1 flex items-center gap-1">
          <Folder size={10} />
          <span className="text-[10px] font-pixel">OPEN</span>
        </button>

        <div className="flex-1"></div>

        <Popover>
          <PopoverTrigger asChild>
            <button className="px-1 py-0.5 hover:bg-[#aa00ff]/30 mr-1 flex items-center gap-1">
              <Scissors size={10} />
              <span className="text-[10px] font-pixel">TRIM</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-[#1a1a2e] border border-[#ff00ff]/30 p-2">
            <div className="space-y-2">
              <h3 className="text-[#00ffff] font-bold text-xs font-pixel">TRIM AUDIO</h3>
              <div className="flex justify-between text-[10px] font-pixel">
                <span className="text-[#00ffff]">START: {formatTime(trimStart)}</span>
                <span className="text-[#00ffff]">END: {formatTime(trimEnd)}</span>
              </div>

              <div className="h-16 bg-[#0a0a1a] rounded-md mb-2 relative">
                {audioData && (
                  <WaveformVisualizer
                    audioData={audioData}
                    isPlaying={false}
                    playbackTime={0}
                    totalDuration={totalDuration}
                    trimStart={trimStart}
                    trimEnd={trimEnd}
                    showTrimHandles={true}
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[#00ffff] text-[10px] block font-pixel">START POSITION</label>
                <Slider
                  value={[trimStart]}
                  min={0}
                  max={totalDuration}
                  step={0.1}
                  onValueChange={handleTrimStartChange}
                  disabled={!audioBlob}
                  className="mb-2"
                />

                <label className="text-[#00ffff] text-[10px] block font-pixel">END POSITION</label>
                <Slider
                  value={[trimEnd]}
                  min={0}
                  max={totalDuration}
                  step={0.1}
                  onValueChange={handleTrimEndChange}
                  disabled={!audioBlob}
                />
              </div>

              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  className="bg-[#ff00ff] hover:bg-[#ff00ff]/80 text-white border-[#ff00ff] h-7 text-xs flex-1 font-pixel"
                  onClick={applyTrim}
                  disabled={!audioBlob || (trimStart === 0 && trimEnd === totalDuration)}
                >
                  APPLY TRIM
                </Button>

                <Button
                  variant="outline"
                  className="bg-[#2a2a3a] hover:bg-[#aa00ff]/30 text-[#00ffff] border-[#00ffff] h-7 text-xs flex-1 font-pixel"
                  onClick={resetTrim}
                  disabled={!audioBlob || !isTrimming}
                >
                  RESET
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button className="px-1 py-0.5 hover:bg-[#aa00ff]/30 mr-1 flex items-center gap-1">
              <Sliders size={10} />
              <span className="text-[10px] font-pixel">FX</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-[#1a1a2e] border border-[#ff00ff]/30 p-2">
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <h3 className="text-[#00ffff] font-bold text-xs font-pixel">AUDIO EFFECTS</h3>

              <Tabs defaultValue="reverb" className="w-full">
                <TabsList className="bg-[#2a2a3a] w-full h-7 mb-2">
                  <TabsTrigger
                    value="reverb"
                    className="text-[10px] h-5 data-[state=active]:bg-[#aa00ff]/50 font-pixel"
                  >
                    REVERB
                  </TabsTrigger>
                  <TabsTrigger value="delay" className="text-[10px] h-5 data-[state=active]:bg-[#aa00ff]/50 font-pixel">
                    DELAY
                  </TabsTrigger>
                  <TabsTrigger
                    value="distort"
                    className="text-[10px] h-5 data-[state=active]:bg-[#aa00ff]/50 font-pixel"
                  >
                    DISTORT
                  </TabsTrigger>
                  <TabsTrigger
                    value="filter"
                    className="text-[10px] h-5 data-[state=active]:bg-[#aa00ff]/50 font-pixel"
                  >
                    FILTER
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="reverb" className="mt-0">
                  <div className="bg-[#1a1a2e] p-2 rounded-md border border-[#ff00ff]/30">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#00ffff] text-xs font-pixel">REVERB</label>
                      <Switch
                        checked={activeEffects.reverb}
                        onCheckedChange={() => toggleEffect("reverb")}
                        className="data-[state=checked]:bg-[#ff00ff] h-4 w-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#00ffff] text-[10px] font-pixel">DECAY TIME</label>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[effectParams.reverbDecay]}
                          min={0.1}
                          max={5}
                          step={0.1}
                          onValueChange={(value) => updateEffectParam("reverbDecay", value[0])}
                          disabled={!activeEffects.reverb}
                          className="flex-1"
                        />
                        <span className="text-[#00ffff] text-[10px] w-6 font-pixel">
                          {effectParams.reverbDecay.toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="delay" className="mt-0">
                  <div className="bg-[#1a1a2e] p-2 rounded-md border border-[#ff00ff]/30">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#00ffff] text-xs font-pixel">DELAY</label>
                      <Switch
                        checked={activeEffects.delay}
                        onCheckedChange={() => toggleEffect("delay")}
                        className="data-[state=checked]:bg-[#ff00ff] h-4 w-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#00ffff] text-[10px] font-pixel">DELAY TIME</label>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[effectParams.delayTime]}
                          min={0.1}
                          max={2}
                          step={0.1}
                          onValueChange={(value) => updateEffectParam("delayTime", value[0])}
                          disabled={!activeEffects.delay}
                          className="flex-1"
                        />
                        <span className="text-[#00ffff] text-[10px] w-6 font-pixel">
                          {effectParams.delayTime.toFixed(1)}s
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 mt-1">
                      <label className="text-[#00ffff] text-[10px] font-pixel">FEEDBACK</label>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[effectParams.delayFeedback]}
                          min={0}
                          max={0.9}
                          step={0.1}
                          onValueChange={(value) => updateEffectParam("delayFeedback", value[0])}
                          disabled={!activeEffects.delay}
                          className="flex-1"
                        />
                        <span className="text-[#00ffff] text-[10px] w-6 font-pixel">
                          {Math.round(effectParams.delayFeedback * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="distort" className="mt-0">
                  <div className="bg-[#1a1a2e] p-2 rounded-md border border-[#ff00ff]/30">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#00ffff] text-xs font-pixel">DISTORTION</label>
                      <Switch
                        checked={activeEffects.distortion}
                        onCheckedChange={() => toggleEffect("distortion")}
                        className="data-[state=checked]:bg-[#ff00ff] h-4 w-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#00ffff] text-[10px] font-pixel">AMOUNT</label>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[effectParams.distortionAmount]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => updateEffectParam("distortionAmount", value[0])}
                          disabled={!activeEffects.distortion}
                          className="flex-1"
                        />
                        <span className="text-[#00ffff] text-[10px] w-6 font-pixel">
                          {Math.round(effectParams.distortionAmount)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a1a2e] p-2 rounded-md border border-[#ff00ff]/30 mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#00ffff] text-xs font-pixel">BITCRUSHER</label>
                      <Switch
                        checked={activeEffects.bitcrusher}
                        onCheckedChange={() => toggleEffect("bitcrusher")}
                        className="data-[state=checked]:bg-[#ff00ff] h-4 w-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#00ffff] text-[10px] font-pixel">BIT DEPTH</label>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[effectParams.bitcrusherBits]}
                          min={1}
                          max={16}
                          step={1}
                          onValueChange={(value) => updateEffectParam("bitcrusherBits", value[0])}
                          disabled={!activeEffects.bitcrusher}
                          className="flex-1"
                        />
                        <span className="text-[#00ffff] text-[10px] w-6 font-pixel">
                          {Math.round(effectParams.bitcrusherBits)} BIT
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="filter" className="mt-0">
                  <div className="bg-[#1a1a2e] p-2 rounded-md border border-[#ff00ff]/30">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#00ffff] text-xs font-pixel">LOW PASS</label>
                      <Switch
                        checked={activeEffects.lowpass}
                        onCheckedChange={() => toggleEffect("lowpass")}
                        className="data-[state=checked]:bg-[#ff00ff] h-4 w-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#00ffff] text-[10px] font-pixel">FREQUENCY</label>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[effectParams.lowpassFreq]}
                          min={100}
                          max={10000}
                          step={100}
                          onValueChange={(value) => updateEffectParam("lowpassFreq", value[0])}
                          disabled={!activeEffects.lowpass}
                          className="flex-1"
                        />
                        <span className="text-[#00ffff] text-[10px] w-12 font-pixel">
                          {effectParams.lowpassFreq.toFixed(0)} HZ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1a1a2e] p-2 rounded-md border border-[#ff00ff]/30 mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#00ffff] text-xs font-pixel">LO-FI</label>
                      <Switch
                        checked={activeEffects.lofi}
                        onCheckedChange={() => toggleEffect("lofi")}
                        className="data-[state=checked]:bg-[#ff00ff] h-4 w-7"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#00ffff] text-[10px] font-pixel">SAMPLE RATE</label>
                      <div className="flex items-center gap-1">
                        <Slider
                          value={[effectParams.lofiSampleRate]}
                          min={0.1}
                          max={1}
                          step={0.1}
                          onValueChange={(value) => updateEffectParam("lofiSampleRate", value[0])}
                          disabled={!activeEffects.lofi}
                          className="flex-1"
                        />
                        <span className="text-[#00ffff] text-[10px] w-6 font-pixel">
                          {Math.round(effectParams.lofiSampleRate * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <button className="px-1 py-0.5 hover:bg-[#aa00ff]/30 mr-1 flex items-center gap-1">
              <BookmarkIcon size={10} />
              <span className="text-[10px] font-pixel">PRESETS</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-[#1a1a2e] border border-[#ff00ff]/30 p-2">
            <div className="space-y-2">
              <h3 className="text-[#00ffff] font-bold text-xs font-pixel">AUDIO PRESETS</h3>

              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between bg-[#2a2a3a] p-1 rounded border border-[#ff00ff]/30 hover:bg-[#aa00ff]/30 cursor-pointer"
                    onClick={() => loadPreset(preset)}
                  >
                    <span className="text-[#00ffff] text-xs font-pixel">{preset.name}</span>
                    <button
                      className="text-[#ff00ff] hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePreset(preset.id)
                      }}
                    >
                      {!preset.id.startsWith("preset-") || Number.parseInt(preset.id.split("-")[1]) > 4 ? (
                        <Trash2 size={12} />
                      ) : null}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#ff00ff]/30">
                <h4 className="text-[#00ffff] text-xs mb-1 font-pixel">SAVE CURRENT SETTINGS</h4>
                <div className="flex gap-1">
                  <Input
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="PRESET NAME"
                    className="h-7 bg-[#2a2a3a] border-[#ff00ff]/30 text-[#00ffff] text-xs font-pixel"
                  />
                  <Button
                    className="h-7 bg-[#ff00ff] hover:bg-[#ff00ff]/80 text-white"
                    onClick={savePreset}
                    disabled={!newPresetName.trim()}
                  >
                    <PlusCircle size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-1 ml-1">
          <button
            className={`px-1 py-0.5 flex items-center gap-1 ${visualizationMode === "waveform" ? "bg-[#aa00ff]/50" : "hover:bg-[#aa00ff]/30"}`}
            onClick={() => setVisualizationMode("waveform")}
          >
            <Waveform size={10} />
          </button>
          <button
            className={`px-1 py-0.5 flex items-center gap-1 ${visualizationMode === "spectrum" ? "bg-[#aa00ff]/50" : "hover:bg-[#aa00ff]/30"}`}
            onClick={() => setVisualizationMode("spectrum")}
          >
            <BarChart2 size={10} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100%-44px)] bg-[#1a1a2e] p-2">
        {/* Waveform Display */}
        <div className="flex-1 bg-[#0a0a1a] border border-[#ff00ff]/30 rounded-md overflow-hidden mb-2 relative">
          <div className="absolute inset-0 bg-[#0a0a1a] z-0">
            <div className="w-full h-full grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(10,1fr)] opacity-10">
              {Array.from({ length: 200 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-[#00ffff]/20"></div>
              ))}
            </div>
          </div>
          <div className="relative z-10 w-full h-full">
            {visualizationMode === "waveform" ? (
              <WaveformVisualizer
                audioData={audioData}
                isPlaying={isPlaying}
                playbackTime={playbackTime}
                totalDuration={totalDuration}
                trimStart={isTrimming ? trimStart : 0}
                trimEnd={isTrimming ? trimEnd : totalDuration}
              />
            ) : (
              <SpectrumVisualizer analyser={analyserRef.current} isPlaying={isPlaying} />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#2a2a3a] p-2 rounded-md border border-[#ff00ff]/30">
          {/* Time Display */}
          <div className="flex justify-between mb-2">
            <div className="bg-black px-2 py-0.5 rounded text-[#00ffff] font-mono text-sm font-pixel">
              {isRecording ? formatTime(recordingTime) : formatTime(playbackTime)}
            </div>
            <div className="bg-black px-2 py-0.5 rounded text-[#00ffff] font-mono text-sm font-pixel">
              {formatTime(totalDuration)}
            </div>
          </div>

          {/* Playback Slider */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={totalDuration || 100}
              value={playbackTime}
              onChange={handleSeek}
              disabled={isRecording || !audioBlob}
              className="w-full h-1.5 accent-[#ff00ff] bg-[#0a0a1a] rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Transport Controls */}
          <div className="flex justify-center gap-1 mb-3">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full bg-[#2a2a3a] border-[#00ffff] text-[#00ffff] hover:bg-[#aa00ff]/30 hover:text-white"
              onClick={() => {
                if (audioElementRef.current) {
                  audioElementRef.current.currentTime = Math.max(
                    isTrimming ? trimStart : 0,
                    audioElementRef.current.currentTime - 5,
                  )
                  setPlaybackTime(audioElementRef.current.currentTime)
                }
              }}
              disabled={isRecording || !audioBlob}
            >
              <Rewind size={14} />
            </Button>

            {isRecording ? (
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full bg-[#ff0000] border-[#ff0000] text-white hover:bg-[#cc0000] hover:text-white"
                onClick={stopRecording}
              >
                <Square size={16} />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-full bg-[#2a2a3a] border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/30 hover:text-white"
                onClick={startRecording}
                disabled={isPlaying}
              >
                <Mic size={16} />
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              className={`w-10 h-10 rounded-full ${
                isPlaying
                  ? "bg-[#00ffff]/20 border-[#00ffff] text-[#00ffff]"
                  : "bg-[#2a2a3a] border-[#00ffff] text-[#00ffff]"
              } hover:bg-[#00ffff]/30 hover:text-white`}
              onClick={togglePlayback}
              disabled={isRecording || !audioBlob}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full bg-[#2a2a3a] border-[#00ffff] text-[#00ffff] hover:bg-[#aa00ff]/30 hover:text-white"
              onClick={() => {
                if (audioElementRef.current) {
                  audioElementRef.current.currentTime = Math.min(
                    isTrimming ? trimEnd : audioElementRef.current.duration,
                    audioElementRef.current.currentTime + 5,
                  )
                  setPlaybackTime(audioElementRef.current.currentTime)
                }
              }}
              disabled={isRecording || !audioBlob}
            >
              <FastForward size={14} />
            </Button>
          </div>

          {/* Basic Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[#00ffff] text-[10px] block mb-0.5 font-pixel">SPEED</label>
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(Number.parseFloat(e.target.value))}
                  disabled={isRecording}
                  className="flex-1 accent-[#ff00ff] h-1.5"
                />
                <span className="text-[#00ffff] text-[10px] w-6 font-pixel">{playbackRate.toFixed(1)}X</span>
              </div>
            </div>
            <div>
              <label className="text-[#00ffff] text-[10px] block mb-0.5 font-pixel">VOLUME</label>
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                  className="flex-1 accent-[#ff00ff] h-1.5"
                />
                <span className="text-[#00ffff] text-[10px] w-6 font-pixel">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Active Effects Indicators */}
          {(activeEffects.reverb ||
            activeEffects.delay ||
            activeEffects.distortion ||
            activeEffects.lowpass ||
            activeEffects.bitcrusher ||
            activeEffects.lofi) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {activeEffects.reverb && (
                <div className="bg-[#ff00ff]/20 text-[#00ffff] text-[10px] px-1 py-0.5 rounded border border-[#ff00ff]/30 font-pixel">
                  REVERB
                </div>
              )}
              {activeEffects.delay && (
                <div className="bg-[#ff00ff]/20 text-[#00ffff] text-[10px] px-1 py-0.5 rounded border border-[#ff00ff]/30 font-pixel">
                  DELAY
                </div>
              )}
              {activeEffects.distortion && (
                <div className="bg-[#ff00ff]/20 text-[#00ffff] text-[10px] px-1 py-0.5 rounded border border-[#ff00ff]/30 font-pixel">
                  DISTORT
                </div>
              )}
              {activeEffects.lowpass && (
                <div className="bg-[#ff00ff]/20 text-[#00ffff] text-[10px] px-1 py-0.5 rounded border border-[#ff00ff]/30 font-pixel">
                  LOWPASS
                </div>
              )}
              {activeEffects.bitcrusher && (
                <div className="bg-[#ff00ff]/20 text-[#00ffff] text-[10px] px-1 py-0.5 rounded border border-[#ff00ff]/30 font-pixel">
                  BITCRUSH
                </div>
              )}
              {activeEffects.lofi && (
                <div className="bg-[#ff00ff]/20 text-[#00ffff] text-[10px] px-1 py-0.5 rounded border border-[#ff00ff]/30 font-pixel">
                  LO-FI
                </div>
              )}
              {isTrimming && (
                <div className="bg-[#ff00ff]/20 text-[#00ffff] text-[10px] px-1 py-0.5 rounded border border-[#ff00ff]/30 font-pixel">
                  TRIMMED
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
