import { TaskStatus } from "./task-status.enum";
import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, ManyToOne } from "typeorm";
import { User } from "../../auth/domain/user.entity";

@Entity()
export class Task extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    status: TaskStatus

    @ManyToOne(type => User, user => user.tasks, { eager: false })
    user: User

    @Column()
    userId: number
}