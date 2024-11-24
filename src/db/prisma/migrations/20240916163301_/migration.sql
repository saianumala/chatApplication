-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_mobileNumber_fkey";

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_savedById_fkey" FOREIGN KEY ("savedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
