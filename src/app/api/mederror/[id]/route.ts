import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteMultipleFromBlob } from "@/lib/blob";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the med error with its images
    const medError = await prisma.medError.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!medError) {
      return NextResponse.json({ error: "MedError not found" }, { status: 404 });
    }

    // Delete images from blob storage if they exist
    if (medError.images.length > 0) {
      const imageUrls = medError.images.map(img => img.url);
      await deleteMultipleFromBlob(imageUrls);
    }

    // Delete the med error (this will cascade delete the images from database)
    await prisma.medError.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting med error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 