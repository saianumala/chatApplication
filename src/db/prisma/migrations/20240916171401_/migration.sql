/*
  Warnings:

  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `myContactsId` on the `Contact` table. All the data in the column will be lost.
  - The required column `contactId` was added to the `Contact` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
DROP COLUMN "myContactsId",
ADD COLUMN     "contactId" TEXT NOT NULL,
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("contactId");
