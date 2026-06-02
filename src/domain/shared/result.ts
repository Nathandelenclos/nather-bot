export type Result<T, E extends Error = Error> = { ok: true; value: T } | { ok: false; error: E };

export const Result = {
  ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
  },
  fail<E extends Error>(error: E): Result<never, E> {
    return { ok: false, error };
  },
};
