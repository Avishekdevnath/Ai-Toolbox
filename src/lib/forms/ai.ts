import { IForm } from '@/models/FormModel';
import { IFormResponse } from '@/models/FormResponseModel';

export async function summarizeResponses(form: IForm, responses: IFormResponse[]): Promise<{ summary: string }> {
  // Placeholder: integrate with your AI provider here
  const total = responses.length;
  const first = responses[0]?.submittedAt ? new Date(responses[0].submittedAt).toISOString() : 'n/a';
  return { summary: `There are ${total} responses. First response at ${first}.` };
}


