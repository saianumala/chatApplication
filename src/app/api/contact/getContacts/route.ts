import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    if (!session || !session.user) {
      throw new Error("please login");
    }

    const contacts = await prisma.contact.findMany({
      where: {
        savedById: session.user.userId,
      },
      orderBy: {
        contactName: "asc",
      },
      select: {
        contactId: true,
        contactName: true,
        mobileNumber: true,
        savedById: true,
        friendsUserAccount: true,
      },
    });
    if (!contacts) {
      throw new Error();
    }
    // for (const contact of contacts) {
    //   const account = await prisma.user.findUnique({
    //     where: { mobileNumber: contact.mobileNumber },
    //   });
    //   contactDetails.push({ ...contact, hasAccount: !!account });
    // }
    return NextResponse.json(
      { message: "success", contacts: contacts },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
