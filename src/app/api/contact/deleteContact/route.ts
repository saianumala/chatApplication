import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const {
    contactName,
    mobileNumber,
  }: { contactName: string; mobileNumber: string } = await req.json();
  try {
    if (!session || !session.user) {
      throw new Error("please login");
    }

    await prisma.contact.delete({
      where: {
        savedById_mobileNumber: {
          mobileNumber: mobileNumber,
          savedById: session.user?.userId!,
        },
      },
    });
    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
