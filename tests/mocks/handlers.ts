import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:8080'

export const handlers = [
  http.post(`${BASE_URL}/api/v1/quotes`, () =>
    HttpResponse.json({
      id: 'quote-1',
      description: 'Test quote',
      material: 'PLA',
      color: 'white',
      quantity: 1,
      finish: 'Padrão',
      desiredDeadline: '2026-04-01',
      status: 'RECEIVED',
      createdAt: '2026-03-11T00:00:00Z',
      files: [],
    }),
  ),

  http.get(`${BASE_URL}/api/v1/quotes/my`, () =>
    HttpResponse.json([]),
  ),

  http.get(`${BASE_URL}/api/v1/quotes`, () =>
    HttpResponse.json([]),
  ),

  http.patch(`${BASE_URL}/api/v1/quotes/:id/status`, () =>
    HttpResponse.json({
      id: 'quote-1',
      status: 'UNDER_REVIEW',
    }),
  ),

  http.get(`${BASE_URL}/api/v1/portfolio-items`, () =>
    HttpResponse.json([]),
  ),

  http.get(`${BASE_URL}/api/v1/portfolio-items/:id`, ({ params }) =>
    HttpResponse.json({
      id: params['id'],
      title: 'Test Item',
      category: { id: 'cat-1', name: 'Geral', slug: 'geral' },
      material: 'PLA',
      printTime: '4h',
      complexity: 'Médio',
      photos: [],
      visible: true,
    }),
  ),

  http.get(`${BASE_URL}/api/v1/auth/me`, () =>
    HttpResponse.json({ id: 'user-1', name: 'Test User', email: 'test@test.com', role: 'CLIENT' }),
  ),

  http.post(`${BASE_URL}/api/v1/auth/logout`, () =>
    new HttpResponse(null, { status: 204 }),
  ),
]
