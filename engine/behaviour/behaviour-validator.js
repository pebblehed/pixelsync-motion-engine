/**
 * PixelSync Motion Engine
 * File: engine/behaviour/behaviour-validator.js
 *
 * Responsibility:
 * Determines whether a governed Production Behaviour satisfies PSME-STD-006.
 *
 * Governance Inheritance:
 * - PSME-ARC-006 Production Behaviour Architecture
 * - PSME-STD-005 Production Behaviour Engineering Standard
 * - PSME-ARC-007 Production Behaviour Domain Model
 * - PSME-STD-006 Production Behaviour Validation Standard
 * - PSME-IMP-001 Production Behaviour Implementation Model
 * - Production Behaviour Implementation Plan
 *
 * Explicit Non-Responsibilities:
 * - No Behaviour creation.
 * - No Behaviour evaluation.
 * - No Behaviour Outcome creation or evaluation.
 * - No runtime-state, production-state, or render-state mutation.
 * - No rendering, scheduling, interpolation, or animation.
 * - No browser, operating-system, network, or device APIs.
 * - No external dependencies.
 */

const CATEGORY_ORDER = Object.freeze([
  {
    key: "identity",
    requirement: "PSME-STD-006 Behaviour Identity Validation",
    validate: validateIdentityCategory,
  },
  {
    key: "ownership",
    requirement: "PSME-STD-006 Behaviour Ownership Validation",
    validate: validateOwnershipCategory,
  },
  {
    key: "inheritedAuthority",
    requirement: "PSME-STD-006 Behaviour Authority Validation",
    validate: validateInheritedAuthorityCategory,
  },
  {
    key: "governedIntent",
    requirement: "PSME-STD-006 Behaviour Intent Validation",
    validate: validateGovernedIntentCategory,
  },
  {
    key: "governedRelationships",
    requirement: "PSME-STD-006 Behaviour Relationship Validation",
    validate: validateGovernedRelationshipsCategory,
  },
  {
    key: "constitutionalTraceability",
    requirement: "PSME-STD-006 Behaviour Traceability Validation",
    validate: validateConstitutionalTraceabilityCategory,
  },
  {
    key: "domainConstraints",
    requirement: "PSME-STD-006 Behaviour Domain Validation",
    validate: validateDomainConstraintsCategory,
  },
  {
    key: "separation",
    requirement: "PSME-STD-006 Separation Validation",
    validate: validateSeparationCategory,
  },
  {
    key: "evaluationReadiness",
    requirement: "PSME-STD-006 Behaviour Evaluation Readiness",
    validate: validateEvaluationReadinessCategory,
  },
]);

const REQUIRED_RELATIONSHIP_TYPES = Object.freeze([
  "production",
  "story",
  "scene",
  "sequence",
  "component",
]);

const PROHIBITED_TOP_LEVEL_SEPARATION_FIELDS = Object.freeze([
  "rendering",
  "render",
  "renderer",
  "renderOutput",
  "renderedOutput",
  "runtimeStateMutation",
  "productionStateMutation",
  "runtimeMutation",
  "productionMutation",
  "mutationInstruction",
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

export function validateBehaviour(behaviour) {
  const affectedBehaviour = describeBehaviour(behaviour);
  const context = {
    behaviour,
    affectedBehaviour,
    categories: {},
  };

  for (let index = 0; index < CATEGORY_ORDER.length; index += 1) {
    const categoryDefinition = CATEGORY_ORDER[index];
    context.categories[categoryDefinition.key] = categoryDefinition.validate(
      context,
      categoryDefinition,
    );
  }

  const failures = [];

  for (let index = 0; index < CATEGORY_ORDER.length; index += 1) {
    const categoryDefinition = CATEGORY_ORDER[index];
    const category = context.categories[categoryDefinition.key];

    for (
      let failureIndex = 0;
      failureIndex < category.failures.length;
      failureIndex += 1
    ) {
      failures.push(category.failures[failureIndex]);
    }
  }

  const valid = failures.length === 0;

  return deepFreeze({
    type: "behaviour-validation-outcome",
    behaviour: affectedBehaviour,
    valid,
    status: valid ? "valid" : "invalid",
    categories: context.categories,
    failures,
  });
}

function validateIdentityCategory(context, definition) {
  const failures = [];
  const { behaviour } = context;

  if (!isPlainObject(behaviour)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (behaviour.type !== "behaviour") {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        'Behaviour.type must be "behaviour".',
      ),
    );
  }

  if (!isPlainObject(behaviour.identity)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour.identity must be present as an explicit governed concept object.",
      ),
    );
  }

  if (isPlainObject(behaviour.identity)) {
    if (!isNonEmptyString(behaviour.identity.id)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.identity.id must be a non-empty string.",
        ),
      );
    }

    if (!isNonEmptyString(behaviour.identity.scope)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.identity.scope must be a non-empty string.",
        ),
      );
    }
  }

  // Contextual identity uniqueness requires governed comparison context and is not provable from one Behaviour alone.

  return createCategoryOutcome(definition, failures);
}

function validateOwnershipCategory(context, definition) {
  const failures = [];
  const { behaviour } = context;

  if (!isPlainObject(behaviour)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!isPlainObject(behaviour.owner)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour.owner must be present as an explicit governed concept object.",
      ),
    );
  }

  if (Object.prototype.hasOwnProperty.call(behaviour, "owners")) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        'Behaviour must not represent plural ownership via "owners".',
      ),
    );
  }

  if (isPlainObject(behaviour.owner)) {
    if (behaviour.owner.type !== "component") {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          'Behaviour.owner.type must be "component".',
        ),
      );
    }

    if (!isNonEmptyString(behaviour.owner.id)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.owner.id must be a non-empty string.",
        ),
      );
    }
  }

  const componentRelationshipId = getRelationshipId(behaviour, "component");

  if (
    isNonEmptyString(componentRelationshipId) &&
    isNonEmptyString(getOwnerId(behaviour)) &&
    componentRelationshipId !== behaviour.owner.id
  ) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour.owner.id must match relationships.component.id when both are represented.",
      ),
    );
  }

  return createCategoryOutcome(definition, failures);
}

function validateInheritedAuthorityCategory(context, definition) {
  const failures = [];
  const { behaviour } = context;

  if (!isPlainObject(behaviour)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!isPlainObject(behaviour.authority)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour.authority must be present as an explicit governed concept object.",
      ),
    );
  }

  if (isPlainObject(behaviour.authority)) {
    if (behaviour.authority.inherited !== true) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.authority.inherited must be true.",
        ),
      );
    }

    if (!isNonEmptyString(behaviour.authority.ownerId)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.authority.ownerId must be a non-empty string.",
        ),
      );
    }

    if (!isNonEmptyStringArray(behaviour.authority.sources)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.authority.sources must be a non-empty array of non-empty strings.",
        ),
      );
    }

    if (
      isNonEmptyString(behaviour.authority.ownerId) &&
      isNonEmptyString(getOwnerId(behaviour)) &&
      behaviour.authority.ownerId !== behaviour.owner.id
    ) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.authority.ownerId must match Behaviour.owner.id when both are represented.",
        ),
      );
    }

    if (
      isNonEmptyString(getIdentityId(behaviour)) &&
      Array.isArray(behaviour.authority.sources) &&
      behaviour.authority.sources.indexOf(behaviour.identity.id) !== -1
    ) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour must not explicitly represent itself as the source of its own authority.",
        ),
      );
    }
  }

  // Recognition of declared authority sources is contextual evidence and cannot be proven here without governed validation context.

  return createCategoryOutcome(definition, failures);
}

function validateGovernedIntentCategory(context, definition) {
  const failures = [];
  const { behaviour } = context;

  if (!isPlainObject(behaviour)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!isPlainObject(behaviour.intent)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour.intent must be present as an explicit governed concept object.",
      ),
    );
  }

  if (isPlainObject(behaviour.intent)) {
    if (!isNonEmptyString(behaviour.intent.objective)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.intent.objective must be a non-empty string.",
        ),
      );
    }

    if (!isNonEmptyString(behaviour.intent.responsibility)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.intent.responsibility must be a non-empty string.",
        ),
      );
    }
  }

  // External approval of intent source is contextual evidence and cannot be proven from a single Behaviour.

  return createCategoryOutcome(definition, failures);
}

function validateGovernedRelationshipsCategory(context, definition) {
  const failures = [];
  const { behaviour } = context;

  if (!isPlainObject(behaviour)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!isPlainObject(behaviour.relationships)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour.relationships must be present as an explicit governed concept object.",
      ),
    );
  }

  if (isPlainObject(behaviour.relationships)) {
    for (
      let relationshipIndex = 0;
      relationshipIndex < REQUIRED_RELATIONSHIP_TYPES.length;
      relationshipIndex += 1
    ) {
      const relationshipName = REQUIRED_RELATIONSHIP_TYPES[relationshipIndex];
      const relationship = behaviour.relationships[relationshipName];

      if (!isPlainObject(relationship)) {
        failures.push(
          createFailure(
            definition,
            context.affectedBehaviour,
            "Behaviour.relationships." +
              relationshipName +
              " must be a plain object.",
          ),
        );
        continue;
      }

      if (relationship.type !== relationshipName) {
        failures.push(
          createFailure(
            definition,
            context.affectedBehaviour,
            "Behaviour.relationships." +
              relationshipName +
              '.type must equal "' +
              relationshipName +
              '".',
          ),
        );
      }

      if (!isNonEmptyString(relationship.id)) {
        failures.push(
          createFailure(
            definition,
            context.affectedBehaviour,
            "Behaviour.relationships." +
              relationshipName +
              ".id must be a non-empty string.",
          ),
        );
      }
    }
  }

  const componentRelationshipId = getRelationshipId(behaviour, "component");

  if (
    isNonEmptyString(componentRelationshipId) &&
    isNonEmptyString(getOwnerId(behaviour)) &&
    componentRelationshipId !== behaviour.owner.id
  ) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour.relationships.component.id must match Behaviour.owner.id.",
      ),
    );
  }

  if (
    isNonEmptyString(componentRelationshipId) &&
    isNonEmptyString(getIdentityScope(behaviour)) &&
    componentRelationshipId !== behaviour.identity.scope
  ) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour.relationships.component.id must match Behaviour.identity.scope.",
      ),
    );
  }

  // Existence of referenced entities is contextual evidence and cannot be proven from a single Behaviour.

  return createCategoryOutcome(definition, failures);
}

function validateDomainConstraintsCategory(context, definition) {
  const failures = [];
  const { behaviour } = context;

  if (!isPlainObject(behaviour)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (behaviour.type !== "behaviour") {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        'Behaviour.type must remain the governed domain entity type "behaviour".',
      ),
    );
  }

  failWhenCategoryInvalid(
    context,
    failures,
    "identity",
    "Behaviour domain constraints require one valid identity.",
  );
  failWhenCategoryInvalid(
    context,
    failures,
    "ownership",
    "Behaviour domain constraints require exactly one valid owner.",
  );
  failWhenCategoryInvalid(
    context,
    failures,
    "inheritedAuthority",
    "Behaviour domain constraints require inherited authority.",
  );
  failWhenCategoryInvalid(
    context,
    failures,
    "governedIntent",
    "Behaviour domain constraints require one valid governed intent.",
  );
  failWhenCategoryInvalid(
    context,
    failures,
    "governedRelationships",
    "Behaviour domain constraints require complete governed production relationships.",
  );
  failWhenCategoryInvalid(
    context,
    failures,
    "constitutionalTraceability",
    "Behaviour domain constraints require constitutional traceability.",
  );

  if (
    containsAnyOwnProperty(behaviour, ["evaluation", "behaviourEvaluation"])
  ) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour domain constraints forbid top-level Behaviour Evaluation data in Behaviour definition.",
      ),
    );
  }

  if (containsAnyOwnProperty(behaviour, ["outcome", "behaviourOutcome"])) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour domain constraints forbid top-level Behaviour Outcome data in Behaviour definition.",
      ),
    );
  }

  return createCategoryOutcome(definition, failures);
}

function validateConstitutionalTraceabilityCategory(context, definition) {
  const failures = [];
  const { behaviour } = context;

  if (!isPlainObject(behaviour)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour definition must be an object.",
      ),
    );

    return createCategoryOutcome(definition, failures);
  }

  if (!isPlainObject(behaviour.traceability)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour.traceability must be present as an explicit governed concept object.",
      ),
    );
  }

  if (isPlainObject(behaviour.traceability)) {
    if (!isNonEmptyStringArray(behaviour.traceability.constitutionalSources)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.traceability.constitutionalSources must be a non-empty array of non-empty strings.",
        ),
      );
    }

    if (!isNonEmptyString(behaviour.traceability.intentSource)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.traceability.intentSource must be a non-empty string.",
        ),
      );
    }

    if (!isNonEmptyString(behaviour.traceability.behaviourId)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.traceability.behaviourId must be a non-empty string.",
        ),
      );
    }

    if (!isNonEmptyString(behaviour.traceability.ownerId)) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.traceability.ownerId must be a non-empty string.",
        ),
      );
    }

    if (
      isNonEmptyString(behaviour.traceability.behaviourId) &&
      isNonEmptyString(getIdentityId(behaviour)) &&
      behaviour.traceability.behaviourId !== behaviour.identity.id
    ) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.traceability.behaviourId must match Behaviour.identity.id.",
        ),
      );
    }

    if (
      isNonEmptyString(behaviour.traceability.ownerId) &&
      isNonEmptyString(getOwnerId(behaviour)) &&
      behaviour.traceability.ownerId !== behaviour.owner.id
    ) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          "Behaviour.traceability.ownerId must match Behaviour.owner.id.",
        ),
      );
    }
  }

  // External approval of declared sources is contextual evidence and cannot be proven from one Behaviour representation.

  return createCategoryOutcome(definition, failures);
}

function validateSeparationCategory(context, definition) {
  const failures = [];
  const { behaviour } = context;

  if (!isPlainObject(behaviour)) {
    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        "Behaviour definition must be an object.",
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

    if (!Object.prototype.hasOwnProperty.call(behaviour, prohibitedField)) {
      continue;
    }

    failures.push(
      createFailure(
        definition,
        context.affectedBehaviour,
        'Behaviour must remain separate from rendering, implementation dependencies, and embedded evaluation/outcome data; prohibited top-level field "' +
          prohibitedField +
          '" is present.',
      ),
    );
  }

  return createCategoryOutcome(definition, failures);
}

function validateEvaluationReadinessCategory(context, definition) {
  const failures = [];
  const blockingCategories = [
    "identity",
    "ownership",
    "inheritedAuthority",
    "governedIntent",
    "governedRelationships",
    "domainConstraints",
    "constitutionalTraceability",
    "separation",
  ];

  for (let index = 0; index < blockingCategories.length; index += 1) {
    const categoryKey = blockingCategories[index];

    if (context.categories[categoryKey].valid !== true) {
      failures.push(
        createFailure(
          definition,
          context.affectedBehaviour,
          'Behaviour is not evaluation-ready because category "' +
            categoryKey +
            '" did not pass.',
        ),
      );
    }
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

function createFailure(definition, affectedBehaviour, reason) {
  return {
    category: definition.key,
    requirement: definition.requirement,
    affectedBehaviour,
    reason,
  };
}

function describeBehaviour(behaviour) {
  if (!isPlainObject(behaviour)) {
    return {
      type: null,
      identity: null,
      owner: null,
    };
  }

  return {
    type: isNonEmptyString(behaviour.type) ? behaviour.type : null,
    identity: isPlainObject(behaviour.identity) ? "present" : null,
    owner: isPlainObject(behaviour.owner) ? "present" : null,
  };
}

function failWhenCategoryInvalid(context, failures, categoryKey, reason) {
  if (context.categories[categoryKey].valid === true) {
    return;
  }

  const definition = CATEGORY_ORDER[5];

  failures.push(createFailure(definition, context.affectedBehaviour, reason));
}

function containsAnyOwnProperty(value, keys) {
  for (let index = 0; index < keys.length; index += 1) {
    if (Object.prototype.hasOwnProperty.call(value, keys[index])) {
      return true;
    }
  }

  return false;
}

function getIdentityId(behaviour) {
  if (!isPlainObject(behaviour) || !isPlainObject(behaviour.identity)) {
    return null;
  }

  return isNonEmptyString(behaviour.identity.id) ? behaviour.identity.id : null;
}

function getIdentityScope(behaviour) {
  if (!isPlainObject(behaviour) || !isPlainObject(behaviour.identity)) {
    return null;
  }

  return isNonEmptyString(behaviour.identity.scope)
    ? behaviour.identity.scope
    : null;
}

function getOwnerId(behaviour) {
  if (!isPlainObject(behaviour) || !isPlainObject(behaviour.owner)) {
    return null;
  }

  return isNonEmptyString(behaviour.owner.id) ? behaviour.owner.id : null;
}

function getRelationshipId(behaviour, relationshipName) {
  if (!isPlainObject(behaviour) || !isPlainObject(behaviour.relationships)) {
    return null;
  }

  const relationship = behaviour.relationships[relationshipName];

  if (!isPlainObject(relationship)) {
    return null;
  }

  return isNonEmptyString(relationship.id) ? relationship.id : null;
}

function isPlainObject(value) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    Array.isArray(value) === false
  );
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
