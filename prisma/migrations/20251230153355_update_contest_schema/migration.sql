/*
  Warnings:

  - You are about to drop the column `duration` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `ContestParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `solvedCount` on the `ContestParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `totalTime` on the `ContestParticipant` table. All the data in the column will be lost.
  - You are about to drop the `_ContestParticipants` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Language` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProblemVisibility" AS ENUM ('PUBLIC', 'CONTEST_ONLY');

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_contestId_fkey";

-- DropForeignKey
ALTER TABLE "_ContestParticipants" DROP CONSTRAINT "_ContestParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContestParticipants" DROP CONSTRAINT "_ContestParticipants_B_fkey";

-- AlterTable
ALTER TABLE "Contest" DROP COLUMN "duration",
DROP COLUMN "type",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxScore" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ContestParticipant" DROP COLUMN "rank",
DROP COLUMN "solvedCount",
DROP COLUMN "totalTime",
ADD COLUMN     "lastSubmitTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Language" ADD COLUMN     "version" TEXT;

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "visibility" "ProblemVisibility" NOT NULL DEFAULT 'PUBLIC';

-- DropTable
DROP TABLE "_ContestParticipants";

-- DropEnum
DROP TYPE "ContestType";

-- CreateTable
CREATE TABLE "ContestInvitation" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContestInvitation_contestId_idx" ON "ContestInvitation"("contestId");

-- CreateIndex
CREATE INDEX "ContestInvitation_userId_idx" ON "ContestInvitation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestInvitation_contestId_userId_key" ON "ContestInvitation"("contestId", "userId");

-- CreateIndex
CREATE INDEX "Contest_isPublic_startTime_idx" ON "Contest"("isPublic", "startTime");

-- CreateIndex
CREATE INDEX "Contest_createdById_idx" ON "Contest"("createdById");

-- CreateIndex
CREATE INDEX "ContestParticipant_contestId_totalScore_lastSubmitTime_idx" ON "ContestParticipant"("contestId", "totalScore", "lastSubmitTime");

-- CreateIndex
CREATE INDEX "ContestParticipant_userId_idx" ON "ContestParticipant"("userId");

-- CreateIndex
CREATE INDEX "ContestProblem_contestId_idx" ON "ContestProblem"("contestId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_name_key" ON "Language"("name");

-- CreateIndex
CREATE INDEX "Problem_visibility_status_idx" ON "Problem"("visibility", "status");

-- CreateIndex
CREATE INDEX "Problem_authorId_idx" ON "Problem"("authorId");

-- CreateIndex
CREATE INDEX "Submission_contestId_userId_problemId_status_idx" ON "Submission"("contestId", "userId", "problemId", "status");

-- CreateIndex
CREATE INDEX "Submission_userId_problemId_idx" ON "Submission"("userId", "problemId");

-- CreateIndex
CREATE INDEX "Submission_contestId_submittedAt_idx" ON "Submission"("contestId", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "ContestInvitation" ADD CONSTRAINT "ContestInvitation_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestInvitation" ADD CONSTRAINT "ContestInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
