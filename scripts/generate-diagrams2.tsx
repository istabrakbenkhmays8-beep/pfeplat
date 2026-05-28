#!/usr/bin/env tsx
/**
 * Generates `diagrams2.pdf` — UML diagrams of the Advancia Training platform,
 * authored as diagram-as-code (Mermaid + PlantUML) and rendered to PNG via the
 * public kroki.io service so the line layout follows real UML conventions
 * (no hand-drawn crossings).
 *
 *   - Use case diagrams: PlantUML (true UML usecase / actor primitives)
 *   - Class diagrams:    Mermaid classDiagram (inheritance, aggregation, cardinality)
 *   - Sequence diagrams: Mermaid sequenceDiagram (activations, alt/loop fragments)
 *
 * Run: npm run gen:diagrams2
 * Requires internet (kroki.io).
 */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToFile,
} from "@react-pdf/renderer";
import path from "node:path";

// ─────────────────────────── kroki bridge ───────────────────────────

type DiagramType = "mermaid" | "plantuml";

async function renderDiagram(source: string, type: DiagramType): Promise<Buffer> {
  const url = `https://kroki.io/${type}/png`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: source,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`kroki ${type} ${res.status}: ${detail.slice(0, 400)}\n--- source ---\n${source}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ─────────────────────────── diagram sources ───────────────────────────

// ---- USE CASE (PlantUML) ----

const UC_OVERVIEW = `
@startuml
skinparam dpi 150
skinparam backgroundColor #FFFFFF
skinparam actorStyle awesome
skinparam shadowing false
left to right direction

actor Visitor
actor "User" as UserAct
actor Admin
actor "Super Admin" as SAdmin
actor "AI Agent\\n(Avi)" as Avi
actor "Email Gateway" as Email

UserAct --|> Visitor
SAdmin --|> Admin

rectangle "Advancia Training Platform" {
  usecase "Browse catalog"        as UC1
  usecase "View course detail"    as UC2
  usecase "Contact form"          as UC3
  usecase "Register / Login"      as UC4
  usecase "Enroll in course"      as UC5
  usecase "Pay (card / wallet)"   as UC6
  usecase "Take assessment"       as UC7
  usecase "Earn certificate"      as UC8
  usecase "Reserve session"       as UC9
  usecase "Earn / spend coins"    as UC10
  usecase "Chatbot (Ada)"         as UC11
  usecase "Manage courses"        as UC12
  usecase "Manage sessions"       as UC13
  usecase "Manage users"          as UC14
  usecase "Import / Export"       as UC15
  usecase "Admin chatbot (Adi)"   as UC16
  usecase "Manage admins"         as UC17
  usecase "Approve reservation"   as UC18
  usecase "Assign trainer"        as UC19
  usecase "Audit log / Settings"  as UC20
  usecase "Agent (Avi) — HITL"    as UC21

  Visitor --> UC1
  Visitor --> UC2
  Visitor --> UC3
  Visitor --> UC4

  UserAct --> UC5
  UserAct --> UC6
  UserAct --> UC7
  UserAct --> UC8
  UserAct --> UC9
  UserAct --> UC10
  UserAct --> UC11

  Admin --> UC12
  Admin --> UC13
  Admin --> UC14
  Admin --> UC15
  Admin --> UC16

  SAdmin --> UC17
  SAdmin --> UC18
  SAdmin --> UC19
  SAdmin --> UC20
  SAdmin --> UC21

  UC11 ..> Avi : <<include>>
  UC16 ..> Avi : <<include>>
  UC21 ..> Avi : <<include>>
  UC19 ..> Email : <<notify>>
  UC4  ..> Email : <<notify>>
}
@enduml
`.trim();

const UC_VISITOR = `
@startuml
skinparam dpi 150
skinparam backgroundColor #FFFFFF
left to right direction
actor Visitor

rectangle "Public site" {
  usecase "Browse catalog"          as V1
  usecase "Filter by vendor/domain" as V2
  usecase "Search courses"          as V3
  usecase "View course detail"      as V4
  usecase "View public calendar"    as V5
  usecase "Submit contact form"     as V6
  usecase "Register"                as V7
  usecase "Sign in"                 as V8
  usecase "Forgot password"         as V9
}

Visitor --> V1
Visitor --> V2
Visitor --> V3
Visitor --> V4
Visitor --> V5
Visitor --> V6
Visitor --> V7
Visitor --> V8
Visitor --> V9

V7 ..> V8 : <<extends>>
@enduml
`.trim();

const UC_USER = `
@startuml
skinparam dpi 150
skinparam backgroundColor #FFFFFF
left to right direction
actor "User (learner)" as UserAct

rectangle "Learner area" {
  usecase "Enroll in course"      as U1
  usecase "Reserve session"       as U2
  usecase "Pay by card"           as U3
  usecase "Partial pay (coins)"   as U4
  usecase "Take assessment"       as U5
  usecase "Play game-course"      as U6
  usecase "Earn / spend coins"    as U7
  usecase "Download certificate"  as U8
  usecase "View leaderboard"      as U9
  usecase "Personal calendar"     as U10
  usecase "Chat with Ada"         as U11
  usecase "Manage profile"        as U12
}

UserAct --> U1
UserAct --> U2
UserAct --> U3
UserAct --> U4
UserAct --> U5
UserAct --> U6
UserAct --> U7
UserAct --> U8
UserAct --> U9
UserAct --> U10
UserAct --> U11
UserAct --> U12

U3 ..> U4 : <<extends>>
U5 ..> U8 : <<include>>
U6 ..> U7 : <<include>>
@enduml
`.trim();

const UC_ADMIN = `
@startuml
skinparam dpi 150
skinparam backgroundColor #FFFFFF
left to right direction
actor Admin

rectangle "Admin space" {
  usecase "Manage courses"      as A1
  usecase "Manage categories"   as A2
  usecase "Manage sessions"     as A3
  usecase "Manage users"        as A4
  usecase "Import users (XLSX)" as A5
  usecase "Export users (XLSX)" as A6
  usecase "Export users (PDF)"  as A7
  usecase "Admin dashboard"     as A8
  usecase "Calendar (full)"     as A9
  usecase "Chat with Adi"       as A10
}

Admin --> A1
Admin --> A2
Admin --> A3
Admin --> A4
Admin --> A5
Admin --> A6
Admin --> A7
Admin --> A8
Admin --> A9
Admin --> A10

A6 ..> A4 : <<extends>>
A7 ..> A4 : <<extends>>
@enduml
`.trim();

const UC_SADMIN = `
@startuml
skinparam dpi 150
skinparam backgroundColor #FFFFFF
left to right direction
actor "Super Admin" as SAdmin
actor "AI Agent (Avi)" as Avi
actor "Email Gateway" as Email

rectangle "Super Admin space" {
  usecase "Manage admins"             as S1
  usecase "Approve reservation"       as S2
  usecase "Reject reservation"        as S3
  usecase "Assign trainer to session" as S4
  usecase "Send trainer email"        as S5
  usecase "Audit log"                 as S6
  usecase "Global settings"           as S7
  usecase "Agent — propose action"    as S8
  usecase "Agent — approve & run"     as S9
  usecase "Proactive insights"        as S10
}

SAdmin --> S1
SAdmin --> S2
SAdmin --> S3
SAdmin --> S4
SAdmin --> S6
SAdmin --> S7
SAdmin --> S8
SAdmin --> S9
SAdmin --> S10

S4 ..> S5 : <<include>>
S8 ..> Avi : <<include>>
S9 ..> Avi : <<include>>
S10 ..> Avi : <<include>>
S5 ..> Email : <<notify>>
@enduml
`.trim();

// ---- CLASS DIAGRAMS (Mermaid) ----

const CLASS_CORE = `
classDiagram
direction LR

class User {
  +String firstName
  +String surname
  +String email
  -String passwordHash
  +UserRole role
  +UserStatus status
  +Gender gender
  +Int age
  +String country
  +LearnerLevel level
  +Int walletCoins
  +Int currentStreak
  +Badge[] badges
  +Date lastLoginAt
  +Int failedLoginCount
  +Date lockedUntil
}

class Category {
  +String slug
  +String name
  +Vendor vendor
  +String group
  +String description
}

class Course {
  +String code
  +String title
  +String summary
  +CourseMode[] modes
  +CourseLevel level
  +Float durationDays
  +Float priceTnd
  +Int coinReward
  +Boolean isGame
  +Boolean isFeatured
  +Boolean isPublished
  +String[] learningOutcomes
  +String[] prerequisites
}

class Session {
  +SessionMode mode
  +SessionStatus status
  +Date startsAt
  +Date endsAt
  +Int capacity
  +Int enrolledCount
  +String location
  +String meetingLink
  +String notes
}

class Trainer {
  +String firstName
  +String surname
  +String email
  +String specialty
  +String bio
  +String country
  +Boolean isActive
}

class Enrollment {
  +EnrollmentStatus status
  +Int progress
  +Date completedAt
  +Boolean coinsAwarded
  +Date coinsAwardedAt
}

class Reservation {
  +ReservationStatus status
  +Date reviewedAt
  +String reviewNote
}

Course "1" --> "1" Category : belongs to
Course "1" --> "0..*" Session : has
Session "0..*" --> "0..1" Trainer : run by
User "1" --> "0..*" Enrollment : holds
Course "1" --> "0..*" Enrollment : enrolled
User "1" --> "0..*" Reservation : makes
Session "1" --> "0..*" Reservation : booked
`.trim();

const CLASS_AUX = `
classDiagram
direction LR

class Assessment {
  +String title
  +String description
  +Int passThreshold
  +Int timeLimitMinutes
  +Int maxAttempts
  +Question[] questions
  +Boolean isPublished
}

class AssessmentResult {
  +Int attempt
  +Int score
  +Boolean passed
  +Answer[] answers
  +Date startedAt
  +Date submittedAt
  +Int timeTakenSeconds
}

class Certificate {
  +String serial
  +Date issuedAt
  +String pdfUrl
  +Date revokedAt
  +String revokeReason
}

class Payment {
  +PaymentProvider provider
  +String providerRef
  +PaymentMethod method
  +Float amountTnd
  +Int coinsUsed
  +PaymentStatus status
  +String failureReason
  +Date paidAt
  +Date refundedAt
}

class CoinTransaction {
  +Int delta
  +CoinReason reason
  +Int balanceAfter
  +String note
}

class EmailToken {
  +String tokenHash
  +EmailTokenType type
  +Date expiresAt
  +Date usedAt
  +String ip
  +String userAgent
}

class AIConversation {
  +AiScope scope
  +String title
  +Message[] messages
  +Date lastMessageAt
}

class AuditLog {
  +AuditAction action
  +String actorRole
  +String targetType
  +ObjectId targetId
  +Object before
  +Object after
  +Object metadata
  +String ip
  +String userAgent
}

class User
class Course
class Enrollment

Course "1" --> "0..*" Assessment : has
Assessment "1" --> "0..*" AssessmentResult : produces
User "1" --> "0..*" AssessmentResult : answers
User "1" --> "0..*" Certificate : holds
Course "1" --> "0..*" Certificate : awarded
User "1" --> "0..*" Payment : pays
Course "1" --> "0..*" Payment : for
Enrollment "1" --> "0..*" Payment : settles
User "1" --> "0..*" CoinTransaction : earns
User "1" --> "0..*" EmailToken : owns
User "1" --> "0..*" AIConversation : converses
User "0..1" --> "0..*" AuditLog : acts
`.trim();

// ---- SEQUENCE DIAGRAMS (Mermaid) ----

const SEQ_REGISTER = `
sequenceDiagram
autonumber
actor Visitor
participant API as /api/auth/register
participant Repo as UserRepo
participant Tok as EmailToken
participant Mail as emailService
participant SMTP

Visitor->>+API: POST /register {email, pwd}
API->>+Repo: Zod validate then findByEmail
Repo-->>-API: null
API->>API: bcrypt.hash(pwd, 10)
API->>+Repo: create User (status=pending_verification)
Repo-->>-API: user._id
API->>+Tok: createHashed(token, type=verify_email, TTL=30min)
Tok-->>-API: rawToken
API->>+Mail: sendVerification(email, link)
Mail->>+SMTP: nodemailer.sendMail
SMTP-->>-Mail: message-id
Mail-->>-API: ok
API-->>-Visitor: 201 Created

Note over Visitor,Tok: Later — GET /verify?token=...
Visitor->>+API: GET /verify?token=raw
API->>+Tok: find by SHA-256(token), check expiresAt
Tok-->>-API: valid
API->>+Repo: status = active, mark token usedAt
Repo-->>-API: ok
API-->>-Visitor: redirect /auth/login
`.trim();

const SEQ_LOGIN = `
sequenceDiagram
autonumber
actor User
participant API as /api/auth/[...nextauth]
participant Repo as UserRepo
participant BC as bcrypt
participant JWT as jose

User->>+API: POST signIn {email, pwd}
API->>+Repo: findByEmail(.select +passwordHash)
Repo-->>-API: user | null
alt user not found
  API-->>User: 401 Unauthorized
else status != active or locked
  API-->>User: 403 Forbidden
else
  API->>+BC: compare(pwd, user.passwordHash)
  BC-->>-API: match
  alt password incorrect
    API->>Repo: failedLoginCount++; if >= N → lockedUntil
    API-->>User: 401 Unauthorized
  else success
    API->>+JWT: encode {sub: userId, role}
    JWT-->>-API: token
    API->>Repo: lastLoginAt = now, failedLoginCount = 0
    API-->>User: 200 OK + Set-Cookie httpOnly
  end
end
`.trim();

const SEQ_RESET = `
sequenceDiagram
autonumber
actor User
participant Forgot as /api/auth/forgot
participant Repo as UserRepo
participant Tok as EmailToken
participant Mail as emailService
participant Reset as /api/auth/reset

User->>+Forgot: POST {email}
Forgot->>+Repo: findByEmail(email)
Repo-->>-Forgot: user | null
alt user exists
  Forgot->>+Tok: createHashed(token, type=reset_password, TTL=15min)
  Tok-->>-Forgot: rawToken
  Forgot->>Mail: sendPasswordReset(email, link)
end
Forgot-->>-User: 200 (same response regardless — no enumeration)

Note over User,Reset: User clicks link in email
User->>+Reset: POST {token, newPassword}
Reset->>+Tok: find by SHA-256(token), check expiresAt and usedAt
Tok-->>-Reset: valid token
Reset->>Repo: passwordHash = bcrypt(newPassword); mark token usedAt
Reset-->>-User: 200 → redirect /auth/login
`.trim();

const SEQ_BROWSE_ENROLL = `
sequenceDiagram
autonumber
actor User
participant UI as /catalog (RSC)
participant Repo as courseRepo
participant API as /api/enrollments
participant Svc as enrollmentService
participant DB as Mongo

User->>+UI: GET /catalog?q=AZ&vendor=Microsoft
UI->>+Repo: searchCatalog(filters)
Repo->>+DB: Course.find + populate(category) + withNextSession
DB-->>-Repo: courses[]
Repo-->>-UI: CatalogCourse[]
UI-->>-User: HTML page (RSC streamed)

User->>+API: POST {courseCode}
API->>+Svc: enroll(userId, courseCode)
Svc->>+DB: Course.findOne({code})
DB-->>-Svc: course
alt course.priceTnd > 0
  Svc-->>API: {needsPayment: true}
  API-->>User: 200 → redirect /checkout
else free
  Svc->>+DB: Enrollment.create(user, course, status=active)
  DB-->>-Svc: enrollment._id
  Svc-->>-API: {enrollmentId}
  API-->>-User: 200 → redirect /my-courses
end
`.trim();

const SEQ_CHECKOUT = `
sequenceDiagram
autonumber
actor User
participant API as /api/checkout
participant Svc as paymentService
participant Repo as Course repo
participant GW as Gateway adapter
participant DB as Mongo (txn)

User->>+API: POST {courseCode, method, coinsUsed}
API->>+Svc: checkout(input)
Svc->>+Repo: Course.findByCode
Repo-->>-Svc: course
Svc->>Svc: validate coinsUsed ≤ wallet and ≤ price
Svc->>Svc: amountToCharge = price − discount(coinsUsed)
alt amountToCharge > 0
  Svc->>+GW: charge(amount, providerRef)
  GW-->>-Svc: {status, providerRef}
end
alt charge ok
  Svc->>+DB: create Payment(status=succeeded)
  Svc->>DB: upsert Enrollment(user, course, status=active)
  Svc->>DB: insert CoinTransaction(-coinsUsed, purchase_discount)
  Svc->>DB: User.walletCoins -= coinsUsed
  DB-->>-Svc: ok (atomic)
  Svc-->>API: {paymentId, enrollmentId}
  API-->>User: 200 → redirect /my-courses
else charge failed
  Svc->>DB: create Payment(status=failed, failureReason)
  Svc-->>API: error
  API-->>User: 402 Payment Required
end
deactivate Svc
deactivate API
`.trim();

const SEQ_ASSESSMENT = `
sequenceDiagram
autonumber
actor User
participant UI as /assessment/[code]
participant API as /api/assessments/submit
participant ASvc as assessmentService
participant CSvc as certificateService
participant DB as Mongo + PDF

User->>+UI: GET — load questions
UI-->>-User: QuizRunner mounted
User->>+API: POST {assessmentId, answers[]}
API->>+ASvc: grade(answers)
ASvc->>+DB: AssessmentResult.create(attempt, score, passed)
DB-->>-ASvc: result
ASvc-->>-API: {score, passed}

alt not passed
  API-->>User: 200 {passed: false, retryHint}
else passed
  API->>+CSvc: issueCertificate(user, course)
  CSvc->>+DB: Enrollment: if !coinsAwarded → grant coinReward
  CSvc->>DB: CoinTransaction(+coinReward, assessment_pass)
  CSvc->>DB: Certificate.create(serial=ADV-cert-…)
  DB-->>-CSvc: certificateId
  CSvc-->>-API: certificateId
  API-->>-User: 200 {passed: true, certificateId}

  User->>+UI: GET /certificates
  UI->>DB: stream PDF (@react-pdf/renderer)
  UI-->>-User: certificate.pdf
end
`.trim();

const SEQ_TRAINER_ASSIGN = `
sequenceDiagram
autonumber
actor SAdmin as Super Admin
participant UI as /super-admin/sessions
participant API as /api/super-admin/sessions/[id]/assign-trainer
participant Svc as trainerService
participant DB as Mongo
participant Mail as emailService
participant SMTP

SAdmin->>+UI: click Assign {sessionId, trainerId}
UI->>+API: POST {sessionId, trainerId}
API->>+Svc: assignTrainer(sessionId, trainerId, actor)
Svc->>+DB: Session.findById.populate(course)
DB-->>-Svc: session
Svc->>+DB: Trainer.findById(trainerId)
DB-->>-Svc: trainer
Svc->>DB: Session.update(trainer, status=confirmed)
Svc->>+Mail: sendTrainerNotice({trainer, session, course, enrolledCount})
Mail->>+SMTP: nodemailer.sendMail
SMTP-->>-Mail: message-id
Mail-->>-Svc: ok
Svc->>DB: AuditLog.create(trainer.assigned, before/after)
Svc-->>-API: {sessionId, trainer}
API-->>-UI: 200
UI-->>-SAdmin: toast 'Trainer notified'
`.trim();

const SEQ_AGENT_HITL = `
sequenceDiagram
autonumber
actor SAdmin as Super Admin
participant UI as ChatWidget
participant Agent as /api/ai/agent
participant Svc as agentService
participant Claude as Anthropic API
participant Tools as agentTools
participant DB as Mongo + email

SAdmin->>+UI: "What should I do next?"
UI->>+Agent: POST {message, history}
Agent->>+Svc: runAgent(history, msg, actorId)

loop tool-use loop (max 8 hops)
  Svc->>+Claude: messages.create(system, tools)
  Claude-->>-Svc: response (text + tool_use blocks)
  alt read-only tool
    Svc->>+Tools: execute(input)
    Tools->>DB: query (read-only)
    Tools-->>-Svc: result
    Svc->>DB: AuditLog ai.tool_invoked
    Svc->>Svc: append tool_result, continue loop
  else mutating tool (proposal)
    Svc->>Svc: build Proposal {name, input, toolUseId, resumeContext}
    Note over Svc: stop loop
  end
end

Svc-->>-Agent: {reply, proposals[]}
Agent-->>-UI: stream proposals
UI-->>SAdmin: render "Show arguments" + Approve

SAdmin->>+UI: click Approve
UI->>+Agent: POST /execute {proposalId}
Agent->>+Svc: executeProposal(proposal, actorId)
Svc->>+Tools: execute(input) — mutating
Tools->>DB: trainerService.assign / approveReservation / etc.
Tools->>DB: emailService.sendTrainerNotice (if applicable)
Tools-->>-Svc: result
Svc->>DB: AuditLog ai.action_executed
Svc->>+Claude: tool_result + resumeContext → final wrap-up
Claude-->>-Svc: follow-up sentence
Svc-->>-Agent: {ok, followUp, result}
Agent-->>-UI: 200
UI-->>-SAdmin: 'Done — trainer notified'
`.trim();

const SEQ_AI_STREAM = `
sequenceDiagram
autonumber
actor User
participant UI as ChatWidget
participant API as /api/ai/chat
participant Svc as aiService
participant Claude as Anthropic API
participant DB as AIConversation

User->>+UI: type message, press Enter
UI->>+API: POST {scope:'user', history, message}
API->>+Svc: ensureConversation(userId, scope)
Svc->>DB: find-or-create AIConversation
Svc-->>API: conversationId
API->>+Svc: streamChat(scope, userId, history)
Svc->>Svc: buildUserContext(userId): user + 20 enrollments
Svc->>+Claude: messages.stream({system + context, model, messages})
loop streaming
  Claude-->>Svc: text delta
  Svc-->>API: pipe chunk (SSE)
  API-->>UI: text/event-stream chunk
  UI-->>User: incremental render
end
deactivate Claude
Svc->>DB: appendMessages(conversationId, [user, assistant])
Svc-->>-API: stream end
API-->>-UI: close
deactivate UI

Note over Svc: Admin scope: same path, Adi's system prompt, no learner context.
Note over Svc: Super-admin scope: NOT this path — see Agent HITL diagram.
`.trim();

// ─────────────────────────── catalog ───────────────────────────

type DiagramSpec = {
  index: string;
  title: string;
  blurb: string;
  source: string;
  type: DiagramType;
};

const DIAGRAMS: DiagramSpec[] = [
  // Use cases
  { index: "1", title: "Use case — overview of all actors", blurb: "Four primary actors with role inheritance (User ⊇ Visitor; Super Admin ⊇ Admin). Auxiliary actors Avi and Email gateway shown on the right. <<include>> / <<extends>> on key use cases.", source: UC_OVERVIEW, type: "plantuml" },
  { index: "1.1", title: "Use case — Visitor", blurb: "Unauthenticated browser of the public site. Cannot enroll, pay, or use the AI.", source: UC_VISITOR, type: "plantuml" },
  { index: "1.2", title: "Use case — User (learner)", blurb: "Signed-in learner. Inherits every Visitor use case (not redrawn). Pay-by-card extends partial-pay-with-coins.", source: UC_USER, type: "plantuml" },
  { index: "1.3", title: "Use case — Admin", blurb: "Manages content and users. Exports the users table as XLSX or PDF (extends Manage users). Advisory chatbot Adi — never mutates.", source: UC_ADMIN, type: "plantuml" },
  { index: "1.4", title: "Use case — Super Admin", blurb: "Governance + the operations agent. Mutating agent actions are proposals — Approve & run is a separate use case from Propose action.", source: UC_SADMIN, type: "plantuml" },

  // Class
  { index: "2", title: "Class diagram — core domain", blurb: "User, Course, Category, Session, Trainer, Enrollment, Reservation. Cardinalities follow Mongoose unique indexes (unique pairs on Enrollment, Reservation).", source: CLASS_CORE, type: "mermaid" },
  { index: "3", title: "Class diagram — auxiliary entities", blurb: "Assessment + Result, Certificate, Payment, CoinTransaction, EmailToken, AIConversation, AuditLog. All references resolve back to User and Course.", source: CLASS_AUX, type: "mermaid" },

  // Sequences
  { index: "4", title: "Sequence — Registration + email verification", blurb: "POST /api/auth/register → bcrypt → User (pending) → EmailToken (SHA-256 hash, 30-min TTL) → emailService → SMTP. /verify activates the account.", source: SEQ_REGISTER, type: "mermaid" },
  { index: "5", title: "Sequence — Login (NextAuth credentials)", blurb: "Credentials provider, JWT strategy. alt fragments cover not-found, locked-out, password-mismatch, and success branches. Failed counter increments; N failures → lockedUntil.", source: SEQ_LOGIN, type: "mermaid" },
  { index: "6", title: "Sequence — Password reset (no enumeration)", blurb: "/forgot always returns 200 regardless of whether the email exists. /reset consumes the one-time hashed token and rehashes the new password.", source: SEQ_RESET, type: "mermaid" },
  { index: "7", title: "Sequence — Browse catalog + enroll", blurb: "RSC catalog page with full-text + vendor/group filters. Free courses enroll immediately; paid courses redirect to /checkout.", source: SEQ_BROWSE_ENROLL, type: "mermaid" },
  { index: "8", title: "Sequence — Checkout (card + coins)", blurb: "Partial pay (amountTnd − discount(coinsUsed)). Atomic write of Payment + Enrollment + CoinTransaction. alt fragment for charge-failure.", source: SEQ_CHECKOUT, type: "mermaid" },
  { index: "9", title: "Sequence — Assessment + certificate issuance", blurb: "Grade → AssessmentResult. On pass: idempotent coin grant (Enrollment.coinsAwarded flag) + Certificate. PDF rendered on demand by /api/certificates/[id]/pdf.", source: SEQ_ASSESSMENT, type: "mermaid" },
  { index: "10", title: "Sequence — Manual trainer assignment", blurb: "Super admin assigns a trainer via the UI → emailService.sendTrainerNotice → AuditLog: trainer.assigned (before/after).", source: SEQ_TRAINER_ASSIGN, type: "mermaid" },
  { index: "11", title: "Sequence — Super-admin agent (Avi) — HITL", blurb: "Tool-use loop (read-only auto-execute, mutating → proposal). Approve & run calls /execute with resumeContext and writes ai.action_executed.", source: SEQ_AGENT_HITL, type: "mermaid" },
  { index: "12", title: "Sequence — AI chatbot streaming (Ada)", blurb: "One AIService adapter, three scopes. User scope concatenates a learner-context block (RAG). Server-Sent Events stream chunks to the client; both messages persisted to AIConversation.", source: SEQ_AI_STREAM, type: "mermaid" },
];

// ─────────────────────────── PDF composition ───────────────────────────

const BRAND = "#C70019";
const INK = "#111111";
const MUTED = "#5b6470";
const SOFT = "#e5e7eb";
const FONT = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontFamily: FONT,
    fontSize: 10,
    color: INK,
  },
  topbar: {
    position: "absolute",
    top: 14,
    left: 36,
    right: 36,
    fontSize: 7.5,
    color: MUTED,
    borderBottomWidth: 0.5,
    borderBottomColor: SOFT,
    paddingBottom: 4,
  },
  pageNum: {
    position: "absolute",
    bottom: 16,
    right: 36,
    fontSize: 8,
    color: MUTED,
  },
  h1: { fontFamily: FONT_BOLD, fontSize: 18, color: INK, marginBottom: 2, marginTop: 6 },
  blurb: { fontSize: 9.5, color: MUTED, marginBottom: 10, lineHeight: 1.45 },
  img: {
    objectFit: "contain",
    alignSelf: "center",
  },
  cover: { textAlign: "center", marginTop: 200 },
  coverTitle: { fontFamily: FONT_BOLD, fontSize: 34, color: INK, marginBottom: 6 },
  coverSub: { fontSize: 13, color: MUTED, marginBottom: 2 },
  badge: {
    marginTop: 18,
    alignSelf: "center",
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: "#fde7ec",
    borderRadius: 12,
    fontFamily: FONT_BOLD,
    fontSize: 10,
    color: BRAND,
  },
  tocRow: { flexDirection: "row", marginBottom: 4 },
  tocLeft: { flex: 1 },
  tocRight: { color: MUTED, fontSize: 9 },
});

function CoverPage({ count }: { count: number }) {
  return (
    <Page size="A4" style={s.page}>
      <View style={s.cover}>
        <Text style={s.coverTitle}>Diagrams 2</Text>
        <Text style={s.coverSub}>UML diagrams — rendered from diagram-as-code</Text>
        <Text style={s.coverSub}>Advancia Training Platform</Text>
        <Text style={s.badge}>PFE — Final Project</Text>
      </View>
      <View style={{ marginTop: 36, fontSize: 10 }}>
        <Text style={{ fontFamily: FONT_BOLD, marginBottom: 6 }}>
          Contents ({count} diagrams)
        </Text>
        {DIAGRAMS.map((d) => (
          <View key={d.index} style={s.tocRow}>
            <Text style={s.tocLeft}>
              {d.index}. {d.title}
            </Text>
            <Text style={s.tocRight}>{d.type === "plantuml" ? "PlantUML" : "Mermaid"}</Text>
          </View>
        ))}
      </View>
      <Text style={{ position: "absolute", bottom: 24, left: 36, fontSize: 8, color: MUTED }}>
        Diagram sources are Mermaid (class, sequence) and PlantUML (use case), rendered to PNG via the
        public kroki.io service. Re-generate with `npm run gen:diagrams2`.
      </Text>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

function DiagramPage({
  spec,
  pngBuffer,
}: {
  spec: DiagramSpec;
  pngBuffer: Buffer;
}) {
  // A4 landscape for diagrams to give Mermaid more horizontal room.
  return (
    <Page size="A4" style={s.page} orientation="landscape">
      <Text style={s.topbar}>
        Advancia Training — Diagrams 2 · {spec.index} · {spec.type === "plantuml" ? "PlantUML" : "Mermaid"}
      </Text>
      <Text style={s.h1}>
        {spec.index}. {spec.title}
      </Text>
      <Text style={s.blurb}>{spec.blurb}</Text>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Image
          src={pngBuffer}
          style={{
            ...s.img,
            maxWidth: 760,
            maxHeight: 460,
          }}
        />
      </View>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </Page>
  );
}

async function main() {
  console.log(`→ Rendering ${DIAGRAMS.length} diagrams via kroki.io…`);
  const t0 = Date.now();
  const buffers: Buffer[] = await Promise.all(
    DIAGRAMS.map(async (d) => {
      const buf = await renderDiagram(d.source, d.type);
      console.log(`  ✓ ${d.index} ${d.title} (${(buf.length / 1024).toFixed(1)} KB)`);
      return buf;
    }),
  );

  const outPath = path.resolve(process.cwd(), "diagrams2.pdf");
  console.log("→ Composing PDF…");
  await renderToFile(
    <Document
      title="Diagrams 2 — Advancia Training Platform"
      author="Advancia Training PFE"
      subject="UML diagrams rendered from Mermaid + PlantUML"
      creator="advancia-platform"
    >
      <CoverPage count={DIAGRAMS.length} />
      {DIAGRAMS.map((d, i) => (
        <DiagramPage key={d.index} spec={d} pngBuffer={buffers[i]} />
      ))}
    </Document>,
    outPath,
  );
  console.log(`✓ Wrote ${outPath} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
