/**
 * PixelSync Motion Engine
 * File: engine/rendering/render-pass.js
 *
 * Responsibility:
 * Defines the governed Render Pass entity as one logical stage of rendering.
 *
 * Governance Inheritance:
 * - PSME-ARC-004 Rendering Architecture
 * - PSME-STD-004 Rendering Engineering Standard
 * - PSME-ARC-005 Rendering Domain Model
 * - Rendering Validation Standard
 * - Existing Rendering Foundation
 *
 * Explicit Non-Responsibilities:
 * - No rendering, drawing, or render work execution.
 * - No render coordination or renderer control.
 * - No Composition or Render Target definitions.
 * - No mutation of Runtime, Execution State, Clock State, Schedule State,
 *   Renderer, Render Context, Render State, Render Graph, or Render Frame.
 * - No browser APIs, Canvas, WebGL, WebGPU, SVG, DOM, or filesystem output.
 * - No external dependencies.
 */

export function createRenderPass({
  passId = "render-pass",
  passName = "Render Pass",
  passOrder = 0,
  enabled = true,
  diagnostics = {},
} = {}) {
  const renderPass = {
    type: "render-pass",
    passId,
    passName,
    passOrder,
    enabled,
    diagnostics,
  };

  validateRenderPass(renderPass);
  return deepFreeze(renderPass);
}

export function validateRenderPass(renderPass) {
  requireObject(renderPass, "RenderPass");
  requireString(renderPass.type, "RenderPass.type");
  requireString(renderPass.passId, "RenderPass.passId");
  requireString(renderPass.passName, "RenderPass.passName");
  requireInteger(renderPass.passOrder, "RenderPass.passOrder");
  requireNonNegativeNumber(renderPass.passOrder, "RenderPass.passOrder");
  requireBoolean(renderPass.enabled, "RenderPass.enabled");
  requireObject(renderPass.diagnostics, "RenderPass.diagnostics");

  if (renderPass.type !== "render-pass") {
    throw new Error('RenderPass.type must be "render-pass".');
  }

  return true;
}

export function updateRenderPass(previousRenderPass, updates = {}) {
  try {
    validateRenderPass(previousRenderPass);
  } catch (error) {
    throw new Error(
      `updateRenderPass previous pass is invalid: ${error.message}`,
    );
  }

  requireObject(updates, "updateRenderPass updates");

  const nextRenderPass = {
    ...previousRenderPass,
    ...updates,
    type: "render-pass",
  };

  validateRenderPass(nextRenderPass);
  return deepFreeze(nextRenderPass);
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

function requireBoolean(value, label) {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be a boolean.`);
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