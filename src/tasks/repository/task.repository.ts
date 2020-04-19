import { EntityRepository, Repository } from "typeorm"
import { Task } from "../domain/task.entity"
import { GetTasksDto } from "../dto/get-tasks.dto"
import { User } from "../../auth/domain/user.entity"

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {

    async getTasks(filterDto: GetTasksDto, user: User): Promise<Task[]> {
        const { status, search } = filterDto
        const query = this.createQueryBuilder("task")

        query.where("task.userId = :userId", { userId: user.id })

        if(status) {
            query.andWhere("task.status = :status", { status })
        }

        if(search) {
            query.andWhere("(task.title LIKE :search OR task.description LIKE :search)", { search: `%${search}%`})
        }

        return await query.getMany()
    }

}