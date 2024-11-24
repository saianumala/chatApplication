import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const {
      type,
      conversationName,
      conversationParticipants,
    }: {
      type: "NORMAL" | "GROUP";
      conversationParticipants: string[];
      conversationName: string | null;
    } = await request.json();
    console.log(`conversationParticipants: ${conversationParticipants}`);
    console.log("conversation name", conversationName);
    if (!conversationParticipants || conversationParticipants.length <= 1) {
      throw new Error("insufficient data");
    }
    if (type === "NORMAL") {
      throw new Error("wrong conversation Type");
    }
    if (conversationName === null) {
      throw new Error("group name is required");
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        conversationName: conversationName,
        conversationParticipants: {
          every: {
            id: {
              in: conversationParticipants.map(
                (participantNumber) => participantNumber
              ),
            },
          },
        },
      },
    });
    console.log(conversation);
    if (conversation) {
      throw new Error(
        "A group already exists with this name and same participants"
      );
    }

    const newConversation = await prisma.conversation.create({
      data: {
        type: "GROUP",
        conversationName: conversationName,
        conversationParticipants: {
          create: conversationParticipants.map((participantNumber) => ({
            participantNumber: participantNumber,
          })),
        },
      },
      include: {
        conversationParticipants: {
          include: {
            user: {
              select: {
                email: true,
                mobileNumber: true,
              },
            },
          },
        },
        messages: true,
      },
    });
    return NextResponse.json(
      {
        newConversation: newConversation,
      },
      {
        status: 200,
      }
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
