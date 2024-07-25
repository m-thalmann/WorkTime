import * as argon2 from 'argon2';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true, length: 80 })
  email!: string;

  @Column({ nullable: true, default: null, type: 'datetime' })
  emailVerifiedAt!: Date | null;

  @Column()
  @Exclude()
  password!: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null;
  }

  setEmailVerified(): void {
    this.emailVerifiedAt = new Date();
  }

  async setPassword(password: string): Promise<void> {
    this.password = await argon2.hash(password);
  }
}
