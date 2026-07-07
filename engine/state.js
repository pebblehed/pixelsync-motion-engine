/**
 * PixelSync Motion Engine
 * File: engine/state.js
 *
 * Responsibility:
 * Defines governed Execution State data structures for the runtime.
 *
 * Inherits from:
 * - PSME-ARC-003 Execution State Machine
 *
 * This file does not define state transitions, playback behaviour,
 * browser execution, requestAnimationFrame, or visual implementation.
 */

const APPROVED_EXECUTION_STATES = ["stopped", "playing", "paused", "completed"];

export function createExecutionState({
  state = "stopped",
  logicalEngineTime = 0,
  currentSceneIndex = 0,
} = {}) {
  const executionState = {
    type: "execution-state",
    state,
    logicalEngineTime,
    currentSceneIndex,
  };

  validateExecutionState(executionState);
  return Object.freeze(executionState);
}

export function validateExecutionState(executionState) {
  requireObject(executionState, "ExecutionState");

  requireApprovedState(executionState.state, "ExecutionState.state");
  requireNonNegativeNumber(
    executionState.logicalEngineTime,
    "ExecutionState.logicalEngineTime",
  );
  requireInteger(
    executionState.currentSceneIndex,
    "ExecutionState.currentSceneIndex",
  );
  requireNonNegativeNumber(
    executionState.currentSceneIndex,
    "ExecutionState.currentSceneIndex",
  );

  return true;
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function requireInteger(value, label) {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer.`);
  }
}

function requireNonNegativeNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative number.`);
  }
}

function requireApprovedState(value, label) {
  if (!APPROVED_EXECUTION_STATES.includes(value)) {
    throw new Error(
      `${label} must be one of: ${APPROVED_EXECUTION_STATES.join(", ")}.`,
    );
  }
}
