/*
  Warnings:

  - You are about to drop the column `userId` on the `ConverstionParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[conversationId,participantNumber]` on the table `ConverstionParticipant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `participantNumber` to the `ConverstionParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConverstionParticipant" DROP CONSTRAINT "ConverstionParticipant_userId_fkey";

-- DropIndex
DROP INDEX "ConverstionParticipant_conversationId_userId_key";

-- AlterTable
ALTER TABLE "ConverstionParticipant" DROP COLUMN "userId",
ADD COLUMN     "participantNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username";

-- CreateIndex
CREATE UNIQUE INDEX "ConverstionParticipant_conversationId_participantNumber_key" ON "ConverstionParticipant"("conversationId", "participantNumber");

-- AddForeignKey
ALTER TABLE "ConverstionParticipant" ADD CONSTRAINT "ConverstionParticipant_participantNumber_fkey" FOREIGN KEY ("participantNumber") REFERENCES "User"("mobileNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
