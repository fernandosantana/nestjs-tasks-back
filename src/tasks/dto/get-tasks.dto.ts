import { TaskStatus } from "../domain/task-status.enum";
import { IsOptional, IsIn, IsNotEmpty } from "class-validator";

export class GetTasksDto {

    @IsOptional()
    @IsIn([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE], { message: "status must be one of the following values: OPEN, IN_PROGRESS or DONE" })
    status: TaskStatus

    @IsOptional()
    @IsNotEmpty({ message: "seach should not be empty"})
    search: string
}