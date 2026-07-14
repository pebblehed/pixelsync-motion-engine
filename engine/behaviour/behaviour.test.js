/**
 * PixelSync Motion Engine
 * File: engine/behaviour/behaviour.test.js
 *
 * Responsibility:
 * Provides deterministic constitutional test evidence for Behaviour representation and validation.
 */

import test from "node:test";
import assert from "node:assert/strict";

import { createBehaviour } from "./behaviour.js";
import { validateBehaviour } from "./behaviour-validator.js";

function createCanonicalBehaviourInput() {
  return {
    identity: {
      id: "behaviour-primary",
      scope: "component-primary",
    },
    owner: {
      type: "component",
      id: "component-primary",
    },
    authority: {
      inherited: true,
      ownerId: "component-primary",
      sources: ["PSME-CON-001", "production-primary"],
    },
    intent: {
      objective:
        "Express approved communication intent through governed change.",
      responsibility: "Represent one governed production responsibility.",
    },
    relationships: {
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
      component: {
        type: "component",
        id: "component-primary",
      },
    },
    traceability: {
      constitutionalSources: [
        "PSME-CON-001",
        "PSME-ARC-006",
        "PSME-STD-005",
        "PSME-ARC-007",
        "PSME-STD-006",
      ],
      intentSource: "approved-intent-primary",
      behaviourId: "behaviour-primary",
      ownerId: "component-primary",
    },
  };
}

function createCanonicalBehaviour() {
  return createBehaviour(createCanonicalBehaviourInput());
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getCategory(validationOutcome, categoryKey) {
  return validationOutcome.categories[categoryKey];
}

function getFailuresForCategory(validationOutcome, categoryKey) {
  return validationOutcome.failures.filter(
    (failure) => failure.category === categoryKey,
  );
}

function assertFrozen(value, message) {
  assert.equal(Object.isFrozen(value), true, message);
}

function assertValidationFailureShape(failure) {
  assert.equal(typeof failure.category, "string");
  assert.equal(typeof failure.requirement, "string");
  assert.equal(typeof failure.affectedBehaviour, "object");
  assert.equal(typeof failure.reason, "string");
}

function assertAllMandatoryCategoriesValid(validationOutcome) {
  const categoryKeys = Object.keys(validationOutcome.categories);

  for (let index = 0; index < categoryKeys.length; index += 1) {
    const categoryKey = categoryKeys[index];
    assert.equal(
      getCategory(validationOutcome, categoryKey).valid,
      true,
      "Expected category to be valid: " + categoryKey,
    );
  }
}

test("createBehaviour returns canonical governed shape with explicit members", () => {
  const behaviour = createCanonicalBehaviour();

  assert.equal(behaviour.type, "behaviour");
  assert.equal(typeof behaviour.identity, "object");
  assert.equal(typeof behaviour.owner, "object");
  assert.equal(typeof behaviour.authority, "object");
  assert.equal(typeof behaviour.intent, "object");
  assert.equal(typeof behaviour.relationships, "object");
  assert.equal(typeof behaviour.traceability, "object");
});

test("createBehaviour preserves supplied governed values without repair, inference, or defaults", () => {
  const input = createCanonicalBehaviourInput();
  input.owner.type = "governed-owner-type-not-validated-here";
  input.intent.responsibility = "Provided exactly as supplied.";
  input.relationships.component.id = "component-from-input";
  input.authority.ownerId = "authority-owner-from-input";

  const behaviour = createBehaviour(input);

  assert.equal(behaviour.type, "behaviour");
  assert.equal(behaviour.owner.type, "governed-owner-type-not-validated-here");
  assert.equal(
    behaviour.intent.responsibility,
    "Provided exactly as supplied.",
  );
  assert.equal(behaviour.relationships.component.id, "component-from-input");
  assert.equal(behaviour.authority.ownerId, "authority-owner-from-input");
  assert.equal(
    Object.prototype.hasOwnProperty.call(behaviour, "evaluation"),
    false,
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(behaviour, "outcome"),
    false,
  );
});

test("createBehaviour returns recursively immutable behaviour representation", () => {
  const behaviour = createCanonicalBehaviour();

  assertFrozen(behaviour, "Behaviour must be frozen.");
  assertFrozen(behaviour.identity, "identity must be frozen.");
  assertFrozen(behaviour.owner, "owner must be frozen.");
  assertFrozen(behaviour.authority, "authority must be frozen.");
  assertFrozen(
    behaviour.authority.sources,
    "authority.sources must be frozen.",
  );
  assertFrozen(behaviour.intent, "intent must be frozen.");
  assertFrozen(behaviour.relationships, "relationships must be frozen.");
  assertFrozen(
    behaviour.relationships.production,
    "relationships.production must be frozen.",
  );
  assertFrozen(
    behaviour.relationships.story,
    "relationships.story must be frozen.",
  );
  assertFrozen(
    behaviour.relationships.scene,
    "relationships.scene must be frozen.",
  );
  assertFrozen(
    behaviour.relationships.sequence,
    "relationships.sequence must be frozen.",
  );
  assertFrozen(
    behaviour.relationships.component,
    "relationships.component must be frozen.",
  );
  assertFrozen(behaviour.traceability, "traceability must be frozen.");
  assertFrozen(
    behaviour.traceability.constitutionalSources,
    "traceability.constitutionalSources must be frozen.",
  );
});

test("validateBehaviour marks complete canonical behaviour as valid and evaluation-ready", () => {
  const behaviour = createCanonicalBehaviour();
  const validationOutcome = validateBehaviour(behaviour);

  assert.equal(validationOutcome.valid, true);
  assert.equal(validationOutcome.status, "valid");
  assert.equal(validationOutcome.failures.length, 0);
  assertAllMandatoryCategoriesValid(validationOutcome);
  assert.equal(
    getCategory(validationOutcome, "evaluationReadiness").valid,
    true,
  );
});

test("validateBehaviour does not mutate behaviour and returns deeply immutable outcome", () => {
  const behaviour = createCanonicalBehaviour();
  const behaviourSnapshot = clone(behaviour);
  const validationOutcome = validateBehaviour(behaviour);

  assert.deepEqual(behaviour, behaviourSnapshot);

  assertFrozen(validationOutcome, "Outcome must be frozen.");
  assertFrozen(
    validationOutcome.categories,
    "Outcome.categories must be frozen.",
  );
  assertFrozen(validationOutcome.failures, "Outcome.failures must be frozen.");

  const categoryKeys = Object.keys(validationOutcome.categories);
  for (let index = 0; index < categoryKeys.length; index += 1) {
    const category = validationOutcome.categories[categoryKeys[index]];
    assertFrozen(category, "Each category outcome must be frozen.");
    assertFrozen(
      category.failures,
      "Each category failure list must be frozen.",
    );
  }
});

test("validateBehaviour identity invalid cases fail deterministically", () => {
  const missingIdentity = clone(createCanonicalBehaviour());
  delete missingIdentity.identity;

  const missingIdentityId = clone(createCanonicalBehaviour());
  delete missingIdentityId.identity.id;

  const missingIdentityScope = clone(createCanonicalBehaviour());
  delete missingIdentityScope.identity.scope;

  const incorrectType = clone(createCanonicalBehaviour());
  incorrectType.type = "not-behaviour";

  const cases = [
    { name: "missing identity", value: missingIdentity },
    { name: "missing identity.id", value: missingIdentityId },
    { name: "missing identity.scope", value: missingIdentityScope },
    { name: "incorrect behaviour type", value: incorrectType },
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const outcome = validateBehaviour(cases[index].value);
    assert.equal(outcome.valid, false, cases[index].name + " must fail.");
    assert.equal(getCategory(outcome, "identity").valid, false);
  }
});

test("validateBehaviour ownership invalid cases fail deterministically", () => {
  const missingOwner = clone(createCanonicalBehaviour());
  delete missingOwner.owner;

  const pluralOwners = clone(createCanonicalBehaviour());
  pluralOwners.owners = [{ id: "component-secondary" }];

  const nonComponentOwnerType = clone(createCanonicalBehaviour());
  nonComponentOwnerType.owner.type = "sequence";

  const missingOwnerId = clone(createCanonicalBehaviour());
  delete missingOwnerId.owner.id;

  const ownerConflict = clone(createCanonicalBehaviour());
  ownerConflict.owner.id = "component-conflict";

  const cases = [
    missingOwner,
    pluralOwners,
    nonComponentOwnerType,
    missingOwnerId,
    ownerConflict,
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const outcome = validateBehaviour(cases[index]);
    assert.equal(outcome.valid, false);
    assert.equal(getCategory(outcome, "ownership").valid, false);
  }
});

test("validateBehaviour authority invalid cases fail deterministically", () => {
  const missingAuthority = clone(createCanonicalBehaviour());
  delete missingAuthority.authority;

  const inheritedNotTrue = clone(createCanonicalBehaviour());
  inheritedNotTrue.authority.inherited = false;

  const missingAuthorityOwnerId = clone(createCanonicalBehaviour());
  delete missingAuthorityOwnerId.authority.ownerId;

  const missingAuthoritySources = clone(createCanonicalBehaviour());
  delete missingAuthoritySources.authority.sources;

  const emptyAuthoritySources = clone(createCanonicalBehaviour());
  emptyAuthoritySources.authority.sources = [];

  const authorityOwnerConflict = clone(createCanonicalBehaviour());
  authorityOwnerConflict.authority.ownerId = "component-conflict";

  const selfAuthoritySource = clone(createCanonicalBehaviour());
  selfAuthoritySource.authority.sources.push(selfAuthoritySource.identity.id);

  const cases = [
    missingAuthority,
    inheritedNotTrue,
    missingAuthorityOwnerId,
    missingAuthoritySources,
    emptyAuthoritySources,
    authorityOwnerConflict,
    selfAuthoritySource,
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const outcome = validateBehaviour(cases[index]);
    assert.equal(outcome.valid, false);
    assert.equal(getCategory(outcome, "inheritedAuthority").valid, false);
  }
});

test("validateBehaviour intent invalid cases fail deterministically", () => {
  const missingIntent = clone(createCanonicalBehaviour());
  delete missingIntent.intent;

  const missingObjective = clone(createCanonicalBehaviour());
  delete missingObjective.intent.objective;

  const missingResponsibility = clone(createCanonicalBehaviour());
  delete missingResponsibility.intent.responsibility;

  const cases = [missingIntent, missingObjective, missingResponsibility];

  for (let index = 0; index < cases.length; index += 1) {
    const outcome = validateBehaviour(cases[index]);
    assert.equal(outcome.valid, false);
    assert.equal(getCategory(outcome, "governedIntent").valid, false);
  }
});

test("validateBehaviour relationships invalid cases fail deterministically", () => {
  const missingRelationships = clone(createCanonicalBehaviour());
  delete missingRelationships.relationships;

  const missingProductionRelationship = clone(createCanonicalBehaviour());
  delete missingProductionRelationship.relationships.production;

  const missingStoryRelationship = clone(createCanonicalBehaviour());
  delete missingStoryRelationship.relationships.story;

  const missingSceneRelationship = clone(createCanonicalBehaviour());
  delete missingSceneRelationship.relationships.scene;

  const missingSequenceRelationship = clone(createCanonicalBehaviour());
  delete missingSequenceRelationship.relationships.sequence;

  const missingComponentRelationship = clone(createCanonicalBehaviour());
  delete missingComponentRelationship.relationships.component;

  const incorrectRelationshipType = clone(createCanonicalBehaviour());
  incorrectRelationshipType.relationships.story.type = "scene";

  const missingRelationshipId = clone(createCanonicalBehaviour());
  delete missingRelationshipId.relationships.scene.id;

  const componentOwnerConflict = clone(createCanonicalBehaviour());
  componentOwnerConflict.relationships.component.id = "component-conflict";

  const componentScopeConflict = clone(createCanonicalBehaviour());
  componentScopeConflict.identity.scope = "component-scope-conflict";

  const cases = [
    missingRelationships,
    missingProductionRelationship,
    missingStoryRelationship,
    missingSceneRelationship,
    missingSequenceRelationship,
    missingComponentRelationship,
    incorrectRelationshipType,
    missingRelationshipId,
    componentOwnerConflict,
    componentScopeConflict,
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const outcome = validateBehaviour(cases[index]);
    assert.equal(outcome.valid, false);
    assert.equal(getCategory(outcome, "governedRelationships").valid, false);
  }
});

test("validateBehaviour traceability invalid cases fail deterministically", () => {
  const missingTraceability = clone(createCanonicalBehaviour());
  delete missingTraceability.traceability;

  const missingConstitutionalSources = clone(createCanonicalBehaviour());
  delete missingConstitutionalSources.traceability.constitutionalSources;

  const missingIntentSource = clone(createCanonicalBehaviour());
  delete missingIntentSource.traceability.intentSource;

  const missingBehaviourId = clone(createCanonicalBehaviour());
  delete missingBehaviourId.traceability.behaviourId;

  const missingOwnerId = clone(createCanonicalBehaviour());
  delete missingOwnerId.traceability.ownerId;

  const behaviourIdConflict = clone(createCanonicalBehaviour());
  behaviourIdConflict.traceability.behaviourId = "behaviour-conflict";

  const ownerIdConflict = clone(createCanonicalBehaviour());
  ownerIdConflict.traceability.ownerId = "component-conflict";

  const cases = [
    missingTraceability,
    missingConstitutionalSources,
    missingIntentSource,
    missingBehaviourId,
    missingOwnerId,
    behaviourIdConflict,
    ownerIdConflict,
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const outcome = validateBehaviour(cases[index]);
    assert.equal(outcome.valid, false);
    assert.equal(
      getCategory(outcome, "constitutionalTraceability").valid,
      false,
    );
  }
});

test("validateBehaviour domain separation rejects embedded evaluation and outcome data", () => {
  const embeddedEvaluation = clone(createCanonicalBehaviour());
  embeddedEvaluation.evaluation = { type: "behaviour-evaluation" };

  const embeddedBehaviourEvaluation = clone(createCanonicalBehaviour());
  embeddedBehaviourEvaluation.behaviourEvaluation = { phase: "runtime" };

  const embeddedOutcome = clone(createCanonicalBehaviour());
  embeddedOutcome.outcome = { status: "generated" };

  const embeddedBehaviourOutcome = clone(createCanonicalBehaviour());
  embeddedBehaviourOutcome.behaviourOutcome = { status: "generated" };

  const cases = [
    embeddedEvaluation,
    embeddedBehaviourEvaluation,
    embeddedOutcome,
    embeddedBehaviourOutcome,
  ];

  for (let index = 0; index < cases.length; index += 1) {
    const outcome = validateBehaviour(cases[index]);
    assert.equal(outcome.valid, false);
    assert.equal(getCategory(outcome, "domainConstraints").valid, false);
  }
});

test("validateBehaviour separation rejects representative prohibited top-level concern fields", () => {
  const prohibitedFields = [
    "rendering",
    "runtimeStateMutation",
    "scheduling",
    "interpolation",
    "animation",
    "keyframes",
    "browser",
    "graphics",
  ];

  for (let index = 0; index < prohibitedFields.length; index += 1) {
    const field = prohibitedFields[index];
    const invalidBehaviour = clone(createCanonicalBehaviour());
    invalidBehaviour[field] = { represented: true };

    const outcome = validateBehaviour(invalidBehaviour);

    assert.equal(
      outcome.valid,
      false,
      "Expected field to fail separation: " + field,
    );
    assert.equal(getCategory(outcome, "separation").valid, false);
    assert.equal(
      getFailuresForCategory(outcome, "separation").length > 0,
      true,
    );
  }
});

test("validateBehaviour fail-closed handling returns invalid outcomes for undefined, null, and array input", () => {
  const invalidInputs = [undefined, null, []];

  for (let index = 0; index < invalidInputs.length; index += 1) {
    const outcome = validateBehaviour(invalidInputs[index]);
    assert.equal(outcome.valid, false);
    assert.equal(outcome.status, "invalid");
    assert.equal(outcome.failures.length > 0, true);
  }
});

test("validateBehaviour fail-closed handling rejects incomplete nested objects", () => {
  const incompleteBehaviour = {
    type: "behaviour",
    identity: {},
    owner: {},
    authority: {},
    intent: {},
    relationships: {},
    traceability: {},
  };

  const outcome = validateBehaviour(incompleteBehaviour);

  assert.equal(outcome.valid, false);
  assert.equal(outcome.status, "invalid");
  assert.equal(getCategory(outcome, "evaluationReadiness").valid, false);
});

test("invalid behaviour never produces valid true and failure evidence is diagnosable", () => {
  const invalidBehaviour = clone(createCanonicalBehaviour());
  delete invalidBehaviour.identity;

  const outcome = validateBehaviour(invalidBehaviour);

  assert.equal(outcome.valid, false);
  assert.equal(outcome.status, "invalid");
  assert.equal(outcome.failures.length > 0, true);

  for (let index = 0; index < outcome.failures.length; index += 1) {
    assertValidationFailureShape(outcome.failures[index]);
  }
});

test("validateBehaviour is deterministic across repeated validation of the same behaviour", () => {
  const behaviour = createCanonicalBehaviour();

  const firstOutcome = validateBehaviour(behaviour);
  const secondOutcome = validateBehaviour(behaviour);
  const thirdOutcome = validateBehaviour(behaviour);

  assert.deepEqual(firstOutcome, secondOutcome);
  assert.deepEqual(secondOutcome, thirdOutcome);
});

test("validateBehaviour is deterministic for equivalent separately constructed behaviours", () => {
  const firstBehaviour = createBehaviour(createCanonicalBehaviourInput());
  const secondBehaviour = createBehaviour(createCanonicalBehaviourInput());

  const firstOutcome = validateBehaviour(firstBehaviour);
  const secondOutcome = validateBehaviour(secondBehaviour);

  assert.deepEqual(firstOutcome, secondOutcome);
});

test("validateBehaviour does not mutate mutable behaviour between runs", () => {
  const mutableBehaviour = clone(createCanonicalBehaviour());
  const beforeFirstRun = clone(mutableBehaviour);

  const firstOutcome = validateBehaviour(mutableBehaviour);
  const afterFirstRun = clone(mutableBehaviour);
  const secondOutcome = validateBehaviour(mutableBehaviour);

  assert.deepEqual(beforeFirstRun, afterFirstRun);
  assert.deepEqual(firstOutcome, secondOutcome);
  assert.equal(firstOutcome.valid, true);
});

test("validateBehaviour determinism demonstrates independence from time, randomness, renderer, and environment state", () => {
  const behaviour = createCanonicalBehaviour();
  const outcomes = [];

  for (let run = 0; run < 5; run += 1) {
    outcomes.push(validateBehaviour(behaviour));
  }

  for (let run = 1; run < outcomes.length; run += 1) {
    assert.deepEqual(outcomes[0], outcomes[run]);
  }
});
