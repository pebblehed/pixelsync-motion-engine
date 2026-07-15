/**
 * PixelSync Motion Engine
 * File: engine/behaviour/behaviour-evaluator.js
 *
 * Responsibility:
 * Consumes a constitutionally valid Production Behaviour and matching
 * validation evidence, then deterministically produces one governed
 * Behaviour Outcome.
 *
 * Governance Inheritance:
 * - PSME-ARC-006 Production Behaviour Architecture
 * - PSME-STD-005 Production Behaviour Engineering Standard
 * - PSME-ARC-007 Production Behaviour Domain Model
 * - PSME-STD-006 Production Behaviour Validation Standard
 * - PSME-IMP-001 Production Behaviour Implementation Model
 * - Production Behaviour Implementation Plan
 *
 * Explicit Non-Responsibilities:
 * - No Behaviour creation.
 * - No Behaviour validation or validation-policy redefinition.
 * - No Behaviour repair or silent correction.
 * - No Behaviour Outcome application.
 * - No runtime-state, production-state, execution-state, or render-state mutation.
 * - No rendering or rendered-output production.
 * - No scheduling or governed-time advancement.
 * - No interpolation, animation, or keyframes.
 * - No browser, operating-system, network, or device APIs.
 * - No external dependencies.
 */

import { createBehaviourOutcome } from "./behaviour-outcome.js";

export function evaluateBehaviour({ behaviour, validationOutcome }) {
  assertBehaviourInput(behaviour);
  assertValidationOutcomeInput(validationOutcome);

  const behaviourIdentity = extractBehaviourIdentity(behaviour);
  const validationIdentity = extractValidationIdentity(validationOutcome);

  assertIdentityMatches(behaviourIdentity, validationIdentity);

  const intent = {
    objective: behaviour.intent.objective,
    responsibility: behaviour.intent.responsibility,
  };

  const evaluation = {
    behaviourId: behaviourIdentity.id,
    behaviourScope: behaviourIdentity.scope,
  };

  const result = {
    objective: behaviour.intent.objective,
    responsibility: behaviour.intent.responsibility,
  };

  return createBehaviourOutcome({
    behaviour,
    behaviourIdentity,
    intent,
    evaluation,
    result,
  });
}

function assertBehaviourInput(behaviour) {
  if (!isPlainObject(behaviour)) {
    throw new Error("Behaviour input is required and must be a plain object.");
  }
}

function assertValidationOutcomeInput(validationOutcome) {
  if (!isPlainObject(validationOutcome)) {
    throw new Error(
      "Validation evidence is required and must be a plain object.",
    );
  }

  if (validationOutcome.type !== "behaviour-validation-outcome") {
    throw new Error(
      'Validation evidence type must be "behaviour-validation-outcome".',
    );
  }

  if (
    validationOutcome.valid !== true ||
    validationOutcome.status !== "valid"
  ) {
    throw new Error("Validation evidence must be constitutionally valid.");
  }
}

function extractBehaviourIdentity(behaviour) {
  if (!isPlainObject(behaviour.identity)) {
    throw new Error("Behaviour identity evidence is required.");
  }

  if (!isNonEmptyString(behaviour.identity.id)) {
    throw new Error("Behaviour identity id evidence is required.");
  }

  if (!isNonEmptyString(behaviour.identity.scope)) {
    throw new Error("Behaviour identity scope evidence is required.");
  }

  return {
    id: behaviour.identity.id,
    scope: behaviour.identity.scope,
  };
}

function extractValidationIdentity(validationOutcome) {
  if (!isPlainObject(validationOutcome.behaviour)) {
    throw new Error("Validation Behaviour evidence is required.");
  }

  if (!isPlainObject(validationOutcome.behaviour.identity)) {
    throw new Error("Validation identity evidence is required.");
  }

  const validationIdentity = validationOutcome.behaviour.identity;

  if (!isNonEmptyString(validationIdentity.id)) {
    throw new Error("Validation identity id evidence is required.");
  }

  if (!isNonEmptyString(validationIdentity.scope)) {
    throw new Error("Validation identity scope evidence is required.");
  }

  return {
    id: validationIdentity.id,
    scope: validationIdentity.scope,
  };
}

function assertIdentityMatches(behaviourIdentity, validationIdentity) {
  if (behaviourIdentity.id !== validationIdentity.id) {
    throw new Error(
      "Validation evidence behaviour id does not match Behaviour.",
    );
  }

  if (behaviourIdentity.scope !== validationIdentity.scope) {
    throw new Error(
      "Validation evidence behaviour scope does not match Behaviour.",
    );
  }
}

function isPlainObject(value) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray(value) === false
  );
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
