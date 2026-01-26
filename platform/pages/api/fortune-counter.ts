/**
 * Fortune Counter API Endpoint
 * Tracks daily fortune readings count
 *
 * @route GET /api/fortune-counter - Get today's count
 * @route POST /api/fortune-counter - Increment count
 *
 * Note: Uses in-memory storage. For production, use a database.
 */

import type { NextApiRequest, NextApiResponse } from 'next'

interface CounterResponse {
  count: number
  date: string
  success: boolean
}

interface CounterStore {
  date: string
  count: number
}

// In-memory store (resets on server restart)
// For production, replace with database (Redis, MongoDB, etc.)
let counterStore: CounterStore = {
  date: '',
  count: 0
}

// Simple rate limiter (in-memory, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = {
  MAX_REQUESTS: 10,
  WINDOW_MS: 60 * 1000 // 1 minute
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT.WINDOW_MS })
    return false
  }

  if (record.count >= RATE_LIMIT.MAX_REQUESTS) {
    return true
  }

  record.count++
  return false
}

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

// Get Turkey date (GMT+3) in YYYY-MM-DD format
function getTurkeyDate(): string {
  const now = new Date()
  // Use Intl.DateTimeFormat for reliable timezone handling
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return formatter.format(now) // Returns YYYY-MM-DD format
}

// Get Turkey hour (0-23)
function getTurkeyHour(): number {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul',
    hour: 'numeric',
    hour12: false
  })
  return parseInt(formatter.format(now), 10)
}

// Generate a realistic base count for the day
function getBaseCount(): number {
  const turkeyHour = getTurkeyHour()

  // Simulate activity based on time of day
  // More activity during evening hours (18-23)
  let baseMultiplier = 1
  if (turkeyHour >= 18 && turkeyHour <= 23) {
    baseMultiplier = 2.5
  } else if (turkeyHour >= 12 && turkeyHour < 18) {
    baseMultiplier = 1.5
  } else if (turkeyHour >= 8 && turkeyHour < 12) {
    baseMultiplier = 1.2
  }

  // Base count grows through the day
  const hoursPassed = turkeyHour
  const estimatedHourlyVisits = Math.floor(15 * baseMultiplier)

  return Math.floor(hoursPassed * estimatedHourlyVisits + Math.random() * 10)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CounterResponse | { error: string }>
) {
  // CORS - allow only same origin (or specific domains in production)
  const origin = req.headers.origin || ''
  const allowedOrigins = [
    'https://hasanarthuraltuntas.xyz',
    'https://www.hasanarthuraltuntas.xyz',
    'http://localhost:3000',
    'http://localhost:3001'
  ]

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Rate limiting for POST requests
  if (req.method === 'POST') {
    const clientIp = getClientIp(req)
    if (isRateLimited(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' })
    }
  }

  const today = getTurkeyDate()

  // Reset counter if it's a new day
  if (counterStore.date !== today) {
    counterStore = {
      date: today,
      count: getBaseCount()
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      count: counterStore.count,
      date: counterStore.date,
      success: true
    })
  }

  if (req.method === 'POST') {
    // Increment the counter
    counterStore.count += 1

    return res.status(200).json({
      count: counterStore.count,
      date: counterStore.date,
      success: true
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
