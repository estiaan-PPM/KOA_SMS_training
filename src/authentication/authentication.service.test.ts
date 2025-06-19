
import { AuthenticationService } from './authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { DrizzleService } from '../database/drizzle.service';
import { InferSelectModel } from 'drizzle-orm';
import { databaseSchema } from '../database/database-schema';
import { DatabaseError } from '../database/database-error';
import PostgresErrorCode from '../database/postgresErrorCodes.enum';
import { UserAlreadyExistsException } from '../users/user-already-exists.exception';
 
jest.mock('bcrypt', () => ({
  hash: () => {
    return Promise.resolve('hashed-password');
  },
}));
 
describe('The AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  let drizzleInsertReturningMock: jest.Mock;
  let drizzleInsertValuesMock: jest.Mock;
  let signUpData: RegisterDto;
  beforeEach(async () => {
    drizzleInsertValuesMock = jest.fn().mockReturnThis();
    drizzleInsertReturningMock = jest.fn().mockResolvedValue([]);
    signUpData = {
      email: 'john@smith.com',
      name: 'John',
      password: 'strongPassword123',
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        UsersService,
        {
          provide: DrizzleService,
          useValue: {
            db: {
              insert: jest.fn().mockReturnThis(),
              values: drizzleInsertValuesMock,
              returning: drizzleInsertReturningMock,
            },
          },
        },
      ],
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secretOrPrivateKey: 'Secret key',
        }),
      ],
    }).compile();
 
    authenticationService = await module.get(AuthenticationService);
  });
  describe('when the signUp function is called', () => {
    it('should insert the user using the Drizzle ORM', async () => {
      await authenticationService.register(signUpData);
      expect(drizzleInsertValuesMock).toHaveBeenCalledWith({
        ...signUpData,
        password: 'hashed-password',
      });
    });
  });

  describe('when the DrizzleService returns a valid user', () => {
    let createdUser: InferSelectModel<typeof databaseSchema.users>;
    beforeEach(() => {
      createdUser = {
        ...signUpData,
        id: 1,
      };
      drizzleInsertReturningMock.mockResolvedValue([createdUser]);
    });
    it('should return the user as well', async () => {
      const result = await authenticationService.register(signUpData);
      expect(result).toBe(createdUser);
    });
  });
  
  describe('when the DrizzleService throws the UniqueViolation error', () => {
    beforeEach(() => {
      const databaseError: DatabaseError = {
        code: PostgresErrorCode.UniqueViolation,
        table: 'users',
        detail: 'Key (email)=(john@smith.com) already exists.',
      };
      drizzleInsertReturningMock.mockImplementation(() => {
        throw databaseError;
      });
    });
    it('should throw the ConflictException', () => {
      return expect(async () => {
        await authenticationService.register(signUpData);
      }).rejects.toThrow(UserAlreadyExistsException);
    });
  });
});



// import { AuthenticationService } from './authentication.service';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule } from '@nestjs/config';
// import { Test } from '@nestjs/testing';
// import { UsersService } from '../users/users.service';
// import { RegisterDto } from './dto/register.dto';
// import * as bcrypt from 'bcrypt';
// import { NotFoundException } from '@nestjs/common';
// import { InferSelectModel } from 'drizzle-orm';
// import { databaseSchema } from '../database/database-schema';
// import { WrongCredentialsException } from './wrongCredentialsException';

// describe('The AuthenticationService', () => {
//   let signUpData: RegisterDto;
//   let authenticationService: AuthenticationService;
//   let getByEmailMock: jest.Mock;
//   let password: string;
//   beforeEach(async () => {
//     getByEmailMock = jest.fn();
//     password = 'strongPassword123';
//     signUpData = {
//       email: 'john@smith.com',
//       name: 'John',
//       password: 'strongPassword123',
//     };

//     const module = await Test.createTestingModule({
//       providers: [
//         AuthenticationService,
//         {
//           provide: UsersService,
//           useValue: {
//             create: jest.fn().mockReturnValue(signUpData),
//             getByEmail: getByEmailMock,
//           },
//         },
//       ],
//       imports: [
//         ConfigModule.forRoot(),
//         JwtModule.register({
//           secretOrPrivateKey: 'Secret key',
//         }),
//       ],
//     }).compile();

//     authenticationService = await module.get(AuthenticationService);
//   });
//   describe('when calling the getCookieForLogOut method', () => {
//     it('should return a correct string', () => {
//       const result = authenticationService.getCookieForLogOut();
//       expect(result).toBe('Authentication=; HttpOnly; Path=/; Max-Age=0');
//     });
//   });
//   describe('when registering a new user', () => {
//     describe('and when the usersService returns the new user', () => {
//       it('should return the new user', async () => {
//         const result = await authenticationService.register(signUpData);
//         expect(result).toBe(signUpData);
//       });
//     });
//   });
//   describe('when the getAuthenticatedUser method is called', () => {
//     describe('and a valid email and password are provided', () => {
//       let userData: InferSelectModel<typeof databaseSchema.users>;
//       beforeEach(async () => {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         userData = {
//           id: 1,
//           email: 'john@smith.com',
//           name: 'John',
//           password: hashedPassword,
//         };
//         getByEmailMock.mockResolvedValue(userData);
//       });
//       it('should return the new user', async () => {
//         const result = await authenticationService.getAuthenticatedUser(
//           userData.email,
//           password,
//         );
//         expect(result).toBe(userData);
//       });
//     });
//     describe('and an invalid email is provided', () => {
//       beforeEach(() => {
//         getByEmailMock.mockRejectedValue(new NotFoundException());
//       });
//       it('should throw the BadRequestException', () => {
//         return expect(async () => {
//           await authenticationService.getAuthenticatedUser(
//             'john@smith.com',
//             password,
//           );
//         }).rejects.toThrow(WrongCredentialsException);
//       });
//     });
//   });
// });