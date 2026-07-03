import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './Preloader.module.css';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [progress, setProgress] = useState(0);

  useGSAP(() => {
    // Simulate loading progress
    const tl = gsap.timeline({
      onComplete: () => {
        // Slide up animation
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 1,
          ease: 'power4.inOut',
          onComplete,
        });
      },
    });

    // Dummy progress animation
    tl.to({ value: 0 }, {
      value: 100,
      duration: 2,
      ease: 'power2.out',
      onUpdate: function () {
        setProgress(Math.round(this.targets()[0].value));
      },
    });

    // Text reveal
    gsap.fromTo(textRef.current, 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={styles.preloader}>
      <div className={styles.counter}>
        <h1 ref={textRef}>{progress}%</h1>
      </div>
    </div>
  );
};
