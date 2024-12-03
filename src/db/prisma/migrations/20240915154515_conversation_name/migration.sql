/*
  Warnings:

  - A unique constraint covering the columns `[conversationName]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "conversationName" TEXT DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_conversationName_key" ON "Conversation"("conversationName");
