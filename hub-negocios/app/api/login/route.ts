import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Importando o cliente que você configurou [2]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Busca o usuário no banco de dados real
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // Verifica se o usuário existe e se a senha coincide
    // Nota: Em produção, use bcrypt para comparar senhas criptografadas
    if (user && user.password === password) {
      return NextResponse.json({ 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name } 
      });
    }

    return NextResponse.json(
      { error: 'E-mail ou senha incorretos.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}