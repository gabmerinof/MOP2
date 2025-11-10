import { BeforeCreate, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/postgresql';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/user.repository';
import { GeoPoint } from './geo-point.entity';

@Entity({ tableName: 'users', repository: () => UserRepository})
export class User {
  @PrimaryKey({ type: 'uuid' })
  userid?: string = uuidv4();

  @Property({ unique: true })
  username!: string;

  @Property({ hidden: true })
  password!: string;

  @Property({ nullable: true })
  email?: string;

  @Property()
  createdAt?: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt?: Date = new Date();

  @OneToMany(() => GeoPoint, geoPoint => geoPoint.user)
  geoPoints = new Collection<GeoPoint>(this);

  @BeforeCreate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const { password, geoPoints, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}