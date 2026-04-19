/** Sample program row for the learner “preview offerings” catalog (only providers in our DB). */
export type ProgramOffering = {
  id: number;
  providerId: number;
  providerName: string;
  title: string;
  credential: string | null;
  modality: string | null;
  durationSummary: string | null;
  summary: string;
};
