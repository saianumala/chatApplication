import prisma from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const email = formData.get("email") as string;
  const number = formData.get("number") as string;
  const password = formData.get("password") as string;
  console.log(email, number, password);
  try {
    if (email === "" || password === "" || number === "") {
      throw new Error("All fields are required");
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            mobileNumber: number,
          },
        ],
      },
      select: {
        email: true,
        mobileNumber: true,
      },
    });

    if (existingUser) {
      throw new Error("email or number already exists");
    }
    const hashedPassword = await bcryptjs.hash(password, 11);

    const user = await prisma.user.create({
      data: {
        email: email,
        mobileNumber: number,
        password: hashedPassword,
      },
      select: {
        email: true,
        mobileNumber: true,
      },
    });

    // console.log(user);
    return NextResponse.json({
      message: "user created sucessfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(error);
  }
}
