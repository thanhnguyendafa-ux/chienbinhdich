export const DELIVERY_MODE_MASTERY = 'mastery';
export const DELIVERY_MODE_ASSESS = 'assess';
export const CURRENT_DELIVERY_CONTRACT_VERSION = 1;
export const DELIVERY_MODES = Object.freeze([DELIVERY_MODE_MASTERY, DELIVERY_MODE_ASSESS]);

export function normalizeDeliveryMode(value, { legacyDefault = DELIVERY_MODE_MASTERY } = {}) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (DELIVERY_MODES.includes(normalized)) return normalized;
  if (!normalized && DELIVERY_MODES.includes(legacyDefault)) return legacyDefault;
  throw deliveryModeError('delivery_mode_invalid', `Unsupported delivery mode: ${value}`);
}

export function resolveDeliveryMode(source) {
  return normalizeDeliveryMode(source?.deliveryMode ?? source?.deliveryModeAtStart ?? '');
}

export function deliverySnapshotFor(mode, version = CURRENT_DELIVERY_CONTRACT_VERSION) {
  const deliveryModeAtStart = normalizeDeliveryMode(mode);
  const numericVersion = Number(version);
  if (!Number.isInteger(numericVersion) || numericVersion < 1) {
    throw deliveryModeError('delivery_contract_invalid', 'Delivery contract version must be a positive integer.');
  }
  return Object.freeze({
    deliveryModeAtStart,
    deliveryContractVersionAtStart: numericVersion
  });
}

export function sessionDeliveryMode(session) {
  return normalizeDeliveryMode(session?.deliveryModeAtStart ?? '', { legacyDefault: DELIVERY_MODE_MASTERY });
}

export function isAssessSession(session) {
  return sessionDeliveryMode(session) === DELIVERY_MODE_ASSESS;
}

function deliveryModeError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
