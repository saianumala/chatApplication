/*
  Warnings:

  - A unique constraint covering the columns `[savedById,mobileNumber]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Contact_savedById_mobileNumber_key" ON "Contact"("savedById", "mobileNumber");
