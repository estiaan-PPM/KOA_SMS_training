
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import studentService from './student.service';
import { DrizzleService } from '../database/drizzle.service';
import studentsController from './students.controller';
import * as request from 'supertest';
 
describe('The studentController', () => {
  let app: INestApplication;
  let findFirstMock: jest.Mock;
  beforeEach(async () => {
    findFirstMock = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        studentService,
        {
          provide: DrizzleService,
          useValue: {
            db: {
              query: {
                student: {
                  findFirst: findFirstMock,
                },
              },
            },
          },
        },
      ],
      controllers: [studentsController],
      imports: [],
    }).compile();
 
    app = module.createNestApplication();
    await app.init();
  });
  
  describe('when the GET /students/:id endpoint is called', () => {
    describe('and the student with a given id exists', () => {
      beforeEach(() => {
        findFirstMock.mockResolvedValue({
          id: 1,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'estiaan+1@plusplusminus.co.za',
        });
      });
      it('should respond with the student', () => {
        return request(app.getHttpServer()).get('/students/1').expect({
          id: 1,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'estiaan+1@plusplusminus.co.za',
        });
      });
    });
    describe('and the student with a given id does not exist', () => {
      beforeEach(() => {
        findFirstMock.mockResolvedValue(undefined);
      });
      it('should respond with the 404 status', () => {
        return request(app.getHttpServer()).get('/categories/2').expect(404);
      });
    });
  });
});