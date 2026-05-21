import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET /api/providers - Retorna todos os prestadores incluindo a profissão relacionada
export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        profession: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(providers);
  } catch (error: any) {
    console.error('Erro ao buscar prestadores de serviço:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar prestadores no banco de dados. Certifique-se de que as migrações foram aplicadas.' },
      { status: 500 }
    );
  }
}

// POST /api/providers - Cria um novo prestador de serviço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      full_name,
      email,
      profession_id,
      location,
      description,
      experience,
      age,
      service_hours,
      avatar_url,
      isNewProfession,
      customProfession
    } = body;

    // Validações básicas
    if (!full_name || !email || !location) {
      return NextResponse.json(
        { error: 'Nome completo, e-mail e localização são obrigatórios.' },
        { status: 400 }
      );
    }

    let finalProfessionId = profession_id;

    // Se o usuário especificou uma nova profissão
    if (isNewProfession && customProfession && customProfession.trim()) {
      const trimmedProfessionName = customProfession.trim();

      // Buscamos ou criamos a profissão correspondente
      const profession = await prisma.profession.upsert({
        where: { name: trimmedProfessionName },
        update: {},
        create: { name: trimmedProfessionName, description: 'Criada automaticamente no cadastro de serviço' },
      });

      finalProfessionId = profession.id;
    }

    if (!finalProfessionId) {
      return NextResponse.json(
        { error: 'A profissão deve ser selecionada ou especificada.' },
        { status: 400 }
      );
    }

    // Cria o prestador de serviço associando ao ID da profissão
    const newProvider = await prisma.provider.create({
      data: {
        full_name: full_name.trim(),
        email: email.trim(),
        profession_id: finalProfessionId,
        location: location.trim(),
        description: description?.trim() || null,
        experience: experience?.trim() || null,
        age: age ? parseInt(age.toString()) : null,
        service_hours: service_hours?.trim() || null,
        avatar_url: avatar_url?.trim() || null,
      },
      include: {
        profession: true,
      }
    });

    return NextResponse.json(newProvider, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar prestador de serviço:', error);
    return NextResponse.json(
      { error: 'Erro interno ao cadastrar prestador de serviço.' },
      { status: 500 }
    );
  }
}
