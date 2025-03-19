import { Transform, TransformFnParams } from 'class-transformer';
import { Types } from 'mongoose';

export const TransformMongoId = () => {
  return Transform((params: TransformFnParams) => {
    const value = params.value;
    if (!value) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) =>
        typeof item === 'string' ? new Types.ObjectId(item) : item,
      );
    }
    return typeof value === 'string' ? new Types.ObjectId(value) : value;
  });
};
