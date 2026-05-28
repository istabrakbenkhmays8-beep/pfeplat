#!/usr/bin/env tsx
/**
 * Idempotent seed: connects to MongoDB, wipes catalog collections, then writes
 * categories, courses, sessions, a default trainer, and three fixture users
 * (super_admin, admin, regular learner).
 *
 * Usage: npm run db:seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDb, disconnectDb } from "../src/lib/db";
import {
  Assessment,
  Category,
  Course,
  Enrollment,
  Reservation,
  Session,
  Trainer,
  User,
} from "../src/models";
import { categories as seedCategories, courses as seedCourses } from "../src/data/seed";

const DEFAULT_PW = "ChangeMe!2026";

async function main() {
  console.log("→ Connecting to MongoDB…");
  await connectDb();
  console.log(`  connected to ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);

  // Wipe catalog data only — don't touch real users / payments if any exist.
  console.log("→ Wiping catalog collections…");
  await Promise.all([
    Category.deleteMany({}),
    Course.deleteMany({}),
    Session.deleteMany({}),
    Reservation.deleteMany({}),
    Enrollment.deleteMany({}),
    Assessment.deleteMany({}),
  ]);

  // Categories
  console.log("→ Inserting categories…");
  const insertedCats = await Category.insertMany(
    seedCategories.map((c) => ({
      slug: c.slug,
      name: c.name,
      vendor: c.vendor,
      group: c.group,
    })),
  );
  const slugToCatId = new Map(insertedCats.map((c) => [c.slug, c._id]));
  console.log(`  ${insertedCats.length} categories`);

  // Courses
  console.log("→ Inserting courses…");
  const featuredCodes = new Set(["AZ-104", "ISO27001LI", "CCNA", "NSE4", "PMP", "AZ-500", "PL-300", "DEVOPS"]);
  const insertedCourses = await Course.insertMany(
    seedCourses.map((c) => ({
      code: c.code,
      title: c.title,
      summary: `Official ${c.title} training and certification preparation.`,
      durationDays: c.durationDays,
      category: slugToCatId.get(c.categorySlug),
      modes: ["live_online", "on_site"],
      level: "intermediate",
      priceTnd: c.durationDays * 600,
      coinReward: c.durationDays * 50,
      isFeatured: featuredCodes.has(c.code),
      isPublished: true,
    })),
  );
  const codeToCourseId = new Map(insertedCourses.map((c) => [c.code, c._id]));
  console.log(`  ${insertedCourses.length} courses`);

  // Trainers (a few generic ones — real names land in admin later)
  console.log("→ Inserting trainers…");
  await Trainer.deleteMany({ email: /@advancia-training\.com$/ });
  const trainers = await Trainer.insertMany([
    { firstName: "Mohamed", surname: "Trabelsi", email: "mohamed.trabelsi@advancia-training.com", specialty: "Cisco · Networking", country: "Tunisia" },
    { firstName: "Sarra", surname: "Ben Ali", email: "sarra.benali@advancia-training.com", specialty: "Microsoft Azure", country: "Tunisia" },
    { firstName: "Karim", surname: "Hadj", email: "karim.hadj@advancia-training.com", specialty: "EC-Council · Cybersecurity", country: "Morocco" },
    { firstName: "Olivier", surname: "Martin", email: "olivier.martin@advancia-training.com", specialty: "PMP · Agile", country: "France" },
  ]);
  console.log(`  ${trainers.length} trainers`);

  // Sessions from the June 2026 brochure
  console.log("→ Inserting June 2026 sessions…");
  const sessions = seedCourses
    .filter((c) => c.juneSession)
    .map((c) => {
      const start = new Date(c.juneSession!.start + "T09:00:00Z");
      const end = new Date(c.juneSession!.end + "T17:00:00Z");
      return {
        course: codeToCourseId.get(c.code),
        trainer: trainers[Math.floor(Math.random() * trainers.length)]._id,
        mode: "live_online" as const,
        status: "scheduled" as const,
        startsAt: start,
        endsAt: end,
        capacity: 12,
        location: "Tunis — Charguia 1 campus",
      };
    });
  const insertedSessions = await Session.insertMany(sessions);
  console.log(`  ${insertedSessions.length} sessions`);

  // Fixture users
  console.log("→ Upserting fixture users…");
  const passwordHash = await bcrypt.hash(DEFAULT_PW, 10);
  const fixtures = [
    {
      email: "superadmin@advancia-training.com",
      firstName: "Super",
      surname: "Admin",
      role: "super_admin" as const,
      status: "active" as const,
      country: "Tunisia",
      level: "expert" as const,
    },
    {
      email: "admin@advancia-training.com",
      firstName: "Platform",
      surname: "Admin",
      role: "admin" as const,
      status: "active" as const,
      country: "Tunisia",
      level: "advanced" as const,
    },
    {
      email: "learner@advancia-training.com",
      firstName: "Demo",
      surname: "Learner",
      role: "user" as const,
      status: "active" as const,
      country: "Tunisia",
      level: "beginner" as const,
      walletCoins: 250,
    },
  ];
  for (const f of fixtures) {
    await User.updateOne(
      { email: f.email },
      { $set: { ...f, passwordHash } },
      { upsert: true },
    );
  }
  console.log(`  ${fixtures.length} users upserted (default password: ${DEFAULT_PW})`);

  // A few sample assessments so the quiz runtime has something to drive.
  console.log("→ Inserting sample assessments…");
  const sampleQuizzes: Array<{ code: string; questions: Array<{ prompt: string; options: Array<{ text: string; isCorrect: boolean }>; explanation?: string }> }> = [
    {
      code: "AZ-104",
      questions: [
        {
          prompt: "Which Azure service hosts virtual machines?",
          options: [
            { text: "Azure Virtual Machines", isCorrect: true },
            { text: "Azure Functions", isCorrect: false },
            { text: "Azure DevOps", isCorrect: false },
            { text: "Azure Logic Apps", isCorrect: false },
          ],
        },
        {
          prompt: "Which tier gives the strongest SLA for a virtual machine?",
          options: [
            { text: "Spot", isCorrect: false },
            { text: "Two or more VMs in an availability set", isCorrect: false },
            { text: "Two or more VMs across availability zones", isCorrect: true },
            { text: "A single VM with Premium SSD", isCorrect: false },
          ],
        },
        {
          prompt: "Which command-line tool ships with the official Azure CLI?",
          options: [
            { text: "az", isCorrect: true },
            { text: "azure", isCorrect: false },
            { text: "msaz", isCorrect: false },
            { text: "cloud-cli", isCorrect: false },
          ],
        },
      ],
    },
    {
      code: "CCNA",
      questions: [
        {
          prompt: "Which OSI layer does an IP address belong to?",
          options: [
            { text: "Layer 1 — Physical", isCorrect: false },
            { text: "Layer 2 — Data Link", isCorrect: false },
            { text: "Layer 3 — Network", isCorrect: true },
            { text: "Layer 4 — Transport", isCorrect: false },
          ],
        },
        {
          prompt: "How many usable host addresses are in a /29 IPv4 subnet?",
          options: [
            { text: "2", isCorrect: false },
            { text: "6", isCorrect: true },
            { text: "8", isCorrect: false },
            { text: "14", isCorrect: false },
          ],
        },
        {
          prompt: "Which protocol is connectionless?",
          options: [
            { text: "TCP", isCorrect: false },
            { text: "UDP", isCorrect: true },
            { text: "TLS", isCorrect: false },
            { text: "SSH", isCorrect: false },
          ],
        },
      ],
    },
  ];
  let assessmentsInserted = 0;
  for (const q of sampleQuizzes) {
    const cid = codeToCourseId.get(q.code);
    if (!cid) continue;
    await Assessment.create({
      course: cid,
      title: `${q.code} — practice assessment`,
      description: "A short quiz to validate the basics.",
      passThreshold: 70,
      timeLimitMinutes: 15,
      maxAttempts: 3,
      questions: q.questions.map((qq) => ({
        ...qq,
        type: "single_choice",
        points: 1,
      })),
      isPublished: true,
    });
    assessmentsInserted++;
  }
  console.log(`  ${assessmentsInserted} assessments`);

  // Summary
  console.log("\n✓ Seed complete");
  console.log("┌──────────────┬───────┐");
  console.log("│ Collection   │ Count │");
  console.log("├──────────────┼───────┤");
  for (const [name, Model_] of [
    ["categories", Category],
    ["courses", Course],
    ["sessions", Session],
    ["trainers", Trainer],
    ["users", User],
  ] as const) {
    const n = await Model_.countDocuments();
    console.log(`│ ${name.padEnd(12)} │ ${String(n).padStart(5)} │`);
  }
  console.log("└──────────────┴───────┘");

  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
