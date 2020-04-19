import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { GetTasksDto } from '../dto/get-tasks.dto';
import { TaskRepository } from '../repository/task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from '../domain/task-status.enum';
import { Task } from '../domain/task.entity';
import { User } from '../../auth/domain/user.entity';

@Injectable()
export class TasksService {
    
    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository
    ){}

    getTasks(filterDto: GetTasksDto, user: User): Promise<Task[]> {
        return this.taskRepository.getTasks(filterDto, user)
    }

    async getTaskById(id: number, user: User): Promise<Task> {
        const found = await this.taskRepository.findOne({ where: { id, userId: user.id }})

        if(!found) {
            throw new NotFoundException(`Task with id "${id}" not found.`)
        }

        return found
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto

        const task = new Task()
        task.title = title
        task.description = description
        task.status = TaskStatus.OPEN
        task.user = user

        const newTask = await this.taskRepository.save(task)
        delete newTask.user
        return newTask
    }

    async deleteTask(id: number, user: User): Promise<void> {
        const result = await this.taskRepository.delete({ id, userId: user.id })

        if(result.affected === 0) {
            throw new NotFoundException(`Task with id "${id}" not found.`)
        }
    }

    async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
        const task = await this.getTaskById(id, user)
        task.status = status

        await this.taskRepository.save(task)

        return task
    }
}
