import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../auth/[...nextauth]/options";
const contactDetailsSchema = z.object({
  // countryCode: z.string().length(3),
  mobileNumber: z.string().length(10),
  contactName: z.string(),
});
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    if (!session || !session.user) {
      throw new Error("please login");
    }
    const contactdata = await req.json();
    console.log(contactdata);
    const parsedContactData = contactDetailsSchema.safeParse(contactdata);
    console.log(parsedContactData);
    if (!parsedContactData) {
      throw new Error("invalid number");
    }
    const {
      mobileNumber,
      contactName,
    }: { mobileNumber: string; contactName: string } = contactdata;

    const newContact = await prisma.contact.create({
      data: {
        contactName: contactName,
        mobileNumber: mobileNumber,
        savedById: session.user.userId!,
      },
    });
    return NextResponse.json({ message: "success" });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.messasge }, { status: 400 });
  }
}
