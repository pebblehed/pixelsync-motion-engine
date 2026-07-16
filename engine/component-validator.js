/**
 * PixelSync Motion Engine
 * File: engine/component-validator.js
 *
 * Responsibility:
 * Determines whether a governed Production Component satisfies PSME-STD-007 and PSME-IMP-002.
 *
 * Governance Inheritance:
 * - PSME-STD-007 Component Engineering Standard
 * - PSME-IMP-002 Component Implementation Model
 *
 * Explicit Non-Responsibilities:
 * - No Component creation or repair.
 * - No Behaviour validation, evaluation, or outcome application.
 * - No Component state progression.
 * - No runtime-state, execution-state, or render-state mutation.
 * - No rendering, scheduling, interpolation, or animation.
 * - No browser, operating-system, network, or device APIs.
 * - No external dependencies.
 */

const CATEGORY_ORDER = Object.freeze([
  {
    key: "identity",
    requirement: "PSME-STD-007 Identity and PSME-IMP-002 Canonical Type",
    validate: validateIdentityCategory,
  },
  {
    key: "ownership",
    requirement: "PSME-STD-007 Ownership and PSME-IMP-002 Owner Representation",
    validate: validateOwnershipCategory,
  },
  {
    key: "inheritedAuthority",
    requirement:
      "PSME-STD-007 Component Authority and PSME-IMP-002 Authority Representation",
    validate: validateInheritedAuthorityCategory,
  },
  {
    key: "governedState",
    requirement:
      "PSME-STD-007 Governed Component State and PSME-IMP-002 State Representation",
    validate: validateGovernedStateCategory,
  },
  {
    key: "behaviourAssociations",
    requirement:
      "PSME-STD-007 Component and Behaviour Relationship and PSME-IMP-002 Behaviour Association Representation",
    validate: validateBehaviourAssociationsCategory,
  },
  {
    key: "constitutionalTraceability",
    requirement:
      "PSME-STD-007 Traceability and PSME-IMP-002 Constitutional Traceability Representation",
    validate: validateConstitutionalTraceabilityCategory,
  },
  {
    key: "domainConstraints",
    requirement:
      "PSME-STD-007 Validation Readiness and PSME-IMP-002 Representation Boundaries",
    validate: validateDomainConstraintsCategory,
  },
  {
    key: "separation",
    requirement:
      "PSME-STD-007 Separation of Responsibilities and PSME-IMP-002 Separation Boundaries",
    validate: validateSeparationCategory,
  },
  {
    key: "processingReadiness",
    requirement: "PSME-STD-007 Validation Readiness",
    validate: validateProcessingReadinessCategory,
  },
]);

const TRACEABILITY_REFERENCE_TYPES = Object.freeze([
  "production",
  "story",
  "scene",
  "sequence",
]);

const PROHIBITED_TOP_LEVEL_SEPARATION_FIELDS = Object.freeze([
  "validation",
  "evaluation",
  "outcome",
  "outcomes",
  "outcomeApplication",
  "rendering",
  "render",
  "renderer",
  "renderState",
  "runtimeState",
  "executionState",
  "scheduling",
  "schedule",
  "interpolation",
  "animation",
  "keyframe",
  "keyframes",
  "browser",
  "graphics",
  "hardware",
  "platform",
]);

const PROHIBITED_DOMAIN_EMBEDDED_FIELDS = Object.freeze([
  {
    keys: ["validation", "componentValidationOutcome"],
    reason:
      "Component domain constraints forbid top-level Component validation outcome data.",
  },
  {
    keys: ["evaluation", "behaviourEvaluation"],
    reason:
      "Component domain constraints forbid top-level Behaviour Evaluation data.",
  },
  {
    keys: ["outcome", "behaviourOutcome", "outcomes"],
    reason:
      "Component domain constraints forbid top-level Behaviour Outcome data.",
  },
  {
    keys: ["outcomeApplication", "outcomeApplicationResult"],
    reason:
      "Component domain constraints forbid top-level Outcome Application result data.",
  },
  {
    keys: ["stateProgression", "stateProgressionResult"],
    reason:
      "Component domain constraints forbid top-level Component state progression result data.",
  },
]);

export function validateComponent(component) {
  const affectedComponent = describeComponent(component);
  const context = {
    component,
    affectedComponent,
    categories: {},
  };

  for (let index = 0; index < CATEGORY_ORDER.length; index += 1) {
    const definition = CATEGORY_ORDER[index];
    context.categories[definition.key] = definition.validate(
      context,
      definition,
    );
  }

  const failures = [];

  for (let index = 0; index < CATEGORY_ORDER.length; index += 1) {
    const definition = CATEGORY_ORDER[index];
    const categoryOutcome = context.categories[definition.key];

    for (
      let failureIndex = 0;
      failureIndex < categoryOutcome.failures.length;
      failureIndex += 1
    ) {
      failures.push(categoryOutcome.failures[failureIndex]);
    }
  }

  const valid = failures.length === 0;

  return deepFreeze({
    type: "component-validation-outcome",
    component: affectedComponent,
    valid,
    status: valid ? "valid" : "invalid",
    categories: context.categories,
    failures,
  });
}

function validateIdentityCategory(context, definition) {
  const failures = [];
  const { component } = context;

  if (!isPlainObject(component)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (component.type !== "component") {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        'Component.type must be "component".',
      ),
    );
  }

  if (!isPlainObject(component.identity)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component.identity must be a plain object.",
      ),
    );
  }

  if (isPlainObject(component.identity)) {
    if (!isNonEmptyString(component.identity.id)) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.identity.id must be a non-empty string.",
        ),
      );
    }

    if (!isNonEmptyString(component.identity.scope)) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.identity.scope must be a non-empty string.",
        ),
      );
    }
  }

  return createCategoryOutcome(definition, failures);
}

function validateOwnershipCategory(context, definition) {
  const failures = [];
  const { component } = context;

  if (!isPlainObject(component)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!isPlainObject(component.owner)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component.owner must be a plain object.",
      ),
    );
  }

  if (Object.prototype.hasOwnProperty.call(component, "owners")) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        'Component must not represent plural ownership via "owners".',
      ),
    );
  }

  if (isPlainObject(component.owner)) {
    if (component.owner.type !== "sequence") {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          'Component.owner.type must be "sequence" for the initial foundation.',
        ),
      );
    }

    if (!isNonEmptyString(component.owner.id)) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.owner.id must be a non-empty string.",
        ),
      );
    }
  }

  const ownerId = getOwnerId(component);
  const sequenceId = getTraceabilityReferenceId(component, "sequence");

  if (
    isNonEmptyString(ownerId) &&
    isNonEmptyString(sequenceId) &&
    ownerId !== sequenceId
  ) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component.owner.id must match Component.traceability.sequence.id when both are represented.",
      ),
    );
  }

  return createCategoryOutcome(definition, failures);
}

function validateInheritedAuthorityCategory(context, definition) {
  const failures = [];
  const { component } = context;

  if (!isPlainObject(component)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!isPlainObject(component.inheritedAuthority)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component.inheritedAuthority must be a plain object.",
      ),
    );
  }

  if (isPlainObject(component.inheritedAuthority)) {
    if (!isNonEmptyStringArray(component.inheritedAuthority.sources)) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.inheritedAuthority.sources must be a non-empty array of non-empty strings.",
        ),
      );
    }

    const identityId = getIdentityId(component);

    if (
      isNonEmptyString(identityId) &&
      Array.isArray(component.inheritedAuthority.sources) &&
      component.inheritedAuthority.sources.indexOf(identityId) !== -1
    ) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component must not explicitly represent itself as the source of its own authority.",
        ),
      );
    }
  }

  return createCategoryOutcome(definition, failures);
}

function validateGovernedStateCategory(context, definition) {
  const failures = [];
  const { component } = context;

  if (!isPlainObject(component)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!isPlainObject(component.state)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component.state must be a plain object.",
      ),
    );
  }

  return createCategoryOutcome(definition, failures);
}

function validateBehaviourAssociationsCategory(context, definition) {
  const failures = [];
  const { component } = context;

  if (!isPlainObject(component)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!Array.isArray(component.behaviours)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component.behaviours must be an array.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  for (let index = 0; index < component.behaviours.length; index += 1) {
    const behaviourReference = component.behaviours[index];

    if (!isPlainObject(behaviourReference)) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.behaviours[" +
            index +
            "] must be a plain object containing id and scope.",
        ),
      );
      continue;
    }

    const keys = Object.keys(behaviourReference);

    if (
      keys.length !== 2 ||
      keys.indexOf("id") === -1 ||
      keys.indexOf("scope") === -1
    ) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.behaviours[" +
            index +
            "] must contain exactly the identity members id and scope.",
        ),
      );
    }

    if (!isNonEmptyString(behaviourReference.id)) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.behaviours[" + index + "].id must be a non-empty string.",
        ),
      );
    }

    if (!isNonEmptyString(behaviourReference.scope)) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.behaviours[" +
            index +
            "].scope must be a non-empty string.",
        ),
      );
    }
  }

  return createCategoryOutcome(definition, failures);
}

function validateConstitutionalTraceabilityCategory(context, definition) {
  const failures = [];
  const { component } = context;

  if (!isPlainObject(component)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!isPlainObject(component.traceability)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component.traceability must be a plain object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  for (let index = 0; index < TRACEABILITY_REFERENCE_TYPES.length; index += 1) {
    const referenceType = TRACEABILITY_REFERENCE_TYPES[index];
    const reference = component.traceability[referenceType];

    if (!isPlainObject(reference)) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.traceability." +
            referenceType +
            " must be a plain object.",
        ),
      );
      continue;
    }

    if (reference.type !== referenceType) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.traceability." +
            referenceType +
            '.type must equal "' +
            referenceType +
            '".',
        ),
      );
    }

    if (!isNonEmptyString(reference.id)) {
      failures.push(
        createFailure(
          definition,
          context.affectedComponent,
          "Component.traceability." +
            referenceType +
            ".id must be a non-empty string.",
        ),
      );
    }
  }

  const ownerId = getOwnerId(component);
  const sequenceId = getTraceabilityReferenceId(component, "sequence");

  if (
    isNonEmptyString(ownerId) &&
    isNonEmptyString(sequenceId) &&
    ownerId !== sequenceId
  ) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component.owner.id must match Component.traceability.sequence.id when both are represented.",
      ),
    );
  }

  return createCategoryOutcome(definition, failures);
}

function validateDomainConstraintsCategory(context, definition) {
  const failures = [];
  const { component } = context;

  if (!isPlainObject(component)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (component.type !== "component") {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        'Component domain constraints require type "component".',
      ),
    );
  }

  failWhenCategoryInvalid(
    context,
    definition,
    failures,
    "identity",
    "Component domain constraints require one valid identity.",
  );
  failWhenCategoryInvalid(
    context,
    definition,
    failures,
    "ownership",
    "Component domain constraints require one valid owner.",
  );
  failWhenCategoryInvalid(
    context,
    definition,
    failures,
    "inheritedAuthority",
    "Component domain constraints require inherited authority.",
  );
  failWhenCategoryInvalid(
    context,
    definition,
    failures,
    "governedState",
    "Component domain constraints require valid governed state representation.",
  );
  failWhenCategoryInvalid(
    context,
    definition,
    failures,
    "behaviourAssociations",
    "Component domain constraints require valid Behaviour association representation.",
  );
  failWhenCategoryInvalid(
    context,
    definition,
    failures,
    "constitutionalTraceability",
    "Component domain constraints require constitutional traceability.",
  );

  for (
    let index = 0;
    index < PROHIBITED_DOMAIN_EMBEDDED_FIELDS.length;
    index += 1
  ) {
    const prohibited = PROHIBITED_DOMAIN_EMBEDDED_FIELDS[index];

    if (!containsAnyOwnProperty(component, prohibited.keys)) {
      continue;
    }

    failures.push(
      createFailure(definition, context.affectedComponent, prohibited.reason),
    );
  }

  return createCategoryOutcome(definition, failures);
}

function validateSeparationCategory(context, definition) {
  const failures = [];
  const { component } = context;

  if (!isPlainObject(component)) {
    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        "Component definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  for (
    let index = 0;
    index < PROHIBITED_TOP_LEVEL_SEPARATION_FIELDS.length;
    index += 1
  ) {
    const prohibitedField = PROHIBITED_TOP_LEVEL_SEPARATION_FIELDS[index];

    if (!Object.prototype.hasOwnProperty.call(component, prohibitedField)) {
      continue;
    }

    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        'Component must remain separate from validation, evaluation, outcome application, rendering, runtime control, scheduling, interpolation, and animation concerns; prohibited top-level field "' +
          prohibitedField +
          '" is present.',
      ),
    );
  }

  return createCategoryOutcome(definition, failures);
}

function validateProcessingReadinessCategory(context, definition) {
  const failures = [];
  const blockingCategories = [
    "identity",
    "ownership",
    "inheritedAuthority",
    "governedState",
    "behaviourAssociations",
    "constitutionalTraceability",
    "domainConstraints",
    "separation",
  ];

  for (let index = 0; index < blockingCategories.length; index += 1) {
    const categoryKey = blockingCategories[index];

    if (context.categories[categoryKey].valid === true) {
      continue;
    }

    failures.push(
      createFailure(
        definition,
        context.affectedComponent,
        'Component is not processing-ready because category "' +
          categoryKey +
          '" did not pass.',
      ),
    );
  }

  return createCategoryOutcome(definition, failures);
}

function createCategoryOutcome(definition, failures) {
  return {
    category: definition.key,
    requirement: definition.requirement,
    valid: failures.length === 0,
    failures,
  };
}

function createFailure(definition, affectedComponent, reason) {
  return {
    category: definition.key,
    requirement: definition.requirement,
    affectedComponent,
    reason,
  };
}

function describeComponent(component) {
  if (!isPlainObject(component)) {
    return {
      type: null,
      identity: {
        present: false,
        id: null,
        scope: null,
      },
      owner: {
        present: false,
        type: null,
        id: null,
      },
    };
  }

  const identity = isPlainObject(component.identity)
    ? {
        present: true,
        id: isNonEmptyString(component.identity.id)
          ? component.identity.id
          : null,
        scope: isNonEmptyString(component.identity.scope)
          ? component.identity.scope
          : null,
      }
    : {
        present: false,
        id: null,
        scope: null,
      };

  const owner = isPlainObject(component.owner)
    ? {
        present: true,
        type: isNonEmptyString(component.owner.type)
          ? component.owner.type
          : null,
        id: isNonEmptyString(component.owner.id) ? component.owner.id : null,
      }
    : {
        present: false,
        type: null,
        id: null,
      };

  return {
    type: isNonEmptyString(component.type) ? component.type : null,
    identity,
    owner,
  };
}

function failWhenCategoryInvalid(
  context,
  definition,
  failures,
  categoryKey,
  reason,
) {
  if (context.categories[categoryKey].valid === true) {
    return;
  }

  failures.push(createFailure(definition, context.affectedComponent, reason));
}

function containsAnyOwnProperty(value, keys) {
  for (let index = 0; index < keys.length; index += 1) {
    if (Object.prototype.hasOwnProperty.call(value, keys[index])) {
      return true;
    }
  }

  return false;
}

function getIdentityId(component) {
  if (!isPlainObject(component) || !isPlainObject(component.identity)) {
    return null;
  }

  return isNonEmptyString(component.identity.id) ? component.identity.id : null;
}

function getOwnerId(component) {
  if (!isPlainObject(component) || !isPlainObject(component.owner)) {
    return null;
  }

  return isNonEmptyString(component.owner.id) ? component.owner.id : null;
}

function getTraceabilityReferenceId(component, referenceType) {
  if (!isPlainObject(component) || !isPlainObject(component.traceability)) {
    return null;
  }

  const reference = component.traceability[referenceType];

  if (!isPlainObject(reference)) {
    return null;
  }

  return isNonEmptyString(reference.id) ? reference.id : null;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  return Array.isArray(value) === false;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonEmptyStringArray(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  for (let index = 0; index < value.length; index += 1) {
    if (!isNonEmptyString(value[index])) {
      return false;
    }
  }

  return true;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  const frozenValue = Object.freeze(value);
  const keys = Object.keys(frozenValue);

  for (let index = 0; index < keys.length; index += 1) {
    deepFreeze(frozenValue[keys[index]]);
  }

  return frozenValue;
}
