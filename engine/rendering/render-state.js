/**
 * PixelSync Motion Engine
 * File: engine/rendering/render-state.js
 *
 * Responsibility:
 * Defines the governed Render State entity as the read-only representation
 * of rendering progress for the current lifecycle.
 *
 * Governance Inheritance:
 * - PSME-ARC-005 Rendering Domain Model
 * - Rendering Implementation Foundation
 *
 * Explicit Non-Responsibilities:
 * - No rendering, drawing, or render coordination.
 * - No mutation of runtime state, execution state, clock state,
 *   or schedule state.
 * - No Render Context, Render Graph, Render Frame, Render Pass,
 *   Composition, or Render Target definitions.
 * - No browser APIs, Canvas, WebGL, WebGPU, SVG, DOM, or filesystem output.
 * - No external dependencies.
 */

export function createRenderState({
  lifecycleStage = "idle",
  activeRenderPass = null,
  validationStatus = "pending",
  diagnostics = {},
  frameProgress = 0,
} = {}) {
  const renderState = {
    type: "render-state",
    lifecycleStage,
    activeRenderPass,
    validationStatus,
    diagnostics,
    frameProgress,
  };

  validateRenderState(renderState);
  return deepFreeze(renderState);
}

export function validateRenderState(renderState) {
  requireObject(renderState, "RenderState");
  requireString(renderState.type, "RenderState.type");

  if (renderState.type !== "render-state") {
    throw new Error('RenderState.type must be "render-state".');
  }

  requireString(renderState.lifecycleStage, "RenderState.lifecycleStage");

  if (renderState.activeRenderPass !== null) {
    requireString(renderState.activeRenderPass, "RenderState.activeRenderPass");
  }

  requireString(renderState.validationStatus, "RenderState.validationStatus");

  if (renderState.diagnostics !== null) {
    requireObject(renderState.diagnostics, "RenderState.diagnostics");
  }

  requireInclusiveNumberRange(
    renderState.frameProgress,
    "RenderState.frameProgress",
    0,
    1,
  );

  return true;
}

export function updateRenderState(previousRenderState, updates = {}) {
  try {
    validateRenderState(previousRenderState);
  } catch (error) {
    throw new Error(
      `updateRenderState previous state is invalid: ${error.message}`,
    );
  }

  requireObject(updates, "updateRenderState updates");

  const nextRenderState = {
    ...previousRenderState,
    ...updates,
    type: "render-state",
  };

  validateRenderState(nextRenderState);
  return deepFreeze(nextRenderState);
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

function requireInclusiveNumberRange(value, label, minimum, maximum) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new Error(
      `${label} must be a number between ${minimum} and ${maximum} inclusive.`,
    );
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
