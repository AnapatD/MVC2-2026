import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// ////////////////
// src/index.ts
import { db } from './models/index.js';
import { citizens, shelters } from './models/schema.js';

// --- TEST: เพิ่มศูนย์พักพิง (Shelter) ---
app.get('/test/add-shelter', async (c) => {
  try {
    const result = await db.insert(shelters).values({
      name: "KMITL",
      capacity: 2,
      riskLevel: 1
    }).returning();
    
    return c.json({ message: "เพิ่มศูนย์สำเร็จ!", data: result });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});

// --- TEST: เพิ่มประชาชน (Citizen) ---
app.get('/test/add-citizen', async (c) => {
  try {
    const result = await db.insert(citizens).values({
      id: "999" + Math.floor(Math.random() * 1000000),
      name: "อนพัทย์ ด่านจิระมนตรี",
      age: 75,
      healthStatus: "Healthy",
      citizenType: "General"
    }).returning();
    
    return c.json({ message: "เพิ่มคนสำเร็จ!", data: result });
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : "Error" }, 500);
  }
});
// ////////////////


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
