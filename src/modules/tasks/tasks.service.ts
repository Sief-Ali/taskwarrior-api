import { TaskwarriorService } from '../../infrastructure/taskwarrior/taskwarrior.client.js';

// const version = await taskwarrior.getVersion();
// const tasks = await taskwarrior.listTasks();
// const task = await taskwarrior.getTask('your-task-uuid');


export class TasksService {
  private readonly taskwarriorService: TaskwarriorService;
  constructor() {
    this.taskwarriorService = new TaskwarriorService();
  }

  async getTasksList() {
    const tasks = await this.taskwarriorService.listTasks();

    return tasks;
    
  }

  async getTaskById(uuid: string) {
    return this.taskwarriorService.getTask(uuid);
  }
};
