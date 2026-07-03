import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import styles from './ProjectList.module.css';

export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  imageUrl: string;
}

interface ProjectListProps {
  projects: Project[];
  onProjectHover: (imageUrl: string | null) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectHover }) => {
  const listRef = useRef<HTMLUListElement>(null);

  useGSAP(() => {
    // Parallax or subtle reveal effect on list items
    const items = gsap.utils.toArray(listRef.current?.children || []);
    
    items.forEach((item: any) => {
      gsap.fromTo(item, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
          }
        }
      );
    });
  }, { scope: listRef });

  return (
    <ul ref={listRef} className={styles.projectList}>
      {projects.map((project) => (
        <li 
          key={project.id} 
          className={styles.projectItem}
          onMouseEnter={() => onProjectHover(project.imageUrl)}
          onMouseLeave={() => onProjectHover(null)}
          data-cursor="view"
        >
          <div className={styles.projectInfo}>
            <h2 className={styles.projectTitle}>{project.title}</h2>
            <div className={styles.projectMeta}>
              <span className={styles.projectCategory}>{project.category}</span>
              <span className={styles.projectYear}>{project.year}</span>
            </div>
          </div>
          {/* Prevent overlap by ensuring absolute positioning of decorative elements is constrained */}
          <div className={styles.projectDivider} />
        </li>
      ))}
    </ul>
  );
};
