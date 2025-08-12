import OpenAI from "openai";
import { config } from "../../config";

export interface IAIProvider {
  generateText(prompt: string, userPayload: any): Promise<any>;
}

// TODO: create custom error
export class OpenAIProvider implements IAIProvider {
  private openai: OpenAI;

  constructor() {
    if (!config.openai?.apiKey) {
      throw new Error(
        "OpenAI API key is required. Please set OPENAI_API_KEY environment variable.",
      );
    }

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateText(systemPrompt: string, userPayload: any): Promise<any> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      return JSON.parse(content);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error("Unknown OpenAI API error");
    }
  }
}
