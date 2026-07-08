/**
 * PixelSync Motion Engine
 * File: engine/rendering/composition.js
 *
 * Responsibility:
 * Defines the governed Composition entity as the assembled visual result of rendering.
 *
 * Governance Inheritance:
 * - PSME-ARC-004 Rendering Architecture
 * - PSME-STD-004 Rendering Engineering Standard
 * - PSME-ARC-005 Rendering Domain Model
 * - Rendering Validation Standard
 * - Existing Rendering Foundation
 *
 * Explicit Non-Responsibilities:
 * - No drawing, pixel rendering, or render work execution.
 * - No render coordination or renderer control.
 * - No Render Target definitions.
 * - No mutation of Runtime, Execution State, Clock State, Schedule State,
 *   Renderer, Render Context, Render State, Render Graph, Render Frame,
 *   or Render Pass.
 * - No browser APIs, Canvas, WebGL, WebGPU, SVG, DOM, or filesystem output.
 * - No external dependencies.
 */

export function createComposition({
  compositionId = "composition",
  items = [],
  diagnostics = {},
} = {}) {
  const composition = {
    type: "composition",
    compositionId,
    items,
    diagnostics,
  };

  validateComposition(composition);
  return deepFreeze(composition);
}

export function validateComposition(composition) {
  requireObject(composition, "Composition");
  requireString(composition.type, "Composition.type");
  requireString(composition.compositionId, "Composition.compositionId");
  requireArray(composition.items, "Composition.items");
  requireObject(composition.diagnostics, "Composition.diagnostics");

  if (composition.type !== "composition") {
    throw new Error('Composition.type must be "composition".');
  }

  const itemIds = new Set();

  for (let i = 0; i < composition.items.length; i += 1) {
    validateCompositionItem(
      composition.items[i],
      i,
      "Composition.items",
      itemIds,
    );
  }

  return true;
}

export function updateComposition(previousComposition, updates = {}) {
  try {
    validateComposition(previousComposition);
  } catch (error) {
    throw new Error(
      `updateComposition previous composition is invalid: ${error.message}`,
    );
  }

  requireObject(updates, "updateComposition updates");

  const nextComposition = {
    ...previousComposition,
    ...updates,
    type: "composition",
  };

  validateComposition(nextComposition);
  return deepFreeze(nextComposition);
}

function validateCompositionItem(item, index, path, itemIds) {
  requireObject(item, `${path}[${index}]`);
  requireString(item.id, `${path}[${index}].id`);
  requireString(item.name, `${path}[${index}].name`);
  requireInteger(item.order, `${path}[${index}].order`);
  requireNonNegativeNumber(item.order, `${path}[${index}].order`);
  requireBoolean(item.visible, `${path}[${index}].visible`);
  requireArray(item.children, `${path}[${index}].children`);
  requireObject(item.diagnostics, `${path}[${index}].diagnostics`);

  if (itemIds.has(item.id)) {
    throw new Error(`${path}[${index}].id must be unique.`);
  }

  itemIds.add(item.id);

  for (let i = 0; i < item.children.length; i += 1) {
    validateCompositionItem(
      item.children[i],
      i,
      `${path}[${index}].children`,
      itemIds,
    );
  }
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
