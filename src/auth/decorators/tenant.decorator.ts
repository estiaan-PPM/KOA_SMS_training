import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return {
      schoolId: request.user?.schoolId,
      userId: request.user?.userId,
      userType: request.user?.userType,
    };
  },
);