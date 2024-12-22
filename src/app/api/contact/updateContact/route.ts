import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const {
    contactName,
    mobileNumber,
  }: { contactName: string; mobileNumber: string } = await req.json();
  try {
    if (!session || !session.user) {
      throw new Error("please login");
    }
    if (contactName === "") {
      throw new Error("field should not be empty");
    }
    const updatedContact = await prisma.contact.update({
      where: {
        savedById_mobileNumber: {
          mobileNumber: mobileNumber,
          savedById: session.user?.userId!,
        },
      },
      data: {
        contactName: contactName,
        mobileNumber,
      },
    });
    // const account = await prisma.user.findUnique({
    //   where: { mobileNumber: mobileNumber },
    // });

    return NextResponse.json(
      {
        message: "success",
        updatedContact: updatedContact,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
