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

// Get Turkey date (GMT+3) in YYYY-MM-DD format
function getTurkeyDate(): string {
  const now = new Date()
  const turkeyOffset = 3 * 60 // GMT+3 in minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const turkeyMinutes = utcMinutes + turkeyOffset

  const turkeyDate = new Date(now)

  if (turkeyMinutes >= 24 * 60) {
    turkeyDate.setUTCDate(turkeyDate.getUTCDate() + 1)
  } else if (turkeyMinutes < 0) {
    turkeyDate.setUTCDate(turkeyDate.getUTCDate() - 1)
  }

  return turkeyDate.toISOString().split('T')[0]
}

// Generate a realistic base count for the day
function getBaseCount(): number {
  const now = new Date()
  const turkeyHour = (now.getUTCHours() + 3) % 24

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
  const today = getTurkeyDate()

  // Reset counter if it's a new day
  if (counterStore.date !== today) {
    counterStore = {
      date: today,
      count: getBaseCount()
    }
  }

  // Set CORS and cache headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

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
