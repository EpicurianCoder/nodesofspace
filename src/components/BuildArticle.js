import { GoogleGenerativeAI } from "@google/generative-ai";
import tags from '@/lib/tags.json';

const BuildArticle = async (fullDescription) => {
  const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!GEMINI_KEY) {
    console.error("Missing Gemini key.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(GEMINI_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `
            Using the description labels here: ${fullDescription}, use the JSON: ${JSON.stringify(tags)} 
            as a reference. Return a JSON containing ALL the keys from the sample and the most relevant 
            SINGLE value under each key. Only one value per key if there is a relative match, 
            otherwise null. For Description, add one highly descriptive sentence of the item, 
            and for the 'Name', come up with an accurate name that is 3 words or less, do not 
            make assumption on what the objects is, rather keep the name simple in order to be 
            more accurate.'GeographicOrigin' should only have one value assigned.
          `
        }]
      }]
    });

    return result.response.text();
  } catch (err) {
    console.error("Gemini API failed:", err.message);
    return null;
  }
};

export default BuildArticle;