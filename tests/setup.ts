import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

class LocalStorageMock {
  private store: Record<string, string> = {}
  clear() { this.store = {} }
  getItem(key: string) { return this.store[key] ?? null }
  setItem(key: string, value: string) { this.store[key] = String(value) }
  removeItem(key: string) { delete this.store[key] }
  get length() { return Object.keys(this.store).length }
  key(i: number) { return Object.keys(this.store)[i] ?? null }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true
})

afterEach(() => {
  window.localStorage.clear()
})
