-- CreateTable
CREATE TABLE "ReadStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadStatus_userId_messageId_key" ON "ReadStatus"("userId", "messageId");

-- AddForeignKey
ALTER TABLE "ReadStatus" ADD CONSTRAINT "ReadStatus_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("conversation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadStatus" ADD CONSTRAINT "ReadStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadStatus" ADD CONSTRAINT "ReadStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("message_id") ON DELETE RESTRICT ON UPDATE CASCADE;
