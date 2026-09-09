import { Entity, Column } from 'typeorm';
import { BaseEntity } from '#/database/base.entity.js';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  name: string;
}
