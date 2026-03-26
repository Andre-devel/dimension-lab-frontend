/* eslint-disable @typescript-eslint/no-explicit-any */
function gtag(...args: unknown[]) {
  if (typeof (window as any).gtag === 'function') {
    ;(window as any).gtag(...args)
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  gtag('event', name, params)
}

export function setVisitorId(visitorId: string) {
  gtag('set', 'user_properties', { visitor_id: visitorId })
}
