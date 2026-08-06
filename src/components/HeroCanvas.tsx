'use client';

import React, { useEffect, useRef } from 'react';

export const HeroCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle class for smoke/dust mist & warp stars
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      maxLife: number;
      life: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.5 + 0.5;
        // Direction outward from center
        const angle = Math.atan2(this.y - height / 2, this.x - width / 2);
        const dist = Math.random() * 1.5 + 0.2;
        this.speedX = Math.cos(angle) * dist + (Math.random() - 0.5) * 0.4;
        this.speedY = Math.sin(angle) * dist + (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.7 + 0.1;
        this.maxLife = Math.random() * 300 + 100;
        this.life = 0;

        const colors = [
          'rgba(255, 255, 255, ',
          'rgba(180, 220, 255, ',
          'rgba(100, 180, 255, ',
          'rgba(200, 200, 255, ',
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || this.life > this.maxLife) {
          this.x = width / 2 + (Math.random() - 0.5) * 200;
          this.y = height / 2 + (Math.random() - 0.5) * 200;
          this.life = 0;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.8 + 0.2;
          this.speedX = Math.cos(angle) * speed;
          this.speedY = Math.sin(angle) * speed;
        }
      }

      draw() {
        if (!ctx) return;
        const fade = 1 - this.life / this.maxLife;
        const currentOpacity = this.opacity * fade;
        ctx.fillStyle = `${this.color}${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Subtle motion streak
        ctx.strokeStyle = `${this.color}${currentOpacity * 0.4})`;
        ctx.lineWidth = this.size * 0.8;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.speedX * 4, this.y - this.speedY * 4);
        ctx.stroke();
      }
    }

    const particles: Particle[] = [];
    const numParticles = Math.min(width < 768 ? 70 : 160, 200);
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    // Render loop
    const render = () => {
      ctx.fillStyle = 'rgba(13, 13, 13, 0.25)'; // Smooth motion trail blur
      ctx.fillRect(0, 0, width, height);

      // Central glowing ambient mist
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.45
      );
      gradient.addColorStop(0, 'rgba(40, 80, 140, 0.15)');
      gradient.addColorStop(0.5, 'rgba(20, 40, 70, 0.08)');
      gradient.addColorStop(1, 'rgba(13, 13, 13, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
