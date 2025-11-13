import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './enums/role.enum';
import { Faculty } from './enums/faculty.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  academicEmail: string;

  @Prop({ enum: Role, default: Role.STUDENT })
  role: Role;

  @Prop({ required: false, default: ''})
  avatar: string;

  @Prop({ required: false, default: ''})
  googleId: string;

  @Prop({ enum: Faculty, required: false })
  faculty?: Faculty;

  @Prop()
  studentId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
