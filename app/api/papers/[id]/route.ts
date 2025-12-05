import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const paper = await prisma.paper.findUnique({
    where: { id: params.id }
  });

  if (!paper) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(paper);
}


