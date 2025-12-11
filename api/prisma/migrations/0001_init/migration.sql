-- Prisma migration to initialize database schema

CREATE TABLE "AthleteProfile" (
    "id" TEXT PRIMARY KEY,
    "athleteId" TEXT NOT NULL UNIQUE,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "timezone" TEXT,
    "avatarUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "AthleteProfile_athleteId_idx" ON "AthleteProfile" ("athleteId");

CREATE TYPE "ProgramStatus" AS ENUM ('PLANNED', 'ACTIVE', 'HOLD', 'COMPLETE');
CREATE TYPE "SessionStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETE', 'MISSED', 'CANCELED');
CREATE TYPE "HealthStatus" AS ENUM ('PASS', 'FAIL', 'DEGRADED');

CREATE TABLE "TrainingProgram" (
    "id" TEXT PRIMARY KEY,
    "athleteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ProgramStatus" NOT NULL DEFAULT 'PLANNED',
    "description" TEXT,
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    "validationFlag" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "TrainingProgram_athleteId_fkey"
        FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile" ("athleteId")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "TrainingProgram_athleteId_idx" ON "TrainingProgram" ("athleteId");

CREATE TABLE "ProgramPhase" (
    "id" TEXT PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "focus" TEXT,
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "ProgramPhase_programId_fkey"
        FOREIGN KEY ("programId") REFERENCES "TrainingProgram" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProgramPhase_programId_idx" ON "ProgramPhase" ("programId");

CREATE TABLE "MicroCycle" (
    "id" TEXT PRIMARY KEY,
    "phaseId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "theme" TEXT,
    "load" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "MicroCycle_phaseId_fkey"
        FOREIGN KEY ("phaseId") REFERENCES "ProgramPhase" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MicroCycle_phaseId_idx" ON "MicroCycle" ("phaseId");

CREATE TABLE "TrainingSession" (
    "id" TEXT PRIMARY KEY,
    "programId" TEXT NOT NULL,
    "microCycleId" TEXT,
    "athleteId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMPTZ NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "focus" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "metrics" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "TrainingSession_programId_fkey"
        FOREIGN KEY ("programId") REFERENCES "TrainingProgram" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingSession_microCycleId_fkey"
        FOREIGN KEY ("microCycleId") REFERENCES "MicroCycle" ("id")
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrainingSession_athleteId_fkey"
        FOREIGN KEY ("athleteId") REFERENCES "AthleteProfile" ("athleteId")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "TrainingSession_programId_idx" ON "TrainingSession" ("programId");
CREATE INDEX "TrainingSession_microCycleId_idx" ON "TrainingSession" ("microCycleId");
CREATE INDEX "TrainingSession_athleteId_idx" ON "TrainingSession" ("athleteId");

CREATE TABLE "DatabaseConnectionProfile" (
    "id" TEXT PRIMARY KEY,
    "environment" TEXT UNIQUE NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "schema" TEXT NOT NULL,
    "credentialRef" TEXT NOT NULL,
    "rotationIntervalHours" INTEGER NOT NULL DEFAULT 720,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ConnectionHealthEvent" (
    "id" TEXT PRIMARY KEY,
    "environment" TEXT NOT NULL,
    "status" "HealthStatus" NOT NULL,
    "latencyMs" INTEGER,
    "errorCode" TEXT,
    "lastFailureAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "connectionProfileId" TEXT NOT NULL,
    CONSTRAINT "ConnectionHealthEvent_connectionProfileId_fkey"
        FOREIGN KEY ("connectionProfileId") REFERENCES "DatabaseConnectionProfile" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "ConnectionHealthEvent_environment_idx" ON "ConnectionHealthEvent" ("environment");
CREATE INDEX "ConnectionHealthEvent_createdAt_idx" ON "ConnectionHealthEvent" ("createdAt");
