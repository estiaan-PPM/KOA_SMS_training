import StudentsService from './student.service';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import { eq, InferSelectModel } from 'drizzle-orm';
import { databaseSchema } from '../database/database-schema';
import { UpdateStudentDto } from './dto/update-student.dto';
 
describe('The StudentsService', () => {
  let studentsService: StudentsService;
  describe('when the getById function is called', () => {
    let selectMock: jest.Mock;
    let fromMock: jest.Mock;
    let whereMock: jest.Mock;

    beforeEach(async () => {
        whereMock = jest.fn();
        fromMock = jest.fn().mockReturnValue({
            where: whereMock,
        });
        selectMock = jest.fn().mockReturnValue({
            from: fromMock,
        });

        // Mock the drizzleService structure
        studentsService = await Test.createTestingModule({
            providers: [
                StudentsService,
                {
                    provide: DrizzleService,
                    useValue: {
                        db: {
                        select: selectMock,
                        },
                    },
                },
            ],
        }).compile().then(module => module.get(StudentsService));
    });

    describe('and the findFirst method returns a student', () => {
      let student: InferSelectModel<typeof databaseSchema.students>;
      const studentId = 1;

      beforeEach(() => {
        student = {
          id: studentId,
          email: 'john@smith.com',
          firstName: 'John',
          lastName: 'Doe',
          status: 'active',
        };

        whereMock.mockResolvedValue([student]);
      });

      it('should call the student with the correct parameters', async () => {
        await studentsService.getById(student.id);
        
        expect(selectMock).toHaveBeenCalled();
        expect(fromMock).toHaveBeenCalledWith(databaseSchema.students);
        expect(whereMock).toHaveBeenCalledWith(eq(databaseSchema.students.id, studentId));
      });

      it('should return the student', async () => {
        const result = await studentsService.getById(studentId);
        expect(result).toBe(student);
      });
    });  //success


    describe('and the select method returns no students', () => {
    const studentId = 999;

    beforeEach(() => {
      // Mock failed select - returns empty array
      whereMock.mockResolvedValue([]);
    });

    it('should throw NotFoundException when no student is found', async () => {
      await expect(
        studentsService.getById(studentId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should still call the database select methods', async () => {
      try {
        await studentsService.getById(studentId);
      } catch (error) {
        // Expected to throw
      }

      expect(selectMock).toHaveBeenCalled();
      expect(fromMock).toHaveBeenCalledWith(databaseSchema.students);
      expect(whereMock).toHaveBeenCalledWith(eq(databaseSchema.students.id, studentId));
    });
  });  //failure
    
  });
  

  //test update Student
  describe('when the update function is called', () => {
    let updateMock: jest.Mock;
    let setMock: jest.Mock;
    let whereMock: jest.Mock;
    let returningMock: jest.Mock;

    beforeEach(async () => {
        // Create mocks for the chained methods
        returningMock = jest.fn();
        whereMock = jest.fn().mockReturnValue({
        returning: returningMock,
        });
        setMock = jest.fn().mockReturnValue({
        where: whereMock,
        });
        updateMock = jest.fn().mockReturnValue({
        set: setMock,
        });

        // Mock the drizzleService structure
        studentsService = await Test.createTestingModule({
            providers: [
                StudentsService,
                {
                provide: DrizzleService,
                useValue: {
                    db: {
                    update: updateMock,
                    },
                },
                },
            ],
        }).compile().then(module => module.get(StudentsService));
    });

    describe('and the update operation returns a student', () => {
        let student: InferSelectModel<typeof databaseSchema.students>;
        let updateData: UpdateStudentDto;
        const studentId = 1;

        beforeEach(() => {
            student = {
                id: studentId,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                status: 'active'
            };

            updateData = {
                firstName: 'Jane',
                email: 'jane.doe@example.com',
                status: 'inactive'
            };

            // Mock successful update - returns array with one student
            returningMock.mockResolvedValue([student]);
        });

        it('should call the database update with correct parameters', async () => {
            await studentsService.update(studentId, updateData);

            expect(updateMock).toHaveBeenCalledWith(databaseSchema.students);
            expect(setMock).toHaveBeenCalledWith(updateData);
            expect(whereMock).toHaveBeenCalledWith(eq(databaseSchema.students.id, studentId));
            expect(returningMock).toHaveBeenCalled();
        });

        it('should return the updated student', async () => {
            const result = await studentsService.update(studentId, updateData);
            expect(result).toBe(student);
        });
    });

    describe('and the update operation returns no students', () => {
        const studentId = 999;
        let updateData: UpdateStudentDto;

        beforeEach(() => {
            updateData = {
                firstName: 'Non-existent Student',
            };

            // Mock failed update - returns empty array
            returningMock.mockResolvedValue([]);
        });

        it('should throw NotFoundException when no student is found', async () => {
            await expect(
                studentsService.update(studentId, updateData)
            ).rejects.toThrow(NotFoundException);
        });

        it('should still call the database update methods', async () => {
            try {
                await studentsService.update(studentId, updateData);
            } catch (error) {
                // Expected to throw
            }

            expect(updateMock).toHaveBeenCalledWith(databaseSchema.students);
            expect(setMock).toHaveBeenCalledWith(updateData);
            expect(whereMock).toHaveBeenCalledWith(eq(databaseSchema.students.id, studentId));
            expect(returningMock).toHaveBeenCalled();
        });
    });
  });
});