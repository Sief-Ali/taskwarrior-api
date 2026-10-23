jest.mock("taskwarrior-adapter", () => ({
  TaskwarriorClient: jest.fn(),
}));

const { TaskwarriorClient } = require("taskwarrior-adapter");

function createCommand(methods) {
  const command = {
    execute: jest.fn().mockResolvedValue(undefined),
  };
  for (const method of methods) {
    command[method] = jest.fn().mockReturnValue(command);
  }
  return command;
}

const createCommandBuilder = createCommand([
  "description",
  "project",
  "priority",
  "due",
  "tag",
]);
const modifyCommandBuilder = createCommand([
  "description",
  "project",
  "priority",
  "due",
  "addTag",
  "removeTag",
]);
const lifecycleCommand = createCommand([]);
const taskOperations = {
  create: jest.fn(() => createCommandBuilder),
  modify: jest.fn(() => modifyCommandBuilder),
  complete: jest.fn(() => lifecycleCommand),
  delete: jest.fn(() => lifecycleCommand),
  start: jest.fn(() => lifecycleCommand),
  stop: jest.fn(() => lifecycleCommand),
};

TaskwarriorClient.mockImplementation(() => ({ tasks: taskOperations }));

const { TaskwarriorService } = require("../src/infrastructure/taskwarrior/taskwarrior.client.ts");

describe("TaskwarriorService mutation methods", () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaskwarriorService();
  });

  it("maps task creation fields to the adapter builder", async () => {
    await service.createTask({
      description: "Buy bread",
      project: "Home Errands",
      priority: "M",
      due: "tomorrow",
      tags: ["errands", "shopping"],
    });

    expect(taskOperations.create).toHaveBeenCalledTimes(1);
    expect(createCommandBuilder.description).toHaveBeenCalledWith("Buy bread");
    expect(createCommandBuilder.project).toHaveBeenCalledWith("Home Errands");
    expect(createCommandBuilder.priority).toHaveBeenCalledWith("M");
    expect(createCommandBuilder.due).toHaveBeenCalledWith("tomorrow");
    expect(createCommandBuilder.tag.mock.calls).toEqual([
      ["errands"],
      ["shopping"],
    ]);
    expect(createCommandBuilder.execute).toHaveBeenCalledTimes(1);
  });

  it("maps task changes and tag operations to the adapter builder", async () => {
    const uuid = "1ad3ddbd-acde-4f06-80ce-2672c88e72c2";
    await service.modifyTask(uuid, {
      description: "Buy oat milk",
      project: "Home",
      priority: "H",
      due: "friday",
      addTags: ["urgent"],
      removeTags: ["someday"],
    });

    expect(taskOperations.modify).toHaveBeenCalledWith(uuid);
    expect(modifyCommandBuilder.description).toHaveBeenCalledWith("Buy oat milk");
    expect(modifyCommandBuilder.project).toHaveBeenCalledWith("Home");
    expect(modifyCommandBuilder.priority).toHaveBeenCalledWith("H");
    expect(modifyCommandBuilder.due).toHaveBeenCalledWith("friday");
    expect(modifyCommandBuilder.addTag).toHaveBeenCalledWith("urgent");
    expect(modifyCommandBuilder.removeTag).toHaveBeenCalledWith("someday");
    expect(modifyCommandBuilder.execute).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["completeTask", "complete"],
    ["deleteTask", "delete"],
    ["startTask", "start"],
    ["stopTask", "stop"],
  ])("maps %s to the adapter operation", async (serviceMethod, adapterMethod) => {
    const uuid = "1ad3ddbd-acde-4f06-80ce-2672c88e72c2";
    await service[serviceMethod](uuid);

    expect(taskOperations[adapterMethod]).toHaveBeenCalledWith(uuid);
    expect(lifecycleCommand.execute).toHaveBeenCalledTimes(1);
  });
});
