import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SmoothScroll } from "./components/SmoothScroll";
import { ProjectList, type Project } from "./components/ProjectList";

const CROWNCODE_PROJECTS: Project[] = [
  {
    id: "auris",
    title: "AURIS Engine",
    category: "AI & research",
    year: "2026",
    imageUrl: "/images/auris.png",
    description:
      "Listening for the boundary between human-made and AI-generated music.",
    detail:
      "A multi-tower audio detection system combining wav2vec2 embeddings, handcrafted audio features, CLAP and external spectral analysis in an ensemble classifier.",
    stack: ["Python", "wav2vec2", "FastAPI"],
    href: "https://hasan-arthur-altuntas.xyz/ai-music-detection",
    source: "https://github.com/Rtur2003/Music-AIDetector",
  },
  {
    id: "noir-grain",
    title: "Noir & Grain",
    category: "Web experiences",
    year: "2026",
    imageUrl: "/images/noir-grain.jpg",
    description: "A digital dining room with an appetite for atmosphere.",
    detail:
      "A fine-dining web template exploring art direction, tactile typography and WebGL interaction. Built as a standalone experience inside the CrownCode workspace.",
    stack: ["React", "WebGL", "GSAP"],
    href: "https://hasan-arthur-altuntas.xyz/noir-grain",
    source: "https://github.com/Rtur2003/CrownCode",
  },
  {
    id: "dreams",
    title: "Crown Dreams",
    category: "AI & research",
    year: "2025",
    imageUrl: "/images/dreams.png",
    description: "A space for the stories that arrive while we sleep.",
    detail:
      "An experimental dream journal using language models to interpret and archive dreams. Part of the CrownCode collection of creative tools.",
    stack: ["Next.js", "AI", "TypeScript"],
    href: "https://hasan-arthur-altuntas.xyz/crown-dreams",
    source: "https://github.com/Rtur2003/CrownCode",
  },
  {
    id: "commend",
    title: "Crown Commend",
    category: "Automation",
    year: "2026",
    imageUrl: "/images/commend.png",
    description: "Multilingual YouTube comments, assisted by generative AI.",
    detail:
      "A comment generation tool with multilingual support and an admin management system. Explore the interface or inspect the open-source implementation.",
    stack: ["JavaScript", "Gemini", "React"],
    href: "https://hasan-arthur-altuntas.xyz/crown-commend",
    source: "https://github.com/Rtur2003/Commend-AI",
  },
  {
    id: "vote",
    title: "VOTRYX",
    category: "Automation",
    year: "2024",
    imageUrl: "/images/vote.png",
    description: "Browser automation, built to handle the repetitive parts.",
    detail:
      "A Python desktop automation project using Selenium and a Tkinter interface, with retry and backoff handling for browser workflows.",
    stack: ["Python", "Selenium", "Tkinter"],
    source: "https://github.com/Rtur2003/VOTRYX",
  },
];

function App() {
  const heroRef = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-title span", {
          yPercent: 105,
          duration: 1.2,
          stagger: 0.1,
          ease: "power4.out",
        });
        gsap.from(".studio-portrait", {
          scale: 0.94,
          opacity: 0,
          duration: 1.5,
          ease: "power3.out",
        });
        gsap.to(".studio-portrait", {
          yPercent: -12,
          scale: 0.88,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
      return () => media.revert();
    },
    { scope: heroRef },
  );

  return (
    <SmoothScroll>
      <a className="skip-link" href="#work">
        Skip to projects
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="wordmark" href="#top">
          <img src="/logo-main.png" alt="" width="64" height="64" />
          CrownCode
        </a>
        <div>
          <a href="#work">Work</a>
          <a href="#studio">About</a>
          <a href="mailto:hasannarthurrr@gmail.com">
            Get in touch <span aria-hidden="true">↗</span>
          </a>
        </div>
      </nav>
      <main>
        <header id="top" className="studio-hero" ref={heroRef}>
          <div className="hero-kicker">
            <span>Independent engineering & digital craft</span>
            <span>By Hasan Arthur Altuntaş</span>
          </div>
          <h1 className="hero-title">
            <span>CrownCode</span>
          </h1>
          <div className="studio-portrait" aria-hidden="true">
            <img src="/logo-main.png" alt="" width="1024" height="1024" />
          </div>
          <div className="hero-bottom">
            <p>
              Audio intelligence. Useful tools.
              <br />
              Digital experiences with a point of view.
            </p>
            <a href="#work">
              Explore the work <span aria-hidden="true">↓</span>
            </a>
            <span className="project-count">
              {CROWNCODE_PROJECTS.length} selected projects
              <br />
              2024—2026
            </span>
          </div>
        </header>
        <section id="work" className="work-section">
          <div className="section-heading">
            <h2>
              Selected work<span>({CROWNCODE_PROJECTS.length})</span>
            </h2>
            <p>Research, creative tools and open-source software.</p>
          </div>
          <ProjectList projects={CROWNCODE_PROJECTS} />
        </section>
        <section id="studio" className="studio-about">
          <p>The person behind the projects</p>
          <h2>
            I compose music.
            <br />I build the systems
            <br />
            that listen to it.
          </h2>
          <div className="about-bottom">
            <p>
              I'm Hasan Arthur Altuntaş, a software developer and cinematic music
              producer. CrownCode is where I bring my research, open-source
              tools and experiments together.
            </p>
            <a
              href="https://hasan-arthur-altuntas.com.tr"
              target="_blank"
              rel="noreferrer"
            >
              Meet the music side <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
        <section className="notebook">
          <h2>From the workbench</h2>
          <a
            href="https://github.com/Rtur2003/Claude-Code-Promts-Skills"
            target="_blank"
            rel="noreferrer"
          >
            <span>For fellow builders</span>
            <h3>A library for coding agents</h3>
            <p>Specialist prompts, skills and the APEI methodology.</p>
            <span aria-hidden="true">↗</span>
          </a>
          <a
            href="https://medium.com/@hasannarthurrr"
            target="_blank"
            rel="noreferrer"
          >
            <span>Notes & writing</span>
            <h3>The thinking behind the making</h3>
            <p>On open source, music and the CrownCode ecosystem.</p>
            <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>
      <footer className="site-footer">
        <p>Have something in mind?</p>
        <a className="footer-title" href="mailto:hasannarthurrr@gmail.com">
          Let's make it.<span aria-hidden="true">↗</span>
        </a>
        <div>
          <span>© {new Date().getFullYear()} CrownCode</span>
          <a
            href="https://github.com/Rtur2003"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://tr.linkedin.com/in/hasan-arthur-altuntas"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </SmoothScroll>
  );
}

export default App;
