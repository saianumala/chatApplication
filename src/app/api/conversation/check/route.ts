import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";
// checking if conversation exists
export async function GET(req: NextRequest) {
  const myNumber = req.nextUrl.searchParams.get("myNumber");
  const friendNumber = req.nextUrl.searchParams.get("friendNumber");
  console.log(myNumber, friendNumber);
  try {
    if (!myNumber || !friendNumber) {
      throw new Error("numbers are required to get conversation");
    }
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            conversationParticipants: {
              some: {
                participantNumber: myNumber,
              },
            },
          },
          {
            conversationParticipants: {
              some: {
                participantNumber: friendNumber,
              },
            },
          },
          {
            conversationParticipants: {
              every: {
                OR: [
                  {
                    participantNumber: myNumber,
                  },
                  {
                    participantNumber: friendNumber,
                  },
                ],
              },
            },
          },
        ],
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
      console.log(conversation);
      throw new Error("no conversation");
    }
    return NextResponse.json({ conversation: conversation }, { status: 200 });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
