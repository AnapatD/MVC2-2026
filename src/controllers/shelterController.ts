import type { Context } from 'hono';
import { db } from '../models/index.js';
import { citizens, shelters, assignments } from '../models/schema.js';
import { eq, isNull, sql } from 'drizzle-orm';

export const ShelterController = {
  getRegistrationPage: async (c: Context) => {
    const allCitizens = await db.select().from(citizens);
    return c.json(allCitizens);
  },

  allocateShelters: async (c: Context) => {
    const pendingCitizens = await db.select().from(citizens)
      .where(sql`${citizens.id} NOT IN (SELECT citizen_id FROM assignments)`)
      .orderBy(sql`CASE WHEN age < 12 OR age > 60 THEN 1 ELSE 2 END`);

    const allShelters = await db.select().from(shelters);

    for (const person of pendingCitizens) {
      for (const shelter of allShelters) {
        const currentCount = await db.select({ count: sql`count(*)` })
          .from(assignments)
          .where(eq(assignments.shelterId, shelter.id));
        
        const isFull = Number(currentCount[0].count) >= shelter.capacity;

        const healthCheck = person.healthStatus === 'Risk' ? shelter.riskLevel <= 2 : true;

        if (!isFull && healthCheck) {
          await db.insert(assignments).values({
            citizenId: person.id,
            shelterId: shelter.id,
          });
          break;
        }
      }
    }
    return c.redirect('/report');
  },

  getReport: async (c: Context) => {
    const successList = await db.select().from(assignments)
      .innerJoin(citizens, eq(assignments.citizenId, citizens.id))
      .innerJoin(shelters, eq(assignments.shelterId, shelters.id));

    const missingList = await db.select().from(citizens)
      .where(sql`${citizens.id} NOT IN (SELECT citizen_id FROM assignments)`);

    return c.json({ success: successList, missing: missingList });
  }
};