/*
  Warnings:

  - You are about to drop the column `userName` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `myContact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "myContact" DROP CONSTRAINT "myContact_mobileNumber_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "userName";

-- DropTable
DROP TABLE "myContact";

-- CreateTable
CREATE TABLE "Contact" (
    "myContactsId" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("myContactsId")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_mobileNumber_fkey" FOREIGN KEY ("mobileNumber") REFERENCES "User"("mobileNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
