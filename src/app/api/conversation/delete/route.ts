import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    if (!session || !session.user.mobileNumber) {
      throw new Error("please login");
    }
    const { conversationId }: { conversationId: string } = await req.json();

    const conversation = await prisma.conversation.delete({
      where: {
        conversation_id: conversationId,
      },
    });

    return NextResponse.json({ conversation: conversation }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
