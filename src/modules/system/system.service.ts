
import { TaskwarriorService } from '@infrastructure/taskwarrior/index.js';

export class SystemService {
  constructor(
    private readonly taskwarrior: TaskwarriorService,
  ) {}

  async getHealth() {
    const taskwarriorVersion = await this.taskwarrior.getVersion();

    return {
      status: 'healthy',
      system: 'Task Warrior Backend',
      taskwarrior: {
        version: taskwarriorVersion,
      },
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
