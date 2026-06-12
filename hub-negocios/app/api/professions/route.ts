import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET /api/professions - Lista todas as profissões ordenadas por nome
export async function GET() {
  try {
    const professions = await prisma.profession.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(professions);
  } catch (error: any) {
    console.error('Erro ao buscar profissões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar profissões no banco de dados. Certifique-se de que as migrações foram aplicadas.' },
      { status: 500 }
    );
  }
}

// POST /api/professions - Cria uma nova profissão
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'O nome da profissão é obrigatório.' }, { status: 400 });
    }

    // Verifica se já existe uma profissão com este nome (case-insensitive ou exact)
    const existingProfession = await prisma.profession.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingProfession) {
      return NextResponse.json(existingProfession); // Retorna a existente caso já cadastrada
    }

    const newProfession = await prisma.profession.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(newProfession, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar profissão:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar profissão.' },
      { status: 500 }
    );
  }
}
