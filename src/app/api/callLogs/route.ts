import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    if (!session) {
      return NextResponse.json({ message: "please signin" }, { status: 401 });
    }
    const userCallLogs = await prisma.callDescription.findMany({
      where: {
        userId: session.user.userId,
      },
      orderBy: {
        callInformation: {
          callStartedAt: "desc",
        },
      },
      select: {
        callInformation: {
          select: {
            conversation: {
              select: {
                conversationName: true,
                conversationParticipants: {
                  select: {
                    participantNumber: true,
                    user: {
                      select: {
                        myContacts: {
                          where: {
                            savedById: session.user.userId,
                          },
                        },
                        contactSavedBy: {
                          select: {
                            contactName: true,
                            savedById: true,
                            mobileNumber: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            callActive: true,
            callStartedAt: true,
            callType: true,
            callEndedAt: true,
          },
        },

        callDescriptionId: true,
        callDirection: true,
        callInformationId: true,
        callResponse: true,
        joined: true,
      },
    });

    return NextResponse.json(
      { message: "logs found", callLogs: userCallLogs ?? [] },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
  }
}
