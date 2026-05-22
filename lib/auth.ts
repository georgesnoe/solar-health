import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import { user, session, account, verification } from "./schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "client",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      visible: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
      latitude: {
        type: "string",
        required: false,
        input: true,
      },
      longitude: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
})
