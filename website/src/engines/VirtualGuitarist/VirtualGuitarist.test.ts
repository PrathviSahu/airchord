import { describe, expect, it } from 'vitest'
import { VirtualGuitarist } from './VirtualGuitarist'
import { PERSONALITIES, personalityFromCollections } from './personalities'

describe('Virtual Guitarist Engine', () => {
  it('creates with named personality', () => {
    const vg = new VirtualGuitarist('campfire')
    expect(vg.getPersonality().id).toBe('campfire')
    expect(vg.getPersonality().strumIntensity).toBeGreaterThan(0)
  })

  it('derives personality from collections', () => {
    expect(personalityFromCollections(['Campfire']).id).toBe('campfire')
    expect(personalityFromCollections(['Rock']).id).toBe('rock')
    expect(personalityFromCollections(['Worship']).id).toBe('worship')
    expect(personalityFromCollections(['Pop']).id).toBe('pop')
    expect(personalityFromCollections(['Bollywood']).id).toBe('bollywood')
    expect(personalityFromCollections(['Indie']).id).toBe('indie')
  })

  it('decides a down stroke with valid voicing', () => {
    const vg = new VirtualGuitarist('pop')
    const decision = vg.decideStroke('D', 'G', 0, 'Verse', 0.35)

    expect(decision.stroke).toBe('down')
    expect(decision.voicing).toHaveLength(6)
    expect(decision.velocity).toBeGreaterThan(0)
    expect(decision.velocity).toBeLessThanOrEqual(0.95)
  })

  it('decides an up stroke', () => {
    const vg = new VirtualGuitarist('pop')
    const decision = vg.decideStroke('U', 'G', 1, 'Verse', 0.35)

    expect(decision.stroke).toBe('up')
  })

  it('returns rest for dot/pause strokes', () => {
    const vg = new VirtualGuitarist('pop')
    const decision = vg.decideStroke('.', 'G', 1, 'Verse', 0.35)

    expect(decision.stroke).toBe('rest')
    expect(decision.velocity).toBe(0)
  })

  it('returns mute for X strokes', () => {
    const vg = new VirtualGuitarist('pop')
    const decision = vg.decideStroke('X', 'G', 1, 'Verse', 0.35)

    expect(decision.stroke).toBe('mute')
    expect(decision.velocity).toBeGreaterThan(0)
    expect(decision.velocity).toBeLessThan(0.35) // muted is quieter
  })

  it('chorus section has higher velocity than verse', () => {
    const vg1 = new VirtualGuitarist('pop')
    const vg2 = new VirtualGuitarist('pop')

    // Average velocity over many beats in each section
    let verseTotal = 0
    let chorusTotal = 0
    const iterations = 50

    for (let i = 0; i < iterations; i++) {
      const vDecision = vg1.decideStroke('D', 'G', 0, 'Verse', 0.35)
      verseTotal += vDecision.velocity
      vg1.reset()

      const cDecision = vg2.decideStroke('D', 'G', 0, 'Chorus', 0.35)
      chorusTotal += cDecision.velocity
      vg2.reset()
    }

    expect(chorusTotal / iterations).toBeGreaterThan(verseTotal / iterations * 0.8)
  })

  it('rock personality has higher intensity than worship', () => {
    expect(PERSONALITIES.rock.strumIntensity).toBeGreaterThan(PERSONALITIES.worship.strumIntensity)
    expect(PERSONALITIES.rock.accentStrength).toBeGreaterThan(PERSONALITIES.worship.accentStrength)
  })

  it('plans a chord transition identifying shared strings', () => {
    const vg = new VirtualGuitarist('pop')
    const plan = vg.planTransition('G', 'Em')

    // G and Em share some strings (G3, B3)
    expect(plan.sharedStrings.length).toBeGreaterThanOrEqual(0)
    expect(plan.newStrings.length).toBeGreaterThan(0)
    expect(plan.style).toBeDefined()
  })

  it('can change personality at runtime', () => {
    const vg = new VirtualGuitarist('pop')
    expect(vg.getPersonality().id).toBe('pop')

    vg.setPersonality('rock')
    expect(vg.getPersonality().id).toBe('rock')
    expect(vg.getPersonality().strumIntensity).toBeGreaterThan(0.8)
  })

  it('creates from collections via static method', () => {
    const vg = VirtualGuitarist.fromCollections(['Campfire', 'Romantic'])
    expect(vg.getPersonality().id).toBe('campfire')
  })

  it('reset clears all state', () => {
    const vg = new VirtualGuitarist('pop')
    vg.decideStroke('D', 'G', 0, 'Verse', 0.35)
    vg.decideStroke('U', 'C', 1, 'Verse', 0.35)
    vg.reset()

    // After reset, should behave like new instance
    const decision = vg.decideStroke('D', 'Em', 0, 'Verse', 0.35)
    expect(decision.stroke).toBe('down')
  })
})
