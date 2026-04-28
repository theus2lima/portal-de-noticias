// src/routes/news.js
// Fastify route definitions for the /news namespace.
// Input validation is handled via Fastify's built-in JSON Schema support —
// invalid requests are rejected before they hit the controller.

import { listNews, getNews } from '../controllers/newsController.js'

// JSON Schema for query-string validation (GET /news)
const listNewsSchema = {
  querystring: {
    type: 'object',
    properties: {
      page:     { type: 'integer', minimum: 1,  default: 1  },
      limit:    { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      category: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data:  { type: 'array'   },
        total: { type: 'integer' },
        page:  { type: 'integer' },
        limit: { type: 'integer' },
      },
    },
  },
}

// JSON Schema for params validation (GET /news/:id)
const getNewsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      // UUID v4 format
      id: {
        type: 'string',
        pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
      },
    },
  },
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function newsRoutes(fastify) {
  fastify.get('/news',     { schema: listNewsSchema }, listNews)
  fastify.get('/news/:id', { schema: getNewsSchema  }, getNews)
}
