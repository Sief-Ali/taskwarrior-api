const { createTaskSchema } = require("../src/modules/tasks/taskRequestValidation.ts");

describe("createTaskSchema", () => {
  it("accepts descriptions and supported optional fields", () => {
    expect(
      createTaskSchema.safeParse({
        description: "Buy bread and milk",
        project: "Home Errands",
        priority: "M",
        due: "tomorrow",
        tags: ["errands", "shopping-list"],
      }).success,
    ).toBe(true);
  });

  it.each([
    [{ description: "" }],
    [{ description: "NUL\u0000character" }],
    [{ description: "Task", priority: "urgent" }],
    [{ description: "Task", project: "unsafe/value" }],
    [{ description: "Task", due: "tomorrow morning" }],
    [{ description: "Task", tags: ["two words"] }],
    [{ description: "Task", unknown: true }],
  ])("rejects invalid input %j", (input) => {
    expect(createTaskSchema.safeParse(input).success).toBe(false);
  });
});
