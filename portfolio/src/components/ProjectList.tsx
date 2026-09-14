import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./ProjectList.module.css";

gsap.registerPlugin(ScrollTrigger);

export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  imageUrl: string;
  description: string;
  detail: string;
  stack: string[];
  href?: string;
  source: string;
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [category, setCategory] = useState("All work");
  const categories = [
    "All work",
    ...new Set(projects.map((project) => project.category)),
  ];
  const visible = projects.filter(
    (project) => category === "All work" || category === project.category,
  );

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 850px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils
            .toArray<HTMLElement>(`.${styles.visual}`)
            .forEach((visual) => {
              gsap.fromTo(
                visual.querySelector("img"),
                { yPercent: -5, scale: 1.12 },
                {
                  yPercent: 5,
                  scale: 1.12,
                  ease: "none",
                  scrollTrigger: {
                    trigger: visual,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                },
              );
            });
        },
      );
      return () => media.revert();
    },
    { scope: listRef, dependencies: [category], revertOnUpdate: true },
  );

  useLayoutEffect(() => {
    ScrollTrigger.refresh();
  }, [category]);

  return (
    <div ref={listRef}>
      <div className={styles.filters} aria-label="Project categories">
        {categories.map((item) => (
          <button
            key={item}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
            <span>
              {item === "All work"
                ? projects.length
                : projects.filter((project) => project.category === item)
                    .length}
            </span>
          </button>
        ))}
      </div>
      <p className={styles.count} aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>
      <div className={styles.projectList}>
        {visible.map((project) => (
          <article key={project.id} className={styles.projectItem}>
            <a
              className={styles.visual}
              href={project.href || project.source}
              target="_blank"
              rel="noreferrer"
              aria-label={`Explore ${project.title}`}
            >
              <img
                src={project.imageUrl}
                alt={`${project.title} project artwork`}
                width="1000"
                height="750"
                loading="lazy"
              />
              <span className={styles.visit}>
                Explore project <span aria-hidden="true">↗</span>
              </span>
              <span className={styles.year}>{project.year}</span>
            </a>
            <div className={styles.projectInfo}>
              <span className={styles.category}>{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className={styles.stack}>
                {project.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
              <details
                className={styles.details}
                onToggle={() => ScrollTrigger.refresh()}
              >
                <summary>
                  Inside the project <span aria-hidden="true">+</span>
                </summary>
                <p>{project.detail}</p>
                <a href={project.source} target="_blank" rel="noreferrer">
                  View source on GitHub ↗
                </a>
              </details>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
