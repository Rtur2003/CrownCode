import { lazy, Suspense, useState } from 'react';
import { SmoothScroll } from './components/SmoothScroll';
import { CustomCursor } from './components/CustomCursor';
import { Preloader } from './components/Preloader';
import { NoiseBackground } from './components/NoiseBackground';
import { ProjectList, type Project } from './components/ProjectList';

// three + drei ~874 kB. Dekoratif katman ilk boyamayi bloklamasin;
// preloader zaten gorunurken arkada yuklenir.
const GLScene = lazy(() =>
  import('./gl/GLScene').then((m) => ({ default: m.GLScene }))
);

const CROWNCODE_PROJECTS: Project[] = [
  {
    id: 'noir-grain',
    title: 'Noir & Grain',
    category: 'Fine Dining / WebGL Template',
    year: '2026',
    imageUrl: '/images/noir-grain.jpg',
  },
  {
    id: 'auris',
    title: 'AURIS Engine',
    category: 'AI / Deep Learning',
    year: '2026',
    imageUrl: '/images/auris.png',
  },
  {
    id: 'dreams',
    title: 'Crown Dreams',
    category: 'Neural Journal / AI',
    year: '2025',
    imageUrl: '/images/dreams.png',
  },
  {
    id: 'commend',
    title: 'Crown Commend',
    category: 'GenAI / Automation',
    year: '2026',
    imageUrl: '/images/commend.png',
  },
  {
    id: 'vote',
    title: 'VOTRYX',
    category: 'Selenium / Automation',
    year: '2024',
    imageUrl: '/images/vote.png',
  }
];

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  return (
    <>
      <NoiseBackground />
      <CustomCursor />
      <Suspense fallback={null}>
        <GLScene activeImageUrl={activeImageUrl} />
      </Suspense>
      
      {isLoading && (
        <Preloader onComplete={() => setIsLoading(false)} />
      )}

      <SmoothScroll>
        <main className="container" style={{ paddingTop: '20vh', minHeight: '200vh' }}>
          <header style={{ marginBottom: '10vh' }}>
            <h1 style={{ fontSize: 'var(--text-display)', maxWidth: '900px', lineHeight: 1 }}>
              Engineering Intelligence &amp; Crafting Digital Experiences.
            </h1>
          </header>
          
          <section>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)', fontSize: 'var(--text-lg)' }}>
              Selected Works & Case Studies
            </p>
            <ProjectList 
              projects={CROWNCODE_PROJECTS} 
              onProjectHover={setActiveImageUrl} 
            />
          </section>
        </main>
      </SmoothScroll>
    </>
  );
}

export default App;
