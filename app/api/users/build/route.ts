import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const HARDCODED_FILES: Record<string, string> = {
  "src/main.jsx": `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

  "src/index.css": `*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}`,

  "vite.config.js": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});`,

  "package.json": JSON.stringify(
    {
      name: "my-app",
      private: true,
      version: "0.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
      },
      devDependencies: {
        "@vitejs/plugin-react": "^4.2.1",
        vite: "^5.1.4",
      },
    },
    null,
    2
  ),
};

function buildSystemPrompt() {
  return `You are an expert React + Tailwind CSS engineer who creates production-grade, visually stunning UI components.

Your job: Generate ONLY the src/App.jsx file for a Vite + React project.

STRICT RULES:
- Return ONLY valid JSON
- No markdown
- No explanations
- No backticks
- Format exactly:
{
  "files": {
    "src/App.jsx": "<full code>"
  }
}

- Use functional React components
- Use Tailwind CSS utility classes only
- No external UI libraries
- Export default App

CRITICAL:
Every component must include:

import { useEffect } from "react";

function useTailwind() {
  useEffect(() => {
    if (document.getElementById("tailwind-cdn")) return;

    const s = document.createElement("script");
    s.id = "tailwind-cdn";
    s.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(s);
  }, []);
}

and call:

useTailwind();

inside App.`;
}

function buildUserPrompt(
  userRequest: string,
  previousCode?: string,
  isFollowUp?: boolean
) {
  if (isFollowUp && previousCode) {
    return `Update this existing React component.

EXISTING CODE:

${previousCode}

USER REQUEST:
${userRequest}

Return ONLY:

{
  "files": {
    "src/App.jsx": "<complete updated code>"
  }
}`;
  }

  return `Create a React + Tailwind application.

USER REQUEST:
${userRequest}

Return ONLY:

{
  "files": {
    "src/App.jsx": "<complete code>"
  }
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const userPrompt: string = body.prompt;
    const previousCode: string | undefined = body.previousCode;
    const isFollowUp: boolean = body.isFollowUp ?? false;

    if (!userPrompt?.trim()) {
      return NextResponse.json(
        { message: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildUserPrompt(
        userPrompt,
        previousCode,
        isFollowUp
      ),
      config: {
        systemInstruction: buildSystemPrompt(),
        temperature: 0.7,
      },
    });

    const rawText = response.text;

    if (!rawText) {
      return NextResponse.json(
        { message: "AI returned empty response" },
        { status: 500 }
      );
    }

    const cleanText = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json(
        {
          message: "Invalid AI response format",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    let parsed: { files: Record<string, string> };

    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        {
          message: "AI returned invalid JSON",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    // Accept either key
    const appCode =
      parsed.files?.["src/App.jsx"] ??
      parsed.files?.["App.jsx"];

    if (!appCode) {
      return NextResponse.json(
        {
          message: "AI did not return App.jsx",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    parsed.files["src/App.jsx"] = appCode;

    delete parsed.files["App.jsx"];

    const allFiles: Record<string, string> = {
      ...HARDCODED_FILES,
      ...parsed.files,
    };

    return NextResponse.json({
      message: "Success",
      files: allFiles,
      generatedFiles: parsed.files,
    });
  } catch (error) {
    console.error("Build API error:", error);

    return NextResponse.json(
      {
        message: "Internal server error",
        error: String(error),
      },
      { status: 500 }
    );
  }
}