// src/components/LiquidBackground.js
import { useEffect, useRef } from "react";

export default function LiquidBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let t = 0;

    const blobs = [
      { x: 0.2, y: 0.3, r: 320, hue: 260, speed: 0.0008 },
      { x: 0.7, y: 0.6, r: 280, hue: 190, speed: 0.0012 },
      { x: 0.5, y: 0.1, r: 250, hue: 300, speed: 0.001 },
      { x: 0.1, y: 0.8, r: 200, hue: 220, speed: 0.0015 },
      { x: 0.85, y: 0.2, r: 230, hue: 170, speed: 0.0009 },
    ];

    const onMouseMove = (e) => {
      mouse.current = { x: e.clientX / W, y: e.clientY / H };
    };

    const onScroll = () => {
      scroll.current = window.scrollY / (document.body.scrollHeight - H);
    };

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    function draw() {
      t++;
      ctx.clearRect(0, 0, W, H);

      // Background
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, `hsl(240,60%,5%)`);
      bg.addColorStop(0.5, `hsl(260,50%,7%)`);
      bg.addColorStop(1, `hsl(280,55%,6%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Floating blobs
      blobs.forEach((b, i) => {
        const mx = mouse.current.x;
        const my = mouse.current.y;
        const sx = scroll.current;

        const bx = (b.x + Math.sin(t * b.speed + i) * 0.15 + mx * 0.08) * W;
        const by = (b.y + Math.cos(t * b.speed * 0.7 + i * 1.3) * 0.12 + my * 0.06 + sx * 0.3) * H;

        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
        const alpha = 0.12 + Math.sin(t * 0.005 + i) * 0.04;
        grad.addColorStop(0, `hsla(${b.hue + t * 0.02},80%,60%,${alpha})`);
        grad.addColorStop(0.5, `hsla(${b.hue + 30 + t * 0.015},70%,50%,${alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${b.hue},60%,40%,0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Noise / grain overlay via micro-dots
      if (t % 3 === 0) {
        ctx.save();
        ctx.globalAlpha = 0.015;
        for (let n = 0; n < 200; n++) {
          const nx = Math.random() * W;
          const ny = Math.random() * H;
          ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
          ctx.fillRect(nx, ny, 1, 1);
        }
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="liquid-canvas"
      style={{ position: "fixed", top: 0, left: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
