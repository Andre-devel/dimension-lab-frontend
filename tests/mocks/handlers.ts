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
    HttpResponse.json([
      {
        id: 'quote-1',
        description: 'Peça mecânica para protótipo industrial de alta precisão',
        material: 'PLA',
        color: 'Branco',
        quantity: 5,
        finish: 'Padrão',
        desiredDeadline: '2026-04-15',
        status: 'RECEIVED',
        createdAt: '2026-03-11T00:00:00Z',
        customer: { id: 'cust-1', name: 'João Silva', email: 'joao@example.com', whatsapp: '11999999999' },
        files: [],
      },
      {
        id: 'quote-2',
        description: 'Suporte para câmera de segurança residencial',
        material: 'PETG',
        color: 'Preto',
        quantity: 2,
        finish: 'Lixado',
        desiredDeadline: '2026-05-01',
        status: 'UNDER_REVIEW',
        createdAt: '2026-03-10T00:00:00Z',
        customer: { id: 'cust-2', name: 'Maria Souza', email: 'maria@example.com' },
        files: [],
      },
    ]),
  ),

  http.patch(`${BASE_URL}/api/v1/quotes/:id/status`, ({ params, request }) =>
    request.json().then((body: unknown) => {
      const b = body as { status?: string }
      return HttpResponse.json({
        id: params['id'],
        description: 'Peça mecânica para protótipo industrial de alta precisão',
        material: 'PLA',
        color: 'Branco',
        quantity: 5,
        finish: 'Padrão',
        desiredDeadline: '2026-04-15',
        status: b.status ?? 'UNDER_REVIEW',
        createdAt: '2026-03-11T00:00:00Z',
        customer: { id: 'cust-1', name: 'João Silva', email: 'joao@example.com', whatsapp: '11999999999' },
        files: [],
      })
    }),
  ),

  http.get(`${BASE_URL}/api/v1/portfolio-items`, () =>
    HttpResponse.json([
      {
        id: 'item-1',
        title: 'Suporte para câmera',
        category: { id: 'cat-1', name: 'Mecânico', slug: 'mecanico' },
        material: 'PLA',
        printTime: 3,
        complexity: 'Médio',
        photos: [],
        visible: true,
      },
      {
        id: 'item-2',
        title: 'Vaso decorativo',
        category: { id: 'cat-2', name: 'Decorativo', slug: 'decorativo' },
        material: 'PETG',
        printTime: 5,
        complexity: 'Fácil',
        photos: [],
        visible: true,
      },
    ]),
  ),

  http.get(`${BASE_URL}/api/v1/portfolio-items/:id`, ({ params }) =>
    HttpResponse.json({
      id: params['id'],
      title: 'Suporte para câmera',
      category: { id: 'cat-1', name: 'Mecânico', slug: 'mecanico' },
      material: 'PLA',
      printTime: 3,
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
