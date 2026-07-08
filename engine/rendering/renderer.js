/**
 * PixelSync Motion Engine
 * File: engine/rendering/renderer.js
 *
 * Responsibility:
 * Defines the governed Renderer entity that coordinates rendering for one frame
 * from validated, read-only execution foundation inputs.
 *
 * Governance Inheritance:
 * - PSME-ARC-004 Rendering Architecture
 * - PSME-STD-004 Rendering Engineering Standard
 * - PSME-ARC-005 Rendering Domain Model
 * - Rendering Validation Standard
 * - Existing Motion Engine Execution Foundation
 *
 * Explicit Non-Responsibilities:
 * - No browser API usage.
 * - No Canvas, WebGL, WebGPU, SVG, DOM, or filesystem output.
 * - No drawing, interpolation, visual effects, or technology-specific targets.
 * - No mutation of runtime, execution state, clock state, or schedule state.
 * - No dependency introduction outside approved architecture.
 */

import { validateRuntime } from "../runtime.js";
import { validateExecutionState } from "../state.js";
import { validateClock } from "../clock.js";
import { validateSchedule } from "../scheduler.js";

export function createRenderer({ id = "renderer", renderState = null } = {}) {
  const renderer = {
    type: "renderer",
    id,
    renderState: renderState ?? createDefaultRenderState(),
  };

  validateRenderer(renderer);
  return freezeObject(renderer);
}

export function validateRenderer(renderer) {
  requireObject(renderer, "Renderer");
  requireString(renderer.type, "Renderer.type");
  requireString(renderer.id, "Renderer.id");

  if (renderer.type !== "renderer") {
    throw new Error('Renderer.type must be "renderer".');
  }

  validateRenderState(renderer.renderState);

  return true;
}

export function renderFrame({ renderer, renderContext, frameNumber = 0 }) {
  try {
    validateRenderer(renderer);
  } catch (error) {
    throw new Error(`renderFrame renderer is invalid: ${error.message}`);
  }

  try {
    validateRenderContext(renderContext);
  } catch (error) {
    throw new Error(`renderFrame renderContext is invalid: ${error.message}`);
  }

  requireInteger(frameNumber, "renderFrame frameNumber");
  requireNonNegativeNumber(frameNumber, "renderFrame frameNumber");

  const renderFrameResult = {
    type: "render-frame",
    frameNumber,
    rendererId: renderer.id,
    status: "coordinated",
    deterministic: true,
    contextAccepted: true,
    diagnostics: {
      validationStatus: "valid",
      readOnlyInputs: true,
      rendererValidated: true,
      renderContextValidated: true,
    },
  };

  return deepFreeze(renderFrameResult);
}

function validateRenderContext(renderContext) {
  requireObject(renderContext, "RenderContext");

  try {
    validateRuntime(renderContext.runtime);
  } catch (error) {
    throw new Error(`RenderContext.runtime is invalid: ${error.message}`);
  }

  try {
    validateExecutionState(renderContext.executionState);
  } catch (error) {
    throw new Error(`RenderContext.executionState is invalid: ${error.message}`);
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

  return true;
}

function validateRenderState(renderState) {
  requireObject(renderState, "RenderState");

  return true;
}

function createDefaultRenderState() {
  return {
    type: "render-state",
    status: "ready",
  };
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

function freezeObject(value) {
  return Object.freeze(value);
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
