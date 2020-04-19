import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TasksService } from '../service/tasks.service';
import { GetTasksDto } from '../dto/get-tasks.dto';
import { TaskStatusValidationPipe } from '../pipes/task-status-validation.pipe';
import { TaskStatus } from '../domain/task-status.enum';
import { Task } from '../domain/task.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../auth/decorator/get-user.decorator';
import { User } from '../../auth/domain/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {

    constructor(private taskService: TasksService) {}

    @Get()
    getTasks(
        @Query(ValidationPipe) filterDto: GetTasksDto,
        @GetUser() user: User
    ): Promise<Task[]> {
        return this.taskService.getTasks(filterDto, user)
    }

    @Get("/:id")
    getTaskById(
        @Param("id", ParseIntPipe) id: number,
        @GetUser() user: User
    ): Promise<Task> {
        return this.taskService.getTaskById(id, user)
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(
        @Body() createTaskDto: CreateTaskDto,
        @GetUser() user: User
    ): Promise<Task> {
        return this.taskService.createTask(createTaskDto, user)
    }

    @Delete("/:id")
    deleteTask(
        @Param("id", ParseIntPipe) id: number,
        @GetUser() user: User
    ): Promise<void> {
        return this.taskService.deleteTask(id, user)
    }

    @Patch("/:id/status")
    updateTaskStatus(
        @Param("id", ParseIntPipe) id: number, 
        @Body("status", TaskStatusValidationPipe) status: TaskStatus,
        @GetUser() user: User
    ): Promise<Task> 
    {
        return this.taskService.updateTaskStatus(id, status, user)
    }

}
