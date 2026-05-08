import { z } from 'zod';

export const submitTestSchema = z.object({
  body: z.object({
    answers: z.record(z.string(), z.string()), // questionId: selectedOption
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type SubmitTestInput = z.infer<typeof submitTestSchema>['body'];
