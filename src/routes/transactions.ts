import { FastifyInstance } from 'fastify'
import { string, z } from 'zod'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { authorizationCookie } from '../middleware/authorizationCook'
import { Session } from 'node:inspector'
// Cookies <--> formas de manter contexto entre requisições

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    '/',
    { preHandler: [authorizationCookie] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select('*')
      return transactions
    },
  )
  app.get('/summary', { preHandler: [authorizationCookie] }, async () => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()
    return summary
  })
  app.get('/:id', async (request) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getTransactionsParamsSchema.parse(request.params)
    const sessionId = request.cookies.sessionId

    const transaction = await knex('transactions')
      .where('id', id)
      .andWhere('session_id', sessionId)
      .first()
    return transaction
  })
  app.post('/', async (request, reply) => {
    const crateTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = crateTransactionSchema.parse(request.body)

    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })
    return reply.status(201).send()
  })
}
