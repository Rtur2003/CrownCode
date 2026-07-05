import { useState } from 'react'
import Cover from '../components/sections/Cover.jsx'
import HorizontalJourney from '../components/sections/HorizontalJourney.jsx'
import SignatureStrip from '../components/sections/SignatureStrip.jsx'
import StoryCollage from '../components/sections/StoryCollage.jsx'
import ReserveInvite from '../components/sections/ReserveInvite.jsx'
import ServiceRail from '../components/ui/ServiceRail.jsx'
import MobileStoryDots from '../components/ui/MobileStoryDots.jsx'
import MarqueeBand from '../components/ui/MarqueeBand.jsx'
import { chapters, marqueeItems } from '../data/content.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function Home() {
  const [chapterIdx, setChapterIdx] = useState(0)
  usePageTitle('')

  return (
    <main className="bg-noir-bg text-noir-text">
      <Cover />
      <ServiceRail sections={chapters} activeId={chapters[chapterIdx]?.id} />
      <MobileStoryDots />
      <HorizontalJourney onChapterChange={setChapterIdx}>
        <SignatureStrip />
        <StoryCollage />
        <ReserveInvite />
      </HorizontalJourney>
      <MarqueeBand items={marqueeItems} />
    </main>
  )
}
