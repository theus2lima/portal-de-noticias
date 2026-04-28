// src/controllers/newsController.js
// Thin layer: parse request → call service → format response.
// No business logic here; that lives in newsService.js.

import { getNewsList, getNewsById } from '../services/newsService.js'

/**
 * GET /news
 * Query params: page, limit, category
 */
export async function listNews(request, reply) {
  const { page = 1, limit = 20, category } = request.query

  const result = await getNewsList({
    page:     Number(page),
    limit:    Math.min(Number(limit), 100), // hard cap: no one should ask for >100
    category: category || undefined,
  })

  return reply.send(result)
}

/**
 * GET /news/:id
 */
export async function getNews(request, reply) {
  const { id } = request.params

  const article = await getNewsById(id)

  if (!article) {
    return reply.code(404).send({ error: 'Article not found' })
  }

  return reply.send(article)
}
