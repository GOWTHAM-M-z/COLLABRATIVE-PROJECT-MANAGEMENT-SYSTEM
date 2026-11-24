"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme-context";

interface Dot {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export function SpringDotsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDots();
    };

    window.addEventListener("resize", handleResize);

    // Mouse tracking
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 120,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Create Dots Grid
    let dots: Dot[] = [];
    const spacing = 35; // distance between dots

    const initDots = () => {
      dots = [];
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * spacing - spacing / 2;
          const baseY = j * spacing - spacing / 2;
          dots.push({
            baseX,
            baseY,
            x: baseX,
            y: baseY,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.5 + 1.5,
            color: theme === "light" ? "rgba(0, 0, 0, " : "rgba(255, 255, 255, ",
          });
        }
      }
    };

    initDots();

    // Physics parameters
    const springStrength = 0.08;
    const damping = 0.82;
    const repelStrength = 4.5;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isLight = theme === "light";
      const baseColorPrefix = isLight ? "rgba(0, 0, 0, " : "rgba(255, 255, 255, ";

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Distance to mouse
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Repel force when mouse is near
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * repelStrength;
          const angle = Math.atan2(dy, dx);
          dot.vx -= Math.cos(angle) * force;
          dot.vy -= Math.sin(angle) * force;
        }

        // Spring force pulling back to base position
        const springDx = dot.baseX - dot.x;
        const springDy = dot.baseY - dot.y;

        dot.vx += springDx * springStrength;
        dot.vy += springDy * springStrength;

        // Apply damping
        dot.vx *= damping;
        dot.vy *= damping;

        // Move dot
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Calculate opacity based on displacement and mouse proximity
        const displacement = Math.sqrt(
          (dot.x - dot.baseX) ** 2 + (dot.y - dot.baseY) ** 2
        );
        
        let opacity = 0.15 + (displacement / 20) * 0.5;
        if (dist < mouse.radius) {
          opacity += (1 - dist / mouse.radius) * 0.6;
        }
        opacity = Math.min(Math.max(opacity, 0.12), 0.9);

        // Draw dot
        ctx.fillStyle = `${baseColorPrefix}${opacity.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size + (dist < mouse.radius ? 1 : 0), 0, Math.PI * 2);
        ctx.fill();

        // Draw spring connection lines if mouse is close
        if (dist < mouse.radius * 0.8) {
          const lineOpacity = (1 - dist / (mouse.radius * 0.8)) * 0.25;
          ctx.strokeStyle = `${baseColorPrefix}${lineOpacity.toFixed(2)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-colors duration-500"
    />
  );
}
