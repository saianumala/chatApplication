import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    if (!session || !session.user.mobileNumber) {
      throw new Error("please login");
    }
    const conversationId = req.nextUrl.searchParams.get("conversationId");
    console.log(conversationId);
    if (!conversationId) {
      throw new Error("conversationId not recieved");
    }
    const conversation = await prisma.conversation.findFirst({
      where: {
        conversation_id: conversationId,
      },

      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            ReadStatus: {
              where: {
                isRead: false,
              },
              select: {
                id: true,
                conversationId: true,
                isRead: true,
                readAt: true,
              },
            },
          },
        },
        conversationParticipants: true,
      },
    });
    if (!conversation) {
      throw new Error("no conversation found");
    }
    return NextResponse.json({ conversation: conversation }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
