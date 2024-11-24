import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    if (!session || !session.user.mobileNumber) {
      throw new Error("please login");
    }
    const {
      conversationId,
      newConversationName = null,
      newParticipants = [],
    }: {
      conversationId: string;
      newConversationName: string | null;
      newParticipants: string[];
    } = await req.json();
    const conversation = await prisma.conversation.update({
      where: {
        conversation_id: conversationId,
      },
      data: {
        ...(newConversationName && { conversationName: newConversationName }),
        conversationParticipants: {
          connectOrCreate: newParticipants.map((participantNumber) => ({
            where: {
              conversationId_participantNumber: {
                conversationId,
                participantNumber,
              },
            },
            create: {
              participantNumber,
            },
          })),
        },
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
