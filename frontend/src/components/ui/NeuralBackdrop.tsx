import React, { useEffect, useRef } from 'react';

const NeuralBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const density = window.innerWidth < 768 ? 40 : 80;
      for (let i = 0; i < density; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
        const particleCount = particles.length;
        const maxDist = 150;
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < particleCount; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < particleCount; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                
                // Fast distance check (AABB)
                if (Math.abs(dx) < maxDist && Math.abs(dy) < maxDist) {
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 22500) { // 150 * 150
                        const distance = Math.sqrt(distSq);
                        const opacity = 0.1 * (1 - distance / maxDist);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        }
    }

    window.addEventListener('resize', resize);
    resize();
    
    const render = () => {
        ctx.fillStyle = 'rgba(2, 2, 3, 0.2)'; // Neural trail effect
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[-1] bg-[#020203]" 
    />
  );
};

export default NeuralBackdrop;
