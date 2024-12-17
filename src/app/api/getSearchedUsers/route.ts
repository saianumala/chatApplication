import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  console.log("reached getusers");

  const searchValue = req.nextUrl.searchParams.get("searchValue");

  console.log("searchValue", searchValue);
  const session = await getServerSession(authOptions);
  let contactDetails: {
    contactId: string;
    mobileNumber: string;
    contactName: string;
    hasAccount: boolean;
  }[] = [];
  try {
    if (!session || !session.user.mobileNumber) {
      throw new Error("please login");
    }
    if (!searchValue) {
      throw new Error("Search term is required");
    }

    const contacts = await prisma.contact.findMany({
      where: {
        savedById: session.user.userId,

        OR: [
          {
            mobileNumber: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
          {
            contactName: {
              contains: searchValue,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        contactId: true,
        mobileNumber: true,
        contactName: true,
      },
    });

    console.log("contacts:", contacts);
    if (!contacts) {
      console.log("inside error");
      throw new Error();
    }
    for (const contact of contacts) {
      const account = await prisma.user.findUnique({
        where: { mobileNumber: contact.mobileNumber },
      });
      contactDetails.push({ ...contact, hasAccount: !!account });
    }
    console.log("outside error and before return");
    return NextResponse.json({ data: contactDetails }, { status: 200 });
  } catch (error) {
    // console.log("error", error);
    console.log("database call failed", error);

    return NextResponse.json(
      { message: "database call failed" },
      { status: 400 }
    );
  }
}
