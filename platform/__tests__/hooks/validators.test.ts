import {
  parseDreamAnalysis,
  parseGenerateResponse,
  parsePostResponse,
  parseYouTubeVideoId,
} from '@/hooks/validators'

const ID = 'dQw4w9WgXcQ'

describe('parseYouTubeVideoId', () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`, ID],
    [`https://youtube.com/watch?v=${ID}&t=42s`, ID],
    [`http://m.youtube.com/watch?v=${ID}`, ID],
    [`https://music.youtube.com/watch?v=${ID}`, ID],
    [`https://youtu.be/${ID}`, ID],
    [`https://youtu.be/${ID}?si=abc`, ID],
    [`https://www.youtube.com/shorts/${ID}`, ID],
    [`https://www.youtube.com/embed/${ID}`, ID],
    [`youtube.com/watch?v=${ID}`, ID],
    [`  https://youtu.be/${ID}  `, ID],
  ])('accepts %s', (url, id) => {
    expect(parseYouTubeVideoId(url)).toBe(id)
  })

  it.each([
    ['empty', ''],
    ['not a url', 'hello world'],
    ['look-alike host', `https://youtube.com.evil.example/watch?v=${ID}`],
    ['look-alike suffix', `https://notyoutube.com/watch?v=${ID}`],
    ['credentials in the url', `https://user:pass@www.youtube.com/watch?v=${ID}`],
    ['custom port', `https://www.youtube.com:8443/watch?v=${ID}`],
    ['other scheme', `javascript://www.youtube.com/watch?v=${ID}`],
    ['ftp scheme', `ftp://www.youtube.com/watch?v=${ID}`],
    ['id too short', 'https://www.youtube.com/watch?v=abc'],
    ['id too long', `https://www.youtube.com/watch?v=${ID}extra`],
    ['bad id characters', 'https://www.youtube.com/watch?v=dQw4w9WgX!Q'],
    ['wrong path', `https://www.youtube.com/channel/${ID}`],
    ['watch without v', 'https://www.youtube.com/watch'],
    ['other site', `https://vimeo.com/${ID}`],
  ])('rejects %s', (_label, url) => {
    expect(parseYouTubeVideoId(url)).toBeNull()
  })

  it('rejects an absurdly long input', () => {
    expect(parseYouTubeVideoId(`https://www.youtube.com/watch?v=${ID}&x=${'a'.repeat(3000)}`)).toBeNull()
  })
})

describe('parseDreamAnalysis', () => {
  const good = {
    emotions: ['fear', 'wonder'],
    themes: ['falling', 'water'],
    symbols: ['moon'],
    interpretation: 'A reading.',
    lucidityIndicator: false,
  }

  it('accepts a well-formed result', () => {
    expect(parseDreamAnalysis(good)).toEqual(good)
  })

  it.each([
    ['null', null],
    ['an array', []],
    ['a string', 'text'],
    ['missing themes', { ...good, themes: undefined }],
    ['themes not a list', { ...good, themes: 'water' }],
    ['interpretation not text', { ...good, interpretation: 7 }],
    ['lucidity not boolean', { ...good, lucidityIndicator: 'yes' }],
  ])('rejects %s', (_label, data) => {
    expect(parseDreamAnalysis(data)).toBeNull()
  })

  it('drops emotions outside the known set instead of rendering them', () => {
    expect(parseDreamAnalysis({ ...good, emotions: ['fear', '<img onerror=x>', 'joy'] })?.emotions).toEqual(['fear', 'joy'])
  })

  it('bounds list sizes and text lengths', () => {
    const out = parseDreamAnalysis({
      ...good,
      themes: Array.from({ length: 50 }, (_, i) => `theme ${i}`),
      symbols: ['x'.repeat(500)],
      interpretation: 'y'.repeat(10_000),
    })
    expect(out?.themes).toHaveLength(12)
    expect(out?.symbols[0]).toHaveLength(80)
    expect(out?.interpretation).toHaveLength(4000)
  })

  it('leaves out blank list entries', () => {
    expect(parseDreamAnalysis({ ...good, themes: ['a', '  ', 3, 'b'] })?.themes).toEqual(['a', 'b'])
  })
})

describe('parseGenerateResponse', () => {
  const details = {
    videoId: ID,
    title: 'A video',
    channelName: 'Channel',
    channelId: 'UC123',
    description: 'About it',
    thumbnailUrl: `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`,
    viewCount: 10,
    likeCount: 2,
    commentCount: 1,
    duration: 212,
    publishedAt: '2026-01-01T00:00:00Z',
  }
  const good = { status: 'success', generatedText: 'Great video.', videoDetails: details, processingTime: 1.2, hasTranscript: true }

  it('accepts a well-formed response', () => {
    expect(parseGenerateResponse(good)).toMatchObject({ generatedText: 'Great video.', hasTranscript: true })
  })

  it.each([
    ['no text', { ...good, generatedText: '' }],
    ['text not a string', { ...good, generatedText: 5 }],
    ['no details', { ...good, videoDetails: null }],
    ['details without a title', { ...good, videoDetails: { ...details, title: undefined } }],
    ['not an object', 'x'],
  ])('rejects %s', (_label, data) => {
    expect(parseGenerateResponse(data)).toBeNull()
  })

  it('keeps only YouTube thumbnails over https', () => {
    const thumb = (url: unknown) => parseGenerateResponse({ ...good, videoDetails: { ...details, thumbnailUrl: url } })?.videoDetails.thumbnailUrl
    expect(thumb(`https://i.ytimg.com/vi/${ID}/hqdefault.jpg`)).toContain('i.ytimg.com')
    expect(thumb('http://i.ytimg.com/vi/x/a.jpg')).toBeNull()
    expect(thumb('https://evil.example/a.jpg')).toBeNull()
    expect(thumb('javascript:alert(1)')).toBeNull()
    expect(thumb(null)).toBeNull()
  })

  it('turns bad counts into zero and bounds long text', () => {
    const out = parseGenerateResponse({
      ...good,
      generatedText: 'z'.repeat(20_000),
      videoDetails: { ...details, viewCount: 'many', duration: Number.NaN, description: 'd'.repeat(9000) },
    })
    expect(out?.generatedText).toHaveLength(10_000)
    expect(out?.videoDetails.viewCount).toBe(0)
    expect(out?.videoDetails.duration).toBe(0)
    expect(out?.videoDetails.description).toHaveLength(5000)
  })
})

describe('parsePostResponse', () => {
  it('accepts a posted comment', () => {
    expect(parsePostResponse({ status: 'success', message: 'Posted', commentId: 'c1', postedAt: 'now' }))
      .toEqual({ status: 'success', message: 'Posted', commentId: 'c1', postedAt: 'now' })
  })

  it('keeps the already-commented flag only when it is true', () => {
    expect(parsePostResponse({ status: 'success', message: 'm', alreadyCommented: true })?.alreadyCommented).toBe(true)
    expect(parsePostResponse({ status: 'success', message: 'm', alreadyCommented: 'yes' })).not.toHaveProperty('alreadyCommented')
  })

  it.each([[null], ['x'], [{ status: 'success' }], [{ message: 'm' }]])('rejects %j', data => {
    expect(parsePostResponse(data)).toBeNull()
  })
})
