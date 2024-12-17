import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
// checking if conversation exists
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const myNumber = req.nextUrl.searchParams.get("myNumber");
  const friendNumber = req.nextUrl.searchParams.get("friendNumber");
  console.log(myNumber, friendNumber);
  try {
    if (!session) {
      return NextResponse.json({ message: "please login" }, { status: 401 });
    }
    if (!myNumber || !friendNumber) {
      throw new Error("numbers are required to get conversation");
    }
    const friendAccount = await prisma.user.findUnique({
      where: {
        mobileNumber: friendNumber,
      },
    });
    if (!friendAccount) {
      return NextResponse.json({ message: "inviteFriend" }, { status: 200 });
    }
    const friendsContact = await prisma.contact.findUnique({
      where: {
        savedById_mobileNumber: {
          mobileNumber: friendNumber,
          savedById: session.user.userId || "",
        },
      },
    });
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
      return NextResponse.json(
        { message: "conversationNotFound" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        message: "conversationFound",
        conversation: {
          ...conversation,
          conversationName: friendsContact?.contactName,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error.message, error: error },
      { status: 400 }
    );
  }
}
