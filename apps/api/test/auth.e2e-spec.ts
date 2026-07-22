import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * End-to-end coverage of the authentication lifecycle. Requires the Postgres
 * and Redis services declared in docker-compose (or a local equivalent) to be
 * reachable via the environment configuration.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;
  const unique = Date.now();
  const email = `e2e_${unique}@idfb-test.local`;
  const password = 'S3curePass!23';
  const taxNumber = String(1000000000 + (unique % 8999999999));

  let refreshToken: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', {
      exclude: ['health', 'health/liveness', 'metrics'],
    });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a new company and returns a token pair', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password,
        firstName: 'E2E',
        lastName: 'Tester',
        companyName: `E2E Co ${unique}`,
        taxNumber,
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('rejects duplicate registration', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email,
        password,
        firstName: 'E2E',
        lastName: 'Tester',
        companyName: 'Dup Co',
        taxNumber,
      })
      .expect(409);
  });

  it('logs in with valid credentials', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);
    expect(response.body.accessToken).toBeDefined();
  });

  it('rejects invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
  });

  it('returns the authenticated profile with permissions', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(response.body.email).toBe(email);
    expect(Array.isArray(response.body.permissions)).toBe(true);
    expect(response.body.permissions.length).toBeGreaterThan(0);
  });

  it('rejects access without a token', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
  });

  it('rotates the refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.refreshToken).not.toBe(refreshToken);

    // Re-using the now-rotated token must be rejected (theft detection).
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });
});
