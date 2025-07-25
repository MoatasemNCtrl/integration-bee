import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to normalize mathematical expressions
function normalizeMathExpression(expr: string): string {
  return expr
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\*\*/g, '^')
    .replace(/\\\\/g, '\\')
    .replace(/constant/gi, 'C')
    .replace(/arbitrary\s*constant/gi, 'C')
    .trim();
}

// Helper function to check if solution is mathematically equivalent
function checkBasicEquivalence(userSolution: string, correctSolution: string): boolean {
  const normalizedUser = normalizeMathExpression(userSolution);
  const normalizedCorrect = normalizeMathExpression(correctSolution);
  
  // Check exact match
  if (normalizedUser === normalizedCorrect) return true;
  
  // Check common equivalent forms
  const equivalentForms = [
    // Fraction forms
    [/(\d+)\/(\d+)/g, (match: string, num: string, den: string) => `\\frac{${num}}{${den}}`],
    // Power forms
    [/\^(\d+)/g, '^{$1}'],
    // Function notations
    [/ln\(/g, '\\ln('],
    [/sin\(/g, '\\sin('],
    [/cos\(/g, '\\cos('],
    [/tan\(/g, '\\tan('],
    [/arcsin\(/g, '\\arcsin('],
    [/arccos\(/g, '\\arccos('],
    [/arctan\(/g, '\\arctan('],
  ];
  
  return false; // Fall back to AI validation
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: "OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables." 
      }, { status: 500 })
    }

    const body = await req.json()
    const { imageData, solution, problem, alternativeForms } = body

    // Validate required fields
    if (!imageData || !solution) {
      return NextResponse.json({ 
        error: "Missing required fields: imageData and solution are required" 
      }, { status: 400 })
    }

    // Ensure the image data is properly formatted
    if (!imageData?.startsWith("data:image/")) {
      return NextResponse.json({ 
        error: "Invalid image data format. Expected base64 image data." 
      }, { status: 400 })
    }

    // Convert base64 URL to base64 string
    const base64Image = imageData.split(",")[1]
    if (!base64Image) {
      return NextResponse.json({ 
        error: "Invalid image data: could not extract base64 content" 
      }, { status: 400 })
    }

    // Prepare alternative forms for more flexible checking
    const allSolutionForms = [solution, ...(alternativeForms || [])];
    const solutionText = allSolutionForms.join(" or ");

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",  // Updated to use latest model
        messages: [
          {
            role: "system",
            content: `You are a mathematics expert specializing in calculus integration. Your task is to evaluate handwritten solutions to integration problems.

IMPORTANT INSTRUCTIONS:
1. Focus on mathematical correctness, not handwriting quality
2. Accept different equivalent forms (e.g., x²/2 = ½x² = 0.5x²)
3. The constant of integration (+C) may be written in various ways or omitted
4. Look for the core mathematical structure being correct
5. Be lenient with notation variations but strict with mathematical accuracy
6. Consider partial credit for correct steps even if final answer has minor errors

Respond with EXACTLY one word: "correct" or "incorrect"`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Problem: ${problem || 'Integration problem'}
                
Expected solution(s): ${solutionText}

Please analyze the handwritten solution in the image and determine if it's mathematically correct. Look for:
- Correct application of integration rules
- Proper algebraic manipulation
- Mathematically equivalent final answers
- Reasonable intermediate steps

The student's work may use different notation or presentation but should be mathematically sound.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                  detail: "high"
                },
              },
            ],
          },
        ],
        max_tokens: 10,
        temperature: 0.1,  // Lower temperature for more consistent responses
      })

      const result = response.choices[0]?.message?.content?.toLowerCase().trim()

      if (!result) {
        throw new Error("No response received from OpenAI API")
      }

      console.log("OpenAI Response:", result); // For debugging

      // Parse the response
      const isCorrect = result.includes("correct") && !result.includes("incorrect");

      return NextResponse.json({
        isCorrect,
        message: result,
        confidence: isCorrect ? "high" : "medium", // Could be enhanced with actual confidence scoring
        feedback: isCorrect 
          ? "Great work! Your solution is mathematically correct." 
          : "The solution appears to have some mathematical errors. Please review your work and try again."
      })

    } catch (openaiError: any) {
      console.error("OpenAI API error:", openaiError)
      
      // Provide more specific error messages
      if (openaiError?.status === 429) {
        return NextResponse.json({ 
          error: "API rate limit exceeded. Please wait a moment and try again." 
        }, { status: 429 })
      } else if (openaiError?.status === 401) {
        return NextResponse.json({ 
          error: "Invalid API key. Please check your OpenAI configuration." 
        }, { status: 500 })
      } else if (openaiError?.status === 400) {
        return NextResponse.json({ 
          error: "Invalid request to OpenAI API. Please check the image format." 
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: "Error processing image with AI. Please try again." 
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Validation error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 },
    )
  }
}

