import fastify from 'fastify'
import { env } from '../env/index'
import { transactionRoutes } from './routes/transactions'
import cookie from '@fastify/cookie'
import { getEnvironmentData } from 'node:worker_threads'

const app = fastify()
app.register(cookie)

app.register(transactionRoutes, { prefix: 'transactions' })

app.listen({ host: '0.0.0.0', port: env.PORT }).then(() => {
  console.log('HTTP Server Running')
})
