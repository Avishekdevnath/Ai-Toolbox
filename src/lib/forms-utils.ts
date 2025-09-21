import mongoose, { Types } from 'mongoose';

export function coerceObjectId(value: string | Types.ObjectId): Types.ObjectId {
  if (value instanceof mongoose.Types.ObjectId) return value;
  return new mongoose.Types.ObjectId(String(value));
}

export function toResponseData(response: any, form: any) {
  const data: Record<string, any> = {};
  for (const a of response?.answers || []) data[a.fieldId] = a.value;
  const identity = {
    name: response?.responder?.name || null,
    email: response?.responder?.email || null,
    studentId: response?.responder?.studentId || null,
  };
  return {
    _id: response?._id,
    formId: response?.formId,
    data,
    identity,
    createdAt: response?.submittedAt || response?.createdAt,
    submittedAt: response?.submittedAt,
    startedAt: response?.startedAt,
    durationMs: response?.durationMs,
    responder: response?.responder,
  };
}

export async function countResponsesByFormIds(FormResponse: any, formIds: string[]) {
  const objectIds = formIds.map(coerceObjectId);
  let counts = objectIds.length
    ? await FormResponse.aggregate([
        { $match: { formId: { $in: objectIds } } },
        { $group: { _id: '$formId', count: { $sum: 1 } } },
      ])
    : [];

  if ((counts?.length || 0) === 0 && formIds.length > 0) {
    counts = await FormResponse.aggregate([
      { $addFields: { formIdStr: { $toString: '$formId' } } },
      { $match: { formIdStr: { $in: formIds.map(String) } } },
      { $group: { _id: '$formIdStr', count: { $sum: 1 } } },
    ]);
  }

  return new Map<string, number>(counts.map((c: any) => [String(c._id), c.count]));
}


