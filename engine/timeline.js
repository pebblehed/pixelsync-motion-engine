/**
 * PixelSync Motion Engine
 * File: engine/timeline.js
 *
 * Responsibility:
 * Defines governed Timeline and Sequence data structures for the runtime.
 *
 * Inherits from:
 * - PSME-ARC-002 Motion Engine Domain Model
 * - PSME-STD-003 Scene Engineering Standard
 *
 * This file does not define animation, rendering, playback,
 * browser execution, requestAnimationFrame, audio, or visual behaviour.
 */

export function createTimeline({
  id,
  title,
  purpose,
  duration,
  sequences = [],
}) {
  const timeline = {
    type: "timeline",
    id,
    title,
    purpose,
    duration,
    sequences,
  };

  validateTimeline(timeline);
  return Object.freeze(timeline);
}

export function createSequence({ id, title, purpose, duration, tracks = [] }) {
  const sequence = {
    type: "sequence",
    id,
    title,
    purpose,
    duration,
    tracks,
  };

  validateSequence(sequence);
  return Object.freeze(sequence);
}

export function validateTimeline(timeline) {
  requireObject(timeline, "Timeline");

  requireString(timeline.id, "Timeline.id");
  requireString(timeline.title, "Timeline.title");
  requireString(timeline.purpose, "Timeline.purpose");
  requirePositiveNumber(timeline.duration, "Timeline.duration");
  requireArray(timeline.sequences, "Timeline.sequences");

  if (timeline.sequences.length === 0) {
    throw new Error("Timeline must contain at least one Sequence.");
  }

  timeline.sequences.forEach((sequence, index) => {
    try {
      validateSequence(sequence);
    } catch (error) {
      throw new Error(
        `Timeline.sequences[${index}] is invalid: ${error.message}`,
      );
    }
  });

  return true;
}

export function validateSequence(sequence) {
  requireObject(sequence, "Sequence");

  requireString(sequence.id, "Sequence.id");
  requireString(sequence.title, "Sequence.title");
  requireString(sequence.purpose, "Sequence.purpose");
  requirePositiveNumber(sequence.duration, "Sequence.duration");
  requireArray(sequence.tracks, "Sequence.tracks");

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

function requirePositiveNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
}
