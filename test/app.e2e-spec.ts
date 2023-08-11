import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
const PORT = 3002;

describe('App EndToEnd tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = appModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.listen(PORT);
    prismaService = app.get(PrismaService);
    await prismaService.cleanDatabase();
    pactum.request.setBaseUrl(`http:/localhost:${PORT}`);
  });

  describe('test authentication', () => {
    describe('register', () => {
      it('should show error with empty email', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            email: '',
            password: '123456',
          })
          .expectStatus(400);
      });
      it('should show error with invalid email', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            email: 'test@gmail',
            password: '123456',
          })
          .expectStatus(400);
      });
      it('should show error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/register')
          .withBody({
            email: 'test@gmail.com',
            password: '',
          })
          .expectStatus(400);
      });
      it('should register', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: 'testemail01@gmail.com',
            password: '123456',
          })
          .expectStatus(201);
      });
    });
    describe('login', () => {
      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'testemail01@gmail.com',
            password: '123456',
          })
          .expectStatus(201)
          .stores('accessToken', 'accessToken');
      });
    });
  });

  describe('User', () => {
    describe('get detail user', () => {
      it('should get detail user', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200);
      });
    });
  });
  describe('Note', () => {
    describe('Insert Note', () => {
      it('insert first note', () => {
        return pactum
          .spec()
          .post('/notes')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .withBody({
            title: 'This is title 11',
            description: 'descriptionnnn 11',
            url: 'www.yahoo.com',
          })
          .expectStatus(201)
          .stores('nodeId01', 'id')
          .inspect();
      });
      it('insert second note', () => {
        return pactum
          .spec()
          .post('/notes')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .withBody({
            title: 'This is title 222',
            description: 'descriptionnnn 222',
            url: 'www.twitter.com',
          })
          .expectStatus(201)
          .stores('nodeId02', 'id')
          .inspect();
      });
      it('get Note by id}', () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .withPathParams('id', '${nodeId01}')
          .expectStatus(200);
      });
      it('get All Notes', () => {
        return pactum
          .spec()
          .get('/notes')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .inspect()
          .expectStatus(200);
      });
      it('delete note by ID', () => {
        return pactum
          .spec()
          .delete('/notes')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .withQueryParams('id', '$S{nodeId02}')
          .inspect()
          .expectStatus(204);
      });
    });
  });
  afterAll(async () => {
    app.close();
  });
  it.todo('should pass');
  it.todo('should pass2');
});

// describe('test ', () => {
//   it('should login');
// });
