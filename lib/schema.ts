import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  pgEnum,
} from "drizzle-orm/pg-core"

export const userRoles = pgEnum("role", ["admin", "client", "technician"])
export const panelStatus = pgEnum("panel_status", ["active", "inactive"])
export const energyType = pgEnum("energy_type", ["production", "consumption"])
export const interventionStatus = pgEnum("intervention_status", ["pending", "confirmed"])
export const simulationStrategy = pgEnum("simulation_strategy", ["automatic", "manual"])
export const simulationTrigger = pgEnum("simulation_trigger", ["scheduled", "on_demand"])

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: userRoles().default("client"),
  phone: text("phone"),
  visible: boolean("visible").default(false).notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const solarPanel = pgTable(
  "solar_panel",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    powerRatingWp: text("power_rating_wp").notNull(),
    installationDate: timestamp("installation_date"),
    status: panelStatus().default("active").notNull(),
    simulationStrategy: simulationStrategy().default("automatic").notNull(),
    simulationTrigger: simulationTrigger().default("scheduled").notNull(),
    manualProductionPct: integer("manual_production_pct").default(100).notNull(),
    manualConsumptionPct: integer("manual_consumption_pct").default(50).notNull(),
    notes: text("notes"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("panel_userId_idx").on(table.userId)]
)

export const energyRecord = pgTable(
  "energy_record",
  {
    id: text("id").primaryKey(),
    panelId: text("panel_id").references(() => solarPanel.id, { onDelete: "set null" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    type: energyType().notNull(),
    value: text("value").notNull(),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("energy_panelId_idx").on(table.panelId),
    index("energy_userId_idx").on(table.userId),
    index("energy_type_idx").on(table.type),
    index("energy_recordedAt_idx").on(table.recordedAt),
  ]
)

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const solarPanelRelations = relations(solarPanel, ({ one, many }) => ({
  user: one(user, {
    fields: [solarPanel.userId],
    references: [user.id],
  }),
  energyRecords: many(energyRecord),
}))

export const alert = pgTable(
  "alert",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    expected: text("expected").notNull(),
    actual: text("actual").notNull(),
    percentage: text("percentage").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("alert_userId_idx").on(table.userId)]
)

export const alertRelations = relations(alert, ({ one }) => ({
  user: one(user, {
    fields: [alert.userId],
    references: [user.id],
  }),
}))

export const energyRecordRelations = relations(energyRecord, ({ one }) => ({
  panel: one(solarPanel, {
    fields: [energyRecord.panelId],
    references: [solarPanel.id],
  }),
  user: one(user, {
    fields: [energyRecord.userId],
    references: [user.id],
  }),
}))

export const intervention = pgTable(
  "intervention",
  {
    id: text("id").primaryKey(),
    alertId: text("alert_id").references(() => alert.id, { onDelete: "set null" }),
    technicianId: text("technician_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: interventionStatus().default("pending").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("intervention_technician_idx").on(table.technicianId),
    index("intervention_client_idx").on(table.clientId),
  ]
)

export const interventionRelations = relations(intervention, ({ one }) => ({
  technician: one(user, {
    fields: [intervention.technicianId],
    references: [user.id],
  }),
  client: one(user, {
    fields: [intervention.clientId],
    references: [user.id],
  }),
  alert: one(alert, {
    fields: [intervention.alertId],
    references: [alert.id],
  }),
}))

export const review = pgTable(
  "review",
  {
    id: text("id").primaryKey(),
    interventionId: text("intervention_id")
      .notNull()
      .references(() => intervention.id, { onDelete: "cascade" }),
    technicianId: text("technician_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    score: text("score").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("review_technician_idx").on(table.technicianId),
    index("review_intervention_idx").on(table.interventionId),
  ]
)

export const reviewRelations = relations(review, ({ one }) => ({
  intervention: one(intervention, {
    fields: [review.interventionId],
    references: [intervention.id],
  }),
  technician: one(user, {
    fields: [review.technicianId],
    references: [user.id],
  }),
  client: one(user, {
    fields: [review.clientId],
    references: [user.id],
  }),
}))
