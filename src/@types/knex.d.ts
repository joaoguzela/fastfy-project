import { Knex } from 'knex'

declare module 'knex/types/tables' {
  interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string
    }
  }
}
