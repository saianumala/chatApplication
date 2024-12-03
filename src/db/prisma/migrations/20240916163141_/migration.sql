/*
  Warnings:

  - Added the required column `savedById` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_mobileNumber_fkey";

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "savedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_mobileNumber_fkey" FOREIGN KEY ("mobileNumber") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
