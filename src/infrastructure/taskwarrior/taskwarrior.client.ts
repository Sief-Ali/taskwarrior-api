
import {
  TaskwarriorClient,
  type TaskwarriorClientOptions,
  type TaskwarriorTask,
  type TaskPriority,
} from 'taskwarrior-adapter';

export interface CreateTaskInput {
  description: string;
  project?: string | undefined;
  priority?: TaskPriority | undefined;
  due?: string | undefined;
  tags?: string[] | undefined;
}

export class TaskwarriorService {
  private readonly client: TaskwarriorClient;

  constructor(options: TaskwarriorClientOptions = {}) {
    this.client = new TaskwarriorClient(options);
  }

  /**
   * Get the installed Taskwarrior CLI version.
   */
  async getVersion(): Promise<string> {
    return this.client.getVersion();
  }

  /**
   * Get all tasks returned by Taskwarrior's export command.
   */
  async listTasks(): Promise<TaskwarriorTask[]> {
    return this.client.listTasks();
  }

  /**
   * Get a task by UUID, or null if it doesn't exist.
   */
  async getTask(uuid: string): Promise<TaskwarriorTask | null> {
    return this.client.getTask(uuid);
  }

  async createTask(input: CreateTaskInput): Promise<void> {
    let command = this.client.tasks.create().description(input.description);

    if (input.project !== undefined) command = command.project(input.project);
    if (input.priority !== undefined) command = command.priority(input.priority);
    if (input.due !== undefined) command = command.due(input.due);
    for (const tag of input.tags ?? []) command = command.tag(tag);

    await command.execute();
  }
}
