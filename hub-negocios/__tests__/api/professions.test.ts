/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/professions/route';
import { DELETE } from '../../app/api/professions/[id]/route';
import prisma from '../../lib/prisma';

// Mock do prisma client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    profession: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Professions API CRUD Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/professions', () => {
    it('deve retornar a lista de profissões ordenadas por nome', async () => {
      const mockProfessions = [
        { id: '1', name: 'Carpinteiro', description: 'Madeira' },
        { id: '2', name: 'Eletricista', description: 'Fios' },
      ];

      (prisma.profession.findMany as jest.Mock).mockResolvedValue(mockProfessions);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProfessions);
      expect(prisma.profession.findMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('deve retornar erro 500 se o Prisma falhar', async () => {
      (prisma.profession.findMany as jest.Mock).mockRejectedValue(new Error('Erro de banco'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/professions', () => {
    it('deve criar uma nova profissão com sucesso se não existir', async () => {
      const newProfession = { id: '3', name: 'Pintor', description: 'Paredes' };

      (prisma.profession.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.profession.create as jest.Mock).mockResolvedValue(newProfession);

      const request = new NextRequest('http://localhost:3000/api/professions', {
        method: 'POST',
        body: JSON.stringify({ name: 'Pintor', description: 'Paredes' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newProfession);
      expect(prisma.profession.create).toHaveBeenCalledWith({
        data: {
          name: 'Pintor',
          description: 'Paredes',
        },
      });
    });

    it('deve retornar a profissão existente se o nome for duplicado', async () => {
      const existingProfession = { id: '1', name: 'Carpinteiro', description: 'Madeira' };

      (prisma.profession.findFirst as jest.Mock).mockResolvedValue(existingProfession);

      const request = new NextRequest('http://localhost:3000/api/professions', {
        method: 'POST',
        body: JSON.stringify({ name: 'Carpinteiro', description: 'Nova Descrição' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(existingProfession);
      expect(prisma.profession.create).not.toHaveBeenCalled();
    });

    it('deve retornar erro 400 se o nome estiver vazio', async () => {
      const request = new NextRequest('http://localhost:3000/api/professions', {
        method: 'POST',
        body: JSON.stringify({ name: '   ', description: 'Descrição' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('O nome da profissão é obrigatório.');
    });
  });

  describe('DELETE /api/professions/[id]', () => {
    it('deve excluir uma profissão existente com sucesso', async () => {
      const deletedProfession = { id: '1', name: 'Carpinteiro' };
      (prisma.profession.delete as jest.Mock).mockResolvedValue(deletedProfession);

      const request = new NextRequest('http://localhost:3000/api/professions/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deleted).toEqual(deletedProfession);
      expect(prisma.profession.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('deve retornar erro 404 se a profissão não existir no banco', async () => {
      const prismaError = new Error('Not Found');
      (prismaError as any).code = 'P2025'; // Código do Prisma para registro não encontrado
      (prisma.profession.delete as jest.Mock).mockRejectedValue(prismaError);

      const request = new NextRequest('http://localhost:3000/api/professions/999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Profissão não encontrada.');
    });
  });
});
