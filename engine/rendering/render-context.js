/**
 * PixelSync Motion Engine
 * File: engine/rendering/render-context.js
 *
 * Responsibility:
 * Defines the governed Render Context entity as the complete read-only
 * rendering environment for a single frame.
 *
 * Governance Inheritance:
 * - PSME-ARC-004 Rendering Architecture
 * - PSME-STD-004 Rendering Engineering Standard
 * - PSME-ARC-005 Rendering Domain Model
 * - Rendering Validation Standard
 * - Existing Motion Engine Execution Foundation
 *
 * Explicit Non-Responsibilities:
 * - No rendering, drawing, or render coordination.
 * - No Render State, Render Graph, Render Frame, Render Pass,
 *   Composition, or Render Target definitions.
 * - No mutation of runtime, execution state, clock state, or schedule state.
 * - No browser APIs, Canvas, WebGL, WebGPU, SVG, DOM, or filesystem output.
 * - No external dependencies.
 */

import { validateRuntime } from "../runtime.js";
import { validateExecutionState } from "../state.js";
import { validateClock } from "../clock.js";
import { validateSchedule } from "../scheduler.js";
import { validateStory, validateScene } from "../scene.js";

export function createRenderContext({
  runtime,
  production = null,
  story = null,
  scene = null,
  sequence = null,
  components = [],
  executionState,
  clock,
  schedule,
  renderConfiguration = null,
} = {}) {
  const renderContext = {
    type: "render-context",
    runtime,
    production,
    story,
    scene,
    sequence,
    components,
    executionState,
    clock,
    schedule,
    renderConfiguration,
  };

  validateRenderContext(renderContext);
  return deepFreeze(renderContext);
}

export function validateRenderContext(renderContext) {
  requireObject(renderContext, "RenderContext");
  requireString(renderContext.type, "RenderContext.type");

  if (renderContext.type !== "render-context") {
    throw new Error('RenderContext.type must be "render-context".');
  }

  try {
    validateRuntime(renderContext.runtime);
  } catch (error) {
    throw new Error(`RenderContext.runtime is invalid: ${error.message}`);
  }

  try {
    validateExecutionState(renderContext.executionState);
  } catch (error) {
    throw new Error(
      `RenderContext.executionState is invalid: ${error.message}`,
    );
  }

  try {
    validateClock(renderContext.clock);
  } catch (error) {
    throw new Error(`RenderContext.clock is invalid: ${error.message}`);
  }

  try {
    validateSchedule(renderContext.schedule);
  } catch (error) {
    throw new Error(`RenderContext.schedule is invalid: ${error.message}`);
  }

  if (renderContext.production !== null) {
    requireObject(renderContext.production, "RenderContext.production");
  }

  if (renderContext.story !== null) {
    try {
      validateStory(renderContext.story);
    } catch (error) {
      throw new Error(`RenderContext.story is invalid: ${error.message}`);
    }
  }

  if (renderContext.scene !== null) {
    try {
      validateScene(renderContext.scene);
    } catch (error) {
      throw new Error(`RenderContext.scene is invalid: ${error.message}`);
    }
  }

  if (renderContext.sequence !== null) {
    requireObject(renderContext.sequence, "RenderContext.sequence");
  }

  requireArray(renderContext.components, "RenderContext.components");

  if (renderContext.renderConfiguration !== null) {
    requireObject(
      renderContext.renderConfiguration,
      "RenderContext.renderConfiguration",
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

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  const frozenValue = Object.freeze(value);
  const keys = Object.keys(frozenValue);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    deepFreeze(frozenValue[key]);
  }

  return frozenValue;
}
