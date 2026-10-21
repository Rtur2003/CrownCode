import { createContext } from 'react'

/**
 * True inside the app shell that pages/_app.tsx mounts once. MainLayout then only
 * contributes the page's <head> and content; rendered on its own (tests, an
 * isolated page) it still brings its own header and footer.
 */
export const ShellContext = createContext(false)
