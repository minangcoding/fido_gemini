import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({});
async function main() {
  const response = await ai.models.list();
  console.log(response.models.map(m => m.name).join('\n'));
}
main();
