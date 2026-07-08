/**
 * PixelSync Motion Engine
 * File: engine/rendering/render-target.js
 *
 * Responsibility:
 * Defines the governed Render Target entity as the destination for rendered output.
 *
 * Governance Inheritance:
 * - PSME-ARC-004 Rendering Architecture
 * - PSME-STD-004 Rendering Engineering Standard
 * - PSME-ARC-005 Rendering Domain Model
 * - Rendering Validation Standard
 * - Existing Rendering Foundation
 *
 * Explicit Non-Responsibilities:
 * - No rendering, drawing, or render execution.
 * - No file writing, video creation, image creation, or export pipelines.
 * - No browser APIs, Canvas, WebGL, WebGPU, SVG, DOM, or filesystem output.
 * - No Render Pass, Composition, or renderer coordination.
 * - No mutation of Runtime, Execution State, Clock State, Schedule State,
 *   Renderer, Render Context, Render State, Render Graph, Render Frame,
 *   Render Pass, or Composition.
 * - No external dependencies.
 */

export function createRenderTarget({
  targetId = "render-target",
  targetClassification = "preview",
  targetStatus = "ready",
  targetConfiguration = {},
  diagnostics = {},
} = {}) {
  const renderTarget = {
    type: "render-target",
    targetId,
    targetClassification,
    targetStatus,
    targetConfiguration,
    diagnostics,
  };

  validateRenderTarget(renderTarget);
  return deepFreeze(renderTarget);
}

export function validateRenderTarget(renderTarget) {
  requireObject(renderTarget, "RenderTarget");
  requireString(renderTarget.type, "RenderTarget.type");
  requireString(renderTarget.targetId, "RenderTarget.targetId");
  requireString(
    renderTarget.targetClassification,
    "RenderTarget.targetClassification",
  );
  requireString(renderTarget.targetStatus, "RenderTarget.targetStatus");
  requireObject(
    renderTarget.targetConfiguration,
    "RenderTarget.targetConfiguration",
  );
  requireObject(renderTarget.diagnostics, "RenderTarget.diagnostics");

  if (renderTarget.type !== "render-target") {
    throw new Error('RenderTarget.type must be "render-target".');
  }

  return true;
}

export function updateRenderTarget(previousRenderTarget, updates = {}) {
  try {
    validateRenderTarget(previousRenderTarget);
  } catch (error) {
    throw new Error(
      `updateRenderTarget previous target is invalid: ${error.message}`,
    );
  }

  requireObject(updates, "updateRenderTarget updates");

  const nextRenderTarget = {
    ...previousRenderTarget,
    ...updates,
    type: "render-target",
  };

  validateRenderTarget(nextRenderTarget);
  return deepFreeze(nextRenderTarget);
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
