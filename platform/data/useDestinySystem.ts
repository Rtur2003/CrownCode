import { useState, useEffect } from 'react'
import { 
  getDailyDestiny, 
  getTurkeyDate, 
  getDestinyDetails, 
  getReverseMessage,
  seededRandom,
  getUserId,
  DailyDestiny,
  DestinyCard,
  FortuneMessage,
  FortuneCategory
} from '@/data/destiny'

/**
 * Crown Destiny Sistemi için Ana Logic Hook
 * Zaman kontrolü, çark durumu ve kart yönetimi burada yapılır.
 */
export function useDestinySystem() {
  const [fortune, setFortune] = useState<DailyDestiny | null>(null)
  const [cardDetails, setCardDetails] = useState<{
    card: DestinyCard
    category: { label: string; color: string; icon: string }
    message: FortuneMessage
  } | null>(null)
  
  const [reverseMessage, setReverseMessage] = useState<FortuneMessage | null>(null)
  const [canSpin, setCanSpin] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showReverse, setShowReverse] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Sayfa yüklendiğinde durumu kontrol et
  useEffect(() => {
    setIsClient(true)
    const today = getTurkeyDate()
    const stored = localStorage.getItem('crown_daily_destiny')
    
    if (stored) {
      try {
        const parsed: DailyDestiny = JSON.parse(stored)
        if (parsed.date === today) {
          // Bugün zaten çevrilmiş
          setFortune(parsed)
          setCardDetails(getDestinyDetails(parsed))
          setCanSpin(false)
        } else {
          // Yeni gün, çevirmeye hazır
          setCanSpin(true)
        }
      } catch {
        setCanSpin(true)
      }
    } else {
      setCanSpin(true)
    }
  }, [])

  // Çarkı Çevir
  const spinWheel = async () => {
    if (!canSpin) return

    setIsSpinning(true)
    
    // Animasyon için yapay gecikme
    await new Promise(resolve => setTimeout(resolve, 3000))

    const newFortune = getDailyDestiny() // Bu fonksiyon localStorage'a da kaydeder
    setFortune(newFortune)
    setCardDetails(getDestinyDetails(newFortune))
    setCanSpin(false)
    setIsSpinning(false)
  }

  // Ters (Gölge) Kartı Aç
  const revealReverseCard = () => {
    if (!fortune || showReverse) return

    // Deterministik seed oluştur: Tarih + UserID + 'reverse'
    const today = getTurkeyDate()
    const userId = getUserId()
    const seedString = `${today}_${userId}_reverse`
    const seed = seededRandom(seedString)

    const reverseMsg = getReverseMessage(fortune.category, seed)
    setReverseMessage(reverseMsg)
    setShowReverse(true)
  }

  // Gece yarısına kalan süreyi hesapla (UI'da göstermek için opsiyonel)
  const getTimeUntilReset = () => {
    // ... (Helper fonksiyon kullanılabilir)
  }

  return {
    isClient,
    canSpin,
    isSpinning,
    fortune,
    cardDetails,
    showReverse,
    reverseMessage,
    spinWheel,
    revealReverseCard
  }
}