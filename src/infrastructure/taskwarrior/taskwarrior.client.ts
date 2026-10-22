
import {
  TaskwarriorClient,
  type TaskwarriorClientOptions,
  type TaskwarriorTask,
} from 'taskwarrior-adapter';

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
}
