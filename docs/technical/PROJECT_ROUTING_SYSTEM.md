# 🧭 DevForge Suite - Alt Proje Yönlendirme Sistemi

## 🎯 Routing Stratejisi

### 🌐 URL Yapısı

```
Ana Platform: https://devforge-suite.com
├── /                                   # Ana sayfa - Platform tanıtımı
├── /projects                           # Tüm projeler listesi
├── /about                              # Platform hakkında
├── /contact                            # İletişim
├── /docs                               # Platform dokümantasyonu
│
├── /ai-music-detection                 # AI Müzik Tespit Projesi
│   ├── /                               # Proje ana sayfası
│   ├── /demo                           # Canlı demo
│   ├── /upload                         # Dosya yükleme
│   ├── /results                        # Sonuçlar sayfası
│   ├── /docs                           # Proje dokümantasyonu
│   ├── /api-docs                       # API dokümantasyonu
│   └── /about                          # Proje hakkında
│
├── /data-manipulation                  # Veri İşleme Projesi
│   ├── /                               # Proje ana sayfası
│   ├── /upload                         # Veri yükleme
│   ├── /process                        # Veri işleme
│   ├── /transform                      # Veri dönüştürme
│   ├── /export                         # Export sayfası
│   ├── /visualization                  # Veri görselleştirme
│   └── /docs                           # Proje dokümantasyonu
│
└── /ml-toolkit                         # ML Araç Seti
    ├── /                               # Proje ana sayfası
    ├── /builder                        # Model builder
    ├── /training                       # Model eğitimi
    ├── /deploy                         # Model deployment
    ├── /monitor                        # Model monitoring
    └── /docs                           # Proje dokümantasyonu
```

## 🏗️ Next.js Dynamic Routing Implementation

### 📁 File Structure

```
pages/
├── index.tsx                           # Ana sayfa
├── projects/
│   └── index.tsx                       # Projeler listesi
├── about.tsx                           # Hakkında
├── contact.tsx                         # İletişim
├── docs/
│   └── [...slug].tsx                   # Platform docs
│
└── [project]/                          # Dynamic project routing
    ├── index.tsx                       # Proje ana sayfası
    ├── [...slug].tsx                   # Proje alt sayfaları
    └── api/
        └── [...path].tsx               # Proje API endpoints
```

### ⚡ Dynamic Project Routing

```typescript
// pages/[project]/[...slug].tsx
import { GetStaticPaths, GetStaticProps } from 'next'
import { ProjectLayout } from '@/components/ProjectLayout'
import { getProjectConfig, getProjectPaths } from '@/utils/projects'

interface ProjectPageProps {
  project: string
  slug: string[]
  projectConfig: ProjectConfig
  content: any
}

export default function ProjectPage({
  project,
  slug,
  projectConfig,
  content
}: ProjectPageProps) {
  return (
    <ProjectLayout project={projectConfig}>
      <ProjectContent
        project={project}
        slug={slug}
        content={content}
      />
    </ProjectLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getProjectPaths()

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const project = params?.project as string
  const slug = (params?.slug as string[]) || []

  const projectConfig = await getProjectConfig(project)
  const content = await getProjectContent(project, slug)

  if (!projectConfig) {
    return { notFound: true }
  }

  return {
    props: {
      project,
      slug,
      projectConfig,
      content
    },
    revalidate: 60 // ISR - 1 dakikada bir revalidate
  }
}
```

### 🔧 Project Configuration System

```typescript
// utils/projects.ts
export interface ProjectConfig {
  id: string
  name: string
  displayName: string
  description: string
  status: 'active' | 'planned' | 'beta' | 'deprecated'
  version: string
  technologies: string[]
  repository: string
  liveUrl: string
  documentation: string
  icon: string
  color: string
  routes: ProjectRoute[]
  features: ProjectFeature[]
  lastUpdated: string
}

export interface ProjectRoute {
  path: string
  name: string
  description: string
  component: string
  isPublic: boolean
  requiresAuth?: boolean
  mobileSupport: 'full' | 'limited' | 'none'
  desktopSupport: 'full' | 'limited' | 'none'
}

export const PROJECTS: Record<string, ProjectConfig> = {
  'ai-music-detection': {
    id: 'ai-music-detection',
    name: 'ai-music-detection',
    displayName: 'AI Müzik Tespit Platformu',
    description: 'Yapay zeka ile üretilen müziği tespit eden gelişmiş platform',
    status: 'active',
    version: '1.0.0',
    technologies: ['Next.js', 'TensorFlow.js', 'wav2vec2', 'PostgreSQL'],
    repository: 'https://github.com/Rtur2003/ai-music-detection',
    liveUrl: 'https://devforge-suite.com/ai-music-detection',
    documentation: '/ai-music-detection/docs',
    icon: '🎵',
    color: '#10B981',
    routes: [
      {
        path: '/',
        name: 'Ana Sayfa',
        description: 'Proje tanıtımı ve özellikleri',
        component: 'HomePage',
        isPublic: true,
        mobileSupport: 'full',
        desktopSupport: 'full'
      },
      {
        path: '/demo',
        name: 'Canlı Demo',
        description: 'Müzik dosyası yükleyip analiz etme',
        component: 'DemoPage',
        isPublic: true,
        mobileSupport: 'limited',
        desktopSupport: 'full'
      },
      {
        path: '/upload',
        name: 'Dosya Yükle',
        description: 'Müzik dosyası yükleme sayfası',
        component: 'UploadPage',
        isPublic: true,
        mobileSupport: 'limited',
        desktopSupport: 'full'
      },
      {
        path: '/results',
        name: 'Sonuçlar',
        description: 'Analiz sonuçları ve detaylar',
        component: 'ResultsPage',
        isPublic: true,
        mobileSupport: 'full',
        desktopSupport: 'full'
      },
      {
        path: '/docs',
        name: 'Dokümantasyon',
        description: 'API ve kullanım dokümantasyonu',
        component: 'DocsPage',
        isPublic: true,
        mobileSupport: 'full',
        desktopSupport: 'full'
      }
    ],
    features: [
      'Real-time müzik analizi',
      'Wav2vec2 tabanlı AI detection',
      'Batch processing desteği',
      'Detaylı sonuç raporları',
      'API erişimi'
    ],
    lastUpdated: '2024-12-21'
  },

  'data-manipulation': {
    id: 'data-manipulation',
    name: 'data-manipulation',
    displayName: 'Veri İşleme Suite',
    description: 'Araştırmacılar için kapsamlı veri işleme araçları',
    status: 'planned',
    version: '0.1.0',
    technologies: ['React', 'Python', 'Pandas', 'FastAPI'],
    repository: 'https://github.com/Rtur2003/data-manipulation',
    liveUrl: 'https://devforge-suite.com/data-manipulation',
    documentation: '/data-manipulation/docs',
    icon: '📊',
    color: '#F59E0B',
    routes: [
      {
        path: '/',
        name: 'Ana Sayfa',
        description: 'Veri işleme araçları tanıtımı',
        component: 'HomePage',
        isPublic: true,
        mobileSupport: 'full',
        desktopSupport: 'full'
      },
      {
        path: '/upload',
        name: 'Veri Yükle',
        description: 'CSV, JSON, Excel dosyası yükleme',
        component: 'UploadPage',
        isPublic: true,
        mobileSupport: 'limited',
        desktopSupport: 'full'
      },
      {
        path: '/process',
        name: 'Veri İşle',
        description: 'Veri temizleme ve dönüştürme',
        component: 'ProcessPage',
        isPublic: true,
        mobileSupport: 'none',
        desktopSupport: 'full'
      },
      {
        path: '/visualization',
        name: 'Görselleştirme',
        description: 'Veri görselleştirme araçları',
        component: 'VisualizationPage',
        isPublic: true,
        mobileSupport: 'limited',
        desktopSupport: 'full'
      }
    ],
    features: [
      'Multiple format support',
      'Advanced data cleaning',
      'Statistical analysis',
      'Interactive visualizations',
      'Export to various formats'
    ],
    lastUpdated: '2024-12-21'
  }
}

export const getProjectConfig = (projectId: string): ProjectConfig | null => {
  return PROJECTS[projectId] || null
}

export const getActiveProjects = (): ProjectConfig[] => {
  return Object.values(PROJECTS).filter(p => p.status === 'active')
}

export const getAllProjects = (): ProjectConfig[] => {
  return Object.values(PROJECTS)
}
```

## 🧭 Navigation Components

### 🎯 Dynamic Project Navigation

```typescript
// components/Navigation/ProjectNavigation.tsx
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ProjectConfig } from '@/utils/projects'

interface ProjectNavigationProps {
  project: ProjectConfig
  currentPath: string
}

export const ProjectNavigation: React.FC<ProjectNavigationProps> = ({
  project,
  currentPath
}) => {
  const router = useRouter()
  const isMobile = useIsMobile()

  return (
    <nav className="project-navigation">
      {/* Mobile Navigation */}
      {isMobile ? (
        <MobileProjectNav project={project} currentPath={currentPath} />
      ) : (
        <DesktopProjectNav project={project} currentPath={currentPath} />
      )}
    </nav>
  )
}

const DesktopProjectNav = ({ project, currentPath }) => (
  <div className="desktop-project-nav">
    <div className="project-header">
      <div className="project-icon">{project.icon}</div>
      <div>
        <h3>{project.displayName}</h3>
        <p className="project-status">
          <StatusBadge status={project.status} />
          v{project.version}
        </p>
      </div>
    </div>

    <ul className="nav-links">
      {project.routes.map(route => (
        <li key={route.path}>
          <Link
            href={`/${project.name}${route.path}`}
            className={currentPath === route.path ? 'active' : ''}
          >
            {route.name}
          </Link>
          {route.mobileSupport === 'limited' && (
            <span className="desktop-only">💻</span>
          )}
        </li>
      ))}
    </ul>
  </div>
)

const MobileProjectNav = ({ project, currentPath }) => (
  <div className="mobile-project-nav">
    <select
      value={currentPath}
      onChange={(e) => router.push(`/${project.name}${e.target.value}`)}
    >
      {project.routes
        .filter(route => route.mobileSupport !== 'none')
        .map(route => (
          <option key={route.path} value={route.path}>
            {route.name}
            {route.mobileSupport === 'limited' ? ' (Sınırlı)' : ''}
          </option>
        ))}
    </select>
  </div>
)
```

### 🏠 Platform Main Navigation

```typescript
// components/Navigation/MainNavigation.tsx
import { getAllProjects } from '@/utils/projects'

export const MainNavigation: React.FC = () => {
  const projects = getAllProjects()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="main-navigation">
      <div className="nav-container">
        {/* Logo */}
        <Link href="/" className="logo">
          <span className="logo-icon">🚀</span>
          DevForge Suite
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link href="/projects">Projeler</Link>
          <ProjectDropdown projects={projects} />
          <Link href="/docs">Dokümantasyon</Link>
          <Link href="/about">Hakkında</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        projects={projects}
      />
    </header>
  )
}

const ProjectDropdown = ({ projects }) => (
  <div className="dropdown">
    <button className="dropdown-trigger">
      Projeler <span>▼</span>
    </button>
    <div className="dropdown-content">
      {projects.map(project => (
        <Link
          key={project.id}
          href={`/${project.name}`}
          className="dropdown-item"
        >
          <span className="project-icon">{project.icon}</span>
          <div>
            <span className="project-name">{project.displayName}</span>
            <StatusBadge status={project.status} />
          </div>
        </Link>
      ))}
    </div>
  </div>
)
```

## 🎯 Breadcrumb System

```typescript
// components/Navigation/Breadcrumb.tsx
interface BreadcrumbProps {
  project?: ProjectConfig
  currentPath: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  project,
  currentPath
}) => {
  const breadcrumbs = generateBreadcrumbs(project, currentPath)

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link href="/">🏠 Ana Sayfa</Link>
        </li>

        {project && (
          <li>
            <Link href={`/${project.name}`}>
              {project.icon} {project.displayName}
            </Link>
          </li>
        )}

        {breadcrumbs.map((crumb, index) => (
          <li key={index} className={index === breadcrumbs.length - 1 ? 'current' : ''}>
            {index === breadcrumbs.length - 1 ? (
              <span>{crumb.name}</span>
            ) : (
              <Link href={crumb.path}>{crumb.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

const generateBreadcrumbs = (project: ProjectConfig | undefined, currentPath: string) => {
  if (!project) return []

  const route = project.routes.find(r => r.path === currentPath)
  if (!route) return []

  const breadcrumbs = []
  const pathParts = currentPath.split('/').filter(Boolean)

  pathParts.forEach((part, index) => {
    const partialPath = '/' + pathParts.slice(0, index + 1).join('/')
    const partRoute = project.routes.find(r => r.path === partialPath)

    if (partRoute) {
      breadcrumbs.push({
        name: partRoute.name,
        path: `/${project.name}${partialPath}`
      })
    }
  })

  return breadcrumbs
}
```

## 🔍 Search and Discovery

```typescript
// components/Search/ProjectSearch.tsx
export const ProjectSearch: React.FC = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const allProjects = getAllProjects()

  const searchProjects = useCallback(
    debounce((searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      const searchResults = allProjects.flatMap(project => {
        const projectMatch = project.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            project.description.toLowerCase().includes(searchQuery.toLowerCase())

        const results: SearchResult[] = []

        if (projectMatch) {
          results.push({
            type: 'project',
            project: project.name,
            title: project.displayName,
            description: project.description,
            path: `/${project.name}`,
            icon: project.icon
          })
        }

        // Search within project routes
        project.routes.forEach(route => {
          const routeMatch = route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           route.description.toLowerCase().includes(searchQuery.toLowerCase())

          if (routeMatch) {
            results.push({
              type: 'route',
              project: project.name,
              title: `${project.displayName} - ${route.name}`,
              description: route.description,
              path: `/${project.name}${route.path}`,
              icon: project.icon
            })
          }
        })

        return results
      })

      setResults(searchResults)
    }, 300),
    [allProjects]
  )

  return (
    <div className="project-search">
      <input
        type="text"
        placeholder="Proje ve özellik ara..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          searchProjects(e.target.value)
        }}
        className="search-input"
      />

      {results.length > 0 && (
        <div className="search-results">
          {results.map((result, index) => (
            <Link key={index} href={result.path} className="search-result-item">
              <span className="result-icon">{result.icon}</span>
              <div>
                <div className="result-title">{result.title}</div>
                <div className="result-description">{result.description}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

## 📱 Mobile-Specific Routing

```typescript
// hooks/useDeviceRouting.ts
export const useDeviceRouting = () => {
  const router = useRouter()
  const isMobile = useIsMobile()

  const navigateToRoute = useCallback((project: string, route: string) => {
    const projectConfig = getProjectConfig(project)
    const routeConfig = projectConfig?.routes.find(r => r.path === route)

    if (!routeConfig) {
      router.push('/404')
      return
    }

    // Check mobile support
    if (isMobile && routeConfig.mobileSupport === 'none') {
      // Redirect to alternative mobile route or show notice
      toast.error('Bu özellik mobil cihazlarda desteklenmiyor')
      router.push(`/${project}`)
      return
    }

    if (isMobile && routeConfig.mobileSupport === 'limited') {
      // Show warning but allow navigation
      toast.warning('Bu özellik mobilde sınırlı çalışabilir')
    }

    router.push(`/${project}${route}`)
  }, [router, isMobile])

  return { navigateToRoute }
}
```

Bu yönlendirme sistemi ile her proje kendi alt başlıkları ve sayfalarıyla organize bir şekilde yönetilebilecek! 🧭🚀