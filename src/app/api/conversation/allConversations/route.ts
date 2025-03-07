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

    const userData = await prisma.user.findUnique({
      where: {
        mobileNumber: session.user.mobileNumber,
      },
      select: {
        conversations: {
          orderBy: {
            conversation: {
              DateModified: "desc",
            },
          },
          select: {
            conversation: {
              include: {
                conversationParticipants: {
                  select: {
                    id: true,
                    conversationId: true,
                    participantNumber: true,
                    user: {
                      select: {
                        myContacts: true,
                      },
                    },
                  },
                },
                ReadStatus: {
                  where: {
                    userId: session.user.userId,
                    isRead: false,
                  },
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        myContacts: true,
      },
    });

    if (!userData) {
      throw new Error("no conversations");
    }
    return NextResponse.json(
      { conversations: userData.conversations, contacts: userData.myContacts },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
