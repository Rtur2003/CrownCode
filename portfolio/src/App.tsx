import { useState } from 'react';
import { SmoothScroll } from './components/SmoothScroll';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { NoiseBackground } from './components/NoiseBackground';
import { ProjectList, type Project } from './components/ProjectList';
import { GLScene } from './gl/GLScene';

const DUMMY_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Aethelgard',
    category: 'E-Commerce / WebGL',
    year: '2026',
    imageUrl: 'https://picsum.photos/id/10/1024/1024',
  },
  {
    id: '2',
    title: 'Nova Sync',
    category: 'SaaS Platform',
    year: '2025',
    imageUrl: 'https://picsum.photos/id/20/1024/1024',
  },
  {
    id: '3',
    title: 'Oasis AI',
    category: 'Artificial Intelligence',
    year: '2026',
    imageUrl: 'https://picsum.photos/id/30/1024/1024',
  },
  {
    id: '4',
    title: 'Lumina',
    category: 'Brand Identity',
    year: '2024',
    imageUrl: 'https://picsum.photos/id/40/1024/1024',
  }
];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  return (
    <>
      <NoiseBackground />
      <CustomCursor />
      <GLScene activeImageUrl={activeImageUrl} />
      
      {isLoading && (
        <Preloader onComplete={() => setIsLoading(false)} />
      )}

      <SmoothScroll>
        <main className="container" style={{ paddingTop: '20vh', minHeight: '200vh' }}>
          <header style={{ marginBottom: '10vh' }}>
            <h1 style={{ fontSize: 'var(--text-display)', maxWidth: '800px', lineHeight: 1 }}>
              Creative Developer & Interactive Designer.
            </h1>
          </header>
          
          <section>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)', fontSize: 'var(--text-lg)' }}>
              Selected Works & Case Studies
            </p>
            <ProjectList 
              projects={DUMMY_PROJECTS} 
              onProjectHover={setActiveImageUrl} 
            />
          </section>
        </main>
      </SmoothScroll>
    </>
  );
}

export default App;
