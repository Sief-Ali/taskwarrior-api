
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

export interface ModifyTaskInput {
  description?: string | undefined;
  project?: string | undefined;
  priority?: TaskPriority | undefined;
  due?: string | undefined;
  addTags?: string[] | undefined;
  removeTags?: string[] | undefined;
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

  async modifyTask(uuid: string, input: ModifyTaskInput): Promise<void> {
    let command = this.client.tasks.modify(uuid);

    if (input.description !== undefined) command = command.description(input.description);
    if (input.project !== undefined) command = command.project(input.project);
    if (input.priority !== undefined) command = command.priority(input.priority);
    if (input.due !== undefined) command = command.due(input.due);
    for (const tag of input.addTags ?? []) command = command.addTag(tag);
    for (const tag of input.removeTags ?? []) command = command.removeTag(tag);

    await command.execute();
  }

  async completeTask(uuid: string): Promise<void> {
    await this.client.tasks.complete(uuid).execute();
  }

  async deleteTask(uuid: string): Promise<void> {
    await this.client.tasks.delete(uuid).execute();
  }

  async startTask(uuid: string): Promise<void> {
    await this.client.tasks.start(uuid).execute();
  }

  async stopTask(uuid: string): Promise<void> {
    await this.client.tasks.stop(uuid).execute();
  }
}
