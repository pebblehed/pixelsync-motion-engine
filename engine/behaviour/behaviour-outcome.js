/**
 * PixelSync Motion Engine
 * File: engine/behaviour/behaviour-outcome.js
 *
 * Responsibility:
 * Represents the governed conceptual result produced by successful Behaviour Evaluation.
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
 * - No Behaviour validation.
 * - No Behaviour evaluation.
 * - No production-state, runtime-state, or render-state mutation.
 * - No rendering, scheduling, interpolation, or animation.
 * - No browser, operating-system, network, or device APIs.
 * - No external dependencies.
 */

export function createBehaviourOutcome({
  behaviour,
  behaviourIdentity,
  intent,
  evaluation,
  result,
}) {
  const behaviourOutcome = {
    type: "behaviour-outcome",
    behaviour,
    behaviourIdentity,
    intent,
    evaluation,
    result,
  };

  return deepFreeze(behaviourOutcome);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  const frozenValue = Object.freeze(value);
  const keys = Object.keys(frozenValue);

  for (let index = 0; index < keys.length; index += 1) {
    deepFreeze(frozenValue[keys[index]]);
  }

  return frozenValue;
}
