import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request);
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);

export const GetSession = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.session[data];
    }
    return request.session;
  },
);
