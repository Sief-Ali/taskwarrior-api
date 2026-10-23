const { TaskwarriorError } = require("taskwarrior-adapter");
const { getTaskwarriorHttpError } = require("../src/modules/tasks/taskwarriorErrorMapping.ts");

describe("getTaskwarriorHttpError", () => {
  it.each([
    ["NOT_INSTALLED", 503],
    ["COMMAND_FAILED", 502],
    ["COMMAND_TIMEOUT", 504],
    ["OUTPUT_LIMIT", 502],
    ["INVALID_JSON", 502],
    ["INVALID_TASK_DATA", 502],
    ["INVALID_UUID", 400],
  ])("maps %s to HTTP %i and preserves the stable message", (code, statusCode) => {
    const error = new TaskwarriorError(code, "adapter-specific diagnostic");

    expect(getTaskwarriorHttpError(error)).toEqual({
      statusCode,
      code,
      message: error.message,
    });
    expect(getTaskwarriorHttpError(error).message).not.toBe(
      "adapter-specific diagnostic",
    );
  });

  it("returns null for errors not created by the adapter", () => {
    expect(getTaskwarriorHttpError(new Error("unrelated failure"))).toBeNull();
    expect(getTaskwarriorHttpError("not an error instance")).toBeNull();
  });
});
