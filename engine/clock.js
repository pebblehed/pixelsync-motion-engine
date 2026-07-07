/**
 * PixelSync Motion Engine
 * File: engine/clock.js
 *
 * Responsibility:
 * Defines governed logical engine time data structures for the runtime.
 *
 * Inherits from:
 * - PSME-ARC-002 Motion Engine Domain Model
 *
 * This file does not define browser time, playback behaviour,
 * state transitions, or visual implementation.
 */

export function createClock({
  logicalEngineTime = 0,
  startedAt = null,
  pausedAt = null,
} = {}) {
  const clock = {
    type: "clock",
    logicalEngineTime,
    startedAt,
    pausedAt,
  };

  validateClock(clock);
  return Object.freeze(clock);
}

export function validateClock(clock) {
  requireObject(clock, "Clock");

  requireNonNegativeNumber(clock.logicalEngineTime, "Clock.logicalEngineTime");
  requireNullOrNonNegativeNumber(clock.startedAt, "Clock.startedAt");
  requireNullOrNonNegativeNumber(clock.pausedAt, "Clock.pausedAt");

  return true;
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function requireNonNegativeNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative number.`);
  }
}

function requireNullOrNonNegativeNumber(value, label) {
  if (value === null) {
    return;
  }

  requireNonNegativeNumber(value, label);
}
