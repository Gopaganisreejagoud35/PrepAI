// AI Evaluation Engine adhering strictly to Section 6, 7 & 8 of system prompt
// Outputs: { score, correct_points, missing_points, mistakes, improvement, ideal_answer, next_action }

export class EvaluationEngine {
  constructor(apiKey = "") {
    this.apiKey = apiKey;
  }

  setApiKey(key) {
    this.apiKey = key.trim();
  }

  /**
   * Main evaluation entry point.
   * If an API key is available, queries the live Gemini API with strict JSON schema.
   * Otherwise, executes our deterministic, semantic keyword & rubric evaluation engine.
   */
  async evaluate({ questionObj, candidateAnswer, candidateProfile, isFollowUp = false }) {
    const trimmedAnswer = candidateAnswer ? candidateAnswer.trim() : "";

    // Immediate check for empty or non-attempted answers
    if (!trimmedAnswer || trimmedAnswer.length < 5) {
      return {
        score: 0,
        correct_points: ["No answer or insufficient content was provided to evaluate."],
        missing_points: questionObj.keyPoints || ["Core concept understanding", "Technical implementation details"],
        mistakes: ["No technical response submitted."],
        improvement: "In technical interviews, even if you are uncertain, articulate your thought process or state what related concepts you do know rather than leaving it blank.",
        ideal_answer: questionObj.idealAnswer || "Please review the key points for this topic.",
        next_action: isFollowUp ? "continue_interview" : "trigger_followup"
      };
    }

    // Try Gemini Live API if user configured an API Key
    if (this.apiKey) {
      try {
        const liveResult = await this.evaluateWithGemini({ questionObj, candidateAnswer: trimmedAnswer, candidateProfile, isFollowUp });
        if (liveResult && typeof liveResult.score === "number") {
          return liveResult;
        }
      } catch (err) {
        console.warn("Live API evaluation failed or quota exceeded, falling back to built-in semantic evaluator:", err);
      }
    }

    // Built-in Deterministic Semantic & Rubric Evaluator
    return this.evaluateWithRubric({ questionObj, candidateAnswer: trimmedAnswer, candidateProfile, isFollowUp });
  }

  /**
   * Built-in semantic & rubric evaluator
   */
  evaluateWithRubric({ questionObj, candidateAnswer, candidateProfile, isFollowUp }) {
    const q = questionObj || {};
    const lowerAnswer = (candidateAnswer || "").toLowerCase();
    const keyPoints = q.keyPoints || ["Core concept understanding", "Technical implementation mechanics"];
    const commonMistakes = q.commonMistakes || [];

    const correct_points = [];
    const missing_points = [];
    const mistakes = [];

    // Analyze key points coverage
    for (const point of keyPoints) {
      // Extract key terms (words > 3 letters)
      const pointTokens = point
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'which', 'when', 'into', 'than'].includes(w));

      let matchedTokens = 0;
      for (const token of pointTokens) {
        if (lowerAnswer.includes(token)) {
          matchedTokens++;
        }
      }

      const matchRatio = pointTokens.length > 0 ? matchedTokens / pointTokens.length : 0;
      if (matchRatio >= 0.35 || lowerAnswer.includes(point.slice(0, 15).toLowerCase())) {
        correct_points.push(point);
      } else {
        missing_points.push(point);
      }
    }

    // Check for common misconceptions or anti-patterns
    for (const mistake of commonMistakes) {
      const mistakeTokens = mistake
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 4);

      let detected = 0;
      for (const token of mistakeTokens) {
        if (lowerAnswer.includes(token)) detected++;
      }
      if (mistakeTokens.length > 0 && detected / mistakeTokens.length >= 0.5) {
        mistakes.push(`Potential misconception: ${mistake}`);
      }
    }

    // Calculate score (0 to 10)
    let rawScore = 0;
    const totalPoints = Math.max(1, keyPoints.length);
    const matchedRatio = correct_points.length / totalPoints;

    // Base score from key points (up to 7 points)
    rawScore += matchedRatio * 7.0;

    // Quality, length, and technical articulation bonus (up to 3 points)
    const wordCount = candidateAnswer.split(/\s+/).filter(Boolean).length;
    if (wordCount >= 60) rawScore += 1.5;
    else if (wordCount >= 30) rawScore += 1.0;
    else if (wordCount >= 15) rawScore += 0.5;

    // Code block or structured list bonus
    if (candidateAnswer.includes("```") || candidateAnswer.includes("function") || candidateAnswer.includes("class") || candidateAnswer.includes("->") || candidateAnswer.includes("1.")) {
      rawScore += 1.0;
    }

    // Penalties for detected mistakes
    rawScore -= (mistakes.length * 1.5);

    // Clamp score strictly between 1 and 10 (or 0 if totally empty)
    let score = Math.min(10, Math.max(1, Math.round(rawScore)));

    // If correct points are 0 and word count is very low, score cannot exceed 3
    if (correct_points.length === 0 && wordCount < 25) {
      score = Math.min(score, 3);
      if (correct_points.length === 0) {
        correct_points.push("Attempted to address the question and identified the domain area.");
      }
    }

    // Build improvement advice
    let improvement = "";
    if (score >= 9) {
      improvement = "Exceptional response! Your explanation was thorough, technically sound, and structured with great clarity. To polish for executive rounds, briefly highlight real-world edge cases or production trade-offs.";
    } else if (score >= 7) {
      improvement = "Solid technical answer. To push from good to top-tier, explicitly mention the time/space complexities and bring up standard industry nuances (such as concurrency edge cases or framework internal flags).";
    } else if (score >= 5) {
      improvement = "Acceptable fundamental understanding, but lacks depth in key technical mechanisms. Structure your interview answers with: (1) Direct definition, (2) Internal mechanics, and (3) A concise practical code example.";
    } else {
      improvement = "Your answer missed several core technical pillars for this topic. Review the missing points below and focus on explaining the 'why' and 'how', not just high-level keywords.";
    }

    // Next action recommendation
    let next_action = "next_question";
    if (score < 6 && questionObj.followUpQuestion && !isFollowUp) {
      next_action = "trigger_followup";
    } else if (score >= 8) {
      next_action = "increase_difficulty";
    }

    return {
      score,
      correct_points,
      missing_points,
      mistakes: mistakes.length > 0 ? mistakes : ["No major technical misconceptions detected."],
      improvement,
      ideal_answer: questionObj.idealAnswer || "Refer to key architectural points.",
      next_action
    };
  }

  /**
   * Live Gemini LLM evaluation
   */
  async evaluateWithGemini({ questionObj, candidateAnswer, candidateProfile, isFollowUp }) {
    const prompt = `
You are an expert AI Technical Interviewer evaluating a candidate's response.
Strictly adhere to the following evaluation criteria:
Candidate Name: ${candidateProfile.candidateName || "Candidate"}
Target Role: ${candidateProfile.targetRole || "Software Engineer"}
Technology: ${questionObj.technology}
Experience Level: ${candidateProfile.experienceLevel || "Intermediate"}
Difficulty: ${questionObj.difficulty}
Interview Question: "${questionObj.question}"
Expected Key Points: ${JSON.stringify(questionObj.keyPoints || [])}
Candidate's Submitted Answer:
"${candidateAnswer}"

CRITICAL INSTRUCTIONS:
- Score the answer from 0 to 10 based on actual technical correctness, completeness, clarity, depth, and communication.
- Do NOT inflate scores to be nice.
- Return ONLY valid JSON matching this exact structure:
{
  "score": 0,
  "correct_points": ["point 1", "point 2"],
  "missing_points": ["missing point 1"],
  "mistakes": ["mistake 1 or note if none"],
  "improvement": "Practical interview improvement advice",
  "ideal_answer": "Concise interview-ready model answer",
  "next_action": "next_question or trigger_followup or increase_difficulty"
}
`;

    // Support both Gemini 1.5 flash and 2.0 flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) throw new Error("No text output received from Gemini API");

    const parsed = JSON.parse(textOutput);
    return {
      score: typeof parsed.score === "number" ? Math.min(10, Math.max(0, parsed.score)) : 5,
      correct_points: Array.isArray(parsed.correct_points) ? parsed.correct_points : [],
      missing_points: Array.isArray(parsed.missing_points) ? parsed.missing_points : [],
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : ["None"],
      improvement: parsed.improvement || "Focus on depth and practical examples.",
      ideal_answer: parsed.ideal_answer || questionObj.idealAnswer,
      next_action: parsed.next_action || (parsed.score < 6 ? "trigger_followup" : "next_question")
    };
  }
}
