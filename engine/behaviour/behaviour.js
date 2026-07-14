/**
 * PixelSync Motion Engine
 * File: engine/behaviour/behaviour.js
 *
 * Responsibility:
 * Represents the governed Production Behaviour entity.
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
 * - No Behaviour evaluation.
 * - No Behaviour validation.
 * - No Behaviour Outcome production.
 * - No runtime-state or production-state mutation.
 * - No rendering or rendered-output production.
 * - No scheduling or governed-time advancement.
 * - No interpolation or animation.
 * - No browser, operating-system, network, or device APIs.
 * - No external dependencies.
 */

export function createBehaviour({
  identity,
  owner,
  authority,
  intent,
  relationships,
  traceability,
}) {
  const behaviour = {
    type: "behaviour",
    identity,
    owner,
    authority,
    intent,
    relationships,
    traceability,
  };

  return deepFreeze(behaviour);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  const frozenValue = Object.freeze(value);
  const keys = Object.keys(frozenValue);

  for (let i = 0; i < keys.length; i += 1) {
    deepFreeze(frozenValue[keys[i]]);
  }

  return frozenValue;
}
