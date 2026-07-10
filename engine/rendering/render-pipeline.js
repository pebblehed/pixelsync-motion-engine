/**
 * PixelSync Motion Engine
 * File: engine/rendering/render-pipeline.js
 *
 * Responsibility:
 * Coordinates approved rendering foundations into the first deterministic
 * governed rendering pipeline from Runtime through Render Target.
 *
 * Governance Inheritance:
 * - PSME-ARC-004 Rendering Architecture
 * - PSME-STD-004 Rendering Engineering Standard
 * - Rendering Domain Model
 * - Rendering Validation Standard
 * - RENDERING_PIPELINE_INTEGRATION_PLAN.md
 *
 * This file does not define rendering policy, browser drawing,
 * graphics APIs, scene authoring, interpolation, playback controls,
 * asset loading, or visual implementation.
 */

import { validateRuntime } from "../runtime.js";
import { validateRenderer } from "./renderer.js";
import { validateRenderContext } from "./render-context.js";
import { validateRenderState } from "./render-state.js";
import { validateRenderGraph } from "./render-graph.js";
import { validateRenderFrame } from "./render-frame.js";
import { validateRenderPass } from "./render-pass.js";
import { validateComposition } from "./composition.js";
import { validateRenderTarget } from "./render-target.js";

export function validateRenderPipeline(pipeline) {
  if (!pipeline || typeof pipeline !== "object") {
    throw new Error("Render Pipeline must be an object.");
  }

  if (!pipeline.runtime) {
    throw new Error("Render Pipeline requires a Runtime.");
  }

  if (!pipeline.renderer) {
    throw new Error("Render Pipeline requires a Renderer.");
  }

  if (!pipeline.context) {
    throw new Error("Render Pipeline requires a Render Context.");
  }

  if (!pipeline.state) {
    throw new Error("Render Pipeline requires a Render State.");
  }

  if (!pipeline.graph) {
    throw new Error("Render Pipeline requires a Render Graph.");
  }

  if (!pipeline.frame) {
    throw new Error("Render Pipeline requires a Render Frame.");
  }

  if (!Array.isArray(pipeline.passes)) {
    throw new Error(
      "Render Pipeline requires an ordered array of Render Passes.",
    );
  }

  if (!pipeline.composition) {
    throw new Error("Render Pipeline requires a Composition.");
  }

  if (!pipeline.target) {
    throw new Error("Render Pipeline requires a Render Target.");
  }

  validateRuntime(pipeline.runtime);
  validateRenderer(pipeline.renderer);
  validateRenderContext(pipeline.context);
  validateRenderState(pipeline.state);
  validateRenderGraph(pipeline.graph);
  validateRenderFrame(pipeline.frame);

  pipeline.passes.forEach((renderPass, index) => {
    validateRenderPass(renderPass);
  });

  validateComposition(pipeline.composition);
  validateRenderTarget(pipeline.target);

  return true;
}

export function createRenderPipeline({
  runtime,
  renderer,
  context,
  state,
  graph,
  frame,
  passes,
  composition,
  target,
}) {
  const pipeline = {
    runtime,
    renderer,
    context,
    state,
    graph,
    frame,
    passes,
    composition,
    target,
  };

  validateRenderPipeline(pipeline);

  return Object.freeze({
    ...pipeline,
    passes: Object.freeze([...passes]),
  });
}

export function executeRenderPipeline(pipeline) {
  validateRenderPipeline(pipeline);

  const productionFrame = Object.freeze({
    type: "governed-production-frame",
    frameId: pipeline.frame.frameId,
    frameNumber: pipeline.frame.frameNumber,
    timestamp: pipeline.frame.timestamp,
    story: pipeline.runtime.story,
    scene: pipeline.runtime.story.scenes[pipeline.runtime.currentSceneIndex],
    composition: pipeline.composition,
    target: pipeline.target,
    status: "production-frame-created",
  });

  return Object.freeze({
    runtime: pipeline.runtime,
    renderer: pipeline.renderer,
    context: pipeline.context,
    state: pipeline.state,
    graph: pipeline.graph,
    frame: pipeline.frame,
    passes: pipeline.passes,
    composition: pipeline.composition,
    target: pipeline.target,
    productionFrame,
    status: "render-pipeline-executed",
  });
}
