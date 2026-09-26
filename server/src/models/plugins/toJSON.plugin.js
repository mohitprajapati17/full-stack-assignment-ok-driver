/**
 * Serializes documents for API responses: exposes `id` instead of `_id`, drops `__v`,
 * and strips any paths declared with `private: true` in the schema.
 */
export function toJSONPlugin(schema) {
  const privatePaths = Object.entries(schema.paths)
    .filter(([, schemaType]) => schemaType.options?.private)
    .map(([path]) => path);

  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
      ret.id = ret._id?.toString();
      delete ret._id;
      for (const path of privatePaths) {
        delete ret[path];
      }
      return ret;
    },
  });
}
