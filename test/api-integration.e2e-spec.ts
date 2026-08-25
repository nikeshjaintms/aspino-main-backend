import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API & Integration Testing (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /gate-pass', () => {
    it('should return 200 and paginated response structure for valid query', async () => {
      const res = await request(app.getHttpServer())
        .get('/gate-pass?page=1&limit=10')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page', 1);
      expect(res.body).toHaveProperty('limit', 10);
    });

    it('should handle search filter without crashing', async () => {
      const res = await request(app.getHttpServer())
        .get('/gate-pass?page=1&limit=5&search=GP')
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });

    it('should return 404 for non-existent gate pass ID', async () => {
      await request(app.getHttpServer())
        .get('/gate-pass/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('should return 400 when creating gate pass with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/gate-pass')
        .send({})
        .expect(400);
    });
  });

  describe('GET /vendor', () => {
    it('should return 200 and vendor list', async () => {
      const res = await request(app.getHttpServer())
        .get('/vendor?page=1&limit=10')
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('GET /customer', () => {
    it('should return 200 and customer list with metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/customer?page=1&limit=10')
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('GET /supplier', () => {
    it('should return 200 and supplier list', async () => {
      const res = await request(app.getHttpServer())
        .get('/supplier?page=1&limit=10')
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('GET /product', () => {
    it('should return 200 and product list', async () => {
      const res = await request(app.getHttpServer())
        .get('/product?page=1&limit=10')
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('POST /auth/admin/login', () => {
    it('should return 400 when body is empty', async () => {
      await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({})
        .expect(400);
    });

    it('should return 401 for non-existent admin credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/admin/login')
        .send({
          email: 'nonexistent_admin_test@aspino.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });
  });
});
