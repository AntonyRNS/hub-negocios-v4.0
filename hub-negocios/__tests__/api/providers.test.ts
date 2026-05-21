/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/providers/route';
import prisma from '../../lib/prisma';

// Mock do prisma client
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    provider: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    profession: {
      upsert: jest.fn(),
    },
  },
}));

describe('Providers API CRUD Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/providers', () => {
    it('deve retornar a lista de prestadores incluindo as profissões associadas', async () => {
      const mockProviders = [
        {
          id: 'prov-1',
          full_name: 'João Silva',
          email: 'joao@email.com',
          location: 'SP',
          profession_id: 'prof-1',
          profession: { id: 'prof-1', name: 'Carpinteiro' },
        },
      ];

      (prisma.provider.findMany as jest.Mock).mockResolvedValue(mockProviders);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProviders);
      expect(prisma.provider.findMany).toHaveBeenCalledWith({
        include: {
          profession: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('deve retornar erro 500 se o Prisma falhar ao buscar', async () => {
      (prisma.provider.findMany as jest.Mock).mockRejectedValue(new Error('Erro de banco'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('POST /api/providers', () => {
    it('deve criar um prestador associando-o a uma profissão existente', async () => {
      const mockNewProvider = {
        id: 'prov-2',
        full_name: 'Maria Souza',
        email: 'maria@email.com',
        location: 'RJ',
        profession_id: 'prof-1',
        profession: { id: 'prof-1', name: 'Carpinteiro' },
      };

      (prisma.provider.create as jest.Mock).mockResolvedValue(mockNewProvider);

      const requestData = {
        full_name: 'Maria Souza',
        email: 'maria@email.com',
        location: 'RJ',
        profession_id: 'prof-1',
        age: 30,
        experience: '5 anos',
        service_hours: 'Comercial',
      };

      const request = new NextRequest('http://localhost:3000/api/providers', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockNewProvider);
      expect(prisma.profession.upsert).not.toHaveBeenCalled();
      expect(prisma.provider.create).toHaveBeenCalledWith({
        data: {
          full_name: 'Maria Souza',
          email: 'maria@email.com',
          location: 'RJ',
          profession_id: 'prof-1',
          description: null,
          experience: '5 anos',
          age: 30,
          service_hours: 'Comercial',
          avatar_url: null,
        },
        include: {
          profession: true,
        },
      });
    });

    it('deve criar uma nova profissão on-the-fly e cadastrar o prestador', async () => {
      const mockCreatedProfession = { id: 'prof-new', name: 'Astronauta' };
      const mockNewProvider = {
        id: 'prov-3',
        full_name: 'Marcos Astronauta',
        email: 'marcos@email.com',
        location: 'Espaço',
        profession_id: 'prof-new',
        profession: mockCreatedProfession,
      };

      (prisma.profession.upsert as jest.Mock).mockResolvedValue(mockCreatedProfession);
      (prisma.provider.create as jest.Mock).mockResolvedValue(mockNewProvider);

      const requestData = {
        full_name: 'Marcos Astronauta',
        email: 'marcos@email.com',
        location: 'Espaço',
        isNewProfession: true,
        customProfession: 'Astronauta',
      };

      const request = new NextRequest('http://localhost:3000/api/providers', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockNewProvider);
      expect(prisma.profession.upsert).toHaveBeenCalledWith({
        where: { name: 'Astronauta' },
        update: {},
        create: {
          name: 'Astronauta',
          description: 'Criada automaticamente no cadastro de serviço',
        },
      });
      expect(prisma.provider.create).toHaveBeenCalledWith({
        data: {
          full_name: 'Marcos Astronauta',
          email: 'marcos@email.com',
          location: 'Espaço',
          profession_id: 'prof-new',
          description: null,
          experience: null,
          age: null,
          service_hours: null,
          avatar_url: null,
        },
        include: {
          profession: true,
        },
      });
    });

    it('deve retornar erro 400 se campos obrigatórios estiverem ausentes', async () => {
      const requestData = {
        email: 'invalido@email.com',
        location: 'SP',
      };

      const request = new NextRequest('http://localhost:3000/api/providers', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Nome completo, e-mail e localização são obrigatórios.');
    });
  });
});
