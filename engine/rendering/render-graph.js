/**
 * PixelSync Motion Engine
 * File: engine/rendering/render-graph.js
 *
 * Responsibility:
 * Defines the governed Render Graph entity as the deterministic structure
 * and dependency model for rendering work.
 *
 * Governance Inheritance:
 * - PSME-ARC-005 Rendering Domain Model
 * - Rendering Implementation Foundation
 *
 * Explicit Non-Responsibilities:
 * - No rendering, node execution, or render coordination.
 * - No Render Frame, Render Pass, Composition, or Render Target definitions.
 * - No mutation of runtime state, execution state, clock state,
 *   or schedule state.
 * - No browser APIs, Canvas, WebGL, WebGPU, SVG, DOM, or filesystem output.
 * - No external dependencies.
 */

export function createRenderGraph({ id = "render-graph", nodes = [] } = {}) {
  const renderGraph = {
    type: "render-graph",
    id,
    nodes,
  };

  validateRenderGraph(renderGraph);
  return deepFreeze(renderGraph);
}

export function validateRenderGraph(renderGraph) {
  requireObject(renderGraph, "RenderGraph");
  requireString(renderGraph.type, "RenderGraph.type");
  requireString(renderGraph.id, "RenderGraph.id");
  requireArray(renderGraph.nodes, "RenderGraph.nodes");

  if (renderGraph.type !== "render-graph") {
    throw new Error('RenderGraph.type must be "render-graph".');
  }

  const nodeIds = new Set();

  for (let i = 0; i < renderGraph.nodes.length; i += 1) {
    const node = renderGraph.nodes[i];

    validateRenderGraphNode(node, i);

    if (nodeIds.has(node.id)) {
      throw new Error(`RenderGraph.nodes[${i}].id must be unique.`);
    }

    nodeIds.add(node.id);
  }

  for (let i = 0; i < renderGraph.nodes.length; i += 1) {
    const node = renderGraph.nodes[i];

    for (let j = 0; j < node.dependencies.length; j += 1) {
      const dependencyId = node.dependencies[j];

      if (!nodeIds.has(dependencyId)) {
        throw new Error(
          `RenderGraph.nodes[${i}].dependencies[${j}] must reference an existing node id.`,
        );
      }
    }
  }

  return true;
}

function validateRenderGraphNode(node, index) {
  requireObject(node, `RenderGraph.nodes[${index}]`);
  requireString(node.id, `RenderGraph.nodes[${index}].id`);
  requireArray(node.dependencies, `RenderGraph.nodes[${index}].dependencies`);

  for (let i = 0; i < node.dependencies.length; i += 1) {
    requireString(
      node.dependencies[i],
      `RenderGraph.nodes[${index}].dependencies[${i}]`,
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