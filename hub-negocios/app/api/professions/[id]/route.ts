import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE /api/professions/[id] - Exclui uma profissão pelo ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 2. Precisamos dar 'await' no params para extrair o id
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID da profissão não fornecido.' }, { status: 400 });
    }

    // O Prisma CASCADE deletará os prestadores associados (como configurado no schema onDelete: Cascade)
    const deletedProfession = await prisma.profession.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true, deleted: deletedProfession });
  } catch (error: any) {
    console.error('Erro ao deletar profissão:', error);
    // Trata erro de registro não encontrado no Prisma (código P2025)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Profissão não encontrada.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Erro interno ao deletar profissão.' },
      { status: 500 }
    );
  }
}