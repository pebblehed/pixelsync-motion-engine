import test from "node:test";
import assert from "node:assert/strict";
import { createComponent } from "./component.js";
import { validateComponent } from "./component-validator.js";

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

function buildCanonicalComponent() {
  return createComponent(buildInput());
}

function buildMutableCanonicalComponent() {
  return {
    type: "component",
    ...structuredClone(buildInput()),
  };
}

function getCategory(outcome, categoryKey) {
  return outcome.categories[categoryKey];
}

function assertInvalidForCategory(outcome, categoryKey) {
  assert.equal(outcome.valid, false);
  assert.equal(outcome.status, "invalid");
  assert.equal(getCategory(outcome, categoryKey).valid, false);
}

function assertFailureShape(failure) {
  assert.equal(typeof failure.category, "string");
  assert.equal(failure.category.length > 0, true);
  assert.equal(typeof failure.requirement, "string");
  assert.equal(failure.requirement.length > 0, true);
  assert.equal(typeof failure.reason, "string");
  assert.equal(failure.reason.length > 0, true);
  assert.equal(typeof failure.affectedComponent, "object");
  assert.notEqual(failure.affectedComponent, null);
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

test("validateComponent accepts canonical component with all mandatory categories passing", () => {
  const component = buildCanonicalComponent();
  const outcome = validateComponent(component);

  assert.equal(outcome.valid, true);
  assert.equal(outcome.status, "valid");
  assert.equal(outcome.type, "component-validation-outcome");

  const mandatoryCategories = [
    "identity",
    "ownership",
    "inheritedAuthority",
    "governedState",
    "behaviourAssociations",
    "constitutionalTraceability",
    "domainConstraints",
    "separation",
    "processingReadiness",
  ];

  for (const categoryKey of mandatoryCategories) {
    assert.equal(getCategory(outcome, categoryKey).valid, true);
  }
});

test("validation outcome preserves component traceability summary for deterministic binding", () => {
  const component = buildCanonicalComponent();
  const outcome = validateComponent(component);

  assert.equal(outcome.component.type, "component");
  assert.equal(outcome.component.identity.present, true);
  assert.equal(outcome.component.identity.id, component.identity.id);
  assert.equal(outcome.component.identity.scope, component.identity.scope);

  assert.equal(outcome.component.owner.present, true);
  assert.equal(outcome.component.owner.type, component.owner.type);
  assert.equal(outcome.component.owner.id, component.owner.id);
});

test("validateComponent does not mutate or freeze mutable caller input and repeated validation keeps input unchanged", () => {
  const mutableComponent = buildMutableCanonicalComponent();
  const original = structuredClone(mutableComponent);

  const outcomeA = validateComponent(mutableComponent);
  const outcomeB = validateComponent(mutableComponent);

  assert.equal(outcomeA.valid, true);
  assert.equal(outcomeB.valid, true);
  assert.deepStrictEqual(mutableComponent, original);

  assert.equal(Object.isFrozen(mutableComponent), false);
  assert.equal(Object.isFrozen(mutableComponent.identity), false);
  assert.equal(Object.isFrozen(mutableComponent.owner), false);
  assert.equal(Object.isFrozen(mutableComponent.inheritedAuthority), false);
  assert.equal(Object.isFrozen(mutableComponent.inheritedAuthority.sources), false);
  assert.equal(Object.isFrozen(mutableComponent.state), false);
  assert.equal(Object.isFrozen(mutableComponent.behaviours), false);
  assert.equal(Object.isFrozen(mutableComponent.traceability), false);
});

test("validateComponent returns recursively immutable validation outcomes including categories and failures", () => {
  const validOutcome = validateComponent(buildCanonicalComponent());

  assert.equal(Object.isFrozen(validOutcome), true);
  assert.equal(Object.isFrozen(validOutcome.component), true);
  assert.equal(Object.isFrozen(validOutcome.component.identity), true);
  assert.equal(Object.isFrozen(validOutcome.component.owner), true);
  assert.equal(Object.isFrozen(validOutcome.categories), true);
  assert.equal(Object.isFrozen(validOutcome.categories.identity), true);
  assert.equal(Object.isFrozen(validOutcome.categories.identity.failures), true);
  assert.equal(Object.isFrozen(validOutcome.failures), true);

  assert.throws(() => {
    validOutcome.status = "invalid";
  }, TypeError);

  const invalidOutcome = validateComponent({ type: "wrong" });

  assert.equal(invalidOutcome.valid, false);
  assert.equal(Object.isFrozen(invalidOutcome.failures), true);
  assert.equal(Object.isFrozen(invalidOutcome.failures[0]), true);

  assert.throws(() => {
    invalidOutcome.failures.push({ reason: "x" });
  }, TypeError);

  assert.throws(() => {
    invalidOutcome.failures[0].reason = "changed";
  }, TypeError);
});

test("validateComponent fail-closed identity evidence for undefined null and array input without throwing", () => {
  const samples = [undefined, null, []];

  for (const sample of samples) {
    assert.doesNotThrow(() => validateComponent(sample));

    const outcome = validateComponent(sample);
    assertInvalidForCategory(outcome, "identity");
  }
});

test("validateComponent fails identity when component.type is not component", () => {
  const subject = buildMutableCanonicalComponent();
  subject.type = "widget";

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "identity");
});

test("validateComponent fails identity when identity is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.identity;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "identity");
});

test("validateComponent fails identity when identity.id is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.identity.id;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "identity");
});

test("validateComponent fails identity when identity.scope is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.identity.scope;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "identity");
});

test("validateComponent fails ownership when owner is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.owner;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "ownership");
});

test("validateComponent fails ownership when plural owners is represented", () => {
  const subject = buildMutableCanonicalComponent();
  subject.owners = [{ type: "sequence", id: "sequence-primary" }];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "ownership");
});

test("validateComponent fails ownership when owner.type is not sequence", () => {
  const subject = buildMutableCanonicalComponent();
  subject.owner.type = "scene";

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "ownership");
});

test("validateComponent fails ownership when owner.id is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.owner.id;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "ownership");
});

test("validateComponent fails ownership when owner.id conflicts with traceability.sequence.id", () => {
  const subject = buildMutableCanonicalComponent();
  subject.owner.id = "sequence-other";

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "ownership");
});

test("validateComponent fails inheritedAuthority when inheritedAuthority is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.inheritedAuthority;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "inheritedAuthority");
});

test("validateComponent fails inheritedAuthority when sources is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.inheritedAuthority.sources;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "inheritedAuthority");
});

test("validateComponent fails inheritedAuthority when sources is empty", () => {
  const subject = buildMutableCanonicalComponent();
  subject.inheritedAuthority.sources = [];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "inheritedAuthority");
});

test("validateComponent fails inheritedAuthority when a source is not a string", () => {
  const subject = buildMutableCanonicalComponent();
  subject.inheritedAuthority.sources = ["PSME-CON-001", 42];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "inheritedAuthority");
});

test("validateComponent fails inheritedAuthority when component identity is listed as its own authority source", () => {
  const subject = buildMutableCanonicalComponent();
  subject.inheritedAuthority.sources = ["PSME-CON-001", subject.identity.id];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "inheritedAuthority");
});

test("validateComponent fails governedState when state is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.state;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "governedState");
});

test("validateComponent fails governedState when state is an array", () => {
  const subject = buildMutableCanonicalComponent();
  subject.state = [];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "governedState");
});

test("validateComponent fails governedState when state is a primitive", () => {
  const subject = buildMutableCanonicalComponent();
  subject.state = "ready";

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "governedState");
});

test("validateComponent does not interpret arbitrary deterministic state property names as architectural responsibilities", () => {
  const subject = buildMutableCanonicalComponent();
  subject.state = {
    animation: "intro",
  };

  const outcome = validateComponent(subject);
  assert.equal(outcome.valid, true);
  assert.equal(getCategory(outcome, "governedState").valid, true);
  assert.equal(getCategory(outcome, "separation").valid, true);
});

test("validateComponent fails behaviourAssociations when behaviours is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.behaviours;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "behaviourAssociations");
});

test("validateComponent fails behaviourAssociations when behaviours is not an array", () => {
  const subject = buildMutableCanonicalComponent();
  subject.behaviours = "not-array";

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "behaviourAssociations");
});

test("validateComponent fails behaviourAssociations when behaviour reference is not a plain object", () => {
  const subject = buildMutableCanonicalComponent();
  subject.behaviours = ["behaviour-primary"];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "behaviourAssociations");
});

test("validateComponent fails behaviourAssociations when behaviour reference is missing id", () => {
  const subject = buildMutableCanonicalComponent();
  subject.behaviours = [{ scope: "production-primary" }];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "behaviourAssociations");
});

test("validateComponent fails behaviourAssociations when behaviour reference is missing scope", () => {
  const subject = buildMutableCanonicalComponent();
  subject.behaviours = [{ id: "behaviour-primary" }];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "behaviourAssociations");
});

test("validateComponent fails behaviourAssociations when behaviour reference includes extra members", () => {
  const subject = buildMutableCanonicalComponent();
  subject.behaviours = [
    { id: "behaviour-primary", scope: "production-primary", extra: true },
  ];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "behaviourAssociations");
});

test("validateComponent fails behaviourAssociations when behaviour reference id is empty", () => {
  const subject = buildMutableCanonicalComponent();
  subject.behaviours = [{ id: "", scope: "production-primary" }];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "behaviourAssociations");
});

test("validateComponent fails behaviourAssociations when behaviour reference scope is empty", () => {
  const subject = buildMutableCanonicalComponent();
  subject.behaviours = [{ id: "behaviour-primary", scope: "" }];

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "behaviourAssociations");
});

test("validateComponent fails constitutionalTraceability when traceability is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.traceability;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "constitutionalTraceability");
});

test("validateComponent fails constitutionalTraceability when production reference is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.traceability.production;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "constitutionalTraceability");
});

test("validateComponent fails constitutionalTraceability when story reference is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.traceability.story;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "constitutionalTraceability");
});

test("validateComponent fails constitutionalTraceability when scene reference is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.traceability.scene;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "constitutionalTraceability");
});

test("validateComponent fails constitutionalTraceability when sequence reference is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.traceability.sequence;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "constitutionalTraceability");
});

test("validateComponent fails constitutionalTraceability for incorrect reference types at each hierarchy level", () => {
  const cases = [
    { key: "production", wrong: "story" },
    { key: "story", wrong: "scene" },
    { key: "scene", wrong: "sequence" },
    { key: "sequence", wrong: "scene" },
  ];

  for (const item of cases) {
    const subject = buildMutableCanonicalComponent();
    subject.traceability[item.key].type = item.wrong;

    const outcome = validateComponent(subject);
    assertInvalidForCategory(outcome, "constitutionalTraceability");
  }
});

test("validateComponent fails constitutionalTraceability when reference id is missing", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.traceability.production.id;

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "constitutionalTraceability");
});

test("validateComponent fails constitutionalTraceability when owner.id conflicts with traceability.sequence.id", () => {
  const subject = buildMutableCanonicalComponent();
  subject.owner.id = "sequence-other";

  const outcome = validateComponent(subject);
  assertInvalidForCategory(outcome, "constitutionalTraceability");
});

test("validateComponent domain constraints reject representative embedded non-component result data", () => {
  const cases = [
    { key: "componentValidationOutcome", value: { status: "valid" } },
    { key: "behaviourEvaluation", value: { status: "ready" } },
    { key: "behaviourOutcome", value: { status: "applied" } },
    { key: "outcomeApplicationResult", value: { status: "ok" } },
    { key: "stateProgressionResult", value: { status: "next" } },
  ];

  for (const item of cases) {
    const subject = buildMutableCanonicalComponent();
    subject[item.key] = item.value;

    const outcome = validateComponent(subject);
    assertInvalidForCategory(outcome, "domainConstraints");
  }
});

test("validateComponent separation rejects representative top-level prohibited concern fields", () => {
  const prohibitedFields = [
    "validation",
    "evaluation",
    "outcome",
    "rendering",
    "runtimeState",
    "executionState",
    "renderState",
    "scheduling",
    "interpolation",
    "animation",
    "platform",
    "hardware",
    "graphics",
  ];

  for (const prohibitedField of prohibitedFields) {
    const subject = buildMutableCanonicalComponent();
    subject[prohibitedField] = { represented: true };

    const outcome = validateComponent(subject);
    assertInvalidForCategory(outcome, "separation");
  }
});

test("validateComponent processingReadiness passes for canonical valid component", () => {
  const outcome = validateComponent(buildCanonicalComponent());

  assert.equal(getCategory(outcome, "processingReadiness").valid, true);
});

test("validateComponent processingReadiness fails when a mandatory category is invalid and identifies blocking category", () => {
  const subject = buildMutableCanonicalComponent();
  delete subject.owner;

  const outcome = validateComponent(subject);

  assertInvalidForCategory(outcome, "processingReadiness");

  const readinessReasons = getCategory(outcome, "processingReadiness").failures.map(
    (failure) => failure.reason,
  );

  assert.equal(
    readinessReasons.some((reason) => reason.includes('"ownership" did not pass')),
    true,
  );
});

test("validateComponent failures include category requirement affectedComponent and reason", () => {
  const subject = {
    type: "wrong",
  };

  const outcome = validateComponent(subject);

  assert.equal(outcome.valid, false);
  assert.equal(outcome.failures.length > 0, true);

  for (const failure of outcome.failures) {
    assertFailureShape(failure);
  }
});

test("validateComponent is deterministic for repeated validation of same component", () => {
  const component = buildCanonicalComponent();

  const outcomeA = validateComponent(component);
  const outcomeB = validateComponent(component);
  const outcomeC = validateComponent(component);

  assert.deepStrictEqual(outcomeA, outcomeB);
  assert.deepStrictEqual(outcomeB, outcomeC);
});

test("validateComponent is deterministic for separately constructed equivalent canonical components", () => {
  const componentA = buildCanonicalComponent();
  const componentB = buildCanonicalComponent();

  const outcomeA = validateComponent(componentA);
  const outcomeB = validateComponent(componentB);

  assert.deepStrictEqual(outcomeA, outcomeB);
});

test("validateComponent is deterministic for equivalent invalid inputs", () => {
  const invalidA = {
    type: "wrong",
  };

  const invalidB = {
    type: "wrong",
  };

  const outcomeA = validateComponent(invalidA);
  const outcomeB = validateComponent(invalidB);

  assert.deepStrictEqual(outcomeA, outcomeB);
});

test("validateComponent has no observable time random or environment variation in outcomes", () => {
  const component = buildCanonicalComponent();
  const outcomes = [];

  for (let index = 0; index < 5; index += 1) {
    outcomes.push(validateComponent(component));
  }

  for (let index = 1; index < outcomes.length; index += 1) {
    assert.deepStrictEqual(outcomes[0], outcomes[index]);
  }
});
