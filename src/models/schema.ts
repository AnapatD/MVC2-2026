import { pgTable, serial, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const healthEnum = pgEnum('health_status', ['Healthy', 'Risk']);
export const typeEnum = pgEnum('citizen_type', ['General', 'RiskGroup', 'VIP']);

export const shelters = pgTable('shelters', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  riskLevel: integer('risk_level').notNull(),
});

export const citizens = pgTable('citizens', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  healthStatus: healthEnum('health_status').default('Healthy'),
  registeredAt: timestamp('registered_at').defaultNow(),
  citizenType: typeEnum('citizen_type').default('General'),
});

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  citizenId: text('citizen_id').references(() => citizens.id),
  shelterId: integer('shelter_id').references(() => shelters.id),
  assignedAt: timestamp('assigned_at').defaultNow(),
});