import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateStudentCommand } from './create-student.command';
import { Logger } from '@nestjs/common';

@CommandHandler(CreateStudentCommand)
export class CreateAlarmCommandHandler
  implements ICommandHandler<CreateStudentCommand>
{
  private readonly logger = new Logger(CreateAlarmCommandHandler.name);

  constructor(
    private readonly alarmRepository: AlarmRepository,
  ) {}

  async execute(command: CreateStudentCommand) {
    this.logger.debug(
      `Processing "CreateAlarmCommand": ${JSON.stringify(command)}`,
    );
    const student = this.alarmFactory.create(command.name, command.severity);
    return this.alarmRepository.save(alarm);
  }
}