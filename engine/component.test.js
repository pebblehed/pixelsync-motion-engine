import test from "node:test";
import assert from "node:assert/strict";
import { createComponent } from "./component.js";

function buildInput() {
  return {
    identity: {
      id: "component-primary",
      scope: "production-primary",
    },
    owner: {
      type: "sequence",
      id: "sequence-primary",
    },
    inheritedAuthority: {
      sources: ["PSME-CON-001", "sequence-primary"],
    },
    state: {
      status: "ready",
      nested: {
        position: { x: 10, y: 20 },
        flags: ["visible", "enabled"],
      },
    },
    behaviours: [
      { id: "behaviour-primary", scope: "production-primary" },
      { id: "behaviour-secondary", scope: "production-primary" },
      { id: "behaviour-tertiary", scope: "production-primary" },
    ],
    traceability: {
      production: {
        type: "production",
        id: "production-primary",
      },
      story: {
        type: "story",
        id: "story-primary",
      },
      scene: {
        type: "scene",
        id: "scene-primary",
      },
      sequence: {
        type: "sequence",
        id: "sequence-primary",
      },
    },
  };
}

test("createComponent returns the exact canonical top-level representation and type", () => {
  const input = buildInput();
  const component = createComponent(input);

  assert.deepStrictEqual(component, {
    type: "component",
    identity: input.identity,
    owner: input.owner,
    inheritedAuthority: input.inheritedAuthority,
    state: input.state,
    behaviours: input.behaviours,
    traceability: input.traceability,
  });

  assert.equal(component.type, "component");
  assert.deepStrictEqual(Object.keys(component), [
    "type",
    "identity",
    "owner",
    "inheritedAuthority",
    "state",
    "behaviours",
    "traceability",
  ]);
});

test("supplied governed values are preserved without inference/repair/transformation/reordering/defaulting", () => {
  const input = buildInput();
  const component = createComponent(input);

  assert.deepStrictEqual(component.identity, input.identity);
  assert.deepStrictEqual(component.owner, input.owner);
  assert.deepStrictEqual(
    component.inheritedAuthority,
    input.inheritedAuthority,
  );
  assert.deepStrictEqual(component.state, input.state);
  assert.deepStrictEqual(component.behaviours, input.behaviours);
  assert.deepStrictEqual(component.traceability, input.traceability);

  assert.deepStrictEqual(component.behaviours, [
    { id: "behaviour-primary", scope: "production-primary" },
    { id: "behaviour-secondary", scope: "production-primary" },
    { id: "behaviour-tertiary", scope: "production-primary" },
  ]);

  assert.deepStrictEqual(
    component.behaviours.map((b) => b.id),
    ["behaviour-primary", "behaviour-secondary", "behaviour-tertiary"],
  );

  assert.deepStrictEqual(component.inheritedAuthority.sources, [
    "PSME-CON-001",
    "sequence-primary",
  ]);
});

test("returned Component representation is recursively immutable across canonical graph", () => {
  const input = buildInput();
  const component = createComponent(input);

  assert.equal(Object.isFrozen(component), true);
  assert.equal(Object.isFrozen(component.identity), true);
  assert.equal(Object.isFrozen(component.owner), true);
  assert.equal(Object.isFrozen(component.inheritedAuthority), true);
  assert.equal(Object.isFrozen(component.inheritedAuthority.sources), true);
  assert.equal(Object.isFrozen(component.state), true);
  assert.equal(Object.isFrozen(component.state.nested), true);
  assert.equal(Object.isFrozen(component.state.nested.position), true);
  assert.equal(Object.isFrozen(component.state.nested.flags), true);
  assert.equal(Object.isFrozen(component.behaviours), true);
  assert.equal(Object.isFrozen(component.behaviours[0]), true);
  assert.equal(Object.isFrozen(component.traceability), true);
  assert.equal(Object.isFrozen(component.traceability.production), true);
  assert.equal(Object.isFrozen(component.traceability.story), true);
  assert.equal(Object.isFrozen(component.traceability.scene), true);
  assert.equal(Object.isFrozen(component.traceability.sequence), true);

  assert.throws(() => {
    component.identity.id = "changed";
  }, TypeError);

  assert.throws(() => {
    component.inheritedAuthority.sources.push("extra-source");
  }, TypeError);

  assert.throws(() => {
    component.state.nested.position.x = 99;
  }, TypeError);

  assert.throws(() => {
    component.behaviours[0].id = "other-behaviour";
  }, TypeError);

  assert.throws(() => {
    component.traceability.production.id = "other-production";
  }, TypeError);
});

test("createComponent does not mutate or freeze caller-supplied input objects or arrays", () => {
  const input = buildInput();
  const original = structuredClone(input);

  const component = createComponent(input);

  assert.deepStrictEqual(input, original);

  assert.equal(Object.isFrozen(input.identity), false);
  assert.equal(Object.isFrozen(input.owner), false);
  assert.equal(Object.isFrozen(input.inheritedAuthority), false);
  assert.equal(Object.isFrozen(input.inheritedAuthority.sources), false);
  assert.equal(Object.isFrozen(input.state), false);
  assert.equal(Object.isFrozen(input.state.nested), false);
  assert.equal(Object.isFrozen(input.behaviours), false);
  assert.equal(Object.isFrozen(input.behaviours[0]), false);
  assert.equal(Object.isFrozen(input.traceability), false);
  assert.equal(Object.isFrozen(input.traceability.production), false);

  assert.notStrictEqual(component.identity, input.identity);
  assert.notStrictEqual(component.owner, input.owner);
  assert.notStrictEqual(component.inheritedAuthority, input.inheritedAuthority);
  assert.notStrictEqual(
    component.inheritedAuthority.sources,
    input.inheritedAuthority.sources,
  );
  assert.notStrictEqual(component.state, input.state);
  assert.notStrictEqual(component.behaviours, input.behaviours);
  assert.notStrictEqual(component.behaviours[0], input.behaviours[0]);
  assert.notStrictEqual(component.traceability, input.traceability);
  assert.notStrictEqual(
    component.traceability.production,
    input.traceability.production,
  );
});

test("equivalent and repeated construction is deterministic with no hidden state", () => {
  const inputA = buildInput();
  const inputB = buildInput();

  const componentA1 = createComponent(inputA);
  const componentA2 = createComponent(inputA);
  const componentB1 = createComponent(inputB);
  const componentB2 = createComponent(inputB);

  assert.deepStrictEqual(componentA1, componentA2);
  assert.deepStrictEqual(componentA1, componentB1);
  assert.deepStrictEqual(componentA2, componentB2);
});

test("canonical representation includes no prohibited top-level concern members", () => {
  const component = createComponent(buildInput());

  const prohibitedTopLevelMembers = [
    "validation",
    "evaluation",
    "outcomes",
    "outcomeApplication",
    "rendering",
    "runtimeState",
    "executionState",
    "renderState",
    "scheduling",
    "animation",
    "interpolation",
  ];

  for (const member of prohibitedTopLevelMembers) {
    assert.equal(member in component, false);
  }
});
