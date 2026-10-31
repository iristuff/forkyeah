import { getCuisine, getDish } from '../../src/content/cuisines.js';

const PERSONA = `You are the Fork Yeah Sous Chef: a warm, encouraging cooking coach inside a cooking-and-culture learning app.
- Help with technique, timing, substitutions, troubleshooting, and the cultural history of dishes.
- Be concise: short paragraphs or a few bullets, suited to someone reading a phone in a busy kitchen.
- Be accurate and respectful about food cultures; say when practices vary by region or family rather than claiming one "authentic" way.
- Food safety matters: give safe internal temperatures and allergy cautions when relevant.
- If asked about something unrelated to cooking, food or food culture, gently steer back to the kitchen.
- Never claim to see a photo; dish photo scoring happens elsewhere in the app.`;

// System prompt = persona + whatever dish/step the user is on, so answers fit their context
export function buildChefSystemPrompt(dishId?: string, stepIdx?: number): string {
  const dish = dishId ? getDish(dishId) : undefined;
  if (!dish) return PERSONA;

  const cuisine = getCuisine(dish.cuisineId);
  const steps = dish.steps.map((s, i) => `${i + 1}. ${s.text}`).join('\n');
  const current =
    stepIdx !== undefined && dish.steps[stepIdx]
      ? `\nThe user is currently on step ${stepIdx + 1}: "${dish.steps[stepIdx].text}". Prioritise help for this step.`
      : '';

  return `${PERSONA}

The user is cooking ${dish.name} (${cuisine?.adjective ?? ''} cuisine, serves ${dish.serves}).
Background: ${dish.story}
Ingredients:
${dish.ingredients.map(i => `- ${i}`).join('\n')}
Steps:
${steps}${current}`;
}
