// Caminho relativo ao projeto: src/agents/text-diagnose.agent.ts
import { Injectable } from '@nestjs/common';

const OPENAI_TEXT_DIAGNOSIS_DISABLED_MESSAGE =
  'Integração com OpenAI desativada.';

@Injectable()
export class TextDiagnoseAgent {
  constructor() {}

  async diagnose(text: string): Promise<string> {
    try {
      // return await this.openai.generateDiagnosis(text); // Integração OpenAI desativada
      return OPENAI_TEXT_DIAGNOSIS_DISABLED_MESSAGE;
    } catch (error) {
      console.error('TextDiagnoseAgent.diagnose error:', error);
      throw error;
    }
  }
}
