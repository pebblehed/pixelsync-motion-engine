/**
 * PixelSync Motion Engine
 * File: engine/scene.js
 *
 * Responsibility:
 * Defines governed Story and Scene data structures for the runtime.
 *
 * Inherits from:
 * - PSME-ARC-002 Motion Engine Domain Model
 * - PSME-STD-002 Story Engineering Standard
 * - PSME-STD-003 Scene Engineering Standard
 *
 * This file does not define animation, motion, camera, audio, rendering,
 * timeline behaviour, or visual implementation.
 */

export function createStory({
  id,
  title,
  communicationObjective,
  audience,
  desiredOutcome,
  emotionalProgression = [],
  narrativeProgression = [],
  scenes = [],
}) {
  const story = {
    type: "story",
    id,
    title,
    communicationObjective,
    audience,
    desiredOutcome,
    emotionalProgression,
    narrativeProgression,
    scenes,
  };

  validateStory(story);
  return Object.freeze(story);
}

export function createScene({
  id,
  title,
  communicationObjective,
  primaryIdea,
  purpose,
  previousSceneId = null,
  nextSceneId = null,
  sequences = [],
}) {
  const scene = {
    type: "scene",
    id,
    title,
    communicationObjective,
    primaryIdea,
    purpose,
    previousSceneId,
    nextSceneId,
    sequences,
  };

  validateScene(scene);
  return Object.freeze(scene);
}

export function validateStory(story) {
  requireObject(story, "Story");

  requireString(story.id, "Story.id");
  requireString(story.title, "Story.title");
  requireString(story.communicationObjective, "Story.communicationObjective");
  requireString(story.audience, "Story.audience");
  requireString(story.desiredOutcome, "Story.desiredOutcome");

  requireArray(story.emotionalProgression, "Story.emotionalProgression");
  requireArray(story.narrativeProgression, "Story.narrativeProgression");
  requireArray(story.scenes, "Story.scenes");

  if (story.scenes.length === 0) {
    throw new Error("Story must contain at least one Scene.");
  }

  story.scenes.forEach((scene, index) => {
    try {
      validateScene(scene);
    } catch (error) {
      throw new Error(`Story.scenes[${index}] is invalid: ${error.message}`);
    }
  });

  return true;
}

export function validateScene(scene) {
  requireObject(scene, "Scene");

  requireString(scene.id, "Scene.id");
  requireString(scene.title, "Scene.title");
  requireString(scene.communicationObjective, "Scene.communicationObjective");
  requireString(scene.primaryIdea, "Scene.primaryIdea");
  requireString(scene.purpose, "Scene.purpose");
  requireArray(scene.sequences, "Scene.sequences");

  if (scene.sequences.length === 0) {
    throw new Error("Scene must contain at least one Sequence placeholder.");
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

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
}
