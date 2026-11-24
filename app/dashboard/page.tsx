"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/* ──────────────────────── Types & Interfaces ──────────────────────── */
interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  size?: string;
  children?: FileNode[];
}

interface GraphNode {
  id: string;
  label: string;
  type: "entry" | "page" | "component" | "hook" | "controller" | "service" | "db" | "model" | "dto" | "api" | "config" | "util";
  layer: "Frontend" | "API / Hook" | "Backend Controller" | "Service Layer" | "Database Table" | "Model / Schema" | "Configuration";
  framework?: string;
  totalLines?: number;
  imports?: string[];
  exports?: string[];
  dependencies?: string[];
  usedBy?: string[];
  lastModified?: string;
  aiSummary?: string;
  performanceScore?: number;
  connections: string[];
  x: number;
  y: number;
}

interface GraphEdge {
  from: string;
  to: string;
}

interface ComprehensiveStats {
  totalFiles: number;
  components: number;
  pages: number;
  controllers: number;
  services: number;
  apis: number;
  hooks: number;
  routes: number;
  models: number;
  dtos: number;
  repositories: number;
  configFiles: number;
  dbTables: number;
  envFiles: number;
  dockerFiles: number;
  buildFiles: number;
  packageJsonCount: number;
  pomXmlCount: number;
  totalLinesOfCode: number;
  detectedFramework: string;
}

interface CodeIntelligenceReport {
  deadCodeCount: number;
  unusedFilesCount: number;
  unusedComponentsCount: number;
  circularDependencies: number;
  duplicateCodePercentage: number;
  missingImportsCount: number;
  performanceBottlenecks: number;
  securityIssuesCount: number;
  codeSmellsCount: number;
  complexityScore: number;
  maintainabilityScore: number;
  aiSuggestions: string[];
}

type UploadMode = "folder" | "files" | "zip" | "github" | "gitlab" | "bitbucket" | "paste";

/* ──────────────────────── Default / Parsed Sample Data ──────────────────────── */
const defaultStats: ComprehensiveStats = {
  totalFiles: 42,
  components: 12,
  pages: 5,
  controllers: 4,
  services: 4,
  apis: 8,
  hooks: 6,
  routes: 7,
  models: 6,
  dtos: 4,
  repositories: 4,
  configFiles: 3,
  dbTables: 5,
  envFiles: 2,
  dockerFiles: 1,
  buildFiles: 2,
  packageJsonCount: 1,
  pomXmlCount: 0,
  totalLinesOfCode: 6840,
  detectedFramework: "Next.js 14 / React (TypeScript)",
};

const defaultCodeIntelligence: CodeIntelligenceReport = {
  deadCodeCount: 2,
  unusedFilesCount: 1,
  unusedComponentsCount: 0,
  circularDependencies: 0,
  duplicateCodePercentage: 1.2,
  missingImportsCount: 0,
  performanceBottlenecks: 1,
  securityIssuesCount: 0,
  codeSmellsCount: 2,
  complexityScore: 14,
  maintainabilityScore: 94,
  aiSuggestions: [
    "Memoize expensive chart calculation in OverviewCard.tsx using useMemo()",
    "Consolidate duplicate Auth DTO interfaces into shared types/auth.ts",
    "Enable Next.js image optimization for 2 static avatar assets",
  ],
};

const defaultGraphNodes: GraphNode[] = [
  {
    id: "app_page",
    label: "page.tsx",
    type: "page",
    layer: "Frontend",
    framework: "Next.js",
    totalLines: 184,
    imports: ["React", "framer-motion", "OverviewTab", "useAuth"],
    exports: ["default Page"],
    dependencies: ["Header.tsx", "Dashboard.tsx", "useAuth.ts"],
    usedBy: ["App Router (/dashboard)"],
    lastModified: "2 mins ago",
    aiSummary: "Main dashboard entry page orchestrating overview analytics and live dependency visualizer.",
    performanceScore: 98,
    connections: ["header", "dashboard", "useAuth"],
    x: 80,
    y: 220,
  },
  {
    id: "header",
    label: "Header.tsx",
    type: "component",
    layer: "Frontend",
    framework: "React",
    totalLines: 96,
    imports: ["React", "useAuth", "ThemeToggle"],
    exports: ["Header"],
    dependencies: ["useAuth.ts"],
    usedBy: ["page.tsx"],
    lastModified: "1 hour ago",
    aiSummary: "Top navigation bar rendering project status badge, search, user menu, and theme toggles.",
    performanceScore: 99,
    connections: ["useAuth"],
    x: 250,
    y: 110,
  },
  {
    id: "dashboard",
    label: "Dashboard.tsx",
    type: "component",
    layer: "Frontend",
    framework: "React",
    totalLines: 310,
    imports: ["React", "useAnalytics", "FlowGraph"],
    exports: ["Dashboard"],
    dependencies: ["useAnalytics.ts"],
    usedBy: ["page.tsx"],
    lastModified: "10 mins ago",
    aiSummary: "Primary analytics view displaying system metrics, connection map table, and health gauges.",
    performanceScore: 94,
    connections: ["useAnalytics"],
    x: 250,
    y: 330,
  },
  {
    id: "useAuth",
    label: "useAuth.ts",
    type: "hook",
    layer: "API / Hook",
    framework: "TypeScript",
    totalLines: 82,
    imports: ["useState", "useEffect", "axios"],
    exports: ["useAuth"],
    dependencies: ["AuthController.ts"],
    usedBy: ["page.tsx", "Header.tsx"],
    lastModified: "Yesterday",
    aiSummary: "Authentication hook managing JWT tokens, user session state, and login endpoints.",
    performanceScore: 96,
    connections: ["authCtrl"],
    x: 430,
    y: 110,
  },
  {
    id: "useAnalytics",
    label: "useAnalytics.ts",
    type: "hook",
    layer: "API / Hook",
    framework: "TypeScript",
    totalLines: 112,
    imports: ["useState", "axios"],
    exports: ["useAnalytics"],
    dependencies: ["ProjectController.ts"],
    usedBy: ["Dashboard.tsx"],
    lastModified: "3 hours ago",
    aiSummary: "Analytics hook fetching project telemetry, code intelligence metrics, and graph nodes.",
    performanceScore: 95,
    connections: ["projCtrl"],
    x: 430,
    y: 330,
  },
  {
    id: "authCtrl",
    label: "AuthController.ts",
    type: "controller",
    layer: "Backend Controller",
    framework: "Node.js / Express",
    totalLines: 145,
    imports: ["express", "UserService", "JwtUtil"],
    exports: ["AuthControllerRouter"],
    dependencies: ["UserService.ts"],
    usedBy: ["useAuth.ts", "API Router (/api/auth)"],
    lastModified: "4 hours ago",
    aiSummary: "REST Controller handling POST /api/auth/login and user credential validation.",
    performanceScore: 97,
    connections: ["userSvc"],
    x: 620,
    y: 110,
  },
  {
    id: "projCtrl",
    label: "ProjectController.ts",
    type: "controller",
    layer: "Backend Controller",
    framework: "Node.js / Express",
    totalLines: 210,
    imports: ["express", "AnalyticsService", "ProjectService"],
    exports: ["ProjectControllerRouter"],
    dependencies: ["AnalyticsService.ts"],
    usedBy: ["useAnalytics.ts", "API Router (/api/projects)"],
    lastModified: "5 hours ago",
    aiSummary: "REST Controller exposing GET /api/projects/analytics and real-time dependency tree endpoints.",
    performanceScore: 93,
    connections: ["analyticSvc"],
    x: 620,
    y: 330,
  },
  {
    id: "userSvc",
    label: "UserService.ts",
    type: "service",
    layer: "Service Layer",
    framework: "TypeScript",
    totalLines: 168,
    imports: ["UserRepository", "BcryptUtil"],
    exports: ["UserService"],
    dependencies: ["usersDb"],
    usedBy: ["AuthController.ts"],
    lastModified: "Yesterday",
    aiSummary: "Core domain service managing user persistence, password hashing, and user roles.",
    performanceScore: 98,
    connections: ["usersDb"],
    x: 800,
    y: 110,
  },
  {
    id: "analyticSvc",
    label: "AnalyticsService.ts",
    type: "service",
    layer: "Service Layer",
    framework: "TypeScript",
    totalLines: 240,
    imports: ["ProjectRepository", "LogRepository"],
    exports: ["AnalyticsService"],
    dependencies: ["projectsDb", "logsDb"],
    usedBy: ["ProjectController.ts"],
    lastModified: "1 hour ago",
    aiSummary: "Service aggregating source code telemetry, LOC count, and dependency relationship maps.",
    performanceScore: 92,
    connections: ["projectsDb", "logsDb"],
    x: 800,
    y: 330,
  },
  {
    id: "usersDb",
    label: "users (DB)",
    type: "db",
    layer: "Database Table",
    framework: "PostgreSQL / Prisma",
    totalLines: 45,
    imports: ["PrismaSchema"],
    exports: ["UserTable"],
    dependencies: [],
    usedBy: ["UserService.ts"],
    lastModified: "3 days ago",
    aiSummary: "Database entity table storing user profiles, password hashes, and timestamps.",
    performanceScore: 100,
    connections: [],
    x: 970,
    y: 110,
  },
  {
    id: "projectsDb",
    label: "projects (DB)",
    type: "db",
    layer: "Database Table",
    framework: "PostgreSQL / Prisma",
    totalLines: 52,
    imports: ["PrismaSchema"],
    exports: ["ProjectTable"],
    dependencies: [],
    usedBy: ["AnalyticsService.ts"],
    lastModified: "2 days ago",
    aiSummary: "Database entity table storing uploaded project metadata, file trees, and AST maps.",
    performanceScore: 100,
    connections: [],
    x: 970,
    y: 270,
  },
  {
    id: "logsDb",
    label: "logs (DB)",
    type: "db",
    layer: "Database Table",
    framework: "PostgreSQL / Prisma",
    totalLines: 38,
    imports: ["PrismaSchema"],
    exports: ["LogTable"],
    dependencies: [],
    usedBy: ["AnalyticsService.ts"],
    lastModified: "1 day ago",
    aiSummary: "Database table recording real-time AI sync logs and build telemetry.",
    performanceScore: 100,
    connections: [],
    x: 970,
    y: 410,
  },
];

const defaultGraphEdges: GraphEdge[] = [
  { from: "app_page", to: "header" },
  { from: "app_page", to: "dashboard" },
  { from: "app_page", to: "useAuth" },
  { from: "header", to: "useAuth" },
  { from: "dashboard", to: "useAnalytics" },
  { from: "useAuth", to: "authCtrl" },
  { from: "useAnalytics", to: "projCtrl" },
  { from: "authCtrl", to: "userSvc" },
  { from: "projCtrl", to: "analyticSvc" },
  { from: "userSvc", to: "usersDb" },
  { from: "analyticSvc", to: "projectsDb" },
  { from: "analyticSvc", to: "logsDb" },
];

/* ──────────────────────── Top Bar Component ──────────────────────── */
function TopBar({
  projectName,
  framework,
  onOpenUpload,
}: {
  projectName: string;
  framework: string;
  onOpenUpload: () => void;
}) {
  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-white/[0.08] bg-black/90 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white to-white/60 text-black flex items-center justify-center font-bold text-xs shadow-lg shadow-white/10">
            TM
          </div>
          <span className="text-base font-bold text-white tracking-wide">TeamMerge Pro</span>
        </Link>
        {framework && (
          <span className="px-3 py-1 text-[11px] font-mono rounded-full bg-white/10 text-white/80 border border-white/15">
            {framework}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onOpenUpload}
          className="px-5 py-2 text-xs text-black bg-white font-bold rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg shadow-white/10 active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Project Source
        </button>
        <ThemeToggle />
        <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs">
          TM
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Node Hover Card (280ms Delay) ──────────────────────── */
function NodeHoverCard({ node, position }: { node: GraphNode; position: { x: number; y: number } }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed z-50 pointer-events-none w-72 rounded-2xl border border-white/20 bg-black/95 backdrop-blur-xl p-4 shadow-2xl space-y-3 font-sans text-xs text-white"
      style={{
        left: Math.min(position.x + 15, window.innerWidth - 300),
        top: Math.min(position.y + 15, window.innerHeight - 260),
      }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white" />
          <h4 className="font-bold text-sm text-white font-mono">{node.label}</h4>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-mono text-white/70">
          {node.layer}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div>
          <span className="text-white/40 block">Type:</span>
          <span className="text-white/80 font-medium capitalize">{node.type}</span>
        </div>
        <div>
          <span className="text-white/40 block">Framework:</span>
          <span className="text-white/80 font-medium">{node.framework || "TypeScript"}</span>
        </div>
        <div>
          <span className="text-white/40 block">Total Lines:</span>
          <span className="text-white/80 font-medium">{node.totalLines || 120} LOC</span>
        </div>
        <div>
          <span className="text-white/40 block">Perf Score:</span>
          <span className="text-emerald-400 font-bold">{node.performanceScore || 96}/100</span>
        </div>
      </div>

      {node.aiSummary && (
        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] text-white/60 leading-tight">
          <span className="text-white/40 font-mono block text-[10px] mb-0.5">AI Summary:</span>
          {node.aiSummary}
        </div>
      )}

      <div className="space-y-1 text-[10px] font-mono text-white/40 pt-1 border-t border-white/10">
        <div>Dependencies: <span className="text-white/70">{node.dependencies?.join(", ") || "None"}</span></div>
        <div>Consumers: <span className="text-white/70">{node.usedBy?.join(", ") || "None"}</span></div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────── Interactive Flow Graph ──────────────────────── */
function FlowGraph({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(
    Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y }]))
  );
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1100, h: 560 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleNodeMouseEnter = (node: GraphNode, e: React.MouseEvent) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setHoveredNode(node);
      setHoverPos({ x: clientX, y: clientY });
    }, 280);
  };

  const handleNodeMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredNode(null);
  };

  const getNodePos = useCallback(
    (id: string) => nodePositions[id] || { x: 0, y: 0 },
    [nodePositions]
  );

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    onSelectNode(nodeId);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggedNode || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = viewBox.w / rect.width;
      const scaleY = viewBox.h / rect.height;
      const x = (e.clientX - rect.left) * scaleX + viewBox.x;
      const y = (e.clientY - rect.top) * scaleY + viewBox.y;
      setNodePositions((prev) => ({ ...prev, [draggedNode]: { x, y } }));
    },
    [draggedNode, viewBox]
  );

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.layer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === "all" || n.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="relative w-full h-[520px] rounded-3xl border border-white/[0.1] bg-black/60 overflow-hidden font-sans select-none shadow-2xl">
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-black/80 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 bg-white/[0.05] px-3 py-1.5 rounded-xl border border-white/10 w-64">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search nodes or layers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-white/40 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-1 font-mono text-[11px] overflow-x-auto">
          {["all", "page", "component", "hook", "controller", "service", "db"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1 rounded-lg capitalize transition-all ${
                selectedTypeFilter === type
                  ? "bg-white text-black font-bold shadow-sm"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.05]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewBox((v) => ({ ...v, w: v.w * 0.85, h: v.h * 0.85 }))}
            className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 hover:text-white text-xs font-bold"
          >
            +
          </button>
          <button
            onClick={() => setViewBox((v) => ({ ...v, w: v.w * 1.15, h: v.h * 1.15 }))}
            className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 hover:text-white text-xs font-bold"
          >
            −
          </button>
          <button
            onClick={() => setViewBox({ x: 0, y: 0, w: 1100, h: 560 })}
            className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => onSelectNode(null)}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect fill="url(#grid)" width="100%" height="100%" />

        {edges.map((edge, i) => {
          const from = getNodePos(edge.from);
          const to = getNodePos(edge.to);
          const isHighlighted = selectedNode === edge.from || selectedNode === edge.to;
          return (
            <g key={i}>
              <line
                x1={from.x + 60}
                y1={from.y}
                x2={to.x - 60}
                y2={to.y}
                stroke={isHighlighted ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.14)"}
                strokeWidth={isHighlighted ? 2.5 : 1}
                strokeDasharray={isHighlighted ? "none" : "4,4"}
                style={{ transition: "all 0.3s ease" }}
              />
              {isHighlighted && (
                <circle cx={(from.x + to.x) / 2} cy={(from.y + to.y) / 2} r={3} fill="white" className="animate-ping" />
              )}
            </g>
          );
        })}

        {filteredNodes.map((node) => {
          const pos = getNodePos(node.id);
          const isSelected = selectedNode === node.id;
          const isConnected =
            selectedNode &&
            edges.some(
              (e) => (e.from === selectedNode && e.to === node.id) || (e.to === selectedNode && e.from === node.id)
            );
          const dimmed = selectedNode && !isSelected && !isConnected;

          return (
            <g
              key={node.id}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id);
              }}
              onMouseEnter={(e) => handleNodeMouseEnter(node, e)}
              onMouseLeave={handleNodeMouseLeave}
              className="cursor-pointer"
              style={{ transition: "opacity 0.3s ease" }}
              opacity={dimmed ? 0.25 : 1}
            >
              {isSelected && (
                <rect
                  x={pos.x - 70}
                  y={pos.y - 25}
                  width={140}
                  height={50}
                  rx={16}
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                  filter="url(#glow)"
                  opacity={0.6}
                />
              )}
              <rect
                x={pos.x - 62}
                y={pos.y - 20}
                width={124}
                height={40}
                rx={12}
                fill={isSelected ? "rgba(255,255,255,0.18)" : "rgba(18,18,18,0.92)"}
                stroke={isSelected ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.16)"}
                strokeWidth={isSelected ? 2 : 1}
                style={{ transition: "all 0.2s ease" }}
              />
              <circle cx={pos.x - 44} cy={pos.y} r={4.5} fill="white" opacity={isSelected ? 1 : 0.5} />
              <text
                x={pos.x + 5}
                y={pos.y + 4}
                textAnchor="middle"
                fill={isSelected ? "white" : "rgba(255,255,255,0.85)"}
                fontSize="11"
                fontWeight="500"
                fontFamily="monospace"
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-4 right-4 z-10 w-36 h-24 rounded-2xl border border-white/15 bg-black/80 backdrop-blur-md p-2 flex flex-col justify-between">
        <span className="text-[9px] font-mono text-white/40 uppercase">Mini Map Radar</span>
        <div className="relative w-full h-full bg-white/[0.02] rounded-lg border border-white/10 overflow-hidden">
          {nodes.map((n) => (
            <div
              key={n.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/60"
              style={{
                left: `${(n.x / 1100) * 100}%`,
                top: `${(n.y / 560) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {hoveredNode && <NodeHoverCard node={hoveredNode} position={hoverPos} />}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────── AI Code Intelligence Panel ──────────────────────── */
function AICodeIntelligencePanel({ report }: { report: CodeIntelligenceReport }) {
  const metrics = [
    { label: "Dead Code Detected", value: report.deadCodeCount, status: report.deadCodeCount === 0 ? "Clean" : "Review", icon: "🧹" },
    { label: "Unused Files", value: report.unusedFilesCount, status: report.unusedFilesCount === 0 ? "Clean" : "1 Orphan", icon: "📄" },
    { label: "Unused Components", value: report.unusedComponentsCount, status: "Clean", icon: "🧩" },
    { label: "Circular Dependencies", value: report.circularDependencies, status: "0 Risks", icon: "🔄" },
    { label: "Duplicate Code", value: `${report.duplicateCodePercentage}%`, status: "Low", icon: "📋" },
    { label: "Missing Imports", value: report.missingImportsCount, status: "Verified", icon: "🔗" },
    { label: "Performance Bottlenecks", value: report.performanceBottlenecks, status: "1 Optimization", icon: "⚡" },
    { label: "Security Issues", value: report.securityIssuesCount, status: "Secure", icon: "🛡️" },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-white/[0.1] bg-white/[0.02] p-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/50 uppercase font-mono block mb-1">Maintainability Index</span>
            <span className="text-3xl font-bold text-white tracking-tight">{report.maintainabilityScore}/100</span>
            <p className="text-xs text-emerald-400 font-mono mt-1">✓ Excellent modular architecture</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white flex items-center justify-center text-sm font-bold font-mono">
            {report.maintainabilityScore}%
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.1] bg-white/[0.02] p-6 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/50 uppercase font-mono block mb-1">Cyclomatic Complexity</span>
            <span className="text-3xl font-bold text-white tracking-tight">{report.complexityScore}</span>
            <p className="text-xs text-white/50 font-mono mt-1">Low cognitive complexity rating</p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white font-mono text-xs font-bold border border-white/15">
            Grade A+
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg">{m.icon}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                {m.status}
              </span>
            </div>
            <div>
              <span className="text-white/40 block text-[11px]">{m.label}</span>
              <span className="text-lg font-bold text-white">{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/[0.1] bg-white/[0.02] p-6 space-y-3 font-sans">
        <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
          <span>✨</span> AI Optimization Suggestions
        </h4>
        <div className="space-y-2 font-mono text-xs">
          {report.aiSuggestions.map((s, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white/80 flex items-start gap-2.5">
              <span className="text-white/50 mt-0.5">•</span>
              <p className="leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Overview Page Components (UPLOAD → ANALYZE → VISUALIZE) ──────────────────────── */

interface DetectedFormat {
  name: string;
  count: number;
  color: string;
}

interface CircularCategory {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
  details: string[];
}

const sampleCircularCategories: CircularCategory[] = [
  { id: "frontend", name: "Frontend", count: 42, percentage: 45, color: "#3b82f6", details: ["24 JSX / TSX", "10 CSS", "8 JavaScript"] },
  { id: "backend", name: "Backend", count: 28, percentage: 30, color: "#06b6d4", details: ["16 Java", "8 Controllers", "4 Services"] },
  { id: "pages", name: "Pages", count: 8, percentage: 9, color: "#8b5cf6", details: ["5 Next.js Pages", "3 App Routes"] },
  { id: "components", name: "Components", count: 14, percentage: 15, color: "#10b981", details: ["10 UI Components", "4 Layouts"] },
  { id: "apis", name: "APIs", count: 10, percentage: 11, color: "#f59e0b", details: ["6 REST Endpoints", "4 Internal Hooks"] },
  { id: "services", name: "Services", count: 6, percentage: 6, color: "#ec4899", details: ["4 Domain Services", "2 Auth Services"] },
  { id: "database", name: "Database", count: 5, percentage: 5, color: "#14b8a6", details: ["3 JPA Entities", "2 SQL Migrations"] },
  { id: "assets", name: "Assets", count: 6, percentage: 6, color: "#6366f1", details: ["4 SVGs", "2 PNG Assets"] },
  { id: "other", name: "Other", count: 3, percentage: 3, color: "#64748b", details: ["2 Config Files", "1 Dockerfile"] },
];

const sampleDetectedFormats: DetectedFormat[] = [
  { name: "JavaScript", count: 24, color: "#f59e0b" },
  { name: "TypeScript", count: 18, color: "#3b82f6" },
  { name: "Java", count: 16, color: "#ef4444" },
  { name: "CSS", count: 9, color: "#06b6d4" },
  { name: "JSON", count: 6, color: "#10b981" },
  { name: "SQL", count: 4, color: "#8b5cf6" },
  { name: "YAML", count: 3, color: "#ec4899" },
];

const sampleDetectedTech = [
  { name: "React", icon: "⚛️" },
  { name: "Spring Boot", icon: "🍃" },
  { name: "Node.js", icon: "🟢" },
  { name: "MySQL", icon: "🐬" },
  { name: "Docker", icon: "🐳" },
  { name: "Maven", icon: "📦" },
];

/* ──────────────────────── Top Upload Section ──────────────────────── */
function TopUploadSection({
  onStartAnalysis,
}: {
  onStartAnalysis: (detectedType?: string) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [gitMode, setGitMode] = useState(false);
  const [gitUrl, setGitUrl] = useState("");

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);
  const zipInputRef = useRef<HTMLInputElement | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onStartAnalysis("Full-Stack Project (Detected)");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      let detectedFramework = "React (TypeScript)";
      if (files.some((f) => f.name === "pom.xml")) detectedFramework = "Spring Boot / Java";
      else if (files.some((f) => f.name === "package.json")) detectedFramework = "Next.js / Node.js";
      onStartAnalysis(detectedFramework);
    }
  };

  return (
    <div className="w-full space-y-6">
      <input type="file" ref={folderInputRef} onChange={handleFileChange} className="hidden" multiple />
      <input type="file" ref={filesInputRef} onChange={handleFileChange} className="hidden" multiple />
      <input type="file" ref={zipInputRef} onChange={handleFileChange} className="hidden" accept=".zip,.tar,.gz,.rar" />

      {/* Main Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 relative overflow-hidden backdrop-blur-xl ${
          dragActive
            ? "border-blue-500 bg-blue-500/10 scale-[1.01] shadow-2xl shadow-blue-500/20"
            : "border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"
        }`}
      >
        <div className="max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Upload Your Project
            </h2>
            <p className="text-sm text-white/50 mt-1 font-mono">
              Drag & drop files or folders here
            </p>
          </div>

          <p className="text-xs text-white/40 leading-relaxed">
            Supports multiple source code files (<span className="text-white/70">.tsx, .ts, .jsx, .js, .java, .py, .go, .sql, .json, .css</span>, etc.) or folders. ZIP is optional.
          </p>

          {/* 4 Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => filesInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              📄 Upload Files
            </button>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              📁 Upload Folder
            </button>
            <button
              onClick={() => zipInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-medium text-xs transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              📦 Upload ZIP
            </button>
            <button
              onClick={() => setGitMode(!gitMode)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95"
            >
              🐙 Import Git Repository
            </button>
          </div>

          {/* Git Import URL Drawer */}
          <AnimatePresence>
            {gitMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 space-y-3"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://github.com/username/repository.git"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-black/70 border border-white/20 text-white placeholder-white/30 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => onStartAnalysis("GitHub Repository Sync")}
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-all shadow-md"
                  >
                    Import & Parse ➔
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── AI Analysis Progress Indicator ──────────────────────── */
function AIAnalysisProgress({
  progress,
  stage,
}: {
  progress: number;
  stage: string;
}) {
  const steps = [
    "Scanning Files",
    "Detecting File Types",
    "Detecting Framework",
    "Analyzing Source Code",
    "Finding Dependencies",
    "Detecting Pages",
    "Detecting APIs",
    "Detecting Database",
    "Building Project Structure",
    "Analysis Complete ✓",
  ];

  const currentStepIdx = Math.min(
    Math.floor((progress / 100) * steps.length),
    steps.length - 1
  );

  return (
    <div className="w-full rounded-3xl border border-white/15 bg-black/90 backdrop-blur-xl p-10 space-y-8 text-center shadow-2xl">
      <div className="relative w-32 h-32 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#progress-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 42}
            strokeDashoffset={(1 - progress / 100) * 2 * Math.PI * 42}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-extrabold text-white font-mono">{Math.round(progress)}%</span>
          <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">AI PARSING</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white tracking-tight">AI Code Analysis & Structure Extraction</h3>
        <p className="text-xs text-blue-400 font-mono animate-pulse">{stage || steps[currentStepIdx]}</p>
      </div>

      {/* Sequential Analysis Checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-3xl mx-auto pt-2 font-mono text-[11px]">
        {steps.map((stepName, i) => {
          const isDone = i < currentStepIdx || progress === 100;
          const isCurrent = i === currentStepIdx && progress < 100;
          return (
            <div
              key={stepName}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                isDone
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : isCurrent
                  ? "bg-blue-500/15 border-blue-500/40 text-blue-300 animate-pulse"
                  : "bg-white/[0.02] border-white/5 text-white/30"
              }`}
            >
              <span className="text-xs shrink-0">{isDone ? "✓" : isCurrent ? "⚡" : "○"}</span>
              <span className="truncate">{stepName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────── Circular Analytics Component ──────────────────────── */
function CircularAnalyticsSection({
  categories,
  onCategoryClick,
}: {
  categories: CircularCategory[];
  onCategoryClick: (categoryName: string) => void;
}) {
  const [hoveredCategory, setHoveredCategory] = useState<CircularCategory | null>(null);

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">
            Interactive Codebase Breakdown
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Circular Analytics & Layer Composition
          </h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/70 font-mono">
          Hover for file details • Click to filter
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* SVG Donut Visualizer */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {categories.map((cat, idx) => {
                const strokeDash = (cat.percentage / 100) * (2 * Math.PI * 38);
                const strokeOffset = categories
                  .slice(0, idx)
                  .reduce((acc, c) => acc - (c.percentage / 100) * (2 * Math.PI * 38), 0);

                return (
                  <circle
                    key={cat.id}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={cat.color}
                    strokeWidth="10"
                    strokeDasharray={`${strokeDash} ${2 * Math.PI * 38 - strokeDash}`}
                    strokeDashoffset={strokeOffset}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80"
                    onMouseEnter={() => setHoveredCategory(cat)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => onCategoryClick(cat.name)}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
              <span className="text-3xl font-extrabold text-white font-mono">
                {hoveredCategory ? hoveredCategory.count : totalCount}
              </span>
              <span className="text-xs font-mono text-white/60 uppercase">
                {hoveredCategory ? hoveredCategory.name : "Total Files"}
              </span>
              {hoveredCategory && (
                <span className="text-[10px] text-blue-400 font-mono mt-1 font-bold">
                  {hoveredCategory.percentage}% of project
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Categories Grid List */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onCategoryClick(cat.name)}
              onMouseEnter={() => setHoveredCategory(cat)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                hoveredCategory?.id === cat.id
                  ? "bg-white/[0.08] border-white/30 scale-[1.02] shadow-xl"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-bold text-white">{cat.name}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="font-bold text-white">{cat.count}</span>
                  <span className="text-white/40">({cat.percentage}%)</span>
                </div>
              </div>

              {/* Detail breakdown pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {cat.details.map((d, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/70 font-mono"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── AI Project Structure Preview ──────────────────────── */
function AIProjectStructurePreview({
  onNavigate,
}: {
  onNavigate: (filterContext: string) => void;
}) {
  const structure = [
    {
      layer: "Frontend",
      color: "border-blue-500/30 bg-blue-500/5",
      items: [
        { name: "Pages", count: "5 files", icon: "📄" },
        { name: "Components", count: "12 files", icon: "🧩" },
        { name: "Services", count: "4 files", icon: "🛠️" },
        { name: "Assets", count: "5 files", icon: "🎨" },
      ],
    },
    {
      layer: "Backend",
      color: "border-cyan-500/30 bg-cyan-500/5",
      items: [
        { name: "Controllers", count: "4 files", icon: "⚡" },
        { name: "Services", count: "4 files", icon: "🛠️" },
        { name: "Repositories", count: "4 files", icon: "🗄️" },
        { name: "Models", count: "6 files", icon: "📐" },
      ],
    },
    {
      layer: "Database",
      color: "border-emerald-500/30 bg-emerald-500/5",
      items: [
        { name: "Entities", count: "5 tables", icon: "📊" },
        { name: "SQL Migrations", count: "2 files", icon: "📝" },
      ],
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
            Parsed Hierarchy Preview
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            AI Project Structure Preview
          </h3>
        </div>
        <span className="text-xs text-white/50 font-mono">
          Compact Overview • Click layer to view files
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        {structure.map((block) => (
          <div
            key={block.layer}
            className={`p-5 rounded-2xl border ${block.color} space-y-4`}
          >
            <div
              onClick={() => onNavigate(block.layer)}
              className="flex items-center justify-between border-b border-white/10 pb-3 cursor-pointer hover:opacity-80"
            >
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                📁 {block.layer}
              </h4>
              <span className="text-[10px] text-white/50 uppercase">Explore ➔</span>
            </div>

            <div className="space-y-2">
              {block.items.map((item) => (
                <div
                  key={item.name}
                  onClick={() => onNavigate(item.name)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-colors cursor-pointer text-white/80 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </span>
                  <span className="text-[10px] text-white/40">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────── File Explorer View (Interactive Destination) ──────────────────────── */
function FileExplorerView({
  filterContext,
  onClearFilter,
}: {
  filterContext: string | null;
  onClearFilter: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const sampleFiles = [
    { name: "page.tsx", layer: "Frontend", category: "Pages", format: "TypeScript", size: "4.2 KB" },
    { name: "Header.tsx", layer: "Frontend", category: "Components", format: "TypeScript", size: "2.8 KB" },
    { name: "Sidebar.tsx", layer: "Frontend", category: "Components", format: "TypeScript", size: "3.5 KB" },
    { name: "AuthController.java", layer: "Backend", category: "Controllers", format: "Java", size: "5.1 KB" },
    { name: "ProjectController.java", layer: "Backend", category: "Controllers", format: "Java", size: "6.4 KB" },
    { name: "UserService.java", layer: "Backend", category: "Services", format: "Java", size: "4.8 KB" },
    { name: "AnalyticsService.java", layer: "Backend", category: "Services", format: "Java", size: "7.2 KB" },
    { name: "User.java", layer: "Database", category: "Entities", format: "Java", size: "2.1 KB" },
    { name: "Project.java", layer: "Database", category: "Entities", format: "Java", size: "3.0 KB" },
    { name: "V1__init_schema.sql", layer: "Database", category: "SQL", format: "SQL", size: "1.5 KB" },
    { name: "application.yaml", layer: "Backend", category: "Config", format: "YAML", size: "850 B" },
    { name: "package.json", layer: "Frontend", category: "Config", format: "JSON", size: "1.2 KB" },
    { name: "styles.css", layer: "Frontend", category: "CSS", format: "CSS", size: "4.5 KB" },
  ];

  const filtered = sampleFiles.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!filterContext) return matchesSearch;
    const ctx = filterContext.toLowerCase();
    const matchesCtx =
      f.layer.toLowerCase().includes(ctx) ||
      f.category.toLowerCase().includes(ctx) ||
      f.format.toLowerCase().includes(ctx) ||
      f.name.toLowerCase().includes(ctx);
    return matchesSearch && matchesCtx;
  });

  return (
    <div className="w-full space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold">
              TeamMerge Pro File Explorer
            </span>
            {filterContext && (
              <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px] border border-blue-400/30">
                Filtered: {filterContext}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Project Files & Code Inspection
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {filterContext && (
            <button
              onClick={onClearFilter}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/15 transition-all"
            >
              Clear Filter ✕
            </button>
          )}
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-xl bg-black border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-blue-500 w-48"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/90 p-6 overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 border-b border-white/10 font-mono text-xs text-white/50 uppercase">
          <div className="col-span-5">File Name</div>
          <div className="col-span-3">Layer / Category</div>
          <div className="col-span-2">Format</div>
          <div className="col-span-2 text-right">Size</div>
        </div>

        <div className="divide-y divide-white/5 font-mono text-xs">
          {filtered.length > 0 ? (
            filtered.map((file, idx) => (
              <div key={idx} className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-white/[0.04] transition-colors text-white/80">
                <div className="col-span-5 font-bold text-white flex items-center gap-2 truncate">
                  <span>📄</span>
                  <span>{file.name}</span>
                </div>
                <div className="col-span-3 text-white/60 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">
                    {file.layer}
                  </span>
                  <span>{file.category}</span>
                </div>
                <div className="col-span-2 text-blue-400 font-semibold">{file.format}</div>
                <div className="col-span-2 text-right text-white/40">{file.size}</div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-white/40 font-mono">
              No files found matching filter query "{filterContext || searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Left Sidebar Navigation Component ──────────────────────── */
interface SidebarItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  isPrimary?: boolean;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

function Sidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}: {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const sections: SidebarSection[] = [
    {
      title: "PROJECT",
      items: [
        {
          id: "overview",
          name: "Overview",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          ),
        },
        {
          id: "project-structure",
          name: "Project Structure",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          ),
        },
        {
          id: "file-explorer",
          name: "File Explorer",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "ANALYSIS",
      items: [
        {
          id: "dependency-map",
          name: "Dependency Map",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="3" x2="6" y2="15" />
              <circle cx="18" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
          ),
        },
        {
          id: "page-flow",
          name: "Page & Navigation Flow",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          ),
        },
        {
          id: "api-db-map",
          name: "API & Database Map",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          ),
        },
        {
          id: "ai-analysis",
          name: "AI Code Intelligence",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <line x1="9" y1="1" x2="9" y2="4" />
              <line x1="15" y1="1" x2="15" y2="4" />
              <line x1="9" y1="20" x2="9" y2="23" />
              <line x1="15" y1="20" x2="15" y2="23" />
              <line x1="20" y1="9" x2="23" y2="9" />
              <line x1="20" y1="15" x2="23" y2="15" />
              <line x1="1" y1="9" x2="4" y2="9" />
              <line x1="1" y1="15" x2="4" y2="15" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "BUILD & VALIDATE",
      items: [
        {
          id: "live-preview",
          name: "Live Preview",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ),
        },
        {
          id: "changes-validation",
          name: "Changes & Validation",
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          ),
        },
        {
          id: "generate",
          name: "Generate Project",
          isPrimary: true,
          icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          ),
        },
      ],
    },
  ];

  const bottomItems = [
    {
      id: "settings",
      name: "Settings",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      id: "help",
      name: "Help",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } border-r border-white/10 dark:border-white/10 light:border-black/10 bg-black/90 dark:bg-black/90 light:bg-slate-50 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 z-40 shrink-0 select-none h-[calc(100vh-4rem)] sticky top-16`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Sidebar Header & Toggle */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-white/10 dark:border-white/10 light:border-black/10 shrink-0">
          {!collapsed && (
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 dark:text-white/50 light:text-slate-500">
              Menu Navigation
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/10 transition-colors ml-auto"
            title="Toggle Sidebar"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {sections.map((section, sIdx) => (
            <div key={section.title} className="space-y-1">
              {!collapsed ? (
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-white/40 dark:text-white/40 light:text-slate-400">
                  {section.title}
                </div>
              ) : (
                sIdx > 0 && <div className="my-2 border-t border-white/10 dark:border-white/10 light:border-black/10" />
              )}

              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                if (item.isPrimary) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 text-left font-medium ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20 border border-blue-400/40"
                          : "bg-blue-600/15 text-blue-400 dark:text-blue-400 light:text-blue-600 hover:bg-blue-600/25 hover:text-blue-300 border border-blue-500/30"
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <span className="truncate flex-1 flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            Final
                          </span>
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-150 text-left ${
                      isActive
                        ? "bg-white/15 dark:bg-white/15 light:bg-black/10 text-white dark:text-white light:text-slate-900 font-semibold border border-white/20 dark:border-white/20 light:border-black/20 shadow-xs"
                        : "text-white/60 dark:text-white/60 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/[0.06] dark:hover:bg-white/[0.06] light:hover:bg-black/[0.05]"
                    }`}
                    title={collapsed ? item.name : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/10 dark:border-white/10 light:border-black/10 space-y-1 shrink-0">
          {bottomItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all text-left ${
                  isActive
                    ? "bg-white/15 dark:bg-white/15 light:bg-black/10 text-white dark:text-white light:text-slate-900 font-semibold border border-white/20"
                    : "text-white/60 dark:text-white/60 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/[0.06]"
                }`}
                title={collapsed ? item.name : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </button>
            );
          })}

          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-white/60 dark:text-white/60 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-white/[0.06] transition-colors"
            title={collapsed ? "Back to Home" : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {!collapsed && <span>Back to Home</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}

/* ──────────────────────── Main Unified Dashboard View ──────────────────────── */
export default function DashboardPage() {
  const [hasProject, setHasProject] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [explorerFilter, setExplorerFilter] = useState<string | null>(null);

  const [stats, setStats] = useState<ComprehensiveStats>(defaultStats);
  const [report, setReport] = useState<CodeIntelligenceReport>(defaultCodeIntelligence);
  const [categories] = useState<CircularCategory[]>(sampleCircularCategories);
  const [detectedFormats] = useState<DetectedFormat[]>(sampleDetectedFormats);
  const [detectedTech] = useState(sampleDetectedTech);

  const summaryCards = [
    { label: "Total Files", value: stats.totalFiles, icon: "📁", filterKey: "Total Files" },
    { label: "Pages", value: stats.pages, icon: "📄", filterKey: "Pages" },
    { label: "Components", value: stats.components, icon: "🧩", filterKey: "Components" },
    { label: "APIs", value: stats.apis, icon: "🌐", filterKey: "APIs" },
    { label: "Services", value: stats.services, icon: "🛠️", filterKey: "Services" },
    { label: "Database", value: `${stats.dbTables} Tables`, icon: "📊", filterKey: "Database" },
    { label: "Configuration", value: stats.configFiles, icon: "⚙️", filterKey: "Config" },
    { label: "Assets", value: 5, icon: "🎨", filterKey: "Assets" },
  ];

  const handleStartAnalysis = (detectedType = "React / Next.js / Java Spring Boot") => {
    setIsAnalyzing(true);
    let p = 0;
    const stages = [
      "Scanning Files",
      "Detecting File Types",
      "Detecting Framework",
      "Analyzing Source Code",
      "Finding Dependencies",
      "Detecting Pages",
      "Detecting APIs",
      "Detecting Database",
      "Building Project Structure",
      "Analysis Complete ✓",
    ];
    let stageIdx = 0;

    const interval = setInterval(() => {
      p += Math.random() * 9 + 4;
      if (p > 100) p = 100;
      setProgress(p);

      if (p > (stageIdx + 1) * (100 / stages.length)) {
        stageIdx = Math.min(stageIdx + 1, stages.length - 1);
      }
      setStage(stages[stageIdx]);

      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          setHasProject(true);
          setStats({
            ...defaultStats,
            detectedFramework: detectedType,
          });
        }, 500);
      }
    }, 150);
  };

  const handleNavigateToFileExplorer = (filterContext: string) => {
    setExplorerFilter(filterContext);
    setActiveTab("file-explorer");
  };

  const getSectionTitle = () => {
    switch (activeTab) {
      case "overview": return "Overview Dashboard";
      case "project-structure": return "Project Structure";
      case "file-explorer": return "File Explorer";
      case "dependency-map": return "Dependency Map";
      case "page-flow": return "Page & Navigation Flow";
      case "api-db-map": return "API & Database Map";
      case "ai-analysis": return "AI Code Intelligence";
      case "live-preview": return "Live Preview";
      case "changes-validation": return "Changes & Validation";
      case "generate": return "Generate Project";
      case "settings": return "Settings";
      case "help": return "Help";
      default: return "Overview";
    }
  };

  return (
    <div className="min-h-screen bg-black dark:bg-black light:bg-slate-100 text-white dark:text-white light:text-slate-900 font-sans transition-colors duration-300 select-none flex flex-col">
      {/* Clean Top Bar Header */}
      <TopBar
        projectName="TeamMerge-Pro-Dev-Hub"
        framework={hasProject ? stats.detectedFramework : ""}
        onOpenUpload={() => {
          setHasProject(false);
          setActiveTab("overview");
        }}
      />

      {/* Main Workspace Body with Left Sidebar */}
      <div className="flex flex-1 w-full min-h-[calc(100vh-4rem)]">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tabId) => {
            setActiveTab(tabId);
            if (tabId !== "file-explorer") setExplorerFilter(null);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 px-8 py-8 space-y-8 overflow-y-auto max-w-7xl">
          {activeTab === "file-explorer" ? (
            /* Dedicated File Explorer View */
            <FileExplorerView
              filterContext={explorerFilter}
              onClearFilter={() => setExplorerFilter(null)}
            />
          ) : activeTab !== "overview" ? (
            /* Other Workflow Panels */
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-white/15 bg-white/[0.03] p-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-white/50 uppercase tracking-widest">
                    TeamMerge Pro Workflow Step
                  </span>
                  <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
                    {getSectionTitle()}
                  </h2>
                </div>
                {activeTab === "generate" && (
                  <span className="px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold font-mono border border-blue-400/40">
                    ⚡ FINAL WORKFLOW STEP
                  </span>
                )}
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                This workflow section is fully connected. Select <strong>Overview</strong> to return to the project analysis pipeline.
              </p>
            </motion.div>
          ) : (
            /* ──────────────────────── OVERVIEW PAGE (UPLOAD → ANALYZE → VISUALIZE) ──────────────────────── */
            <div className="space-y-8">
              {/* 1. TOP UPLOAD SECTION or ANALYSIS ANIMATION */}
              {isAnalyzing ? (
                <AIAnalysisProgress progress={progress} stage={stage} />
              ) : (
                <TopUploadSection onStartAnalysis={handleStartAnalysis} />
              )}

              {/* 2. DETECTED PROJECT SUMMARY CARDS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider text-white/50">
                    3. Detected Project Summary (8 Core Metrics)
                  </h3>
                  <span className="text-[11px] text-white/40 font-mono">Click card to open in File Explorer</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                  {summaryCards.map((card, i) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleNavigateToFileExplorer(card.filterKey)}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer space-y-1 shadow-sm group"
                    >
                      <div className="flex items-center justify-between text-white/40 group-hover:text-blue-400">
                        <span className="text-xl">{card.icon}</span>
                        <span className="text-[10px]">EXPLORE ➔</span>
                      </div>
                      <p className="text-2xl font-extrabold text-white tracking-tight pt-1">{card.value}</p>
                      <p className="text-xs text-white/60 font-sans font-medium">{card.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 3. CIRCULAR ANALYTICS SECTION */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider text-white/50">
                  4. Circular Analytics & Code Composition
                </h3>
                <CircularAnalyticsSection
                  categories={categories}
                  onCategoryClick={handleNavigateToFileExplorer}
                />
              </div>

              {/* 4. DETECTED FILE FORMATS & TECHNOLOGIES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Formats */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>📊</span> 5. Detected File Formats
                    </h4>
                    <span className="text-[10px] text-white/40 font-mono">Click to filter</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detectedFormats.map((fmt) => (
                      <button
                        key={fmt.name}
                        onClick={() => handleNavigateToFileExplorer(fmt.name)}
                        className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-blue-500/15 border border-white/10 hover:border-blue-500/30 text-xs font-mono text-white/80 hover:text-white transition-all flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fmt.color }} />
                        <span>{fmt.name}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white">
                          {fmt.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>⚡</span> Detected Stack Technologies
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Auto-Indexed</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detectedTech.map((tech) => (
                      <button
                        key={tech.name}
                        onClick={() => handleNavigateToFileExplorer(tech.name)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-mono text-emerald-300 transition-all flex items-center gap-2"
                      >
                        <span>{tech.icon}</span>
                        <span className="font-bold">{tech.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. AI PROJECT STRUCTURE PREVIEW */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider text-white/50">
                  6. AI Project Structure Preview (Compact Overview)
                </h3>
                <AIProjectStructurePreview onNavigate={handleNavigateToFileExplorer} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


