-- CreateTable
CREATE TABLE "myContact" (
    "myContactsId" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,

    CONSTRAINT "myContact_pkey" PRIMARY KEY ("myContactsId")
);

-- AddForeignKey
ALTER TABLE "myContact" ADD CONSTRAINT "myContact_mobileNumber_fkey" FOREIGN KEY ("mobileNumber") REFERENCES "User"("mobileNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
