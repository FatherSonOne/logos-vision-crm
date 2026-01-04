

// Dynamic import to avoid loading library before API key is available
// FIX: Rename 'Document' to 'AppDocument' to avoid name collision with the global DOM Document type.
import type { Project, TeamMember, Client, Task, WebpageComponent, ChatMessage, EnrichedTask, Activity, Volunteer, Case, Document as AppDocument, WebSearchResult, Donation, Event, RecommendedVolunteer, AiProjectPlan, MeetingAnalysisResult } from '../types';
import { TaskStatus, CasePriority, ActivityStatus, CaseStatus } from '../types';
import { Type, Modality } from '@google/genai';

// IMPORTANT: Do not expose your API key in client-side code in a real application.
// This is for demonstration purposes only. In a production environment, this call
// should be made from a secure backend server.

// Lazy initialization to ensure environment variables are loaded
let ai: any = null;
let GoogleGenAI: any = null;

async function getAI() {
  if (!ai) {
    // Dynamically import the library only when needed
    const genai = await import('@google/genai');
    GoogleGenAI = genai.GoogleGenAI;
    
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.warn('VITE_API_KEY not found. AI features will be disabled.');
      ai = new GoogleGenAI({ apiKey: 'not-configured' });
    } else {
      ai = new GoogleGenAI({ apiKey });
    }
  }
  return ai;
}

// --- Project Management AI ---

export async function generateProjectSummary(
  project: Project,
  client: Client,
  allTeamMembers: TeamMember[],
): Promise<{ summary: string; sources: any[] }> {
  if (!import.meta.env.VITE_API_KEY) {
    return { summary: "API key is not configured.", sources: [] };
  }
    
  const prompt = `
    Generate a concise and professional project summary for a project management CRM named Logos Vision.
    The summary should be suitable for a status report to stakeholders.
    Also, find recent news or developments related to the client's industry, which is non-profit consulting focused on "${client.name}".
    Do not use markdown formatting like headings or bullet points, write it as 2-3 paragraphs of plain text.

    Project Details:
    - Name: ${project.name}
    - Client: ${client.name}
    - Description: ${project.description}
    - Status: ${project.status}

    Based on the information above and recent web search results, provide a summary covering the project's objective, current status, and any relevant external context.
  `;

  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { summary: response.text, sources: groundingChunks };
  } catch (error) {
    console.error("Error generating project summary:", error);
    return { summary: "An error occurred while generating the summary.", sources: [] };
  }
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface RiskAnalysisResult {
  riskLevel: RiskLevel;
  explanation: string;
}

const riskAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        riskLevel: {
            type: Type.STRING,
            enum: ['Low', 'Medium', 'High'],
            description: 'The assessed risk level for the project.'
        },
        explanation: {
            type: Type.STRING,
            description: 'A concise, natural-language explanation for the assessed risk level, highlighting specific tasks or cases of concern.'
        }
    },
    required: ['riskLevel', 'explanation']
};

export async function analyzeProjectRisk(
  project: Project,
  cases: Case[]
): Promise<RiskAnalysisResult> {
  if (!import.meta.env.VITE_API_KEY) {
    return { riskLevel: 'Low', explanation: 'API key not configured.' };
  }

  const today = new Date().toISOString().split('T')[0];

  const relevantCases = cases
    .filter(c => c.priority === CasePriority.High && c.status !== CaseStatus.Closed && c.status !== CaseStatus.Resolved)
    .map(c => `- High-priority case: "${c.title}" (Status: ${c.status}) created on ${new Date(c.createdAt).toLocaleDateString()}`).join('\n');

  const upcomingOrOverdueTasks = project.tasks
    .filter(t => t.status !== TaskStatus.Done)
    .map(t => `- Task: "${t.description}" (Status: ${t.status}) due on ${new Date(t.dueDate).toLocaleDateString()}`).join('\n');

  const prompt = `
    As a proactive project management assistant for a non-profit consulting CRM, analyze the following project data to assess its risk level.
    The current date is ${today}.

    **Project Details:**
    - Name: ${project.name}
    - Description: ${project.description}
    - Status: ${project.status}
    - Start Date: ${project.startDate}
    - End Date: ${project.endDate}

    **Upcoming or Overdue Tasks:**
    ${upcomingOrOverdueTasks || 'No outstanding tasks.'}

    **High-Priority Open Cases for this Client:**
    ${relevantCases || 'No high-priority open cases for this client.'}

    **Analysis Instructions:**
    1.  Evaluate the project's health based on overdue tasks, tasks due soon, project status, and any high-priority open cases that could impact the project.
    2.  Determine a risk level: 'Low' (on track), 'Medium' (some concerns, potential delays), or 'High' (significant issues, high chance of failure or major delay).
    3.  Provide a concise, professional explanation for your assessment. Mention specific tasks or cases that are contributing to the risk. For example, "Risk is Medium because two critical tasks are due within 7 days but are still 'To Do', and a high-priority case regarding a contract was recently opened."
    4.  Return the result as a JSON object adhering to the provided schema.
  `;

  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: riskAnalysisSchema,
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error analyzing project risk:", error);
    return { riskLevel: 'Low', explanation: 'An error occurred during risk analysis.' };
  }
}

const projectPlanSchema = {
    type: Type.OBJECT,
    properties: {
        projectName: { type: Type.STRING, description: 'A clear, concise name for the project.' },
        description: { type: Type.STRING, description: 'A one-paragraph summary of the project plan.' },
        phases: {
            type: Type.ARRAY,
            description: 'An array of project phases.',
            items: {
                type: Type.OBJECT,
                properties: {
                    phaseName: { type: Type.STRING, description: 'The name of the phase (e.g., "Planning & Logistics").' },
                    tasks: {
                        type: Type.ARRAY,
                        description: 'A list of specific, actionable tasks for this phase.',
                        items: { type: Type.STRING }
                    }
                },
                required: ['phaseName', 'tasks']
            }
        }
    },
    required: ['projectName', 'description', 'phases']
};

export async function generateProjectPlan(goal: string): Promise<AiProjectPlan> {
    if (!import.meta.env.VITE_API_KEY) {
        return { projectName: 'Error', description: 'API key not configured.', phases: [] };
    }

    const prompt = `
        You are an expert project manager for a non-profit consulting firm.
        Based on the user's high-level goal, generate a structured project plan.
        
        **User's Goal:**
        "${goal}"

        **Instructions:**
        1.  Create a clear and professional project name.
        2.  Write a brief, one-paragraph description of the project.
        3.  Break the project down into 3-5 logical phases (e.g., "Planning", "Execution", "Post-Event").
        4.  For each phase, list 3-5 specific, actionable tasks.
        5.  Return the entire plan as a single JSON object that strictly adheres to the provided schema.
    `;

    try {
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: projectPlanSchema,
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating project plan:", error);
        return {
            projectName: "Plan Generation Failed",
            description: "An error occurred while trying to generate the project plan. The model may have returned an unexpected format. Please try again.",
            phases: [],
            error: "An error occurred while generating the plan."
        };
    }
}

export interface DonorInsightsResult {
    insights: string;
    suggestion: {
        text: string;
        actionType: 'ScheduleCall' | 'DraftEmail' | 'None';
        actionTitle?: string;
    };
}

const donorInsightsSchema = {
    type: Type.OBJECT,
    properties: {
        insights: {
            type: Type.STRING,
            description: "A concise, 1-2 sentence summary of the donor's behavior, highlighting patterns, trends, or key statistics."
        },
        suggestion: {
            type: Type.OBJECT,
            properties: {
                text: {
                    type: Type.STRING,
                    description: "A single, concrete, actionable next step for the user to take to engage this donor."
                },
                actionType: {
                    type: Type.STRING,
                    enum: ['ScheduleCall', 'DraftEmail', 'None'],
                    description: "The type of action suggested. Use 'ScheduleCall' for follow-ups, 'DraftEmail' for outreach, and 'None' if no specific action is needed."
                },
                actionTitle: {
                    type: Type.STRING,
                    description: "A pre-filled title for the activity if an action is suggested (e.g., 'Follow-up call with...')."
                }
            },
            required: ['text', 'actionType']
        }
    },
    required: ['insights', 'suggestion']
};

export async function generateDonorInsights(
    client: Client,
    donations: Donation[],
    activities: Activity[],
    events: Event[]
): Promise<DonorInsightsResult> {
    if (!import.meta.env.VITE_API_KEY) {
        return { insights: 'API Key not configured.', suggestion: { text: '', actionType: 'None' } };
    }

    const prompt = `
        You are an expert fundraising strategist for a non-profit consulting firm. Analyze the provided data for the organization "${client.name}" and generate actionable insights.

        **Data for Analysis (current date: ${new Date().toLocaleDateString()}):**

        *   **Donations History:** ${donations.length > 0 ? JSON.stringify(donations) : "No donation history."}
        *   **Activity History (Calls, Meetings, Emails):** ${activities.length > 0 ? JSON.stringify(activities) : "No activity history."}
        *   **Event Attendance History:** ${events.length > 0 ? JSON.stringify(events) : "No event attendance history."}

        **Instructions:**
        1.  Analyze all provided data to identify patterns in donation timing, frequency, amount changes, and engagement with activities/events.
        2.  Generate a concise (1-2 sentences) insight summary. Example: "${client.name} is a consistent donor, typically contributing in Q3. Their average donation has increased by 15% over the past two years."
        3.  Based on the insight, provide a single, concrete, and actionable suggestion for what the user should do next. Example: "Since their last donation was over 9 months ago, consider scheduling a follow-up call to discuss your upcoming 'Impact Assessment Report'."
        4.  Determine the most appropriate action type ('ScheduleCall', 'DraftEmail', or 'None').
        5.  If an action is suggested, provide a pre-filled title for it.
        6.  Return the response as a single JSON object strictly adhering to the provided schema.
    `;

    try {
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: donorInsightsSchema,
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating donor insights:", error);
        return {
            insights: "An error occurred while generating insights.",
            suggestion: { text: "Please try again later.", actionType: 'None' }
        };
    }
}


export async function generateSpokenText(text: string): Promise<string | null> {
    if (!import.meta.env.VITE_API_KEY) return null;
    try {
        const response = await (await getAI()).models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
}

// --- Form Generation ---

const formFieldSchema = {
    type: Type.OBJECT,
    properties: {
        label: { type: Type.STRING, description: 'The user-visible label for the form field.' },
        type: { type: Type.STRING, enum: ['text', 'email', 'phone', 'date', 'textarea', 'checkbox', 'radio', 'select'], description: 'The type of the form input.' },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'For radio or select types, the list of options.' },
    },
    required: ['label', 'type']
};

const formSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: 'The title of the form.' },
        description: { type: Type.STRING, description: 'A short description of the form\'s purpose.' },
        fields: {
            type: Type.ARRAY,
            items: formFieldSchema,
            description: 'The list of fields in the form.'
        }
    },
    required: ['title', 'description', 'fields']
};

export async function generateFormFromDescription(
  formDescription: string,
  client: Client | null,
): Promise<string> {
    if (!import.meta.env.VITE_API_KEY) {
        return JSON.stringify({ error: "API key is not configured." });
    }
    const prompt = `
        You are an AI assistant in a CRM for non-profit consultants. Your task is to generate a JSON structure for a web form based on a user's description.
        The JSON output must strictly adhere to the provided schema.
        User's Form Description: "${formDescription}"
        Client Information: ${client ? `For client: ${client.name}.` : "General template."}
    `;

    try {
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: formSchema }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating form:", error);
        return JSON.stringify({ error: "An error occurred while generating the form." });
    }
}

// --- Email Campaign Generation ---
const emailSchema = {
    type: Type.OBJECT,
    properties: {
        subject: { type: Type.STRING, description: 'A compelling and concise subject line for the email.' },
        body: { type: Type.STRING, description: 'The full body of the email, formatted with appropriate line breaks.' },
    },
    required: ['subject', 'body']
};

const subjectLinesSchema = {
    type: Type.OBJECT,
    properties: {
        subjectA: { type: Type.STRING, description: 'The first compelling and concise subject line variation.' },
        subjectB: { type: Type.STRING, description: 'A second, distinct subject line variation for A/B testing.' },
    },
    required: ['subjectA', 'subjectB']
};


export async function generateEmailContent(prompt: string): Promise<{ subject: string, body: string }> {
    if (!import.meta.env.VITE_API_KEY) {
        return { subject: "Error", body: "API key is not configured." };
    }
    const fullPrompt = `
        You are an expert email marketer for non-profit organizations. Your tone should be engaging, professional, and inspiring.
        Based on the following user prompt, generate a compelling subject line and a full email body.
        The body should be well-structured with clear paragraphs.
        Return the response as a JSON object strictly adhering to the provided schema.

        User's Email Goal: "${prompt}"
    `;
    try {
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: { responseMimeType: 'application/json', responseSchema: emailSchema }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating email content:", error);
        return { subject: "Generation Failed", body: "Sorry, an error occurred while trying to generate the email content." };
    }
}

export async function generateFollowUpEmail(
    client: Client,
    insight: string,
    senderName: string,
): Promise<{ subject: string, body: string }> {
    if (!import.meta.env.VITE_API_KEY) {
        return { subject: "Error", body: "API key is not configured." };
    }

    const prompt = `
        You are an expert fundraising and client relationship manager named ${senderName}.
        Your task is to write a personalized, friendly, and professional follow-up email.

        **Context for the email:**
        - **Recipient:** ${client.contactPerson} from ${client.name}.
        - **Your Name (Sender):** ${senderName}.
        - **Key Insight driving this email:** "${insight}"

        **Instructions:**
        1.  Generate a concise and engaging subject line.
        2.  Write a warm and personalized email body.
        3.  Reference the key insight naturally in the email. For example, if the insight is "It's been 6 months since their last donation," you could say "I was just looking at our records and realized it's been a little while since we last connected..."
        4.  Keep the email concise (2-3 short paragraphs).
        5.  End with a clear and soft call to action, like suggesting a brief chat to catch up.
        6.  Sign off with your name, ${senderName}.
        7.  Return the response as a JSON object strictly adhering to the provided schema. Do not include any introductory text or markdown formatting around the JSON object.
    `;

    try {
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: emailSchema }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating follow-up email:", error);
        return { subject: "Generation Failed", body: "An error occurred while generating the email content. Please try again." };
    }
}

export async function generateSubjectLineVariations(prompt: string): Promise<{ subjectA: string, subjectB: string }> {
    if (!import.meta.env.VITE_API_KEY) {
        return { subjectA: "Error: API Key not configured", subjectB: "" };
    }
    const fullPrompt = `
        You are an expert email marketer for non-profit organizations. 
        Based on the user's goal, generate two distinct, compelling, and A/B test-worthy subject lines.
        Variation A should be professional and straightforward.
        Variation B should be more creative, urgent, or emotionally engaging.

        User's Email Goal: "${prompt}"
    `;
    try {
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: { responseMimeType: 'application/json', responseSchema: subjectLinesSchema }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating subject lines:", error);
        return { subjectA: "Failed to generate subjects.", subjectB: "" };
    }
}

export async function generateGrantNarrative(
  prompt: string,
  contextData?: string
): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) return "API key not configured.";
  
  const fullPrompt = `
    You are an expert grant writer for non-profit organizations. Your tone is professional, persuasive, and data-driven.
    Based on the user's request, and incorporating the provided context from their CRM data, write a compelling narrative for a grant application.

    **User Request:**
    "${prompt}"

    ${contextData ? `
    **Relevant CRM Data for Context:**
    ---
    ${contextData}
    ---
    ` : ''}

    Generate the narrative now.
  `;

  try {
    const response = await (await getAI()).models.generateContent({ 
      model: 'gemini-2.5-pro',
      contents: fullPrompt 
    });
    return response.text;
  } catch (error) {
    console.error("Error generating grant narrative:", error);
    return "An error occurred while generating the narrative.";
  }
}


// --- Gold Pages - Web Design AI ---

const colorPaletteSchema = {
    type: Type.OBJECT,
    properties: {
        primary: { type: Type.STRING, description: 'Primary color hex code (e.g., #FFFFFF)' },
        secondary: { type: Type.STRING, description: 'Secondary color hex code' },
        accent: { type: Type.STRING, description: 'Accent color hex code' },
        text: { type: Type.STRING, description: 'Main text color hex code' },
        background: { type: Type.STRING, description: 'Background color hex code' },
    },
    required: ['primary', 'secondary', 'accent', 'text', 'background']
};

export async function generateColorPalette(themeDescription: string): Promise<string> {
    if (!import.meta.env.VITE_API_KEY) return JSON.stringify({ error: "API key is not configured." });
    const prompt = `Generate a cohesive color palette for a webpage based on the theme: "${themeDescription}". Provide hex codes.`;
    try {
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: colorPaletteSchema }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating color palette:", error);
        return JSON.stringify({ error: "Failed to generate palette." });
    }
}

export async function generateWebpageText(prompt: string): Promise<string> {
    if (!import.meta.env.VITE_API_KEY) return "API key not configured.";
    const fullPrompt = `You are a web copywriter. Write a short, compelling piece of text (e.g., a headline or paragraph) for a non-profit's website based on the following instruction: "${prompt}"`;
    try {
        const response = await (await getAI()).models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
        return response.text;
    } catch (error) {
        console.error("Error generating webpage text:", error);
        return "Error generating text.";
    }
}

export async function generateImage(prompt: string, aspectRatio: string): Promise<string | null> {
    if (!import.meta.env.VITE_API_KEY) return null;
    try {
        const response = await (await getAI()).models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio },
        });
        return response.generatedImages[0].image.imageBytes;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
}

export async function analyzeSeo(content: WebpageComponent[]): Promise<string> {
    if (!import.meta.env.VITE_API_KEY) return "API key not configured.";
    const textContent = content.map(c => c.content.text || c.content.headline || '').join('\n');
    const prompt = `
        As an SEO expert, analyze the following webpage content for a non-profit organization.
        Provide actionable suggestions to improve SEO, readability, and engagement.
        Focus on: keyword usage (assume common non-profit terms), clarity of message, calls to action, and heading structure.
        Format your response as markdown.

        Content:
        ---
        ${textContent}
        ---
    `;
    try {
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { thinkingConfig: { thinkingBudget: 32768 } }
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing SEO:", error);
        return "Error analyzing content.";
    }
}

// --- App-Wide Chat Bot ---

export async function chatWithBot(
  history: ChatMessage[],
  newMessage: string,
  systemInstruction?: string,
): Promise<string> {
    if (!import.meta.env.VITE_API_KEY) return "API key not configured.";
    
    const chatHistory = history.map(msg => ({
        role: msg.senderId === 'USER' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({ 
        model: 'gemini-flash-lite-latest',
        history: chatHistory,
        config: systemInstruction ? { systemInstruction } : undefined,
    });
    try {
        const response = await chat.sendMessage({
            message: newMessage
        });
        return response.text;
    } catch (error) {
        console.error("Error in chatWithBot:", error);
        return "Sorry, I encountered an error.";
    }
}

export async function summarizeChatHistory(
  messages: ChatMessage[],
  teamMembers: TeamMember[],
): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) return "API key not configured.";

  const getSenderName = (senderId: string) => {
    return teamMembers.find(m => m.id === senderId)?.name || 'Unknown User';
  };

  const transcript = messages
    .map(msg => `${getSenderName(msg.senderId)}: ${msg.text}`)
    .join('\n');

  const prompt = `
    You are an expert meeting summarization assistant for a professional consulting firm's internal chat.
    Analyze the following chat transcript and generate a concise, well-structured summary.
    Format your response using clear markdown headings and bullet points.

    Your summary MUST include the following sections if relevant information is present:
    - **Key Decisions:** A bulleted list of any decisions that were made.
    - **Action Items:** A bulleted list clearly stating who is responsible for what. Use '@' to mention users (e.g., "@Alice to follow up...").
    - **Main Discussion Points:** A brief overview of the topics discussed.

    If a section has no relevant information, omit it from the summary.
    Keep the tone professional and action-oriented.

    **Chat Transcript:**
    ---
    ${transcript}
    ---
  `;

  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing chat history:", error);
    return "An error occurred while generating the summary.";
  }
}
// FIX: Add the missing generateSmartReplies function to resolve the import error.
const smartRepliesSchema = {
    type: Type.OBJECT,
    properties: {
        replies: {
            type: Type.ARRAY,
            description: 'A list of 3 short, context-aware smart replies.',
            items: {
                type: Type.STRING
            }
        }
    },
    required: ['replies']
};

export async function generateSmartReplies(
  chatHistory: ChatMessage[],
  teamMembers: TeamMember[],
): Promise<string[]> {
  if (!import.meta.env.VITE_API_KEY) {
    return [];
  }

  const getSenderName = (senderId: string) => {
    return teamMembers.find(m => m.id === senderId)?.name || 'Unknown User';
  };
  
  // Take last 5 messages for context
  const transcript = chatHistory
    .slice(-5)
    .map(msg => `${getSenderName(msg.senderId)}: ${msg.text}`)
    .join('\n');

  const prompt = `
    You are an AI assistant integrated into a team chat application. Your goal is to suggest smart replies to facilitate quick communication.
    Analyze the following recent chat transcript. Based on the **last message** and the context of the conversation, generate 3 concise and relevant reply suggestions.

    **Chat Transcript:**
    ---
    ${transcript}
    ---

    **Instructions:**
    1.  The replies should be short (1-5 words).
    2.  The tone should be professional but conversational.
    3.  Examples: "Sounds good!", "I'll look into it.", "When do you need this by?", "On it.", "Thanks!".
    4.  Return the suggestions as a JSON object strictly adhering to the provided schema.
  `;

  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: smartRepliesSchema,
      }
    });
    const result = JSON.parse(response.text.trim());
    return result.replies || [];
  } catch (error) {
    console.error("Error generating smart replies:", error);
    return [];
  }
}

// --- Volunteer Management ---

const recommendationSchema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          volunteerId: { type: Type.STRING },
          name: { type: Type.STRING },
          justification: { type: Type.STRING },
          matchScore: { type: Type.NUMBER },
        },
        required: ['volunteerId', 'name', 'justification', 'matchScore'],
      },
    },
  },
  required: ['recommendations'],
};

export async function recommendVolunteers(
  taskDescription: string,
  volunteers: Volunteer[],
): Promise<RecommendedVolunteer[]> {
  if (!import.meta.env.VITE_API_KEY) {
    return [];
  }

  const volunteerData = volunteers.map(v => ({
    id: v.id,
    name: v.name,
    skills: v.skills.join(', '),
    availability: v.availability,
  }));

  const prompt = `
    You are an AI assistant for a non-profit consulting CRM. Your task is to recommend the best volunteers for a specific task.
    Analyze the list of available volunteers and their skills/availability against the provided task description.

    **Task Description:**
    "${taskDescription}"

    **Available Volunteers:**
    ${JSON.stringify(volunteerData, null, 2)}

    **Instructions:**
    1. Evaluate each volunteer's suitability for the task based on their skills and stated availability.
    2. Provide a numerical "matchScore" from 0 to 100, where 100 is a perfect match.
    3. Write a brief, one-sentence "justification" for why each volunteer is a good match.
    4. Return a ranked list of the top 3-5 most suitable volunteers.
    5. The final output must be a JSON object that strictly adheres to the provided schema.
  `;

  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: recommendationSchema,
      },
    });
    const result = JSON.parse(response.text);
    return result.recommendations || [];
  } catch (error) {
    console.error("Error recommending volunteers:", error);
    return [];
  }
}

export async function generateOnboardingPacket(
  volunteer: Volunteer,
  project: Project,
  teamMembers: TeamMember[],
): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) {
    return "API key not configured.";
  }

  const projectTeam = teamMembers
    .filter(tm => project.teamMemberIds.includes(tm.id))
    .map(tm => `- ${tm.name}, ${tm.role}`)
    .join('\n');

  const initialTasks = project.tasks
    .filter(t => t.status === TaskStatus.ToDo)
    .slice(0, 3)
    .map(t => `- ${t.description}`)
    .join('\n');

  const prompt = `
    You are a friendly and professional onboarding specialist for a non-profit consulting firm.
    Your task is to generate a personalized onboarding packet/email for a new volunteer joining a project.
    The tone should be welcoming, informative, and encouraging.
    Format the output as clear markdown.

    **Volunteer Details:**
    - Name: ${volunteer.name}

    **Project Details:**
    - Name: ${project.name}
    - Description: ${project.description}

    **Key Team Members on this Project:**
    ${projectTeam || 'Team members to be assigned.'}

    **Potential Initial Tasks:**
    ${initialTasks || 'Your project manager will assign your first tasks shortly.'}

    **Instructions:**
    1. Start with a warm welcome addressed to the volunteer by name.
    2. Briefly introduce the project they're joining, using the provided description.
    3. Introduce the key team members they'll be working with.
    4. Suggest some initial tasks to help them get started.
    5. End with an encouraging closing statement and thank them for their contribution.
  `;

  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating onboarding packet:", error);
    return "An error occurred while generating the onboarding packet.";
  }
}


export async function processTextWithAction(text: string, action: 'improve' | 'summarize' | 'clarify'): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) return "API key not configured.";
  
  let prompt = '';
  switch (action) {
    case 'improve':
      prompt = `You are an expert copy editor. Improve the following text for clarity, grammar, and professionalism. Return only the improved text, without any introductory phrases. Text: "${text}"`;
      break;
    case 'summarize':
      prompt = `Summarize the following text into a few key points or a concise paragraph. Return only the summary. Text: "${text}"`;
      break;
    case 'clarify':
      prompt = `You are a communication expert. Review the following text and rewrite it to be clearer and more easily understood. Return only the clarified text. Text: "${text}"`;
      break;
  }

  try {
    const response = await (await getAI()).models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error processing text:", error);
    return `Error: Could not process text. Original: ${text}`;
  }
}


// --- AI Tools ---

export async function analyzeImage(imageDataB64: string, mimeType: string, prompt: string): Promise<string> {
    if (!import.meta.env.VITE_API_KEY) return "API key not configured.";
    try {
        const imagePart = { inlineData: { data: imageDataB64, mimeType } };
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [ {text: prompt}, imagePart ] }
        });
        return response.text;
    } catch (error) {
        console.error("Error analyzing image:", error);
        return "Error analyzing image.";
    }
}

export async function transcribeAudio(audioDataB64: string, mimeType: string): Promise<string> {
    if (!import.meta.env.VITE_API_KEY) return "API key not configured.";
    try {
        const audioPart = { inlineData: { data: audioDataB64, mimeType } };
        const textPart = { text: "Transcribe the following audio recording accurately." };
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, audioPart] }
        });
        return response.text;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return "Error transcribing audio. The model may not support this audio format.";
    }
}

const meetingAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A concise summary of the meeting formatted in markdown. Include sections for 'Key Decisions' and 'Discussion Points'."
        },
        actionItems: {
            type: Type.ARRAY,
            description: "A list of clear, actionable tasks identified from the transcript.",
            items: {
                type: Type.OBJECT,
                properties: {
                    taskDescription: {
                        type: Type.STRING,
                        description: "The full description of the action item."
                    },
                    suggestedAssignee: {
                        type: Type.STRING,
                        description: "The name of the person mentioned as responsible, if any. Null if no one is mentioned."
                    }
                },
                required: ['taskDescription']
            }
        }
    },
    required: ['summary', 'actionItems']
};

export async function analyzeTranscript(transcript: string): Promise<MeetingAnalysisResult> {
    if (!import.meta.env.VITE_API_KEY) {
        return { summary: "API key not configured.", actionItems: [] };
    }

    const prompt = `
        You are an expert meeting summarization assistant. Analyze the following meeting transcript.
        Your task is to:
        1. Create a concise summary of the meeting. The summary should be in markdown and include a "Key Decisions" section if any were made.
        2. Extract all clear action items. For each action item, identify who it was assigned to if mentioned.

        Return the result as a single JSON object that strictly adheres to the provided schema.

        **Meeting Transcript:**
        ---
        ${transcript}
        ---
    `;

    try {
        const response = await (await getAI()).models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: meetingAnalysisSchema,
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing transcript:", error);
        return {
            summary: "An error occurred while analyzing the transcript.",
            actionItems: [],
            error: "Failed to process the transcript."
        };
    }
}


export async function findNearbyPlaces(lat: number, lng: number, query: string): Promise<{ text: string, sources: any[] }> {
  if (!import.meta.env.VITE_API_KEY) {
    return { text: "API key is not configured.", sources: [] };
  }
  const prompt = `Find the following near the provided location: "${query}"`;
  try {
    const response = await (await getAI()).models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
      },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources: groundingChunks };
  } catch (error) {
    console.error("Error finding nearby places:", error);
    return { text: "An error occurred while searching for places.", sources: [] };
  }
}

// --- Reports ---

export async function generateReportSummary(
  data: any[],
  reportGoal: string,
  dataSourceName: string
): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) return "API key not configured.";

  const prompt = `
    You are a data analyst for Logos Vision, a consulting firm for non-profits.
    Your task is to analyze the provided data and generate a professional report summary based on the user's goal.

    **User's Goal:** "${reportGoal}"

    **Data Source:** ${dataSourceName}

    **Data (JSON format):**
    ${JSON.stringify(data, null, 2)}

    **Instructions:**
    1.  Analyze the provided data in the context of the user's goal.
    2.  Write a concise, insightful summary.
    3.  Identify key trends, significant figures, or important outliers.
    4.  If applicable, suggest potential action items or areas for further investigation.
    5.  Format your response using markdown for clarity (e.g., headings, bullet points, bold text).
    6.  Do not just list the data; provide interpretation and analysis.
  `;
  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report summary:", error);
    return "An error occurred while generating the report summary.";
  }
}

export async function generateChartInsights(
  chartData: any[],
  dataSourceName: string,
  groupBy: string,
  metric: string,
): Promise<string> {
  if (!import.meta.env.VITE_API_KEY) return "- API key is not configured.";

  const prompt = `
    You are a data analyst assistant. Analyze the following summarized data and provide 2-3 concise, insightful bullet points.
    Focus on highs, lows, or interesting patterns. Do not write a long paragraph; use bullet points only, starting each with a hyphen.

    **Data Context:** The data represents the "${metric}" for "${dataSourceName}", grouped by "${groupBy}".

    **Data:**
    ${JSON.stringify(chartData, null, 2)}

    **Example Output:**
    - The 'Annual Gala' campaign generated the most donations.
    - 'Community Outreach' has a significantly lower donation count than other campaigns.
  `;

  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating chart insights:", error);
    return "- Could not generate insights at this time.";
  }
}


// --- Semantic Search ---
interface AllData {
    clients: Client[];
    projects: Project[];
    tasks: EnrichedTask[];
    cases: Case[];
    teamMembers: TeamMember[];
    activities: Activity[];
    volunteers: Volunteer[];
    // FIX: Use AppDocument alias to avoid name collision with global DOM Document type.
    documents: AppDocument[];
}

interface SearchIdResults {
    clientIds?: string[];
    projectIds?: string[];
    taskIds?: string[];
    caseIds?: string[];
    teamMemberIds?: string[];
    activityIds?: string[];
    volunteerIds?: string[];
    documentIds?: string[];
}

const searchResultsSchema = {
    type: Type.OBJECT,
    properties: {
        clientIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of matching clients" },
        projectIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of matching projects" },
        taskIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of matching tasks" },
        caseIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of matching cases" },
        teamMemberIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of matching team members" },
        activityIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of matching activities" },
        volunteerIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of matching volunteers" },
        documentIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "IDs of matching documents" },
    },
};

const webLeadSchema = {
    type: Type.OBJECT,
    properties: {
        leads: {
            type: Type.ARRAY,
            description: "A list of potential non-profit leads found on the web.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the organization." },
                    description: { type: Type.STRING, description: "A brief, one-sentence description of the organization's mission or purpose." },
                    url: { type: Type.STRING, description: "The official website URL for the organization." }
                },
                required: ['name', 'description']
            }
        }
    },
    required: ['leads']
};


export async function performAdvancedSearch(
    query: string,
    allData: AllData,
    includeWebSearch: boolean
): Promise<{ internalResults: SearchIdResults, webResults: WebSearchResult[] }> {
    if (!import.meta.env.VITE_API_KEY) {
        console.error("API key is not configured.");
        return { internalResults: {}, webResults: [] };
    }

    // Sanitize data for the prompt to reduce token count
    const minimalData = {
        clients: allData.clients.map(({ id, name, contactPerson, location }) => ({ id, name, contactPerson, location })),
        projects: allData.projects.map(({ id, name, description, status }) => ({ id, name, description, status })),
        tasks: allData.tasks.map(({ id, description, status }) => ({ id, description, status })),
        cases: allData.cases.map(({ id, title, description, status, priority, lastUpdatedAt }) => ({ id, title, description, status, priority, lastUpdatedAt })),
        teamMembers: allData.teamMembers.map(({ id, name, role }) => ({ id, name, role })),
        activities: allData.activities.map(({ id, title, type, notes, activityDate }) => ({ id, title, type, notes, activityDate })),
        volunteers: allData.volunteers.map(({ id, name, skills }) => ({ id, name, skills })),
        documents: allData.documents.map(({ id, name, category }) => ({ id, name, category })),
    };

    const internalPrompt = `
        You are an advanced semantic search engine for a CRM application. Your task is to analyze the user's natural language query and find matching items from the provided JSON data.

        **User Query:** "${query}"
        
        **Date Context:** Assume the current date is ${new Date().toISOString()}. Analyze relative date queries like "this week", "last month", or "recently" based on this date.

        **Available Data:** You have access to the following data sets. Each item has a unique 'id'.
        1. Clients: ${JSON.stringify(minimalData.clients)}
        2. Projects: ${JSON.stringify(minimalData.projects)}
        3. Tasks: ${JSON.stringify(minimalData.tasks)}
        4. Cases: ${JSON.stringify(minimalData.cases)}
        5. Team Members: ${JSON.stringify(minimalData.teamMembers)}
        6. Activities: ${JSON.stringify(minimalData.activities)}
        7. Volunteers: ${JSON.stringify(minimalData.volunteers)}
        8. Documents: ${JSON.stringify(minimalData.documents)}

        **Instructions:**
        1.  Carefully analyze the user's query to understand their intent. This could involve filtering by name, status, priority, date ranges, or relationships between items (e.g., "cases for Global Health").
        2.  Search through all the provided data sets to find items that match the query's intent. The match can be on any relevant field.
        3.  Return a JSON object containing arrays of the unique 'id's for all matching items, strictly adhering to the provided schema. Do not include items that do not match. If no items match a category, return an empty array for that category.
    `;
    
    const internalSearchPromise = (await getAI()).models.generateContent({
        model: 'gemini-2.5-pro',
        contents: internalPrompt,
        config: { 
            responseMimeType: 'application/json', 
            responseSchema: searchResultsSchema 
        }
    });

    let webSearchPromise = Promise.resolve(null);
    if (includeWebSearch) {
        const webPrompt = `
            You are a research assistant for a non-profit consulting firm. Your task is to find potential new leads based on a user's query.
            Use the search tool to find organizations that match the query.
            Return ONLY a raw JSON object (no markdown formatting) containing a list of these leads, following this structure:
            {
              "leads": [
                {
                  "name": "The name of the organization.",
                  "description": "A brief, one-sentence description of the organization's mission or purpose.",
                  "url": "The official website URL for the organization."
                }
              ]
            }

            User Query: "${query}"
        `;
        webSearchPromise = (await getAI()).models.generateContent({
            model: 'gemini-2.5-flash',
            contents: webPrompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
    }

    try {
        const [internalResponse, webResponse] = await Promise.all([internalSearchPromise, webSearchPromise]);

        const internalResults: SearchIdResults = JSON.parse(internalResponse.text);
        let webResults: WebSearchResult[] = [];

        if (webResponse) {
            try {
                let jsonStr = webResponse.text.trim();
                
                // Use a regex to robustly extract the JSON object, even if it's wrapped in markdown or conversational text.
                const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[0];
                } else {
                    // If no JSON object is found, throw an error to be caught below.
                    throw new Error("No valid JSON object found in the web search response.");
                }
                
                const parsedWeb = JSON.parse(jsonStr);
                const groundingChunks = webResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

                if (parsedWeb.leads && Array.isArray(parsedWeb.leads)) {
                    let sourceIndex = 0;
                    webResults = parsedWeb.leads.map((lead: any) => {
                        const source = groundingChunks[sourceIndex]?.web?.uri;
                        if (groundingChunks[sourceIndex]?.web?.uri) {
                            sourceIndex++;
                        }
                        return {
                            name: lead.name || 'Unknown Name',
                            description: lead.description || 'No description available.',
                            url: lead.url,
                            source: source || '#',
                        };
                    });
                }
            } catch(e) {
                console.error("Error parsing web search results:", e, "Original text from model:", webResponse?.text);
                // Keep webResults as an empty array
            }
        }

        return { internalResults, webResults };
    } catch (error) {
        console.error("Error performing advanced search:", error);
        return { internalResults: {}, webResults: [] };
    }
}


// --- Dashboard Briefing ---

export interface BriefingData {
  userName: string;
  tasks: EnrichedTask[];
  cases: Case[];
  activities: Activity[];
  projects: Project[];
  clients: Client[];
  donations?: Donation[];
  documents?: AppDocument[];
}

export interface DailyBriefingResult {
  greeting: string;
  summary: string;
  actionItems: { 
    text: string; 
    priority: 'high' | 'medium' | 'low';
    relatedId?: string;
    relatedType?: 'task' | 'project' | 'case' | 'activity' | 'document' | 'donation';
  }[];
  kudos: string[];
  reminders: string[];
  recap: string[];
  quote?: string;
}

const dailyBriefingSchema = {
  type: Type.OBJECT,
  properties: {
    greeting: { type: Type.STRING, description: 'A warm, personalized morning greeting.' },
    summary: { type: Type.STRING, description: 'A concise executive summary of the day and key focus areas.' },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          relatedId: { type: Type.STRING, description: 'The ID of the related item (task, project, etc) if applicable' },
          relatedType: { type: Type.STRING, enum: ['task', 'project', 'case', 'activity', 'document', 'donation'], description: 'The type of the related item' }
        },
        required: ['text', 'priority']
      },
      description: 'Specific, actionable tasks or events for today and this week.'
    },
    kudos: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Positive reinforcement based on recent completed tasks, closed cases, or new donations.'
    },
    reminders: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Gentle reminders for follow-ups, deadlines, or stalled projects.'
    },
    recap: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Recap of important recent activity or documents if the day is quiet.'
    },
    quote: { type: Type.STRING, description: 'An inspiring quote relevant to leadership, productivity, or charity.' }
  },
  required: ['greeting', 'summary', 'actionItems', 'kudos', 'reminders', 'recap']
};

export async function generateDailyBriefing(data: BriefingData): Promise<DailyBriefingResult> {
  if (!import.meta.env.VITE_API_KEY) {
    return {
      greeting: `Good morning, ${data.userName}!`,
      summary: "The AI briefing service is currently unavailable.",
      actionItems: [],
      kudos: [],
      reminders: [],
      recap: [],
      quote: "Technology is best when it brings people together."
    };
  }

  const { userName, tasks, cases, activities, projects, clients, donations = [], documents = [] } = data;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);

  // Pre-process data for the prompt to keep it relevant and fit context if needed (though Flash has large context)
  const upcomingTasks = tasks
    .filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate <= oneWeekFromNow && dueDate >= today && t.status !== TaskStatus.Done;
    })
    .map(t => `- Task [ID: ${t.id}]: "${t.description}" due ${new Date(t.dueDate).toLocaleDateString()} (Priority: ${t.priority})`);

  const completedTasks = tasks
    .filter(t => t.status === TaskStatus.Done && new Date(t.updatedAt || t.createdAt) > new Date(Date.now() - 3 * 86400000))
    .map(t => `- Completed Task [ID: ${t.id}]: "${t.description}"`);

  const recentCases = cases
    .filter(c => new Date(c.createdAt) >= new Date(Date.now() - 3 * 86400000))
    .map(c => `- New Case [ID: ${c.id}]: "${c.title}" (${c.priority})`);
    
  const todaysActivities = activities
    .filter(a => a.activityDate === todayStr)
    .map(a => `- ${a.type} [ID: ${a.id}]: "${a.title}" at ${a.activityTime || 'all day'}`);

  const recentDonations = donations
    .filter(d => new Date(d.date) >= new Date(Date.now() - 7 * 86400000))
    .map(d => `- Donation [ID: ${d.id}]: $${d.amount} from donor ID ${d.donorId}`);

  const recentDocs = documents
    .filter(d => new Date(d.uploadedAt) >= new Date(Date.now() - 3 * 86400000))
    .map(d => `- Document [ID: ${d.id}]: "${d.title}" (${d.category})`);

  const activeProjects = projects
    .filter(p => p.status === 'In Progress')
    .map(p => `- Project [ID: ${p.id}]: ${p.name}`);

  const prompt = `
    You are an intelligent and empathetic executive assistant for ${userName} in the Logos Vision CRM.
    Current Date: ${today.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

    **Goal**: Generate a comprehensive "Daily Briefing" hero widget content. 
    The user wants to feel prepared, encouraged, and informed.

    **Data Sources:**
    *   **Agenda (Today):** ${todaysActivities.length ? todaysActivities.join('\n') : "No scheduled activities."}
    *   **Immediate Priorities (Tasks due soon):** ${upcomingTasks.length ? upcomingTasks.join('\n') : "No urgent tasks."}
    *   **Recent Wins (Completed Tasks):** ${completedTasks.length ? completedTasks.join('\n') : "No recent completed tasks."}
    *   **New Developments (Cases/Docs):** 
        ${recentCases.join('\n')}
        ${recentDocs.join('\n')}
    *   **Financials (Recent Donations):** ${recentDonations.length ? recentDonations.join('\n') : "No recent donations."}
    *   **Active Projects:** ${activeProjects.join(', ')}

    **Instructions:**
    1.  **Greeting**: Warm and professional.
    2.  **Summary**: Synthesize the "big picture". If busy, highlight top priorities. If quiet, suggest focusing on long-term goals or reviewing active projects.
    3.  **Action Items**: Extract specific actions from tasks and agenda. Assign priority based on context. 
        *IMPORTANT*: Use the provided IDs to populate 'relatedId' and 'relatedType' in the output JSON.
    4.  **Kudos**: Find reasons to celebrate (completed tasks, new donations, or just managing a lot of projects).
    5.  **Reminders**: Remind about upcoming deadlines or suggest checking in on "Active Projects" that haven't had recent activity.
    6.  **Recap**: If the day is light, recap important recent files or active project statuses to keep them top of mind.
    7.  **Quote**: Include a short, relevant inspirational quote.

    Return the result as a strictly valid JSON object matching the schema.
  `;

  try {
    const response = await (await getAI()).models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: dailyBriefingSchema,
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating daily briefing:", error);
    return {
        greeting: `Good morning, ${userName}.`,
        summary: "I'm having trouble connecting to the intelligence engine right now.",
        actionItems: [],
        kudos: [],
        reminders: ["Check your internet connection", "Try refreshing the dashboard"],
        recap: [],
        quote: "Patience is a virtue."
    };
  }
}

// --- Sentiment Analysis ---

export interface SentimentAnalysisResult {
  clientId: string;
  clientName: string;
  sentimentScore: number; // 0-100
  sentimentLabel: 'Positive' | 'Neutral' | 'Negative' | 'At Risk';
  summary: string;
  keyConcerns?: string[];
  trend: 'improving' | 'declining' | 'stable';
}

const sentimentAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    sentimentScore: { type: Type.NUMBER, description: 'Score from 0 (Negative) to 100 (Positive)' },
    sentimentLabel: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'At Risk'] },
    summary: { type: Type.STRING, description: 'Brief explanation of the sentiment assessment.' },
    keyConcerns: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Specific issues or concerns identified.' },
    trend: { type: Type.STRING, enum: ['improving', 'declining', 'stable'], description: 'Assessment of sentiment trend over time.' }
  },
  required: ['sentimentScore', 'sentimentLabel', 'summary', 'trend']
};

export async function analyzeSentiment(
  clientName: string,
  clientId: string,
  activities: { date: string; type: string; notes?: string; title: string }[]
): Promise<SentimentAnalysisResult> {
  if (!import.meta.env.VITE_API_KEY) {
    return {
      clientId,
      clientName,
      sentimentScore: 75,
      sentimentLabel: 'Neutral',
      summary: 'AI service unavailable.',
      trend: 'stable'
    };
  }

  // Filter out activities with no content
  const relevantActivities = activities.filter(a => a.notes || a.title);
  if (relevantActivities.length === 0) {
      return {
          clientId,
          clientName,
          sentimentScore: 50,
          sentimentLabel: 'Neutral',
          summary: 'Not enough activity data to analyze.',
          trend: 'stable'
      };
  }

  const activityText = relevantActivities
    .map(a => `[${a.date}] ${a.type}: ${a.title} - ${a.notes || ''}`)
    .join('\n');

  const prompt = `
    Analyze the sentiment of the following recent interactions with client "${clientName}".
    Goal: Assess the health of the relationship and identify any risks of churn or dissatisfaction.
    
    Interactions:
    ${activityText}

    Instructions:
    1. Determine a Sentiment Score (0-100). <40 is Negative, 40-60 Neutral, >60 Positive.
    2. If there are explicit complaints or signs of withdrawal, mark as "At Risk".
    3. Determine the Trend (improving, declining, stable) based on the timeline.
    4. Provide a 1-sentence summary and list key concerns if any.
    
    Return valid JSON matching the schema.
  `;

  try {
    const ai = await getAI();
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: sentimentAnalysisSchema,
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const data = JSON.parse(response);
    
    return {
      clientId,
      clientName,
      ...data
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      clientId,
      clientName,
      sentimentScore: 50,
      sentimentLabel: 'Neutral',
      summary: 'Error analyzing sentiment.',
      trend: 'stable'
    };
  }
}

// --- Opportunity Scout ---

export async function generateOpportunityPitch(
  clientName: string,
  opportunityType: 'high_capacity_low_engagement' | 'lapsed_major_donor' | 'rising_star',
  details: string
): Promise<{ subject: string; pitch: string; suggestedAction: string }> {
  if (!import.meta.env.VITE_API_KEY) {
    return {
      subject: "Connect with " + clientName,
      pitch: "Please configure the AI service to generate a personalized pitch.",
      suggestedAction: "Call to catch up"
    };
  }

  const prompt = `
    Generate a concise outreach strategy for a donor opportunity.
    
    Donor: ${clientName}
    Opportunity Type: ${opportunityType.replace(/_/g, ' ')}
    Context: ${details}
    
    Output JSON with:
    1. subject: A catchy email subject line.
    2. pitch: A 2-sentence conversational opener.
    3. suggestedAction: One concrete next step (e.g., "Invite to Gala", "Schedule coffee").
  `;

  try {
    const ai = await getAI();
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error("Error generating pitch:", error);
    return {
      subject: "Error generating pitch",
      pitch: "Could not generate pitch due to an error.",
      suggestedAction: "Review donor profile"
    };
  }
}

// --- Meeting Prep ---

export async function generateMeetingPrep(
  attendeeName: string,
  meetingTitle: string,
  lastInteractions: string[]
): Promise<{ talkingPoints: string[]; recentContext: string; openQuestions: string[] }> {
  if (!import.meta.env.VITE_API_KEY) {
    return {
      talkingPoints: ["Ask about their recent project", "Discuss partnership opportunities"],
      recentContext: "AI service unavailable for full context analysis.",
      openQuestions: ["How is the family?", "Any updates on the timeline?"]
    };
  }

  const prompt = `
    Prepare a "Meeting Cheat Sheet" for a meeting with ${attendeeName}.
    Meeting Title: "${meetingTitle}"
    
    Recent Interactions/Context:
    ${lastInteractions.join('\n')}

    Output JSON with:
    1. talkingPoints: 3 bullet points for conversation starters or agenda items.
    2. recentContext: A 1-sentence summary of the last interaction to refresh memory.
    3. openQuestions: 2 strategic open-ended questions to ask.
  `;

  try {
    const ai = await getAI();
    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return JSON.parse(response);
  } catch (error) {
    console.error("Error generating meeting prep:", error);
    return {
      talkingPoints: ["Review agenda"],
      recentContext: "Could not analyze context.",
      openQuestions: []
    };
  }
}
