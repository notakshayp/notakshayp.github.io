'use client';

import React, { useEffect, useRef, useState } from 'react';

export function GlassEffect() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  useEffect(() => {
    if (isMobile()) return;

    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    const animateCursor = () => {
      if (!cursorRef.current) return;

      const cursor = cursorRef.current;
      const currentX = parseFloat(cursor.style.left) || 0;
      const currentY = parseFloat(cursor.style.top) || 0;

      const dx = position.x - currentX;
      const dy = position.y - currentY;

      const smoothFactor = 0.1;
      const newX = currentX + dx * smoothFactor;
      const newY = currentY + dy * smoothFactor;

      cursor.style.left = `${newX}px`;
      cursor.style.top = `${newY}px`;
      requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animateCursor();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animateCursor);
    };
  }, [position]);

  if (isMobile()) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none rounded-full mix-blend-plus-lighter z-50"
      style={{
        width: '150px',
        height: '150px',
        left: '0px',
        top: '0px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        transition: 'all 0.1s ease-out',
      }}
    />
  );
}