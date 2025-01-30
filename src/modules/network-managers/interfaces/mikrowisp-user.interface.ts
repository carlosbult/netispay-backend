import { CreateUserDto } from '../mikrowisp/users/dto/create-user.dto';

export interface MikrowispUser {
  createUser(data: CreateUserDto): Promise<any>;
}
