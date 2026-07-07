/**
 * PixelSync Motion Engine
 * File: engine/executor.js
 *
 * Responsibility:
 * Coordinates governed Runtime, Execution State,
 * Clock, and Schedule data structures.
 *
 * Inherits from:
 * - PSME-ARC-002 Motion Engine Domain Model
 * - PSME-ARC-003 Execution State Machine
 *
 * This file does not define playback controls, state transitions,
 * interpolation, rendering, browser execution, or visual implementation.
 */

import { validateRuntime } from "./runtime.js";
import { validateExecutionState } from "./state.js";
import { validateClock } from "./clock.js";
import { validateSchedule } from "./scheduler.js";

export function createExecutor({ runtime, executionState, clock, schedule }) {
  const executor = {
    type: "executor",
    runtime,
    executionState,
    clock,
    schedule,
  };

  validateExecutor(executor);
  return Object.freeze(executor);
}

export function validateExecutor(executor) {
  requireObject(executor, "Executor");

  try {
    validateRuntime(executor.runtime);
  } catch (error) {
    throw new Error(`Executor.runtime is invalid: ${error.message}`);
  }

  try {
    validateExecutionState(executor.executionState);
  } catch (error) {
    throw new Error(`Executor.executionState is invalid: ${error.message}`);
  }

  try {
    validateClock(executor.clock);
  } catch (error) {
    throw new Error(`Executor.clock is invalid: ${error.message}`);
  }

  try {
    validateSchedule(executor.schedule);
  } catch (error) {
    throw new Error(`Executor.schedule is invalid: ${error.message}`);
  }

  return true;
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}
