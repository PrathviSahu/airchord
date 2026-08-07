// ── AirChord Event Bus ────────────────────────────────────────────────────────
//
// Central publish/subscribe system. Everything subscribes. Nothing depends
// directly on anything else.
//
// Usage:
//   import { eventBus } from '../core/EventBus'
//   eventBus.emit('gesture:detected', result)
//   const unsub = eventBus.on('audio:beat', (data) => { ... })
//   unsub() // cleanup
//
// This decouples:
//   Gesture → EventBus → Audio, Lyrics, Practice, Recording, Analytics

import type { AirChordEvents } from './types'

type EventHandler<T> = (data: T) => void
type Unsubscribe = () => void

class EventBus {
  private listeners = new Map<string, Set<EventHandler<any>>>()

  /** Subscribe to an event. Returns an unsubscribe function. */
  on<K extends keyof AirChordEvents>(
    event: K,
    handler: EventHandler<AirChordEvents[K]>,
  ): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler)

    return () => {
      this.listeners.get(event)?.delete(handler)
    }
  }

  /** Subscribe to an event, but only fire once. */
  once<K extends keyof AirChordEvents>(
    event: K,
    handler: EventHandler<AirChordEvents[K]>,
  ): Unsubscribe {
    const wrapped: EventHandler<AirChordEvents[K]> = (data) => {
      handler(data)
      this.listeners.get(event)?.delete(wrapped)
    }
    return this.on(event, wrapped)
  }

  /** Emit an event to all subscribers. */
  emit<K extends keyof AirChordEvents>(
    event: K,
    ...[data]: AirChordEvents[K] extends void ? [] : [AirChordEvents[K]]
  ): void {
    const handlers = this.listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      try {
        handler(data)
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${event}":`, err)
      }
    }
  }

  /** Remove all listeners for a specific event, or all events if no key given. */
  clear<K extends keyof AirChordEvents>(event?: K): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /** Get count of listeners for debugging/monitoring. */
  listenerCount<K extends keyof AirChordEvents>(event: K): number {
    return this.listeners.get(event)?.size ?? 0
  }
}

// Singleton instance — all modules share the same bus
export const eventBus = new EventBus()
