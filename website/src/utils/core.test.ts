import { describe, expect, it } from 'vitest'
import { CHORD_NOTES } from './guitarSound'
import { GuitaristEngine } from './guitaristEngine'
import { getProfileById } from './GestureProfiles'
import { parseLRC } from './lrclib'
import { SEED_SONGS } from './songLibrary'

const supportedChords = new Set(Object.keys(CHORD_NOTES))

function durationInSeconds(duration: string) {
  const [minutes, seconds] = duration.split(':').map(Number)
  return minutes * 60 + seconds
}

describe('AirChord chord data', () => {
  it('keeps every voicing six strings wide', () => {
    for (const [name, voicing] of Object.entries(CHORD_NOTES)) {
      expect(voicing, `${name} voicing`).toHaveLength(6)
      expect(voicing.every(note => note === null || typeof note === 'string')).toBe(true)
    }
  })

  it('has an audio voicing for every song chord and finger mapping', () => {
    for (const song of SEED_SONGS) {
      const mapping = song.fingerMapping ?? []
      for (const chord of [...song.chords, ...mapping]) {
        expect(supportedChords.has(chord), `${song.id} uses unsupported chord ${chord}`).toBe(true)
      }
      for (const section of song.sections) {
        for (const line of section.lyrics) {
          expect(supportedChords.has(line.chord), `${song.id} lyric uses unsupported chord ${line.chord}`).toBe(true)
        }
      }
    }
  })

  it('has unique IDs, six-finger mappings, and lyrics within duration', () => {
    const ids = SEED_SONGS.map(song => song.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (const song of SEED_SONGS) {
      if (song.fingerMapping) {
        expect(song.fingerMapping).toHaveLength(6)
      }
      const duration = durationInSeconds(song.duration)
      const lastLyricTime = Math.max(...song.sections.flatMap(section => section.lyrics.map(line => line.time)))
      expect(lastLyricTime, `${song.id} lyric timeline`).toBeLessThanOrEqual(duration)
    }
  })
})

describe('gesture profiles and guitarist orchestration', () => {
  it('contains the classic profile used by camera sessions', () => {
    expect(getProfileById('classic').mapping).toEqual(['Em', 'Am', 'G', 'C', 'D', 'F'])
  })

  it('keeps section dynamics and style selection deterministic', () => {
    expect(GuitaristEngine.sectionVolume('Chorus')).toBe(1)
    expect(GuitaristEngine.sectionVolume('Unknown')).toBe(0.82)
    expect(GuitaristEngine.styleFromCollections(['Romantic'])).toBe('ballad')
    expect(GuitaristEngine.styleFromCollections(['Campfire'])).toBe('campfire')
  })
})

describe('LRC parsing', () => {
  it('sorts lines, removes empty lines, and normalizes a long intro', () => {
    const lines = parseLRC('[00:05.00]first\n[00:03.50]intro\n[00:06]last\nnot a lyric')

    expect(lines).toEqual([
      { time: 0, text: 'intro' },
      { time: 1.5, text: 'first' },
      { time: 2.5, text: 'last' },
    ])
  })
})
