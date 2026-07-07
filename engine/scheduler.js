/**
 * PixelSync Motion Engine
 * File: engine/scheduler.js
 *
 * Responsibility:
 * Determines governed active runtime elements from Story,
 * runtime state, and logical engine time.
 *
 * Inherits from:
 * - PSME-ARC-002 Motion Engine Domain Model
 *
 * This file does not define interpolation, rendering, playback,
 * browser execution, or visual implementation.
 */

import { validateStory } from "./scene.js";

export function createSchedule({
  story,
  currentSceneIndex,
  logicalEngineTime,
}) {
  const currentScene = resolveCurrentScene(story, currentSceneIndex);

  const schedule = {
    type: "schedule",
    story,
    currentSceneIndex,
    logicalEngineTime,
    currentScene,
  };

  validateSchedule(schedule);
  return Object.freeze(schedule);
}

export function validateSchedule(schedule) {
  requireObject(schedule, "Schedule");

  try {
    validateStory(schedule.story);
  } catch (error) {
    throw new Error(`Schedule.story is invalid: ${error.message}`);
  }

  requireInteger(schedule.currentSceneIndex, "Schedule.currentSceneIndex");
  requireNonNegativeNumber(
    schedule.currentSceneIndex,
    "Schedule.currentSceneIndex",
  );
  requireNonNegativeNumber(
    schedule.logicalEngineTime,
    "Schedule.logicalEngineTime",
  );

  const resolvedScene = resolveCurrentScene(
    schedule.story,
    schedule.currentSceneIndex,
  );

  if (schedule.currentScene !== resolvedScene) {
    throw new Error(
      "Schedule.currentScene must match Schedule.story at Schedule.currentSceneIndex.",
    );
  }

  return true;
}

export function resolveCurrentScene(story, currentSceneIndex) {
  try {
    validateStory(story);
  } catch (error) {
    throw new Error(`resolveCurrentScene story is invalid: ${error.message}`);
  }

  requireInteger(currentSceneIndex, "currentSceneIndex");
  requireNonNegativeNumber(currentSceneIndex, "currentSceneIndex");

  const currentScene = story.scenes[currentSceneIndex];

  if (!currentScene) {
    throw new Error(
      "Current Scene must exist for the provided currentSceneIndex.",
    );
  }

  return currentScene;
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
