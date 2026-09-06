import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { App } from 'supertest/types';

// Interfaz para tipar las respuestas de la API en los tests
interface AccountResponseBody {
  id: string;
  accountNumber: string;
  balance: number;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
  }>;
  message?: string | string[];
}

describe('AccountsController (e2e)', () => {
  let app: INestApplication;
  let server: App;
  let prisma: PrismaService;
  let testAccountId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    server = app.getHttpServer() as App;
    prisma = app.get<PrismaService>(PrismaService);

    // Limpiar base de datos e insertar cuenta inicial
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();

    const createdAccount = await prisma.account.create({
      data: {
        ownerName: 'Cliente Prueba E2E',
        ownerDocument: '1098765432',
        currency: 'COP',
        balance: 1000.0,
        type: 'SAVINGS',
      },
    });

    testAccountId = createdAccount.id;
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.transaction.deleteMany();
      await prisma.account.deleteMany();
      await prisma.$disconnect();
    }
    if (app) {
      await app.close();
    }
  });

  describe('GET /accounts/:id', () => {
    it('debe obtener la información de la cuenta correctamente (200 OK)', async () => {
      const response = await request(server)
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      const body = response.body as AccountResponseBody;

      expect(body).toHaveProperty('id', testAccountId);
      expect(body).toHaveProperty('accountNumber');
      expect(Number(body.balance)).toBe(1000.0);
      expect(Array.isArray(body.transactions)).toBeTruthy();
    });

    it('debe retornar 404 Not Found si la cuenta no existe', async () => {
      const response = await request(server)
        .get('/accounts/00000000-0000-0000-0000-000000000000')
        .expect(404);

      const body = response.body as AccountResponseBody;

      expect(body.message).toContain('no fue encontrada');
    });
  });

  describe('POST /accounts/:id/deposit', () => {
    it('debe realizar un depósito exitoso (200 OK)', async () => {
      const response = await request(server)
        .post(`/accounts/${testAccountId}/deposit`)
        .send({ amount: 500.0 })
        .expect(200);

      const body = response.body as AccountResponseBody;

      expect(Number(body.balance)).toBe(1500.0);
      expect(body.transactions.length).toBeGreaterThan(0);
    });

    it('debe rechazar montos negativos o no válidos (400 Bad Request)', async () => {
      const response = await request(server)
        .post(`/accounts/${testAccountId}/deposit`)
        .send({ amount: -100.0 })
        .expect(400);

      const body = response.body as AccountResponseBody;

      expect(body.message).toBeDefined();
    });
  });

  describe('POST /accounts/:id/withdraw', () => {
    it('debe realizar un retiro exitoso (200 OK)', async () => {
      const response = await request(server)
        .post(`/accounts/${testAccountId}/withdraw`)
        .send({ amount: 300.0 })
        .expect(200);

      const body = response.body as AccountResponseBody;

      expect(Number(body.balance)).toBe(1200.0);
    });

    it('debe rechazar retiros si el saldo es insuficiente (422 Unprocessable Entity)', async () => {
      const response = await request(server)
        .post(`/accounts/${testAccountId}/withdraw`)
        .send({ amount: 999999.0 })
        .expect(422);

      const body = response.body as AccountResponseBody;

      expect(body.message).toBe('Saldo insuficiente para completar el retiro.');
    });
  });
});