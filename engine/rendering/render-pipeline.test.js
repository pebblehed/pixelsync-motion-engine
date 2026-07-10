/**
 * PixelSync Motion Engine
 * File: engine/rendering/render-pipeline.test.js
 *
 * Responsibility:
 * Provides deterministic validation evidence for the governed render pipeline.
 *
 * Governance Inheritance:
 * - PSME-ARC-004 Rendering Architecture
 * - PSME-STD-004 Rendering Engineering Standard
 * - Rendering Domain Model
 * - Rendering Validation Standard
 * - RENDERING_PIPELINE_INTEGRATION_PLAN.md
 * - PHASE_5_RENDERING_PIPELINE_STATUS_REVIEW.md
 */

import test from "node:test";
import assert from "node:assert/strict";

import { createScene, createStory } from "../scene.js";
import { createRuntime } from "../runtime.js";
import { createExecutionState } from "../state.js";
import { createClock } from "../clock.js";
import { createSchedule } from "../scheduler.js";

import {
  createRenderPipeline,
  executeRenderPipeline,
  progressRenderPipelineFrame,
} from "./render-pipeline.js";
import { createRenderer } from "./renderer.js";
import { createRenderContext } from "./render-context.js";
import { createRenderState } from "./render-state.js";
import { createRenderGraph } from "./render-graph.js";
import { createRenderFrame } from "./render-frame.js";
import { createRenderPass } from "./render-pass.js";
import { createComposition } from "./composition.js";
import { createRenderTarget } from "./render-target.js";

function createStoryFixture() {
  const scene = createScene({
    id: "scene-1",
    title: "Scene 1",
    communicationObjective: "Validate deterministic rendering path.",
    primaryIdea: "Single governed scene for test fixtures.",
    purpose: "Support pipeline validation.",
    sequences: [{ id: "sequence-1" }],
  });

  return createStory({
    id: "story-1",
    title: "Governed Render Pipeline Test Story",
    communicationObjective: "Prove pipeline determinism and validation.",
    audience: "engineers",
    desiredOutcome: "validated deterministic integration",
    emotionalProgression: ["neutral"],
    narrativeProgression: ["setup"],
    scenes: [scene],
  });
}

function createValidPipelineInput() {
  const story = createStoryFixture();
  const runtime = createRuntime({
    story,
    currentSceneIndex: 0,
    playbackState: "stopped",
  });
  const executionState = createExecutionState({
    state: "stopped",
    logicalEngineTime: 0,
    currentSceneIndex: 0,
  });
  const clock = createClock({
    logicalEngineTime: 0,
    startedAt: null,
    pausedAt: null,
  });
  const schedule = createSchedule({
    story,
    currentSceneIndex: 0,
    logicalEngineTime: 0,
  });

  const renderer = createRenderer({ id: "renderer-1" });
  const context = createRenderContext({
    runtime,
    story,
    scene: story.scenes[0],
    components: [],
    executionState,
    clock,
    schedule,
    renderConfiguration: { profile: "test" },
  });
  const state = createRenderState({
    lifecycleStage: "ready",
    activeRenderPass: null,
    validationStatus: "valid",
    diagnostics: { source: "test" },
    frameProgress: 0,
  });
  const graph = createRenderGraph({
    id: "graph-1",
    nodes: [
      { id: "pass-background", dependencies: [] },
      { id: "pass-components", dependencies: ["pass-background"] },
    ],
  });
  const frame = createRenderFrame({
    frameId: "frame-1",
    frameNumber: 0,
    timestamp: 0,
    lifecycleStage: "pending",
    diagnostics: { source: "test" },
    status: "ready",
    renderer,
    renderContext: context,
    renderState: state,
    renderGraph: graph,
  });
  const passes = [
    createRenderPass({
      passId: "pass-background",
      passName: "Background",
      passOrder: 0,
      enabled: true,
      diagnostics: {},
    }),
    createRenderPass({
      passId: "pass-components",
      passName: "Components",
      passOrder: 1,
      enabled: true,
      diagnostics: {},
    }),
  ];
  const composition = createComposition({
    compositionId: "composition-1",
    items: [
      {
        id: "layer-1",
        name: "Background Layer",
        order: 0,
        visible: true,
        children: [],
        diagnostics: {},
      },
    ],
    diagnostics: {},
  });
  const target = createRenderTarget({
    targetId: "target-1",
    targetClassification: "preview",
    targetStatus: "ready",
    targetConfiguration: { resolution: "hd" },
    diagnostics: {},
  });

  return {
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
}

test("createRenderPipeline creates a valid governed pipeline", () => {
  const input = createValidPipelineInput();

  const pipeline = createRenderPipeline(input);

  assert.equal(typeof pipeline, "object");
  assert.equal(pipeline.runtime.type, "runtime");
  assert.equal(pipeline.renderer.type, "renderer");
  assert.equal(pipeline.context.type, "render-context");
  assert.equal(pipeline.state.type, "render-state");
  assert.equal(pipeline.graph.type, "render-graph");
  assert.equal(pipeline.frame.type, "render-frame");
  assert.equal(Array.isArray(pipeline.passes), true);
  assert.equal(pipeline.composition.type, "composition");
  assert.equal(pipeline.target.type, "render-target");
});

test("executeRenderPipeline executes a valid governed pipeline", () => {
  const pipeline = createRenderPipeline(createValidPipelineInput());

  const result = executeRenderPipeline(pipeline);

  assert.equal(result.status, "render-pipeline-executed");
  assert.equal(result.runtime, pipeline.runtime);
  assert.equal(result.renderer, pipeline.renderer);
  assert.equal(result.context, pipeline.context);
  assert.equal(result.state, pipeline.state);
  assert.equal(result.graph, pipeline.graph);
  assert.equal(result.frame, pipeline.frame);
  assert.equal(result.passes, pipeline.passes);
  assert.equal(result.composition, pipeline.composition);
  assert.equal(result.target, pipeline.target);
  assert.equal(result.productionFrame.type, "governed-production-frame");
  assert.equal(result.productionFrame.status, "production-frame-created");
  assert.equal(result.productionFrame.frameId, pipeline.frame.frameId);
  assert.equal(result.productionFrame.frameNumber, pipeline.frame.frameNumber);
  assert.equal(result.productionFrame.timestamp, pipeline.frame.timestamp);
  assert.equal(result.productionFrame.story, pipeline.runtime.story);
  assert.equal(
    result.productionFrame.scene,
    pipeline.runtime.story.scenes[pipeline.runtime.currentSceneIndex],
  );
  assert.equal(result.productionFrame.composition, pipeline.composition);
  assert.equal(result.productionFrame.target, pipeline.target);
});

test("createRenderPipeline rejects missing required pipeline entities", () => {
  const requiredEntities = [
    "runtime",
    "renderer",
    "context",
    "state",
    "graph",
    "frame",
    "composition",
    "target",
  ];

  requiredEntities.forEach((entityName) => {
    const input = createValidPipelineInput();
    input[entityName] = null;

    assert.throws(
      () => createRenderPipeline(input),
      /Render Pipeline requires/,
      "Expected missing " + entityName + " to be rejected.",
    );
  });
});

test("createRenderPipeline requires passes to be an array", () => {
  const input = createValidPipelineInput();
  input.passes = { not: "an-array" };

  assert.throws(
    () => createRenderPipeline(input),
    /ordered array of Render Passes/,
  );
});

test("createRenderPipeline validates each render pass", () => {
  const input = createValidPipelineInput();
  input.passes = [
    createRenderPass({ passId: "pass-valid", passName: "Valid", passOrder: 0 }),
    {
      type: "render-pass",
      passId: "pass-invalid",
      passName: "",
      passOrder: 1,
      enabled: true,
      diagnostics: {},
    },
  ];

  assert.throws(() => createRenderPipeline(input), /non-empty string/);
});

test("createRenderPipeline returns an immutable pipeline", () => {
  const pipeline = createRenderPipeline(createValidPipelineInput());

  assert.equal(Object.isFrozen(pipeline), true);
  assert.equal(Object.isFrozen(pipeline.passes), true);
  assert.throws(() => {
    pipeline.passes.push(
      createRenderPass({
        passId: "pass-extra",
        passName: "Extra",
        passOrder: 2,
      }),
    );
  }, TypeError);
});

test("executeRenderPipeline returns an immutable execution result", () => {
  const pipeline = createRenderPipeline(createValidPipelineInput());
  const result = executeRenderPipeline(pipeline);

  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.productionFrame), true);
  assert.throws(() => {
    result.status = "mutated";
  }, TypeError);
  assert.throws(() => {
    result.productionFrame.status = "mutated";
  }, TypeError);
});

test("executeRenderPipeline is deterministic for the same input", () => {
  const pipeline = createRenderPipeline(createValidPipelineInput());

  const firstExecution = executeRenderPipeline(pipeline);
  const secondExecution = executeRenderPipeline(pipeline);

  assert.deepEqual(firstExecution, secondExecution);
  assert.equal(firstExecution.status, "render-pipeline-executed");
  assert.equal(secondExecution.status, "render-pipeline-executed");
});

test("progressRenderPipelineFrame returns a second governed production frame deterministically", () => {
  const pipeline = createRenderPipeline(createValidPipelineInput());
  const firstResult = executeRenderPipeline(pipeline);
  const nextFrame = createRenderFrame({
    frameId: "frame-2",
    frameNumber: 1,
    timestamp: 16,
    lifecycleStage: "pending",
    diagnostics: { source: "test" },
    status: "ready",
    renderer: pipeline.renderer,
    renderContext: pipeline.context,
    renderState: pipeline.state,
    renderGraph: pipeline.graph,
  });

  const secondResult = progressRenderPipelineFrame(pipeline, nextFrame);

  assert.equal(secondResult.status, "render-pipeline-executed");
  assert.equal(secondResult.productionFrame.type, "governed-production-frame");
  assert.equal(secondResult.productionFrame.status, "production-frame-created");
  assert.equal(secondResult.productionFrame.frameNumber, 1);
  assert.equal(secondResult.productionFrame.timestamp, nextFrame.timestamp);
  assert.equal(
    secondResult.productionFrame.timestamp >
      firstResult.productionFrame.timestamp,
    true,
  );
  assert.equal(secondResult.runtime, pipeline.runtime);
  assert.equal(
    secondResult.productionFrame.story,
    firstResult.productionFrame.story,
  );
  assert.equal(
    secondResult.productionFrame.scene,
    firstResult.productionFrame.scene,
  );
  assert.equal(secondResult.productionFrame.composition, pipeline.composition);
  assert.equal(secondResult.productionFrame.target, pipeline.target);
  assert.equal(pipeline.frame.frameNumber, 0);
  assert.equal(pipeline.frame.timestamp, 0);
  assert.equal(Object.isFrozen(secondResult), true);
  assert.equal(Object.isFrozen(secondResult.productionFrame), true);
});

test("progressRenderPipelineFrame rejects invalid frame number progression", () => {
  const pipeline = createRenderPipeline(createValidPipelineInput());
  const invalidNextFrame = createRenderFrame({
    frameId: "frame-2",
    frameNumber: 2,
    timestamp: 16,
    lifecycleStage: "pending",
    diagnostics: { source: "test" },
    status: "ready",
    renderer: pipeline.renderer,
    renderContext: pipeline.context,
    renderState: pipeline.state,
    renderGraph: pipeline.graph,
  });

  assert.throws(
    () => progressRenderPipelineFrame(pipeline, invalidNextFrame),
    /frameNumber must be exactly current frameNumber \+ 1/,
  );
});

test("progressRenderPipelineFrame rejects non-increasing timestamp progression", () => {
  const pipeline = createRenderPipeline(createValidPipelineInput());
  const invalidNextFrame = createRenderFrame({
    frameId: "frame-2",
    frameNumber: 1,
    timestamp: 0,
    lifecycleStage: "pending",
    diagnostics: { source: "test" },
    status: "ready",
    renderer: pipeline.renderer,
    renderContext: pipeline.context,
    renderState: pipeline.state,
    renderGraph: pipeline.graph,
  });

  assert.throws(
    () => progressRenderPipelineFrame(pipeline, invalidNextFrame),
    /timestamp must be greater than current frame timestamp/,
  );
});
