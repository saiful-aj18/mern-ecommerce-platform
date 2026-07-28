const { z } = require("zod");
const { generateObject } = require("ai");
const { createGoogleGenerativeAI } = require("@ai-sdk/google");

const DEFAULT_MODEL = "gemini-flash-latest";

const SYSTEM_ROLE = 
    "You are an e-commerce SEO copywriter." +
    "You write factual, concise, SEO-friendly product content."+
    "You never invent Specifications, Certifications, Performance Claims," +
    "discounts, delivery promises, health benefits, warranty terms, or materials."

function buildProductionPrompt(input) {
    const features = (input.features || [])
    .map((f) => `- ${f}`)
    .join("\n");
    
    return `
    Production facts (use ONLY these, do not add anything else):

    Name: ${input.name}
    Brand:    ${input.brand}
    Category: ${input.category}
    Price:    ${input.price} BDT
    Features:
    ${features || "- (none provided)"}

    Rules:
    - Use ONLY the supplied product information above.
    - Do NOT invent specifications, warranty, certifications, materials, 
    battery duration, health benefits, performance claims, discounts, or delivery promises.
    - Write clear, natural, SEO-friendly English.
    - The slug must be lowercase, URL-friendly, hyphen-separated, and contains only letters a-z, digits 0-9 and hyphens.
    
    Required output (return every field exactly once):
    - slug                (string, lowercase, hyphens only)
    - shortDescription    (1-2 sentences, 30-250 chars)
    - description         (paragraphs, 100-1500 chars)
    - seoTitle            (10-60 chars)
    - metaDescription     (50-160 chars)
    - keywords            (3-10 short strings)
    - bulletPoints        (3-6 short selling points, each 5-200 chars)
    `.trim();
}

const aiOutputSchema = z.object({
    slug: z
        .string()
        .min(3, "Slug must be at least 3 char")
        .max(120, "Slug must be at most 120 char")
        .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, digits and hyphens"),
    shortDescription: z
        .string()
        .min(30, "Short description must be at least 30 characters")
        .max(250, "Short description must be at most 250 characters"),

    description: z
        .string()
        .min(100, "Description must be at least 100 characters")
        .max(1500, "Description must be at most 1500 characters"),

    seoTitle: z
        .string()
        .min(10, "SEO title must be at least 10 characters")
        .max(60, "SEO title must be at most 60 characters"),

    metaDescription: z
        .string()
        .min(50, "Meta description must be at least 50 characters")
        .max(160, "Meta description must be at most 160 characters"),

    keywords: z
        .array(z.string().min(2).max(40))
        .min(3, "At least 3 keywords are required")
        .max(10, "At most 10 keywords are allowed"),

    bulletPoints: z
        .array(z.string().min(5).max(200))
        .min(3, "At least 3 bullet points are required")
        .max(6, "At most 6 bullet points are allowed"),
})

async function generateProductionContent(productInput) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        const error = new Error("AI service is not configured");
        error.statusCode = 503;
        throw error;
    }

    const modelName = process.env.GOOGLE_MODEL || DEFAULT_MODEL;

    const googleProvider = createGoogleGenerativeAI({ apiKey });

    let generated;

    try {
        generated = await generateObject({
            model: googleProvider(modelName),
            schema: aiOutputSchema,
            system: SYSTEM_ROLE,
            prompt: buildProductionPrompt(productInput),
        })
    } catch (err) {
        
        if (process.env.NODE_ENV !== "production") {
            console.error("[ai.service] generateObject failed:", err);
        }

        const inner = err && (err.lastError || err);
        const upstreamStatus =
            inner && (inner.statusCode || inner.status) ||
            err  && (err.statusCode  || err.status);

        let message = "Unable to generate product content";
        let statusCode = 502;

        if (upstreamStatus === 401 || upstreamStatus === 429) {
             
            message =
                upstreamStatus === 429
                    ? "AI quota exceeded or rate limited. Please try again later or contact an admin."
                    : "AI service authentication failed. Please contact an admin.";
            statusCode = 503; 
        }

        const wrapped = new Error(message);
        wrapped.statusCode = statusCode;
        if (upstreamStatus) {
            wrapped.upstreamStatus = upstreamStatus;
        }
        throw wrapped;
    }

    const parsed = aiOutputSchema.safeParse(generated.object);
    if (!parsed.success) {
        if (process.env.NODE_ENV !== "production") {
            console.error("[ai.service] AI output failed validation:", parsed.error.issues);
        }
        const wrapped = new Error("Unable to generate product content");
        wrapped.statusCode = 502;
        throw wrapped;        
    }

    return parsed.data;
}

module.exports = { generateProductionContent }