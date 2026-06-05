'use client'

import { useCallback, useRef } from 'react'
import type { Howl } from 'howler'
import { loadState } from '@/lib/progress'

export type SoundKey = 'tick' | 'chime' | 'tone-down' | 'boot'

const SOUND_VOLUME: Record<SoundKey, number> = {
  tick: 0.3,
  chime: 0.35,
  'tone-down': 0.35,
  boot: 0.4
}

export function useSound(key: SoundKey) {
  const howlRef = useRef<Howl | null>(null)

  const play = useCallback(async () => {
    const s = loadState()
    if (!s.settings.soundEnabled) return
    if (!howlRef.current) {
      const { Howl } = await import('howler')
      howlRef.current = new Howl({
        src: [`/sounds/${key}.wav`],
        volume: SOUND_VOLUME[key],
        preload: true
      })
    }
    howlRef.current.play()
  }, [key])

  return { play }
}
