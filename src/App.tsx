import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useSpring,
} from "motion/react";
import {
  ArrowUpRight,
  Plus,
  Minus,
  Quote,
  Sun,
  Moon,
  Eye,
  ArrowUp,
  Volume2,
  VolumeX,
  TerminalSquare,
  Lock,
  Unlock,
  Play,
  ListMusic,
  Trash2,
  Shuffle,
  SkipForward,
  Palette,
  X,
  Github,
  Linkedin,
  Mail,
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// --- Sound System (Web Audio API) ---
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: Uint8Array | null = null;
let bgAudio: HTMLAudioElement | null = null;
let bgAudioSource: MediaElementAudioSourceNode | null = null;

let onTrackEndCallback: (() => void) | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128; // Small size for a subtle visualizer
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    analyser.connect(audioCtx.destination);

    // Initialize actual background music
    bgAudio = new Audio();
    bgAudio.crossOrigin = "anonymous";
    bgAudio.volume = 0;

    bgAudio.onerror = () => {
      console.error("Audio element error:", bgAudio?.error);
    };

    bgAudio.addEventListener("ended", () => {
      if (onTrackEndCallback) onTrackEndCallback();
    });

    // Connect to analyser for visualization
    bgAudioSource = audioCtx.createMediaElementSource(bgAudio);
    bgAudioSource.connect(analyser);
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
};

const playTrack = (url: string) => {
  if (!bgAudio) return;
  bgAudio.src = url;
  bgAudio.load();
  bgAudio
    .play()
    .catch((e) => console.log("Audio play prevented:", e.message || e));

  // Fade in
  let vol = 0;
  bgAudio.volume = 0;
  const fade = setInterval(() => {
    vol += 0.02;
    if (vol >= 0.3) {
      bgAudio!.volume = 0.3;
      clearInterval(fade);
    } else {
      bgAudio!.volume = vol;
    }
  }, 100);
};

const stopAmbientMusic = () => {
  if (bgAudio) {
    // Fade out
    let vol = bgAudio.volume;
    const fade = setInterval(() => {
      vol -= 0.05;
      if (vol <= 0) {
        bgAudio!.volume = 0;
        bgAudio!.pause();
        clearInterval(fade);
      } else {
        bgAudio!.volume = vol;
      }
    }, 100);
  }
};

const playHoverSound = () => {
  if (!audioCtx || !analyser || audioCtx.state === "suspended") return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(analyser);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
};

const playClickSound = () => {
  if (!audioCtx || !analyser || audioCtx.state === "suspended") return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(analyser);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
};

const AudioVisualizer = ({ isSoundEnabled }: { isSoundEnabled: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isSoundEnabled || !analyser || !dataArray || !canvasRef.current)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      analyser!.getByteFrequencyData(dataArray as any);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const accentColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--theme-accent")
          .trim() || "#d4c3a3";

      const barCount = dataArray!.length / 2.5;
      const barWidth = canvas.width / barCount;
      let x = 0;

      for (let i = 0; i < barCount; i++) {
        const barHeight = (dataArray![i] / 255) * canvas.height;

        ctx.fillStyle = accentColor;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isSoundEnabled]);

  if (!isSoundEnabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 60 }}
      exit={{ opacity: 0, width: 0 }}
      transition={{ duration: 0.3 }}
      className="ml-2 overflow-hidden flex items-center h-[20px] shrink-0"
    >
      <canvas
        ref={canvasRef}
        width={60}
        height={20}
        className="pointer-events-none block"
      />
    </motion.div>
  );
};

// --- SVG Components ---
const SyndicateSVG = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full stroke-accent fill-none"
    strokeWidth="1"
  >
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      d="M50,100 L150,100 L200,50 L250,150 L300,100 L350,100"
    />
    <motion.circle
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 1 }}
      cx="50"
      cy="100"
      r="4"
      className="fill-accent"
    />
    <motion.circle
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 1.2 }}
      cx="150"
      cy="100"
      r="4"
      className="fill-accent"
    />
    <motion.circle
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 1.4 }}
      cx="200"
      cy="50"
      r="4"
      className="fill-accent"
    />
    <motion.circle
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 1.6 }}
      cx="250"
      cy="150"
      r="4"
      className="fill-accent"
    />
    <motion.circle
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 1.8 }}
      cx="300"
      cy="100"
      r="4"
      className="fill-accent"
    />
    <motion.circle
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay: 2 }}
      cx="350"
      cy="100"
      r="4"
      className="fill-accent"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      d="M150,120 L300,120"
      strokeDasharray="4 4"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      d="M150,80 L300,80"
      strokeDasharray="4 4"
    />
  </svg>
);

const AuraSVG = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full stroke-accent fill-none"
    strokeWidth="1"
  >
    {[40, 80, 120, 160].map((y, i) => (
      <motion.circle
        key={`in-${i}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.1 }}
        cx="50"
        cy={y}
        r="4"
        className="fill-accent"
      />
    ))}
    {[60, 100, 140].map((y, i) => (
      <motion.circle
        key={`h1-${i}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 + i * 0.1 }}
        cx="150"
        cy={y}
        r="4"
        className="fill-accent"
      />
    ))}
    {[60, 100, 140].map((y, i) => (
      <motion.circle
        key={`h2-${i}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 + i * 0.1 }}
        cx="250"
        cy={y}
        r="4"
        className="fill-accent"
      />
    ))}
    {[80, 120].map((y, i) => (
      <motion.circle
        key={`out-${i}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5 + i * 0.1 }}
        cx="350"
        cy={y}
        r="4"
        className="fill-accent"
      />
    ))}
    {[40, 80, 120, 160].map((y1, i) =>
      [60, 100, 140].map((y2, j) => (
        <motion.path
          key={`c1-${i}-${j}`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.2 + (i + j) * 0.05 }}
          d={`M50,${y1} L150,${y2}`}
        />
      )),
    )}
    {[60, 100, 140].map((y1, i) =>
      [60, 100, 140].map((y2, j) => (
        <motion.path
          key={`c2-${i}-${j}`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.7 + (i + j) * 0.05 }}
          d={`M150,${y1} L250,${y2}`}
        />
      )),
    )}
    {[60, 100, 140].map((y1, i) =>
      [80, 120].map((y2, j) => (
        <motion.path
          key={`c3-${i}-${j}`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 1, delay: 1.2 + (i + j) * 0.05 }}
          d={`M250,${y1} L350,${y2}`}
        />
      )),
    )}
  </svg>
);

const NexusSVG = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full stroke-accent fill-none"
    strokeWidth="1"
  >
    {[
      [100, 50],
      [300, 50],
      [200, 100],
      [100, 150],
      [300, 150],
    ].map(([x, y], i) => (
      <motion.circle
        key={`n-${i}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.2 }}
        cx={x}
        cy={y}
        r="15"
      />
    ))}
    {[
      [100, 50],
      [300, 50],
      [200, 100],
      [100, 150],
      [300, 150],
    ].map(([x, y], i) => (
      <motion.circle
        key={`nd-${i}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 + i * 0.2 }}
        cx={x}
        cy={y}
        r="2"
        className="fill-accent"
      />
    ))}
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 1 }}
      d="M100,65 L200,85"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 1.2 }}
      d="M300,65 L200,85"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 1.4 }}
      d="M100,135 L200,115"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 1.6 }}
      d="M300,135 L200,115"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 1.8 }}
      d="M115,50 L285,50"
      strokeDasharray="2 4"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 2.0 }}
      d="M115,150 L285,150"
      strokeDasharray="2 4"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 2.2 }}
      d="M100,65 L100,135"
      strokeDasharray="2 4"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 2.4 }}
      d="M300,65 L300,135"
      strokeDasharray="2 4"
    />
  </svg>
);

const ChronosSVG = () => (
  <svg
    viewBox="0 0 400 200"
    className="w-full h-full stroke-accent fill-none"
    strokeWidth="1"
  >
    <motion.path
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      transition={{ duration: 1 }}
      d="M50,150 L350,150"
    />
    <motion.path
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      transition={{ duration: 1 }}
      d="M50,50 L50,150"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "linear" }}
      d="M50,120 Q80,140 110,100 T170,80 T230,110 T290,60 T350,40"
      strokeWidth="2"
    />
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.5 }}
      cx="170"
      cy="80"
      r="6"
      strokeDasharray="2 2"
    />
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2 }}
      cx="290"
      cy="60"
      r="6"
      strokeDasharray="2 2"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1, delay: 2 }}
      d="M350,40 Q370,30 390,50"
      strokeDasharray="4 4"
      strokeWidth="2"
    />
  </svg>
);

const IgnisSVG = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full stroke-accent fill-none absolute inset-0 opacity-10 group-hover:opacity-100 transition-opacity duration-500"
    strokeWidth="1"
  >
    {[...Array(8)].map((_, i) => (
      <motion.line
        key={i}
        x1="50"
        y1="50"
        x2="50"
        y2="10"
        transform={`rotate(${i * 45} 50 50)`}
        variants={{
          initial: { pathLength: 0, opacity: 0 },
          hover: {
            pathLength: [0, 1, 0],
            opacity: [0, 1, 0],
            transition: { duration: 0.8, repeat: Infinity, delay: i * 0.1 },
          },
        }}
      />
    ))}
    <circle cx="50" cy="50" r="4" className="fill-accent" />
  </svg>
);

const projects = [
  {
    id: "01",
    title: "CyberSentry",
    category: "Network Security Monitoring",
    github: "https://github.com/Izumitempest/cybersentry",
    year: "2025",
    problem:
      "Modern network environments face increasingly sophisticated zero-day threats that bypass traditional signature-based detection systems, leading to silent data exfiltration.",
    solution:
      "Architected an advanced monitoring engine using Python and Scapy, integrating a real-time TensorFlow anomaly detection model to identify suspicious traffic patterns with high precision.",
    contribution:
      "Lead Developer. Successfully implemented a multi-threaded packet processing pipeline that reduced detection latency to sub-10ms, identifying 40% more threats than legacy systems.",
    Diagram: SyndicateSVG,
  },
  {
    id: "02",
    title: "QuantumCrypt",
    category: "Quantum-Resistant Encryption",
    github: "https://github.com/Izumitempest/quantumcrypt",
    year: "2024",
    problem:
      "The looming reality of quantum computing threatens current RSA and ECC encryption standards, potentially exposing decades of encrypted sensitive data to decryption.",
    solution:
      "Engineered a post-quantum cryptographic library in Python, utilizing NumPy and C++ extensions to implement lattice-based and code-based encryption algorithms resistant to Shor's algorithm.",
    contribution:
      "Security Architect. Optimized the performance of NTRU and Kyber implementations, achieving a 3x speedup over standard Python libraries while maintaining absolute cryptographic integrity.",
    Diagram: AuraSVG,
  },
  {
    id: "03",
    title: "NexusGuard",
    category: "AI-Powered Threat Detection",
    github: "https://github.com/Izumitempest/nexusguard",
    year: "2024",
    problem:
      "Security teams are overwhelmed by thousands of false-positive alerts daily, making it nearly impossible to prioritize and react to genuine security breaches in massive data environments.",
    solution:
      "Developed a deep learning threat classifier using PyTorch and Django, processing millions of logs through a Redis-backed real-time analysis pipeline to provide prioritized threat scoring.",
    contribution:
      "ML Engineer. Achieved a 98.4% accuracy rate in malware classification, reducing false-positive alerts by 65% and significantly decreasing incident response times for the SOC team.",
    Diagram: NexusSVG,
  },
  {
    id: "04",
    title: "ShadowScanner",
    category: "Automated Penetration Testing",
    github: "https://github.com/Izumitempest/shadowscanner",
    year: "2024",
    problem:
      "Manual penetration testing is slow and inconsistent, often leaving critical security gaps open for weeks between scheduled audits in fast-moving dev environments.",
    solution:
      "Engineered an automated offensive security framework using Python and Selenium, orchestrating Nmap and custom fuzzing scripts to perform continuous vulnerability mapping.",
    contribution:
      "Core Architect. Refined the orchestration logic to reduce scanning overhead by 50% while expanding coverage across a wide range of web and network-level vulnerabilities.",
    Diagram: IgnisSVG,
  },
  {
    id: "05",
    title: "BlockShield",
    category: "Blockchain Security Analysis",
    github: "https://github.com/Izumitempest/blockshield",
    year: "2023",
    problem:
      "Smart contract vulnerabilities lead to billions of dollars in lost crypto assets annually, with traditional static analysis tools often missing complex logic-based exploits.",
    solution:
      "Created a comprehensive security audit suite for Web3 using Web3.py and Solidity, capable of identifying reentrancy, overflow, and access control issues through symbolic execution.",
    contribution:
      "Lead Auditor. Developed a proprietary rule engine that helped secure over $200M in digital assets by identifying critical flaws in major DeFi protocol smart contracts.",
    Diagram: AuraSVG,
  },
  {
    id: "06",
    title: "CipherChat",
    category: "Secure Messaging Platform",
    github: "https://github.com/Izumitempest/cipherchat",
    year: "2023",
    problem:
      "Common communication platforms often lack true zero-knowledge architecture, leaving user metadata and message content vulnerable to institutional access or data breaches.",
    solution:
      "Architected an end-to-end encrypted messaging system using Django and WebSockets, implementing the Signal Protocol for perfect forward secrecy and self-destructing data packets.",
    contribution:
      "System Architect. Designed the core cryptographic exchange protocol, ensuring minimal latency while maintaining the highest level of privacy and data sovereignty for users.",
    Diagram: SyndicateSVG,
  },
];

const TerraSVG = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full stroke-accent fill-none absolute inset-0 opacity-10 group-hover:opacity-100 transition-opacity duration-500"
    strokeWidth="1"
  >
    <motion.rect
      x="30"
      y="30"
      width="40"
      height="40"
      variants={{
        initial: { rotate: 0, scale: 1 },
        hover: {
          rotate: 90,
          scale: 1.1,
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        },
      }}
      style={{ originX: "50px", originY: "50px" }}
    />
    <motion.rect
      x="20"
      y="20"
      width="60"
      height="60"
      variants={{
        initial: { rotate: 0, opacity: 0.5 },
        hover: {
          rotate: -90,
          opacity: 1,
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        },
      }}
      style={{ originX: "50px", originY: "50px" }}
      strokeDasharray="4 4"
    />
  </svg>
);

const AquaSVG = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full stroke-accent fill-none absolute inset-0 opacity-10 group-hover:opacity-100 transition-opacity duration-500"
    strokeWidth="1"
  >
    {[...Array(3)].map((_, i) => (
      <motion.path
        key={i}
        d="M 10 50 Q 30 30 50 50 T 90 50"
        variants={{
          initial: { y: i * 10 - 10, opacity: 0.5 },
          hover: {
            y: [i * 10 - 10, i * 10 - 15, i * 10 - 10],
            opacity: 1,
            transition: {
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            },
          },
        }}
      />
    ))}
  </svg>
);

const AetherSVG = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-full h-full stroke-accent fill-none absolute inset-0 opacity-10 group-hover:opacity-100 transition-opacity duration-500"
    strokeWidth="1"
  >
    <motion.circle
      cx="50"
      cy="50"
      r="20"
      variants={{
        initial: { scale: 1, opacity: 0.5 },
        hover: {
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        },
      }}
    />
    <motion.circle
      cx="50"
      cy="50"
      r="5"
      className="fill-accent"
      variants={{
        initial: { scale: 1 },
        hover: {
          scale: [1, 1.2, 1],
          transition: { duration: 1, repeat: Infinity },
        },
      }}
    />
  </svg>
);

const elements = [
  {
    id: "I",
    name: "Ignis / Execution",
    concept: "High-Frequency Systems",
    description:
      "Forging C++ bindings and asynchronous Python to achieve microsecond latency. Speed is not a feature; it is the foundation.",
    Visual: IgnisSVG,
  },
  {
    id: "II",
    name: "Terra / Architecture",
    concept: "Distributed Data Mesh",
    description:
      "Sculpting fault-tolerant, globally distributed pipelines. Solid, unyielding, and capable of supporting immense scale.",
    Visual: TerraSVG,
  },
  {
    id: "III",
    name: "Aqua / Synthesis",
    concept: "Predictive Analytics",
    description:
      "Flowing through vast datasets with PyTorch, finding the hidden currents of truth within chaotic information.",
    Visual: AquaSVG,
  },
  {
    id: "IV",
    name: "Aether / Elegance",
    concept: "Algorithmic Design",
    description:
      "The invisible space between the lines. Crafting code that is mathematically pure, infinitely readable, and undeniably beautiful.",
    Visual: AetherSVG,
  },
];

const codeSnippets = [
  {
    id: "algo",
    title: "Arbitrage Execution",
    code: `def execute_arbitrage(market_data):
    """
    Identifies and executes latency-arbitrage opportunities.
    """
    spread = market_data['ask'] - market_data['bid']
    if spread > THRESHOLD:
        with MemoryMap() as mmap:
            mmap.write(b'EXECUTE')
            return "Arbitrage captured: +$14,200"
    return "Awaiting signal..."`,
    output:
      "> Initializing memory map...\n> Analyzing order book...\n> Signal detected. Latency: 4μs\n> Arbitrage captured: +$14,200",
  },
  {
    id: "tensor",
    title: "Tensor Synthesis",
    code: `import torch

def synthesize_manifold(dimensions: int):
    """
    Folds a high-dimensional tensor manifold.
    """
    tensor = torch.randn(dimensions, dimensions, device='cuda')
    eigenvalues = torch.linalg.eigvals(tensor)
    return f"Manifold folded. Spectral radius: {eigenvalues.abs().max():.4f}"`,
    output:
      "> Allocating CUDA memory...\n> Generating random tensor (1024x1024)...\n> Computing eigenvalues...\n> Manifold folded. Spectral radius: 32.1452",
  },
];

const testimonials = [
  {
    quote:
      "Izumi does not write software; they craft digital clockwork. The trading engine they architected operates with a silent, ruthless efficiency that redefined our capabilities.",
    author: "Alexander V.",
    role: "CTO, Global Quant Syndicate",
  },
  {
    quote:
      "The elegance of the codebase was matched only by its performance. It is rare to find an engineer who treats data orchestration as a true art form.",
    author: "Elena M.",
    role: "Director of Engineering, Luxury Maison",
  },
];

const performanceData = [
  { month: "Jan", latency: 120, accuracy: 82 },
  { month: "Feb", latency: 95, accuracy: 85 },
  { month: "Mar", latency: 80, accuracy: 88 },
  { month: "Apr", latency: 65, accuracy: 91 },
  { month: "May", latency: 45, accuracy: 95 },
  { month: "Jun", latency: 25, accuracy: 98 },
  { month: "Jul", latency: 12, accuracy: 99.5 },
];

const techStack = [
  {
    category: "Languages",
    items: ["Python 3.12+", "C++20", "Rust", "TypeScript"],
  },
  {
    category: "Architecture",
    items: ["Microservices", "Event-Driven", "Serverless", "CQRS"],
  },
  {
    category: "Data & ML",
    items: ["PyTorch", "TensorFlow", "PostgreSQL", "Redis", "Kafka"],
  },
  {
    category: "Infrastructure",
    items: ["Kubernetes", "Docker", "AWS", "GCP", "Terraform"],
  },
];

const defaultPlaylist = [
  {
    id: "1",
    name: "80s Vibe",
    url: "https://howlerjs.com/assets/howler.js/examples/player/audio/80s_vibe.mp3",
  },
  {
    id: "2",
    name: "Rave Digger",
    url: "https://howlerjs.com/assets/howler.js/examples/player/audio/rave_digger.mp3",
  },
  {
    id: "3",
    name: "Running Out",
    url: "https://howlerjs.com/assets/howler.js/examples/player/audio/running_out.mp3",
  },
];

export default function App() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const parallax1 = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const parallax2 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const parallax3 = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  // Theme & Sound Logic
  const [theme, setTheme] = useState<
    "default" | "light" | "minimalist" | "neon"
  >(() => (localStorage.getItem("portfolio-theme") as any) || "default");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isA11yMode, setIsA11yMode] = useState(
    () => localStorage.getItem("portfolio-a11y") === "true",
  );
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  useEffect(() => {
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("portfolio-a11y", String(isA11yMode));
  }, [isA11yMode]);

  // Playlist State
  const [playlist, setPlaylist] = useState(defaultPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackUrl, setNewTrackUrl] = useState("");
  const [isShuffle, setIsShuffle] = useState(false);

  useEffect(() => {
    onTrackEndCallback = () => {
      handleNextTrack();
    };
    return () => {
      onTrackEndCallback = null;
    };
  }, [playlist, currentTrackIndex, isShuffle, isSoundEnabled]);

  const handleNextTrack = () => {
    if (playlist.length === 0) return;
    let nextIndex = currentTrackIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (nextIndex >= playlist.length) {
      nextIndex = 0;
    }
    setCurrentTrackIndex(nextIndex);
    if (isSoundEnabled) {
      playTrack(playlist[nextIndex].url);
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    if (isSoundEnabled) {
      stopAmbientMusic();
      setTimeout(() => {
        playTrack(playlist[index].url);
      }, 500);
    }
  };

  // Vault Logic
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultInput, setVaultInput] = useState("");
  const [vaultError, setVaultError] = useState(false);

  // Terminal Logic
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Code Showcase Logic
  const [activeSnippet, setActiveSnippet] = useState(0);
  const [snippetOutput, setSnippetOutput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const runSnippet = () => {
    if (isSoundEnabled) playClickSound();
    setIsSimulating(true);
    setSnippetOutput("");

    const outputLines = codeSnippets[activeSnippet].output.split("\n");
    let currentLine = 0;

    const interval = setInterval(() => {
      if (currentLine < outputLines.length) {
        setSnippetOutput(
          (prev) => prev + (prev ? "\n" : "") + outputLines[currentLine],
        );
        currentLine++;
        if (isSoundEnabled) playHoverSound();
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 400);
  };
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Izumi OS v1.0.4 initialized.",
    "Type 'help' for available commands.",
  ]);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.remove(
      "theme-light",
      "theme-minimalist",
      "theme-neon",
    );
    if (theme !== "default") {
      document.body.classList.add(`theme-${theme}`);
    }

    if (isA11yMode) document.body.classList.add("a11y-mode");
    else document.body.classList.remove("a11y-mode");
  }, [theme, isA11yMode]);

  // Terminal Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setIsTerminalOpen((prev) => {
          if (!prev && isSoundEnabled) playClickSound();
          return !prev;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSoundEnabled]);

  useEffect(() => {
    if (isTerminalOpen && terminalInputRef.current) {
      terminalInputRef.current.focus();
    }
  }, [isTerminalOpen]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    let response = "";

    if (isSoundEnabled) playClickSound();

    if (cmd.startsWith("cat ")) {
      const id = cmd.split(" ")[1];
      const project = projects.find((p) => p.id === id);
      if (project) {
        response = `${project.title} (${project.year}): ${project.category}. Problem: ${project.problem.substring(0, 80)}...`;
      } else {
        response = `Project ID ${id} not found. Use 'ls' to see valid IDs.`;
      }
    } else if (cmd.startsWith("theme ")) {
      const newTheme = cmd.split(" ")[1];
      const validThemes = ["default", "light", "minimalist", "neon"];
      if (validThemes.includes(newTheme)) {
        setTheme(newTheme as any);
        response = `Theme changed to ${newTheme}.`;
      } else {
        response = `Invalid theme. Try: ${validThemes.join(", ")}`;
      }
    } else {
      switch (cmd) {
        case "help":
          response =
            "Available commands: whoami, clear, unlock vault, ls, cat [id], themes, theme [name], socials, sudo, exit";
          break;
        case "ls":
          response =
            projects.map((p) => `${p.id} (${p.title})`).join(", ") +
            ". Type 'cat [id]' for details.";
          break;
        case "themes":
          response =
            "Available themes: default, light, minimalist, neon. Use 'theme [name]' to switch.";
          break;
        case "socials":
          response =
            "GitHub: github.com/Izumitempest | LinkedIn: linkedin.com/in/izumitempest";
          break;
        case "sudo":
          response =
            "Nice try. This incident will be reported to... actually, I am the only root here.";
          break;
        case "whoami":
          response = "Izumi - System Designer & Cybersecurity Architect.";
          break;
        case "unlock vault":
          if (isVaultUnlocked) {
            response = "Vault is already unlocked.";
          } else {
            setIsVaultUnlocked(true);
            response = "Access granted. Vault unlocked.";
          }
          break;
        case "clear":
          setTerminalHistory([]);
          setTerminalInput("");
          return;
        case "exit":
          setIsTerminalOpen(false);
          setTerminalInput("");
          return;
        default:
          response = `Command not found: ${cmd}`;
      }
    }

    if (response) {
      setTerminalHistory((prev) => [...prev, `> ${terminalInput}`, response]);
    }
    setTerminalInput("");
  };

  const handleVaultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSoundEnabled) playClickSound();

    if (vaultInput === "0x1A4") {
      setIsVaultUnlocked(true);
      setVaultError(false);
    } else {
      setVaultError(true);
      setTimeout(() => setVaultError(false), 1000);
    }
    setVaultInput("");
  };

  const toggleSound = () => {
    if (!isSoundEnabled) {
      initAudio();
      playClickSound();
      if (playlist.length > 0) {
        playTrack(playlist[currentTrackIndex].url);
      }
    } else {
      stopAmbientMusic();
    }
    setIsSoundEnabled(!isSoundEnabled);
  };

  const handleHover = () => {
    if (isSoundEnabled) playHoverSound();
  };

  const handleClick = () => {
    if (isSoundEnabled) playClickSound();
  };

  // Custom Cursor Logic
  const cursorX = useSpring(0, { stiffness: 800, damping: 20, mass: 0.2 });
  const cursorY = useSpring(0, { stiffness: 800, damping: 20, mass: 0.2 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  useEffect(() => {
    setIsDesktop(window.matchMedia("(pointer: fine)").matches);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 8);
      cursorY.set(e.clientY - 8);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-cursor="hover"]')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [cursorX, cursorY]);

  const scrollToTop = () => {
    handleClick();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    handleClick();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-site-bg text-site-text font-sans selection:bg-site-accent selection:text-site-bg overflow-hidden transition-colors duration-700 ease-in-out"
    >
      <div className="noise-overlay"></div>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-accent z-50 origin-left"
        style={{ scaleX: scrollYProgress, width: "100%" }}
      />

      {/* Hidden Terminal Overlay */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] bg-bg/90 backdrop-blur-xl border border-border rounded-lg shadow-2xl z-[100] font-mono text-xs p-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
              <span className="text-accent tracking-widest uppercase">
                Izumi Terminal
              </span>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="opacity-50 hover:opacity-100 hover:text-accent"
                onMouseEnter={handleHover}
              >
                [CLOSE]
              </button>
            </div>
            <div className="h-48 overflow-y-auto mb-4 space-y-2">
              {terminalHistory.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.startsWith(">") ? "opacity-50" : "text-accent"
                  }
                >
                  {line}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
            <form
              onSubmit={handleTerminalSubmit}
              className="flex items-center gap-2"
            >
              <span className="text-accent">{">"}</span>
              <input
                ref={terminalInputRef}
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-text"
                spellCheck={false}
                autoComplete="off"
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Cursor */}
      {isDesktop && !isA11yMode && (
        <motion.div
          className="fixed top-0 left-0 w-4 h-4 rounded-full border border-accent pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center"
          style={{ x: cursorX, y: cursorY }}
          animate={{
            scale: isHovering ? 2.5 : 1,
            backgroundColor: isHovering
              ? "rgba(150, 150, 150, 0.2)"
              : "rgba(150, 150, 150, 0)",
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-1 h-1 bg-accent rounded-full"
            animate={{ opacity: isHovering ? 0 : 1 }}
          />
        </motion.div>
      )}

      {/* Floating Social Bar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-40 hidden md:flex"
      >
        <a
          href="https://github.com/Izumitempest"
          target="_blank"
          className="text-text/30 hover:text-accent transition-colors"
          onMouseEnter={handleHover}
          onClick={handleClick}
        >
          <Github size={18} />
        </a>
        <a
          href="https://linkedin.com/in/izumitempest"
          target="_blank"
          className="text-text/30 hover:text-accent transition-colors"
          onMouseEnter={handleHover}
          onClick={handleClick}
        >
          <Linkedin size={18} />
        </a>
        <a
          href="mailto:izumi@example.com"
          className="text-text/30 hover:text-accent transition-colors"
          onMouseEnter={handleHover}
          onClick={handleClick}
        >
          <Mail size={18} />
        </a>
        <div className="w-[1px] h-20 bg-border mx-auto"></div>
        <span className="text-[10px] vertical-text tracking-widest uppercase opacity-30 select-none">
          Connect
        </span>
      </motion.div>

      {/* Dash to Top Button */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-bg border border-border flex items-center justify-center rounded-full hover:border-accent hover:text-accent transition-all z-40 group overflow-hidden"
            onMouseEnter={handleHover}
          >
            <motion.div className="absolute inset-0 bg-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <ArrowUp size={20} className="relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-50 bg-site-bg/95 backdrop-blur-xl border-b border-site-border/50 transition-all duration-700 ease-in-out shadow-sm text-site-text">
        <div className="text-sm tracking-[0.2em] uppercase font-light">
          Izumi
        </div>
        <div className="flex items-center gap-6 md:gap-8">
          <div className="flex items-center gap-4 border-r border-border pr-6 md:pr-8">
            <button
              onClick={() => {
                handleClick();
                setIsTerminalOpen(!isTerminalOpen);
              }}
              onMouseEnter={handleHover}
              className="hover:text-accent transition-colors duration-500"
              data-cursor="hover"
              aria-label="Toggle Terminal"
            >
              <TerminalSquare size={16} />
            </button>
            <div className="relative flex items-center">
              <button
                onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
                onMouseEnter={handleHover}
                className={`hover:text-accent transition-colors duration-500 mr-4 ${isPlaylistOpen ? "text-accent" : ""}`}
                data-cursor="hover"
                aria-label="Toggle Playlist"
              >
                <ListMusic size={16} />
              </button>
              <button
                onClick={toggleSound}
                onMouseEnter={handleHover}
                className={`hover:text-accent transition-colors duration-500 ${isSoundEnabled ? "text-accent" : ""}`}
                data-cursor="hover"
                aria-label="Toggle Sound"
              >
                {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <AnimatePresence>
                {isSoundEnabled && (
                  <AudioVisualizer isSoundEnabled={isSoundEnabled} />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isPlaylistOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-72 bg-site-bg/95 backdrop-blur-xl border border-site-border p-4 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] flex flex-col gap-4 text-site-text"
                  >
                    <div className="flex justify-between items-center border-b border-border pb-2">
                      <span className="text-xs tracking-[0.2em] uppercase text-accent">
                        Audio Synthesis
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsShuffle(!isShuffle)}
                          className={`hover:text-accent transition-colors ${isShuffle ? "text-accent" : "opacity-50"}`}
                        >
                          <Shuffle size={14} />
                        </button>
                        <button
                          onClick={handleNextTrack}
                          className="hover:text-accent transition-colors opacity-50 hover:opacity-100"
                        >
                          <SkipForward size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {playlist.map((track, index) => (
                        <div
                          key={track.id}
                          className={`group flex justify-between items-center p-2 rounded text-xs transition-colors ${currentTrackIndex === index ? "bg-accent/10 text-accent" : "hover:bg-accent/5"}`}
                        >
                          <button
                            className="truncate flex-1 text-left"
                            onClick={() => selectTrack(index)}
                          >
                            {currentTrackIndex === index && (
                              <Play size={10} className="inline mr-2" />
                            )}
                            {track.name}
                          </button>
                          <button
                            onClick={() =>
                              setPlaylist(
                                playlist.filter((_, i) => i !== index),
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-2"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-border">
                      <input
                        type="text"
                        placeholder="Track Name"
                        value={newTrackName}
                        onChange={(e) => setNewTrackName(e.target.value)}
                        className="bg-transparent border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent text-text"
                      />
                      <input
                        type="text"
                        placeholder="Audio URL (.mp3, .ogg)"
                        value={newTrackUrl}
                        onChange={(e) => setNewTrackUrl(e.target.value)}
                        className="bg-transparent border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent text-text"
                      />
                      <button
                        onClick={() => {
                          if (newTrackName && newTrackUrl) {
                            setPlaylist([
                              ...playlist,
                              {
                                id: Date.now().toString(),
                                name: newTrackName,
                                url: newTrackUrl,
                              },
                            ]);
                            setNewTrackName("");
                            setNewTrackUrl("");
                          }
                        }}
                        className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 rounded px-2 py-1 text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus size={12} /> Add Track
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative flex items-center">
              <button
                onClick={() => {
                  handleClick();
                  setIsThemeMenuOpen(!isThemeMenuOpen);
                }}
                onMouseEnter={handleHover}
                className={`hover:text-accent transition-colors duration-500 ${isThemeMenuOpen ? "text-accent" : ""}`}
                data-cursor="hover"
                aria-label="Toggle Theme Menu"
              >
                <Palette size={16} />
              </button>

              <AnimatePresence>
                {isThemeMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-40 bg-site-bg/95 backdrop-blur-xl border border-site-border p-2 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[60] flex flex-col gap-1 text-site-text"
                  >
                    {(["default", "light", "minimalist", "neon"] as const).map(
                      (t) => (
                        <button
                          key={t}
                          onClick={() => {
                            handleClick();
                            setTheme(t);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`text-left px-3 py-2 rounded text-xs transition-colors ${theme === t ? "bg-accent/10 text-accent" : "hover:bg-accent/5"}`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ),
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => {
                handleClick();
                setIsA11yMode(!isA11yMode);
              }}
              onMouseEnter={handleHover}
              className={`hover:text-accent transition-colors duration-500 ${isA11yMode ? "text-accent" : ""}`}
              data-cursor="hover"
              aria-label="Toggle Accessibility Mode"
            >
              <Eye size={16} />
            </button>
          </div>
          <div className="text-sm tracking-[0.2em] uppercase font-light flex gap-6 md:gap-8">
            <a
              href="#work"
              onMouseEnter={handleHover}
              onClick={(e) => handleNavClick(e, "work")}
              className="hover:text-accent transition-colors duration-500"
              data-cursor="hover"
            >
              Work
            </a>
            <a
              href="#contact"
              onMouseEnter={handleHover}
              onClick={(e) => handleNavClick(e, "contact")}
              className="hover:text-accent transition-colors duration-500"
              data-cursor="hover"
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 relative">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            <p className="font-serif italic text-accent text-xl md:text-3xl mb-6 transition-all duration-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
              Precision Python Engineering
            </p>
            <h1 className="font-serif text-[15vw] md:text-[12vw] leading-[0.8] tracking-tighter uppercase font-light text-site-text drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)]">
              Izumi
            </h1>
            <h1 className="font-serif text-[15vw] md:text-[12vw] leading-[0.8] tracking-tighter uppercase font-light text-outline ml-12 md:ml-32 hover:text-accent transition-all duration-700 cursor-default">
              Architect
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="mt-24 md:mt-40 grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <div className="col-span-1 md:col-start-3">
              <p className="text-sm leading-relaxed font-light tracking-wide text-site-text/80 transition-colors duration-700">
                Elevating code to an art form. Specializing in high-performance
                Python systems, data architecture, and algorithmic elegance for
                discerning clients worldwide.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ y: isA11yMode ? 0 : yBg }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] border border-accent rounded-full blur-3xl -z-10 transition-colors duration-500"
        />
      </section>

      {/* The Journey & The Ritual */}
      <section className="py-32 px-6 md:px-12 relative z-10 bg-site-bg transition-colors duration-500 overflow-hidden">
        {/* Parallax Background Elements */}
        <motion.div
          style={{ y: isA11yMode ? 0 : parallax1 }}
          className="absolute top-20 left-10 w-64 h-64 border border-accent/10 rounded-full -z-10"
        />
        <motion.div
          style={{ y: isA11yMode ? 0 : parallax2 }}
          className="absolute bottom-20 right-10 w-96 h-96 border border-accent/5 rounded-full -z-10"
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-xs tracking-[0.3em] uppercase text-accent mb-12 transition-colors duration-500">
              01 / The Journey
            </h2>
            <h3 className="font-serif text-3xl md:text-5xl leading-tight font-light mb-8">
              "Software is not merely written; it is{" "}
              <span className="italic text-accent transition-colors duration-500">
                sculpted
              </span>
              ."
            </h3>
            <div className="space-y-6 text-sm font-light leading-relaxed opacity-80">
              <p>
                My path as a system designer was forged at the intersection of
                pure logic and defensive strategy. With over 4 years of
                deep-level Python engineering, I view code not just as a set of
                instructions, but as a resilient architecture that must survive
                the most hostile digital environments.
              </p>
              <p>
                Specializing in high-performance cybersecurity tools and
                AI-driven threat detection, I have cultivated a philosophy that
                prioritizes structural integrity over convenience. My work
                ranges from engineering quantum-resistant encryption libraries
                to developing complex neural networks for real-time malware
                classification.
              </p>
              <p>
                I believe that true security in software lies in its
                transparency of purpose and opacity to exploit. The most
                sophisticated systems are those that operate with silent,
                unyielding efficiency while maintaining absolute data
                sovereignty for their users.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h2 className="text-xs tracking-[0.3em] uppercase text-accent mb-12 transition-colors duration-500">
              02 / The Ritual
            </h2>
            <div
              className="border border-site-border p-8 md:p-12 relative bg-site-card transition-colors duration-500"
              data-cursor="hover"
              onMouseEnter={handleHover}
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-site-accent to-transparent opacity-50"></div>
              <h4 className="font-serif text-2xl mb-6 text-accent transition-colors duration-500">
                The White Room
              </h4>
              <p className="text-sm font-light leading-relaxed opacity-80 mb-8">
                Before a single line of logic is committed to the machine, there
                is the 'White Room' phase. A period of pure conceptualization
                using only ink and parchment. I believe that if an architecture
                cannot be elegantly drawn, it cannot be elegantly coded.
              </p>
              <pre className="font-mono text-[10px] md:text-xs leading-loose tracking-widest text-site-accent/80 mb-8 p-4 bg-site-bg/50 border border-site-border rounded">
                <code className="block">def architect_reality(vision):</code>
                <code className="block"> # Distill complexity</code>
                <code className="block opacity-50"> # Vault Access: 0x1A4</code>
                <code className="block"> return Model.synthesize(vision)</code>
              </pre>
              <div className="flex items-center gap-4 text-[10px] tracking-[0.2em] uppercase text-accent transition-colors duration-500">
                <span className="w-8 h-[1px] bg-accent transition-colors duration-500"></span>
                Concept Before Syntax
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 md:px-12 bg-site-card-hover border-y border-site-border relative z-10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-16">
            <Quote
              size={32}
              className="text-accent opacity-50 transition-colors duration-500"
              strokeWidth={1}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="text-center md:text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
              >
                <p className="font-serif text-xl md:text-2xl leading-relaxed font-light italic mb-8">
                  "{t.quote}"
                </p>
                <div className="text-[10px] tracking-[0.2em] uppercase">
                  <span className="text-accent transition-colors duration-500">
                    {t.author}
                  </span>
                  <span className="opacity-50 mx-2">|</span>
                  <span className="opacity-50">{t.role}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Elements (Skills) */}
      <section className="py-32 md:py-48 px-6 md:px-12 relative z-10 bg-site-bg transition-colors duration-500 overflow-hidden">
        {/* Parallax Background Elements */}
        <motion.div
          style={{ y: isA11yMode ? 0 : parallax3 }}
          className="absolute top-1/3 right-1/4 w-48 h-48 border border-accent/10 rotate-45 -z-10"
        />
        <motion.div
          style={{ y: isA11yMode ? 0 : parallax1 }}
          className="absolute bottom-1/4 left-10 w-72 h-72 border border-accent/5 rounded-full -z-10"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-24">
            <h2 className="text-xs tracking-[0.3em] uppercase text-accent mb-6 transition-colors duration-500">
              03 / The Arsenal
            </h2>
            <h3 className="font-serif text-4xl md:text-6xl font-light">
              A METAPHORICAL{" "}
              <span className="italic text-accent transition-colors duration-500">
                MASTERY
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {elements.map((el, i) => (
              <motion.div
                key={el.id}
                initial="initial"
                whileInView="initial"
                whileHover="hover"
                viewport={{ once: true, margin: "-50px" }}
                onMouseEnter={handleHover}
                className="relative h-[400px] border border-site-border p-8 flex flex-col justify-between group overflow-hidden transition-colors duration-500"
                data-cursor="hover"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="absolute inset-0 z-0"
                >
                  <el.Visual />
                </motion.div>
                <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-0" />

                <div className="relative z-10">
                  <span className="font-serif italic text-accent text-3xl transition-colors duration-500">
                    {el.id}
                  </span>
                  <h4 className="text-xs tracking-[0.2em] uppercase mt-6">
                    {el.name}
                  </h4>
                </div>

                <div className="relative z-10">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    {el.concept}
                  </p>
                  <p className="text-sm font-light leading-relaxed opacity-50 group-hover:opacity-90 transition-opacity duration-500 delay-200">
                    {el.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Stack */}
      <section className="py-32 px-6 md:px-12 border-t border-border relative z-10 bg-bg transition-colors duration-500 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-24">
            <h2 className="text-xs tracking-[0.3em] uppercase text-accent mb-6 transition-colors duration-500">
              04 / The Stack
            </h2>
            <h3 className="font-serif text-4xl md:text-6xl font-light">
              TECHNICAL{" "}
              <span className="italic text-accent transition-colors duration-500">
                FOUNDATION
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {techStack.map((stack, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="flex flex-col gap-6"
              >
                <h4 className="text-xs tracking-[0.2em] uppercase text-accent border-b border-border pb-4 transition-colors duration-500">
                  {stack.category}
                </h4>
                <ul className="space-y-4">
                  {stack.items.map((item, j) => (
                    <li
                      key={j}
                      className="text-sm font-light tracking-wide opacity-80 flex items-center gap-3"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/50"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-32 px-6 md:px-12 border-t border-border relative z-10 bg-bg transition-colors duration-500 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-24">
            <h2 className="text-xs tracking-[0.3em] uppercase text-accent mb-6 transition-colors duration-500">
              05 / Performance Metrics
            </h2>
            <h3 className="font-serif text-4xl md:text-6xl font-light">
              EMPIRICAL{" "}
              <span className="italic text-accent transition-colors duration-500">
                EVIDENCE
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="border border-site-border p-8 bg-site-card rounded-xl transition-colors duration-500"
            >
              <h4 className="text-xs tracking-[0.2em] uppercase mb-8 opacity-70">
                Latency Optimization (μs)
              </h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorLatency"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--theme-accent)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--theme-accent)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--theme-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="var(--theme-text)"
                      opacity={0.5}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--theme-text)"
                      opacity={0.5}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--theme-bg)",
                        borderColor: "var(--theme-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "var(--theme-accent)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="latency"
                      stroke="var(--theme-accent)"
                      fillOpacity={1}
                      fill="url(#colorLatency)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="border border-site-border p-8 bg-site-card rounded-xl transition-colors duration-500"
            >
              <h4 className="text-xs tracking-[0.2em] uppercase mb-8 opacity-70">
                Model Accuracy (%)
              </h4>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--theme-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="var(--theme-text)"
                      opacity={0.5}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[80, 100]}
                      stroke="var(--theme-text)"
                      opacity={0.5}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--theme-bg)",
                        borderColor: "var(--theme-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "var(--theme-accent)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="var(--theme-accent)"
                      strokeWidth={2}
                      dot={{
                        fill: "var(--theme-bg)",
                        stroke: "var(--theme-accent)",
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{ r: 6, fill: "var(--theme-accent)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Laboratory (Code Showcase) */}
      <section className="py-32 md:py-48 px-6 md:px-12 border-t border-site-border relative z-10 bg-site-bg transition-colors duration-500 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-24">
            <h2 className="text-xs tracking-[0.3em] uppercase text-accent mb-6 transition-colors duration-500">
              06 / The Laboratory
            </h2>
            <h3 className="font-serif text-4xl md:text-6xl font-light">
              INTERACTIVE{" "}
              <span className="italic text-accent transition-colors duration-500">
                SYNTHESIS
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 flex flex-col gap-4">
              {codeSnippets.map((snippet, index) => (
                <button
                  key={snippet.id}
                  onClick={() => {
                    if (isSoundEnabled) playClickSound();
                    setActiveSnippet(index);
                    setSnippetOutput("");
                  }}
                  onMouseEnter={handleHover}
                  data-cursor="hover"
                  className={`text-left p-6 border transition-all duration-500 ${activeSnippet === index ? "border-accent bg-accent/5" : "border-border hover:border-border-hover"}`}
                >
                  <h4 className="font-serif text-xl mb-2">{snippet.title}</h4>
                  <p className="text-[10px] tracking-[0.2em] uppercase opacity-50">
                    Snippet {index + 1}
                  </p>
                </button>
              ))}
            </div>

            <div className="lg:col-span-8 border border-site-border bg-site-card rounded-lg overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-site-border bg-site-bg/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-border"></div>
                  <div className="w-3 h-3 rounded-full bg-border"></div>
                  <div className="w-3 h-3 rounded-full bg-border"></div>
                </div>
                <button
                  onClick={runSnippet}
                  disabled={isSimulating}
                  onMouseEnter={handleHover}
                  data-cursor="hover"
                  className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-site-accent hover:text-site-text transition-colors duration-300 disabled:opacity-50"
                >
                  <Play size={12} />{" "}
                  {isSimulating ? "Executing..." : "Run Sequence"}
                </button>
              </div>

              <div className="p-6 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto text-site-text/80">
                <pre>
                  <code>{codeSnippets[activeSnippet].code}</code>
                </pre>
              </div>

              <div className="mt-auto border-t border-site-border bg-site-bg/80 p-6 min-h-[120px] font-mono text-xs text-site-accent">
                <div className="opacity-50 mb-2 text-[10px] tracking-widest uppercase">
                  Output Console
                </div>
                <pre className="whitespace-pre-wrap">
                  {snippetOutput || "Ready."}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Works */}
      <section
        id="work"
        className="py-32 md:py-48 px-6 md:px-12 border-t border-border relative z-10 bg-bg transition-colors duration-500"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-24">
            <div>
              <h2 className="text-xs tracking-[0.3em] uppercase text-accent mb-6 transition-colors duration-500">
                07 / Selected Works
              </h2>
              <h3 className="font-serif text-4xl md:text-6xl font-light">
                ARCHITECTURAL{" "}
                <span className="italic text-accent transition-colors duration-500">
                  EXHIBITION
                </span>
              </h3>
            </div>
            <p className="text-xs tracking-[0.1em] uppercase opacity-50 hidden md:block">
              2023 — 2025
            </p>
          </div>

          <div className="flex flex-col border-t border-site-border transition-colors duration-500">
            {projects.map((project, index) => {
              const isExpanded = expandedProject === index;
              return (
                <motion.div
                  key={project.id}
                  className="border-b border-site-border transition-colors duration-500"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <div
                    className="py-12 flex flex-col md:flex-row md:items-center justify-between gap-8 group cursor-pointer"
                    onClick={() => {
                      handleClick();
                      setExpandedProject(isExpanded ? null : index);
                    }}
                    onMouseEnter={handleHover}
                    data-cursor="hover"
                  >
                    <div className="flex items-start md:items-center gap-8 md:gap-16">
                      <span className="font-serif italic text-accent text-xl opacity-50 group-hover:opacity-100 transition-all duration-500">
                        {project.id}
                      </span>
                      <div>
                        <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light group-hover:text-accent transition-colors duration-500">
                          {project.title}
                        </h3>
                        <p className="text-[10px] tracking-[0.2em] uppercase mt-4 opacity-50">
                          {project.category}
                        </p>
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-full border border-site-border-hover flex items-center justify-center group-hover:border-site-accent group-hover:text-site-accent transition-all duration-500 shrink-0">
                      {isExpanded ? (
                        <Minus size={16} strokeWidth={1} />
                      ) : (
                        <Plus size={16} strokeWidth={1} />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
                          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                              <h4 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4 flex items-center gap-2 transition-colors duration-500">
                                <span className="w-4 h-[1px] bg-site-accent transition-colors duration-500"></span>{" "}
                                The Problem
                              </h4>
                              <p className="text-sm font-light leading-relaxed opacity-70">
                                {project.problem}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4 flex items-center gap-2 transition-colors duration-500">
                                <span className="w-4 h-[1px] bg-site-accent transition-colors duration-500"></span>{" "}
                                The Solution
                              </h4>
                              <p className="text-sm font-light leading-relaxed opacity-70">
                                {project.solution}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <h4 className="text-[10px] tracking-[0.2em] uppercase text-accent mb-4 flex items-center gap-2 transition-colors duration-500">
                                <span className="w-4 h-[1px] bg-site-accent transition-colors duration-500"></span>{" "}
                                Contribution
                              </h4>
                              <p className="text-sm font-light leading-relaxed opacity-70">
                                {project.contribution}
                              </p>
                            </div>
                          </div>

                          {/* SVG Architecture Draw-Down */}
                          <div className="lg:col-span-5 h-64 border border-site-border bg-site-card rounded-lg p-6 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute top-4 left-4 text-[10px] tracking-[0.2em] uppercase text-accent opacity-50">
                              Architecture Topology
                            </div>
                            <project.Diagram />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="vault"
        className="py-32 md:py-48 px-6 md:px-12 border-t border-site-border relative z-10 bg-site-bg transition-colors duration-500"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-16">
            <h2 className="text-xs tracking-[0.3em] uppercase text-accent mb-6 transition-colors duration-500">
              08 / Restricted Access
            </h2>
            <h3 className="font-serif text-4xl md:text-6xl font-light">
              THE{" "}
              <span className="italic text-accent transition-colors duration-500">
                VAULT
              </span>
            </h3>
          </div>

          <div className="border border-site-border p-8 md:p-16 bg-site-card rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-site-accent to-transparent opacity-30"></div>

            {isVaultUnlocked ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 border border-accent rounded-full text-accent mb-4">
                  <Unlock size={24} />
                </div>
                <div>
                  <h4 className="font-serif text-2xl text-accent mb-4 transition-colors duration-500">
                    Classified Access Granted
                  </h4>
                  <p className="text-sm font-light opacity-70 max-w-md mx-auto">
                    You have reached the inner sanctum. Below are restricted
                    resources and direct contact protocols.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  <a
                    href="/resume.pdf"
                    target="_blank"
                    className="flex items-center gap-4 p-5 border border-site-border hover:border-site-accent bg-site-bg/50 transition-all rounded-lg group"
                    onMouseEnter={handleHover}
                    onClick={handleClick}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-site-accent/10 rounded group-hover:bg-site-accent group-hover:text-site-bg transition-colors">
                      <ArrowUpRight size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-widest opacity-40">
                        Document
                      </div>
                      <div className="text-xs font-medium tracking-tight">
                        Premium Resume.pdf
                      </div>
                    </div>
                  </a>

                  <a
                    href="mailto:izumi@example.com"
                    className="flex items-center gap-4 p-5 border border-site-border hover:border-site-accent bg-site-bg/50 transition-all rounded-lg group"
                    onMouseEnter={handleHover}
                    onClick={handleClick}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-site-accent/10 rounded group-hover:bg-site-accent group-hover:text-site-bg transition-colors">
                      <Mail size={18} />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] uppercase tracking-widest opacity-40">
                        Protocol
                      </div>
                      <div className="text-xs font-medium tracking-tight">
                        Direct Channel (Email)
                      </div>
                    </div>
                  </a>
                </div>

                <div className="pt-8 border-t border-site-border mt-8">
                  <p className="text-[10px] font-mono italic opacity-30 text-center uppercase tracking-widest">
                    "The most elegant systems are those that disappear into the
                    purpose they serve."
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div className="inline-flex items-center justify-center w-16 h-16 border border-site-border rounded-full opacity-50 mb-4">
                  <Lock size={24} />
                </div>
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.3em] font-light opacity-50">
                    Identity Authentication Required
                  </p>
                  <form
                    onSubmit={handleVaultSubmit}
                    className="max-w-xs mx-auto space-y-6"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ENTER HASH"
                        value={vaultInput}
                        onChange={(e) => setVaultInput(e.target.value)}
                        className={`w-full bg-site-bg border ${vaultError ? "border-red-500" : "border-site-border focus:border-site-accent"} outline-none p-4 text-center tracking-[0.5em] font-mono text-xs rounded transition-all uppercase`}
                      />
                      {vaultError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -bottom-6 left-0 w-full text-center text-[10px] text-red-500 uppercase tracking-widest"
                        >
                          Authentication Failed
                        </motion.div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 border border-site-border hover:border-site-accent hover:bg-site-accent hover:text-site-bg transition-all duration-500 uppercase tracking-widest text-[10px] font-medium"
                      onMouseEnter={handleHover}
                    >
                      Authenticate
                    </button>
                  </form>
                </div>
                <div className="text-center pt-4">
                  <span className="text-[10px] opacity-20 uppercase tracking-[0.4em]">
                    Algorithm Hint: 0x1A4
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <section
        id="contact"
        className="py-32 md:py-48 px-6 md:px-12 border-t border-site-border relative overflow-hidden z-10 bg-site-bg transition-colors duration-500"
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-xs tracking-[0.3em] uppercase text-accent mb-12 transition-colors duration-500">
            08 / Engage
          </h2>

          <button
            onClick={() => {
              handleClick();
              setIsConsultationOpen(true);
            }}
            className="group inline-block focus:outline-none"
            data-cursor="hover"
            onMouseEnter={handleHover}
          >
            <h3 className="font-serif text-4xl md:text-7xl lg:text-[8rem] leading-[0.9] font-light mb-12 relative inline-block text-left md:text-center">
              REQUEST A <br />{" "}
              <span className="italic text-accent transition-colors duration-500">
                CONSULTATION
              </span>
              {/* Glowing Underline Effect */}
              <span className="absolute -bottom-4 left-0 w-full h-[2px] bg-site-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left ease-[cubic-bezier(0.16,1,0.3,1)]"></span>
              <span className="absolute -bottom-4 left-0 w-full h-[2px] bg-site-accent blur-md scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left ease-[cubic-bezier(0.16,1,0.3,1)] opacity-50"></span>
            </h3>
          </button>

          <p className="text-sm tracking-[0.1em] uppercase font-light opacity-70 mb-16 mt-8">
            Available for select commissions & architectural consulting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => {
                handleClick();
                setIsConsultationOpen(true);
              }}
              data-cursor="hover"
              onMouseEnter={handleHover}
              className="group inline-flex items-center gap-4 border border-site-border-hover rounded-full px-8 py-4 hover:border-site-accent hover:bg-site-accent hover:text-site-bg transition-all duration-500 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-site-accent opacity-0 group-hover:animate-pulse transition-opacity duration-300"></span>
              <span className="text-xs tracking-[0.2em] uppercase relative z-10">
                Secure Message
              </span>
              <ArrowUpRight
                size={14}
                strokeWidth={2}
                className="relative z-10"
              />
            </button>

            <a
              href="https://github.com/Izumitempest"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              onMouseEnter={handleHover}
              onClick={handleClick}
              className="group inline-flex items-center gap-4 border border-site-border-hover rounded-full px-8 py-4 hover:border-site-accent hover:bg-site-accent hover:text-site-bg transition-all duration-500 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-site-accent opacity-0 group-hover:animate-pulse transition-opacity duration-300"></span>
              <span className="text-xs tracking-[0.2em] uppercase relative z-10">
                GitHub
              </span>
              <ArrowUpRight
                size={14}
                strokeWidth={2}
                className="relative z-10"
              />
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-end text-[10px] tracking-[0.2em] uppercase text-site-text/40">
          <div>© {new Date().getFullYear()} Izumi</div>
          <div>Tokyo / Global</div>
        </div>
      </section>

      {/* Consultation Modal */}
      <AnimatePresence>
        {isConsultationOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-site-bg/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-site-card border border-site-border rounded-xl shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-site-accent to-transparent opacity-50"></div>

              <div className="p-8 md:p-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="font-serif text-3xl md:text-4xl font-light mb-2">
                      Initiate Dialogue
                    </h2>
                    <p className="text-sm tracking-[0.1em] uppercase font-light opacity-70 text-accent">
                      Confidential Inquiry
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleClick();
                      setIsConsultationOpen(false);
                    }}
                    className="p-2 hover:text-accent transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={24} strokeWidth={1} />
                  </button>
                </div>

                <form
                  className="space-y-8"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setIsConsultationOpen(false);
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-site-text">
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block text-site-text">
                        Identity
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-transparent border-b border-site-border focus:border-site-accent outline-none py-2 text-sm transition-colors duration-300"
                        placeholder="Your Name / Organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block text-site-text">
                        Secure Contact
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full bg-transparent border-b border-site-border focus:border-site-accent outline-none py-2 text-sm transition-colors duration-300"
                        placeholder="Email Address"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block">
                      Nature of Inquiry
                    </label>
                    <select className="w-full bg-transparent border-b border-site-border focus:border-site-accent outline-none py-2 text-sm transition-colors duration-300 appearance-none">
                      <option
                        value="architecture"
                        className="bg-site-bg text-site-text"
                      >
                        System Architecture
                      </option>
                      <option
                        value="optimization"
                        className="bg-site-bg text-site-text"
                      >
                        Performance Optimization
                      </option>
                      <option
                        value="consulting"
                        className="bg-site-bg text-site-text"
                      >
                        Technical Consulting
                      </option>
                      <option
                        value="other"
                        className="bg-site-bg text-site-text"
                      >
                        Other Inquiry
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] tracking-[0.2em] uppercase opacity-70 block">
                      Project Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-transparent border-b border-site-border focus:border-site-accent outline-none py-2 text-sm transition-colors duration-300 resize-none"
                      placeholder="Briefly describe the scope and objectives..."
                    ></textarea>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="group inline-flex items-center gap-4 border border-site-border-hover rounded-full px-8 py-4 hover:border-site-accent hover:bg-site-accent hover:text-site-bg transition-all duration-500 relative overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-site-accent opacity-0 group-hover:animate-pulse transition-opacity duration-300"></span>
                      <span className="text-xs tracking-[0.2em] uppercase relative z-10">
                        Transmit Request
                      </span>
                      <ArrowUpRight
                        size={14}
                        strokeWidth={2}
                        className="relative z-10"
                      />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
