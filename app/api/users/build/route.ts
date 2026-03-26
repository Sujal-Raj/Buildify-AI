import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userPrompt = body.prompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
Generate a React + Tailwind project.

Return ONLY JSON in this format:
{
  "files": {
    "App.jsx": "",
    "index.js": "",
    "styles.css": ""
  }
}

Rules:
- Use functional React components
- Use Tailwind CSS
- No explanations
- No markdown
- Only JSON
- Do not use external libraries.
- Only React + Tailwind CSS.

User request:
${userPrompt}
      `,
    });

    
    // const text = response.text;
    const rawText = response.text;


if (!rawText) {
  return NextResponse.json({
    message: "AI returned empty response",
  }, { status: 500 });
}

const cleanText = rawText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const jsonMatch = cleanText.match(/{[\s\S]*}/);

if (!jsonMatch) {
  return NextResponse.json({
    message: "Invalid AI response",
    raw: rawText,
  });
}
    // ⚠️ Try parsing JSON safely
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({
        message: "AI returned invalid JSON",
        raw: rawText,
      });
    }

    return NextResponse.json({
      message: "Success",
      files: parsed.files,
    });

  } catch (error) {
    return NextResponse.json(
      { message: "Error", error: String(error) },
      { status: 500 }
    );
  }
}