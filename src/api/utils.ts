import type { ObjectSchema } from "yup";

export const wrapError = (err: unknown) => {
  if (!err) {
    return new Error();
  }
  if (err instanceof Error) {
    return err;
  }
  if (typeof err === "string") {
    return new Error(err);
  }
  if (typeof err === "object" && "toString" in err) {
    return new Error(err.toString());
  }
  return new Error(JSON.stringify(err));
};

export const createParseAndValidateBody =
  <S extends ObjectSchema<{}>>(schema: S) =>
  (reqBody: unknown) => {
    try {
      const maybeBody = typeof reqBody === "string" ? JSON.parse(reqBody) : reqBody;
      return [null, schema.validateSync(maybeBody)] as const;
    } catch (err) {
      return [wrapError(err), null] as const;
    }
  };
