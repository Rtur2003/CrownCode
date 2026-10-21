/**
 * CrownCode backend (FastAPI, Docker Space on Hugging Face).
 *
 * NEXT_PUBLIC_API_URL overrides it at build time (e.g. a local
 * `uvicorn` on :7860); without it the site talks to the public Space.
 * The Space's CORS list must include the site's origin.
 */
export const DEFAULT_API_URL = 'https://rthur2003-crowncode-backend.hf.space'

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL).replace(/\/+$/, '')

/** Public model repository the Space downloads its weights from. */
export const AURIS_MODELS_URL = 'https://huggingface.co/Rthur2003/auris-models'
export const AURIS_SPACE_URL = 'https://huggingface.co/spaces/Rthur2003/crowncode-backend'

/**
 * Crown Commend drafts are public; posting one to YouTube uses an account that
 * belongs to the server and needs its API key, which a browser can't hold. The post
 * button therefore stays hidden unless a build is made for an owner who has set that up.
 */
export const COMMEND_POSTING_ENABLED = process.env.NEXT_PUBLIC_COMMEND_POSTING === 'true'
