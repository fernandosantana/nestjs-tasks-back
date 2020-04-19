import { PipeTransform, BadRequestException } from "@nestjs/common";
import { TaskStatus } from "../domain/task-status.enum";

export class TaskStatusValidationPipe implements PipeTransform {
    
    private readonly allowedStatuses = [
        TaskStatus.OPEN,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE
    ]

    transform(value: any) {
        value = value.toUpperCase()

        if(!this.isStatusValid(value)) {
            throw new BadRequestException(`${value} is an invalid status`)
        }

        return value
    }

    private isStatusValid(status: any): boolean {
        const index = this.allowedStatuses.indexOf(status)
        return index !== -1
    }
}