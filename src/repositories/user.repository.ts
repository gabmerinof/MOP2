import { EntityRepository } from '@mikro-orm/postgresql';
import { User } from '../entities/user.entity';

export class UserRepository extends EntityRepository<User> {

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  async usernameExists(username: string): Promise<boolean> {
    const count = await this.count({ username });
    return count > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.count({ email });
    return count > 0;
  }
}