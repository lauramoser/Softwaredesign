import { testPasswordSecurity } from "../classes/TestMethods";

test("Check if password is secure", () => {
  expect(testPasswordSecurity("Asfasd!3423")).toBe(true);
});
test("Check if password is secure", () => {
  expect(testPasswordSecurity("A3")).toBe(false);
});

