# Execution State Machine

Property Value

---

Document EXECUTION_STATE_MACHINE.md
Project PixelSync Motion Engine
Document ID PSME-ARC-003
Version 1.0 Foundation
Status Draft
Classification Architecture
Owner PixelSync
Parent PSME-STD-006
Last Updated 2026-07-07

---

# 1. Responsibility

This document defines the approved execution state machine for the
PixelSync Motion Engine.

It specifies: - Approved execution states - Valid state transitions -
Invalid state transitions - Transition responsibilities - Runtime
progression semantics

It does not define rendering, animation interpolation, browser playback,
audio, export, or visual behaviour.

---

# 2. Inheritance

The execution state machine inherits from:

1.  PixelSync Motion Engine Constitution
2.  Motion Engine Architecture
3.  Motion Engine Domain Model
4.  Execution Engine Standard

No implementation may introduce execution behaviour that contradicts
this document.

---

# 3. Approved Execution States

---

State Description

---

`stopped` Runtime exists but execution has not yet
begun or has been reset.

`playing` Logical engine time is progressing.

`paused` Logical execution is suspended while
preserving runtime state.

`completed` The governed story has reached its logical
end.

---

No additional execution states are permitted during Foundation v1.

---

# 4. Initial State

Every runtime shall begin with:

- Execution state: `stopped`
- Logical engine time: `0`
- Current scene index: `0`

No playback may occur before a valid transition to `playing`.

---

# 5. Approved State Transitions

Current State Action Next State

---

stopped start playing
playing pause paused
paused resume playing
playing stop stopped
paused stop stopped
playing complete completed
completed stop stopped

---

# 6. Invalid State Transitions

Any transition not listed above is invalid.

Invalid transitions must raise an explicit error.

Silent failure is not permitted.

---

# 7. Transition Responsibilities

Transitions may update derived runtime state.

Transitions must not: - mutate authored Story, Scene, Timeline,
Animation, or Track objects - render visuals - access browser APIs -
perform interpolation - play audio

---

# 8. State Machine

```text
stopped
   |
 start
   v
playing ------ complete ------> completed
   |                              |
 pause                           stop
   v                              |
paused ---- resume ---------------+
   |
 stop
   v
stopped
```

---

# 9. Completion Semantics

Completion occurs only when execution reaches the end of the governed
story timeline.

Completion must not automatically restart execution.

---

# 10. Stop Semantics

Stopping execution resets:

- playback state → `stopped`
- logical engine time → `0`
- current scene index → `0`

Authored story data must remain unchanged.

---

# 11. Pause Semantics

Pause preserves:

- logical engine time
- current scene index
- derived runtime state

---

# 12. Resume Semantics

Resume continues from the preserved runtime position.

It must not restart the story.

---

# 13. Validation Rules

Execution state must always be one of the approved states.

Invalid state/action combinations must throw an explicit error.

---

# 14. Future Version Log

Deferred:

- reverse playback
- looping
- timeline scrubbing
- branching stories
- event hooks
- renderer notifications
- browser playback adapters
