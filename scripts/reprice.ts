#!/usr/bin/env tsx
/**
 * One-shot price/coin-reward update.
 *
 * Reads the realistic prices from src/data/seed.ts and updates ONLY priceTnd + coinReward
 * on existing Course documents. Doesn't touch enrollments, payments, users, or anything else.
 *
 * Safe to run repeatedly.
 *
 * Usage: npm run db:reprice
 */
import "dotenv/config";
import { connectDb, disconnectDb } from "../src/lib/db";
import { Course } from "../src/models";
import { courses as seedCourses, priceForCourse, coinRewardForCourse } from "../src/data/seed";

async function main() {
  await connectDb();
  console.log(`→ Repricing ${seedCourses.length} catalog courses…`);

  let updated = 0;
  let unchanged = 0;
  let missing = 0;

  for (const c of seedCourses) {
    const priceTnd = priceForCourse(c.code, c.durationDays);
    const coinReward = coinRewardForCourse(c.code, c.durationDays);
    const r = await Course.updateOne(
      { code: c.code.toUpperCase() },
      { $set: { priceTnd, coinReward } },
    );
    if (r.matchedCount === 0) {
      missing++;
      console.warn(`  ! no course in DB for code=${c.code}`);
    } else if (r.modifiedCount > 0) {
      updated++;
      console.log(`  ✓ ${c.code.padEnd(12)} → ${priceTnd} DT · +${coinReward} coins`);
    } else {
      unchanged++;
    }
  }

  console.log(`\nDone. updated=${updated} unchanged=${unchanged} missing=${missing}`);
  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
