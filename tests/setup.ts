import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { server } from './mocks/server'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// jsdom does not implement IntersectionObserver — stub it for components that use Reveal
global.IntersectionObserver = class {
  observe() {}
  disconnect() {}
  unobserve() {}
} as unknown as typeof IntersectionObserver

// jsdom does not implement scrollBy — stub it for components that use Carousel
Element.prototype.scrollBy = function () {}

// jsdom does not implement scrollIntoView — stub it for QuoteRequest color field
Element.prototype.scrollIntoView = function () {}
