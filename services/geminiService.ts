import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Role, ImageSize } from "../types";

// Ensure API key exists
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.warn("API_KEY is missing in environment variables. Using fallback key.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'AIzaSyCgIseZsV8AuI9c2TB9NhFuuqclzpoBZt4' });

export const SYSTEM_INSTRUCTION = `
You are "Spark", an AI assistant that presents knowledge with the aesthetic of a high-end technology magazine.
Your Goal: "Spark inspiration, ignite creativity".

**CRITICAL OUTPUT STRUCTURE:**
Every comprehensive response MUST follow this markdown structure to mimic the Spark layout:

1.  **Dynamic Theme Color (MANDATORY)**: 
    *   Analyze the **Emotional Tone** and **Topic** of the content.
    *   Select a **Morandi Emotion Color** (muted, desaturated, elegant) using the strict palette below.
    *   Format: Start your ENTIRE response with the tag \`[THEME:#RRGGBB]\`.
    *   **Morandi Color Palette (Strictly follow this):**
        *   **Pink/Romance/Soft/Beauty**: \`[THEME:#AE88B5]\` (Morandi Purple-Pink)
        *   **Blue/Tech/Calm/Rational**: \`[THEME:#749FAE]\` (Morandi Blue)
        *   **Yellow/History/Warmth/Retro**: \`[THEME:#B5AE88]\` (Morandi Yellow-Khaki)
        *   **Green/Nature/Life/Healing**: \`[THEME:#88B596]\` (Morandi Green)
        *   **Orange/Energy/Creativity/Spark**: \`[THEME:#D68C6E]\` (Morandi Orange)
        *   **Purple/Mystery/Depth/Space**: \`[THEME:#8588B5]\` (Morandi Indigo)

2.  **Title (H2)**: A clear, engaging title (e.g., ## 为什么 “高峡出平湖”).

3.  **Cover Image (CONDITIONAL)**:
    *   **Rule**: Generate a cover image ONLY IF the response is primarily text/article based.
    *   **EXCEPTION**: Do NOT generate a cover image if you are generating a **Micro-App** (HTML code) or a **3D Model**.
    *   If generating a cover image:
        *   Generate a concise, high-quality English description for the scene.
        *   Format: \`[COVER_IMAGE_PROMPT: English description of the scene]\`
        *   Place this IMMEDIATELY after the Title.

4.  **Summary/Essence (Blockquote)**: A poetic or concise summary of the core concept. Use standard markdown blockquote (>).

5.  **Section 1: Context/History (H3)**: Background information (e.g., ### 一句诗的前世今生).

6.  **Data Sketch (Table)**: If the topic has numbers, dimensions, or stats, YOU MUST use a Markdown Table. This renders as the "Digital Sketch" section.

7.  **Section 2: Deep Dive (H3)**: Detailed analysis, often using numbered lists.

**3D Model Visualization (Special Case):**
If the user asks to see a "3D model", "3D structure", "Spatial view", or specific landmarks (e.g., "3D map of Potala Palace", "3D car model"):
1.  You MUST output a **Single File HTML** solution inside a \`\`\`html\`\`\` code block.
2.  **IMPORTANT**: The code MUST start with the comment \`<!-- 3D_MODEL_VIEWER -->\`.
3.  **SETUP (ES Modules)**:
    *   Use \`<script type="module">\`.
    *   Import THREE from \`https://esm.sh/three\`.
    *   Import OrbitControls from \`https://esm.sh/three/examples/jsm/controls/OrbitControls\`.
4.  **SCENE CONFIG**:
    *   **Background**: Set \`scene.background = new THREE.Color('#0a0a0e');\` (CRITICAL to match app theme).
    *   **Camera**: Use \`PerspectiveCamera\`. **IMPORTANT**: Set \`camera.position.z = 8\` (or appropriate distance) and \`camera.position.y = 2\` so the object is clearly visible from the start.
    *   **Controls**: \`const controls = new OrbitControls(camera, renderer.domElement);\`, \`controls.enableDamping = true;\`.
    *   **Lighting**: Add \`new THREE.AmbientLight(0xffffff, 0.6)\` AND \`new THREE.DirectionalLight(0xffffff, 1)\` positioned at (5, 10, 7).
    *   **Geometry**: Use geometric primitives (BoxGeometry, CylinderGeometry, ConeGeometry, etc.) to artistically/abstractly construct the object. Be creative with colors and materials (MeshStandardMaterial).
    *   **Animation**: Create an \`animate\` loop calling \`requestAnimationFrame\`, \`controls.update()\`, and \`renderer.render(scene, camera)\`.
    *   **Resize**: Handle \`window.addEventListener('resize', ...)\` to update \`camera.aspect\` and \`renderer.setSize\`.

**Micro-Apps & Interactive Code (CRITICAL):**
If the user asks to "create an app", "write a game", "make a visualization", "design a component" or similar:
1.  You MUST output a **Single File HTML** solution inside a \`\`\`html\`\`\` code block.
2.  **Format**:
    *   Include all CSS in \`<style>\` tags.
    *   Include all JS in \`<script>\` tags.
    *   Use **Tailwind CSS** via CDN for styling: \`<script src="https://cdn.tailwindcss.com"></script>\`.
    *   Ensure the app is responsive and looks modern (dark mode preferred to match the UI).
    *   Do NOT output separate \`css\` or \`js\` files. Everything must be in one \`html\` block.

**Image Generation (Text-to-Image & Image Editing):**
If the user explicitly asks to "generate an image", "draw a picture", "create an illustration", "visualize this", etc., OR if the user provides an image and asks to "edit", "modify", "filter" or "polish" it:
1.  Do NOT simply describe the image.
2.  Output a dedicated tag: \`[GENERATE_IMAGE: <detailed_english_prompt>]\`.
    *   If editing an image, the prompt should describe the **desired visual result** (e.g., "A cat with a retro filter applied").
3.  The system will detect this tag. If a source image was uploaded, it will use it as a reference for generation.

**Comic/Storyboard Generation:**
If the user asks for a "comic", "storyboard", "manga", or "sequential art" involving multiple panels/scenes:
1.  Output a dedicated tag: \`[GENERATE_COMIC: ["prompt for panel 1", "prompt for panel 2", ...]]\`.
2.  Provide a JSON array of 2-5 detailed English prompts.

**Style Rules:**
*   **Tone**: Professional, literary, objective, yet vivid.
*   **Formatting**:
    *   Use **Bold** for key terms.
    *   Use \`Code\` for technical terms.
    *   Use Tables for comparisons or specs.

**Example of "Data Sketch" Table:**
| 属性 | 数值 |
| :--- | :--- |
| 坝高 | 185 m |
| 坝长 | 2,309 m |
| 总库容 | 393 亿 m³ |

Ensure the content looks beautiful and structured.
`;

// Helper to generate image with multiple model fallbacks and optional source image for editing
const generateImage = async (
    prompt: string, 
    settings: { aspectRatio: '16:9' | '1:1' | '4:3' | '3:4', imageSize: ImageSize },
    sourceImage?: string // Base64 string
): Promise<string | null> => {
    const imageAi = new GoogleGenAI({ apiKey: process.env.API_KEY || 'AIzaSyCgIseZsV8AuI9c2TB9NhFuuqclzpoBZt4' });
    
    try {
        // Case 1: Image Editing (Source Image Provided)
        if (sourceImage) {
            console.log("Editing image with prompt:", prompt);
            const parts: any[] = [{ text: prompt }];
            
            const base64Data = sourceImage.split(',')[1];
            const mimeType = sourceImage.split(';')[0].split(':')[1];
            parts.push({ 
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                } 
            });

            // For editing, we use gemini-2.5-flash-image as it supports image input + text instructions
            const response = await imageAi.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    imageConfig: {
                        aspectRatio: settings.aspectRatio
                    }
                }
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        } 
        // Case 2: Pure Text-to-Image Generation (Cover Images)
        else {
            console.log("Generating image with Imagen 3.0:", prompt);
            const response = await imageAi.models.generateImages({
                model: 'imagen-3.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: settings.aspectRatio,
                    outputMimeType: 'image/jpeg'
                }
            });

            const base64Data = response.generatedImages?.[0]?.image?.imageBytes;
            if (base64Data) {
                return `data:image/jpeg;base64,${base64Data}`;
            }
        }

    } catch (e) {
         console.warn("Image generation failed, falling back.", e);
    }

    // Fallback to Pollinations if API fails
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${settings.aspectRatio === '16:9' ? 1280 : 1024}&height=${settings.aspectRatio === '16:9' ? 720 : 1024}&nologo=true`;
};

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  userLocation?: { latitude: number; longitude: number },
  image?: string,
  imageSettings: { size: ImageSize } = { size: '1K' }
): Promise<{ text: string; groundingChunks?: any[]; themeColor?: string }> => {
  
  // 1. Construct Contents
  const contents = history.map((msg) => {
    const parts: any[] = [{ text: msg.text }];
    if (msg.image) {
         const base64Data = msg.image.split(',')[1]; 
         const mimeType = msg.image.split(';')[0].split(':')[1];
         parts.push({
             inlineData: { mimeType, data: base64Data }
         });
    }
    return {
        role: msg.role === Role.USER ? 'user' : 'model',
        parts: parts
    };
  });

  // 2. Select Model (gemini-2.5-flash is best for chat/reasoning/multimodal input)
  const modelName = 'gemini-2.5-flash';

  // 3. Execute with Auto-Retry (Tools -> No Tools)
  let result;
  
  try {
      // Attempt 1: With Grounding Tools
      const tools: any[] = [
          { googleSearch: {} },
          { googleMaps: {} }
      ];
      const toolConfig = userLocation ? {
          retrievalConfig: {
              latLng: {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude
              }
          }
      } : undefined;

      result = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: tools,
          toolConfig: toolConfig,
        }
      });

  } catch (error: any) {
      // Handle 403 (Permission Denied) or other tool-related errors
      if (error.message?.includes('403') || error.status === 403 || error.code === 403) {
          console.warn("Grounding tools permission denied. Retrying without tools.");
          
          // Attempt 2: Without Tools
          result = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              // No tools, no toolConfig
            }
          });
      } else {
          // If it's another error, rethrow
          throw error;
      }
  }

  // 4. Process Result
  let text = result.text || "Unable to generate response.";
  let themeColor = undefined;

  // Theme Color
  const themeMatch = text.match(/^\[THEME:(#[0-9a-fA-F]{6})\]\s*/);
  if (themeMatch) {
      themeColor = themeMatch[1];
      text = text.replace(themeMatch[0], ''); 
  }
  
  // Cover Image (16:9)
  const imagePromptMatch = text.match(/\[COVER_IMAGE_PROMPT:(.+?)\]/);
  if (imagePromptMatch) {
      const imagePrompt = imagePromptMatch[1];
      let imageMarkdown = '';
      if (text.includes('```html') || text.includes('<!-- 3D_MODEL_VIEWER -->')) {
           text = text.replace(imagePromptMatch[0], '');
      } else {
          // Cover images usually purely generative, no source image needed
          const base64Image = await generateImage(imagePrompt, { aspectRatio: '16:9', imageSize: imageSettings.size }); 
          if (base64Image) {
              imageMarkdown = `![Cover Image](${base64Image})`;
          } else {
              imageMarkdown = `![Cover Image](https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1280&height=720&nologo=true)`;
          }
          text = text.replace(imagePromptMatch[0], imageMarkdown);
      }
  }

  // General Image Generation (1:1) - Supports Editing
  const genImageMatch = text.match(/\[GENERATE_IMAGE:(.+?)\]/);
  if (genImageMatch) {
      const genPrompt = genImageMatch[1];
      // Pass the user's uploaded image (if any) to the generator to enable editing
      const base64Image = await generateImage(genPrompt, { aspectRatio: '1:1', imageSize: imageSettings.size }, image);
      const genImageMarkdown = base64Image 
          ? `![Generated Image](${base64Image})` 
          : `![Generated Image](https://image.pollinations.ai/prompt/${encodeURIComponent(genPrompt)}?width=1024&height=1024&nologo=true)`;
      text = text.replace(genImageMatch[0], genImageMarkdown);
  }

  // Comic Generation
  const comicMatch = text.match(/\[GENERATE_COMIC:\s*(\[.*?\])\]/);
  if (comicMatch) {
      try {
          const prompts = JSON.parse(comicMatch[1]);
          if (Array.isArray(prompts)) {
              const imagePromises = prompts.map(p => generateImage(p, { aspectRatio: '16:9', imageSize: imageSettings.size }));
              const images = await Promise.all(imagePromises);
              
              const comicData = prompts.map((p, i) => ({
                  image: images[i] || `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?width=1024&height=576&nologo=true`,
                  caption: p
              }));
              
              const comicJson = JSON.stringify(comicData);
              const comicBlock = `\n\`\`\`comic-strip\n${comicJson}\n\`\`\`\n`;
              text = text.replace(comicMatch[0], comicBlock);
          }
      } catch (e) {
          console.error("Failed to parse comic prompts", e);
      }
  }

  const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return { text, groundingChunks, themeColor };
};