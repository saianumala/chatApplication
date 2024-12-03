import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  console.log("reached getusers");

  const searchValue = req.nextUrl.searchParams.get("searchValue");

  console.log("searchValue", searchValue);
  const session = await getServerSession(authOptions);

  try {
    if (!session || !session.user.mobileNumber) {
      throw new Error("please login");
    }
    if (!searchValue) {
      throw new Error("Search term is required");
    }
    const result = await prisma.contact.findMany({
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
    console.log("result:", result);
    if (!result) {
      console.log("inside error");
      throw new Error();
    }
    console.log("outside error and before return");
    return NextResponse.json({ data: result });
  } catch (error) {
    // console.log("error", error);
    console.log("database call failed", error)

    return NextResponse.json(
      { message: "database call failed" },
      { status: 400 }
    );
  }
}
