/**
 * PixelSync Motion Engine
 * File: engine/rendering/render-frame.js
 *
 * Responsibility:
 * Defines the governed Render Frame entity as one deterministic rendering cycle.
 *
 * Governance Inheritance:
 * - PSME-ARC-004 Rendering Architecture
 * - PSME-STD-004 Rendering Engineering Standard
 * - PSME-ARC-005 Rendering Domain Model
 * - Rendering Validation Standard
 * - Existing Rendering Foundation
 *
 * Explicit Non-Responsibilities:
 * - No rendering, render graph execution, or render pass coordination.
 * - No Render Pass, Composition, or Render Target definitions.
 * - No mutation of Renderer, Render Context, Render State, or Render Graph.
 * - No browser APIs, Canvas, WebGL, WebGPU, SVG, DOM, or filesystem output.
 * - No external dependencies.
 */

import { validateRenderer } from "./renderer.js";
import { validateRenderContext } from "./render-context.js";
import { validateRenderState } from "./render-state.js";
import { validateRenderGraph } from "./render-graph.js";

export function createRenderFrame({
  frameId = "render-frame",
  frameNumber = 0,
  timestamp = 0,
  lifecycleStage = "pending",
  diagnostics = {},
  status = "pending",
  renderer = null,
  renderContext = null,
  renderState = null,
  renderGraph = null,
} = {}) {
  const renderFrame = {
    type: "render-frame",
    frameId,
    frameNumber,
    timestamp,
    lifecycleStage,
    diagnostics,
    status,
    renderer,
    renderContext,
    renderState,
    renderGraph,
  };

  validateRenderFrame(renderFrame);
  return deepFreeze(renderFrame);
}

export function validateRenderFrame(renderFrame) {
  requireObject(renderFrame, "RenderFrame");
  requireString(renderFrame.type, "RenderFrame.type");
  requireString(renderFrame.frameId, "RenderFrame.frameId");
  requireInteger(renderFrame.frameNumber, "RenderFrame.frameNumber");
  requireNonNegativeNumber(renderFrame.frameNumber, "RenderFrame.frameNumber");
  requireNonNegativeNumber(renderFrame.timestamp, "RenderFrame.timestamp");
  requireString(renderFrame.lifecycleStage, "RenderFrame.lifecycleStage");
  requireObject(renderFrame.diagnostics, "RenderFrame.diagnostics");
  requireString(renderFrame.status, "RenderFrame.status");

  if (renderFrame.type !== "render-frame") {
    throw new Error('RenderFrame.type must be "render-frame".');
  }

  if (renderFrame.renderer !== null) {
    try {
      validateRenderer(renderFrame.renderer);
    } catch (error) {
      throw new Error(`RenderFrame.renderer is invalid: ${error.message}`);
    }
  }

  if (renderFrame.renderContext !== null) {
    try {
      validateRenderContext(renderFrame.renderContext);
    } catch (error) {
      throw new Error(`RenderFrame.renderContext is invalid: ${error.message}`);
    }
  }

  if (renderFrame.renderState !== null) {
    try {
      validateRenderState(renderFrame.renderState);
    } catch (error) {
      throw new Error(`RenderFrame.renderState is invalid: ${error.message}`);
    }
  }

  if (renderFrame.renderGraph !== null) {
    try {
      validateRenderGraph(renderFrame.renderGraph);
    } catch (error) {
      throw new Error(`RenderFrame.renderGraph is invalid: ${error.message}`);
    }
  }

  return true;
}

export function updateRenderFrame(previousRenderFrame, updates = {}) {
  try {
    validateRenderFrame(previousRenderFrame);
  } catch (error) {
    throw new Error(
      `updateRenderFrame previous frame is invalid: ${error.message}`,
    );
  }

  requireObject(updates, "updateRenderFrame updates");

  const nextRenderFrame = {
    ...previousRenderFrame,
    ...updates,
    type: "render-frame",
  };

  validateRenderFrame(nextRenderFrame);
  return deepFreeze(nextRenderFrame);
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
