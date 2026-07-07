/**
 * PixelSync Motion Engine
 * File: engine/runtime.js
 *
 * Responsibility:
 * Defines governed Runtime state data structures for execution.
 *
 * Inherits from:
 * - PSME-ARC-002 Motion Engine Domain Model
 *
 * This file does not define rendering, playback behaviour,
 * browser execution, requestAnimationFrame, or visual implementation.
 */

import { validateStory } from "./scene.js";

export function createRuntime({
  story,
  currentSceneIndex = 0,
  playbackState = "stopped",
}) {
  const runtime = {
    type: "runtime",
    story,
    currentSceneIndex,
    playbackState,
  };

  validateRuntime(runtime);
  return Object.freeze(runtime);
}

export function validateRuntime(runtime) {
  requireObject(runtime, "Runtime");

  try {
    validateStory(runtime.story);
  } catch (error) {
    throw new Error(`Runtime.story is invalid: ${error.message}`);
  }

  requireInteger(runtime.currentSceneIndex, "Runtime.currentSceneIndex");
  requireNonNegativeNumber(
    runtime.currentSceneIndex,
    "Runtime.currentSceneIndex",
  );
  requireString(runtime.playbackState, "Runtime.playbackState");

  if (runtime.playbackState !== "stopped") {
    throw new Error('Runtime.playbackState must be "stopped".');
  }

  if (runtime.currentSceneIndex >= runtime.story.scenes.length) {
    throw new Error(
      "Runtime.currentSceneIndex must reference an existing Scene.",
    );
  }

  return true;
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
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
