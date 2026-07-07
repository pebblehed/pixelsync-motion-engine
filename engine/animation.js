/**
 * PixelSync Motion Engine
 * File: engine/animation.js
 *
 * Responsibility:
 * Defines governed Animation and Track data structures for the runtime.
 *
 * Inherits from:
 * - PSME-ARC-002 Motion Engine Domain Model
 *
 * This file does not define playback, rendering, browser execution,
 * interpolation, easing, or visual behaviour.
 */

export function createAnimation({ id, title, purpose, duration, tracks = [] }) {
  const animation = {
    type: "animation",
    id,
    title,
    purpose,
    duration,
    tracks,
  };

  validateAnimation(animation);
  return Object.freeze(animation);
}

export function createTrack({
  property,
  startValue,
  endValue,
  easing,
  duration,
  delay,
}) {
  const track = {
    type: "track",
    property,
    startValue,
    endValue,
    easing,
    duration,
    delay,
  };

  validateTrack(track);
  return Object.freeze(track);
}

export function validateAnimation(animation) {
  requireObject(animation, "Animation");

  requireString(animation.id, "Animation.id");
  requireString(animation.title, "Animation.title");
  requireString(animation.purpose, "Animation.purpose");
  requirePositiveNumber(animation.duration, "Animation.duration");
  requireArray(animation.tracks, "Animation.tracks");

  animation.tracks.forEach((track, index) => {
    try {
      validateTrack(track);
    } catch (error) {
      throw new Error(
        `Animation.tracks[${index}] is invalid: ${error.message}`,
      );
    }
  });

  return true;
}

export function validateTrack(track) {
  requireObject(track, "Track");

  requireString(track.property, "Track.property");
  requireDefined(track.startValue, "Track.startValue");
  requireDefined(track.endValue, "Track.endValue");
  requireString(track.easing, "Track.easing");
  requirePositiveNumber(track.duration, "Track.duration");
  requireNonNegativeNumber(track.delay, "Track.delay");

  return true;
}

function requireDefined(value, label) {
  if (typeof value === "undefined") {
    throw new Error(`${label} must be defined.`);
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

function requirePositiveNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
}

function requireNonNegativeNumber(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative number.`);
  }
}
