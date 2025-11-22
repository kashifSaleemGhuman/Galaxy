import { randomUUID } from 'crypto';

export const normalizeAttributes = (input) => {
  if (!input) {
    return {};
  }

  if (Array.isArray(input)) {
    return input.reduce((acc, entry) => {
      if (!entry) return acc;
      const key = typeof entry.key === 'string' ? entry.key.trim() : '';
      if (!key) return acc;
      const value = entry.value ?? '';
      acc[key] = typeof value === 'string' ? value.trim() : value;
      return acc;
    }, {});
  }

  if (typeof input === 'object') {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const trimmedKey = typeof key === 'string' ? key.trim() : '';
      if (!trimmedKey) return acc;
      acc[trimmedKey] = typeof value === 'string' ? value.trim() : value ?? '';
      return acc;
    }, {});
  }

  return {};
};

export const normalizeTraceabilityQuestions = (input = []) => {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((question, index) => {
      if (!question) return null;
      const promptSource = typeof question.prompt === 'string'
        ? question.prompt
        : typeof question.label === 'string'
          ? question.label
          : '';
      const prompt = promptSource.trim();
      if (!prompt) return null;

      const id =
        (typeof question.id === 'string' && question.id.trim()) ||
        (typeof question.key === 'string' && question.key.trim()) ||
        `traceability-${Date.now()}-${index}-${randomUUID()}`;

      return {
        id,
        prompt,
        type: typeof question.type === 'string' ? question.type : 'text',
        required: question.required !== false,
        placeholder:
          typeof question.placeholder === 'string'
            ? question.placeholder
            : undefined,
      };
    })
    .filter(Boolean);
};

