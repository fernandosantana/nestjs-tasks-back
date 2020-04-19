import { Test } from "@nestjs/testing"
import { TaskRepository } from "../src/tasks/repository/task.repository";
import { TasksService } from "../src/tasks/service/tasks.service";
import { GetTasksDto } from "../src/tasks/dto/get-tasks.dto";
import { TaskStatus } from "../src/tasks/domain/task-status.enum";
import { Task } from "../src/tasks/domain/task.entity";
import { NotFoundException } from "@nestjs/common";
import { CreateTaskDto } from "../src/tasks/dto/create-task.dto";
import { User } from "../src/auth/domain/user.entity";

const mockUser = new User()
mockUser.id = 1

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn()
})

describe("TasksService", () => {

    let taskRepository: TaskRepository
    let tasksService: TasksService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: TaskRepository,
                    useFactory: mockTaskRepository
                }
            ]
        }).compile()

        tasksService = module.get<TasksService>(TasksService)
        taskRepository = module.get<TaskRepository>(TaskRepository)
    })


    describe("getTasks", () => {
        it("gets all tasks from repository", async () => {
            expect(taskRepository.getTasks).not.toHaveBeenCalled()

            jest.spyOn(taskRepository, "getTasks").mockResolvedValue([new Task()]);

            const filter: GetTasksDto = { status: TaskStatus.IN_PROGRESS, search: "some search" }
            const result = await tasksService.getTasks(filter, mockUser)

            expect(taskRepository.getTasks).toHaveBeenCalled()
            expect((result).length).toBe(1)
        })
    })

    describe("getTaskById", () => {
        it("call tasksService.getTaskById() and succesffuly retrieve and return the task", async () => {
            const task = new Task()
            task.id = 1
            task.title = "task test"

            jest.spyOn(taskRepository, "findOne").mockResolvedValue(task)

            const result = await tasksService.getTaskById(1, mockUser)
            expect(result.id).toBe(task.id)
            expect(result.title).toBe(task.title)
            expect(taskRepository.findOne).toHaveBeenCalledWith(
                { where: { id: 1, userId: mockUser.id }}
            )
        })

        it("throws an error as task is not found", () => {
            jest.spyOn(taskRepository, "findOne").mockResolvedValue(null)
            expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException)
        })
    })

    describe("createTask", () => {
        it("calls tasksService.createTask() and return the result", async () => {
            expect(taskRepository.save).not.toHaveBeenCalled()
            const createTask: CreateTaskDto = { title: "create task", description: "description create task" }

            const task = new Task()
            task.id = 1
            task.title = createTask.title
            task.description = createTask.description

            jest.spyOn(taskRepository, "save").mockResolvedValue(task)

            const result = await tasksService.createTask(createTask, mockUser)

            expect(taskRepository.save).toHaveBeenCalled()
            expect(result.title).toBe(task.title)
            expect(result.description).toBe(task.description)
        })
    })

    describe("deleteTask", () => {
        it("calls tasksService.deleteTask() to delete a task", async () => {
            jest.spyOn(taskRepository, "delete").mockResolvedValue({ affected: 1, raw: {}})
            expect(taskRepository.delete).not.toHaveBeenCalled()

            await tasksService.deleteTask(1, mockUser)
            expect(taskRepository.delete).toHaveBeenCalledWith(
                { id: 1, userId: mockUser.id }
            )
        })

        it("throws an error as task is not found", () => {
            jest.spyOn(taskRepository, "delete").mockResolvedValue({ affected: 0, raw: {}})
            expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(NotFoundException)
        })
    })

    describe("updateTaskStatus", () => {
        it("update a task status", async () => {
            const task = new Task()
            task.id = 1
            task.title = "title"
            task.description = "description"
            task.status = TaskStatus.OPEN

            jest.spyOn(tasksService, "getTaskById").mockResolvedValue(task)
            jest.spyOn(taskRepository, "save").mockResolvedValue(task)

            expect(tasksService.getTaskById).not.toHaveBeenCalled()
            expect(taskRepository.save).not.toHaveBeenCalled()

            const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser)

            expect(tasksService.getTaskById).toHaveBeenCalled()
            expect(taskRepository.save).toHaveBeenCalled()
            expect(result.status).toBe(TaskStatus.DONE)
        })
    })
    
})