import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service'

describe('AccountsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testAccountId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Habilitar ValidationPipe para verificar transformaciones de DTOs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Limpiar tabla e insertar cuenta de prueba en la base de datos de test
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();

    const createdAccount = await prisma.account.create({
      data: {
        accountNumber: '999888777',
        holderName: 'Cliente Prueba E2E',
        balance: 1000.0,
        type: 'SAVINGS',
      },
    });

    testAccountId = createdAccount.id;
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await app.close();
  });

  describe('GET /accounts/:id', () => {
    it('debe obtener la información de la cuenta correctamente (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/accounts/${testAccountId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', testAccountId);
      expect(response.body).toHaveProperty('accountNumber', '999888777');
      expect(response.body).toHaveProperty('balance', 1000.0);
      expect(Array.isArray(response.body.transactions)).toBeTruthy();
    });

    it('debe retornar 404 Not Found si la cuenta no existe', async () => {
      const response = await request(app.getHttpServer())
        .get('/accounts/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.message).toContain('no fue encontrada');
    });
  });

  describe('POST /accounts/:id/deposit', () => {
    it('debe realizar un depósito exitoso (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/accounts/${testAccountId}/deposit`)
        .send({ amount: 500.0 })
        .expect(200);

      expect(response.body.balance).toBe(1500.0);
      expect(response.body.transactions.length).toBeGreaterThan(0);
      expect(response.body.transactions[0].type).toBe('DEPOSIT');
    });

    it('debe rechazar montos negativos o no válidos (400 Bad Request)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/accounts/${testAccountId}/deposit`)
        .send({ amount: -100.0 })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /accounts/:id/withdraw', () => {
    it('debe realizar un retiro exitoso (200 OK)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/accounts/${testAccountId}/withdraw`)
        .send({ amount: 300.0 })
        .expect(200);

      expect(response.body.balance).toBe(1200.0);
      expect(response.body.transactions[0].type).toBe('WITHDRAWAL');
    });

    it('debe rechazar retiros si el saldo es insuficiente (422 Unprocessable Entity)', async () => {
      const response = await request(app.getHttpServer())
        .post(`/accounts/${testAccountId}/withdraw`)
        .send({ amount: 999999.0 })
        .expect(422);

      expect(response.body.message).toBe('Saldo insuficiente para completar el retiro.');
    });
  });
});