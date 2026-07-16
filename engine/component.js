/**
 * Pixelsync Motion Engine
 * File:
 * engine/component.js
 *
 * Responsibility:
 * Represents the canonical governed Production Component entity.
 *
 * Governance Inheritance:
 * - PSME-CON-001 PixelSync Cinematic Engineering Constitution
 * - PSME-ARC-001 Motion Engine Architecture
 * - PSME-ARC-002 Motion Engine Domain Model
 * - PSME-STD-007 Component Engineering Standard
 * - PSME-IMP-002 Component Implementation Model
 *
 * Explicit Non-Responsibilities:
 * - No Component validation.
 * - No Behaviour creation or validation.
 * - No Behaviour Evaluation.
 * - No Behaviour Outcome production or application.
 * - No Component state progression.
 * - No runtime-state, execution-state, or render-state mutation.
 * - No rendering, scheduling, interpolation, or animation.
 * - No browser, operating-system, network, or device APIs.
 * - No external dependencies.
 */

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function toRecursivelyImmutable(value) {
  if (Array.isArray(value)) {
    const clone = value.map((entry) => toRecursivelyImmutable(entry));
    return Object.freeze(clone);
  }

  if (isPlainObject(value)) {
    const clone = {};

    for (const key of Object.keys(value)) {
      clone[key] = toRecursivelyImmutable(value[key]);
    }

    return Object.freeze(clone);
  }

  return value;
}

export function createComponent({
  identity,
  owner,
  inheritedAuthority,
  state,
  behaviours,
  traceability,
}) {
  return Object.freeze({
    type: "component",
    identity: toRecursivelyImmutable(identity),
    owner: toRecursivelyImmutable(owner),
    inheritedAuthority: toRecursivelyImmutable(inheritedAuthority),
    state: toRecursivelyImmutable(state),
    behaviours: toRecursivelyImmutable(behaviours),
    traceability: toRecursivelyImmutable(traceability),
  });
}
