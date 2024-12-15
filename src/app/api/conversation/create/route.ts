import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";
// import http from "http"

export async function POST(request: NextRequest, response: NextResponse) {
  const session = await getServerSession(authOptions);

  try {
    if (!session) {
      return NextResponse.json({ message: "please login" }, { status: 401 });
    }
    const {
      type,
      myNumber,
      friendNumber,
    }: { type: "NORMAL" | "GROUP"; myNumber: string; friendNumber: string } =
      await request.json();
    if (!myNumber || !friendNumber) {
      throw new Error("contact number is required");
    }
    if (type === "GROUP") {
      throw new Error("wrong conversation type");
    }
    console.log(myNumber, friendNumber);
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
                NOT: {
                  participantNumber: {
                    in: ["", myNumber, friendNumber],
                  },
                },
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
    if (conversation) {
      return NextResponse.json(
        {
          conversation: {
            ...conversation,
            conversationName: friendsContact?.contactName,
          },
        },
        { status: 200 }
      );
    }
    const newConversation = await prisma.conversation.create({
      data: {
        conversationName: null,
        conversationParticipants: {
          create: [
            {
              participantNumber: myNumber,
            },
            {
              participantNumber: friendNumber,
            },
          ],
        },
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
    return NextResponse.json(
      {
        conversation: {
          ...newConversation,
          conversationName: friendsContact?.contactName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "something went wrong" },
      { status: 400 }
    );
  }
}
