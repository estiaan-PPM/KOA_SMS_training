import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { DrizzleService } from '../database/drizzle.service';
import { databaseSchema } from '../database/database-schema';
import { eq } from 'drizzle-orm';
import PostgresErrorCode from '../database/postgresErrorCodes.enum';
import { isDatabaseError } from '../database/database-error';
import { UserAlreadyExistsException } from './user-already-exists.exception';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getByEmail(email: string) {
    const user = await this.drizzleService.db.query.users.findFirst({
      where: eq(databaseSchema.users.email, email),
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getById(id: number) {
    const user = await this.drizzleService.db.query.users.findFirst({
      with: {
        address: true,
      },
      where: eq(databaseSchema.users.id, id),
    });

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async create(user: UserDto) {

    try {
      const createdUsers = await this.drizzleService.db
        .insert(databaseSchema.users)
        .values(user)
        .returning();

      return createdUsers.pop();
    } catch (error) {
      if(isDatabaseError(error) && error.code === PostgresErrorCode.UniqueViolation) {
        throw new UserAlreadyExistsException(user.email);
      }

      throw error;
    }
  }

}