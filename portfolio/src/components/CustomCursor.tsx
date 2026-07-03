import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './CustomCursor.module.css';
import { cn } from '../utils/cn';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);
  const [hoverState, setHoverState] = useState<'default' | 'view' | 'hidden'>('default');
  const [hasMoved, setHasMoved] = useState(false);

  // GSAP context for the cursor movement
  useGSAP(() => {
    // We only set up the GSAP quickSetters once
    const xTo = gsap.quickTo(cursorRef.current, 'x', { duration: 0.15, ease: 'power3' });
    const yTo = gsap.quickTo(cursorRef.current, 'y', { duration: 0.15, ease: 'power3' });

    const moveCursor = (e: MouseEvent) => {
      if (!hasMoved) setHasMoved(true);
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, { scope: cursorRef });

  // Handle state changes when hovering interactive elements
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // If the target or any of its parents has 'data-cursor' attribute
      const cursorTarget = target.closest('[data-cursor]') as HTMLElement;
      
      if (cursorTarget) {
        const type = cursorTarget.getAttribute('data-cursor');
        if (type === 'view') {
          setHoverState('view');
        } else if (type === 'hidden') {
          setHoverState('hidden');
        }
      } else if (target.closest('a') || target.closest('button')) {
        setHoverState('view'); // Or any other state for links
      } else {
        setHoverState('default');
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    return () => window.removeEventListener('mouseover', handleMouseOver);
  }, []);

  // Animate scale/state changes
  useGSAP(() => {
    if (!cursorRef.current) return;
    
    if (hoverState === 'view') {
      gsap.to(cursorRef.current, {
        width: 80,
        height: 80,
        backgroundColor: 'var(--color-accent)',
        duration: 0.3,
        ease: 'power2.out',
      });
      if (cursorTextRef.current) {
        gsap.to(cursorTextRef.current, { opacity: 1, scale: 1, duration: 0.2, delay: 0.1 });
      }
    } else if (hoverState === 'hidden') {
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.3,
      });
    } else {
      // Default state
      gsap.to(cursorRef.current, {
        width: 16,
        height: 16,
        backgroundColor: 'var(--color-text-primary)',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      if (cursorTextRef.current) {
        gsap.to(cursorTextRef.current, { opacity: 0, scale: 0.5, duration: 0.2 });
      }
    }
  }, [hoverState]);

  return (
    <div
      ref={cursorRef}
      className={cn(styles.cursor, !hasMoved && styles.hidden)}
    >
      <div ref={cursorTextRef} className={styles.cursorText}>
        View
      </div>
    </div>
  );
};
