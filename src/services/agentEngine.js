// AI Interview Preparation Agent Engine
// Orchestrates: Candidate Profile, Question Selection, Difficulty Progression,
// Follow-ups, Mock Interview rounds, Weak Area Tracking, and Tool Invocations.

import { QUESTION_BANK, getFilteredQuestions } from '../data/questionBank.js';
import { EvaluationEngine } from './evaluationEngine.js';

const STORAGE_KEY_PROFILE = 'prep_ai_candidate_profile';
const STORAGE_KEY_HISTORY = 'prep_ai_interview_history';
const STORAGE_KEY_STATS = 'prep_ai_candidate_stats';

export class InterviewAgent {
  constructor() {
    this.evaluationEngine = new EvaluationEngine();

    // Default Profile adhering to Section 2
    this.profile = {
      candidateName: 'Alex Rivera',
      targetRole: 'Full Stack Engineer',
      technology: 'Java',
      experienceLevel: 'Intermediate', // Beginner, Intermediate, Senior
      difficulty: 'Intermediate',     // Beginner, Intermediate, Advanced
      interviewType: 'Conceptual',    // Conceptual, Technical, Scenario-based, Coding
      topics: ['OOP', 'Collections', 'Multithreading'],
      mode: 'practice',               // practice, mock, topic, weak_area
      apiKey: ''
    };

    // State
    this.currentQuestion = null;
    this.currentQuestionIndex = 0;
    this.isFollowUpActive = false;
    this.pendingFollowUp = null;
    this.consecutiveHighScores = 0;
    this.consecutiveLowScores = 0;

    // Mock Interview State
    this.mockState = {
      active: false,
      totalQuestions: 5,
      currentRound: 0,
      questions: [],
      candidateAnswers: [],
      evaluations: [],
      startTime: null,
      endTime: null,
      isCompleted: false
    };

    // Tool execution logs (Section 11 & 12)
    this.toolLogs = [];

    // History and Metrics (Section 9)
    this.history = [];
    this.stats = {
      totalAnswered: 0,
      totalScore: 0,
      averageScore: 0,
      strongTopics: [],
      weakTopics: [],
      topicScores: {} // { topic: { totalScore: 0, count: 0, avg: 0 } }
    };

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (savedProfile) {
        this.profile = { ...this.profile, ...JSON.parse(savedProfile) };
        if (this.profile.apiKey) {
          this.evaluationEngine.setApiKey(this.profile.apiKey);
        }
      }

      const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }

      const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
      if (savedStats) {
        this.stats = { ...this.stats, ...JSON.parse(savedStats) };
      }
    } catch (e) {
      console.warn("Storage load warning:", e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(this.profile));
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.history.slice(-50)));
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(this.stats));
    } catch (e) {
      console.warn("Storage save warning:", e);
    }
  }

  updateProfile(newProfile) {
    this.profile = { ...this.profile, ...newProfile };
    if (newProfile.apiKey !== undefined) {
      this.evaluationEngine.setApiKey(newProfile.apiKey);
    }
    this.saveToStorage();
  }

  logToolCall(toolName, inputPayload, outputSummary) {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      toolName,
      input: inputPayload,
      output: outputSummary
    };
    this.toolLogs.unshift(entry);
    if (this.toolLogs.length > 20) this.toolLogs.pop();
    return entry;
  }

  // ==================== QUESTION GENERATOR TOOL ====================
  getNextQuestion(customTopic = null) {
    this.isFollowUpActive = false;
    this.pendingFollowUp = null;

    let candidateQuestions = [];

    if (this.profile.mode === 'weak_area') {
      // Prioritize questions from candidate's recorded weak topics
      const weakTopics = this.stats.weakTopics;
      if (weakTopics && weakTopics.length > 0) {
        candidateQuestions = QUESTION_BANK.filter(q => 
          weakTopics.some(wt => wt.toLowerCase() === q.topic.toLowerCase() || wt.toLowerCase() === q.technology.toLowerCase())
        );
      }
    } else if (this.profile.mode === 'topic' && customTopic) {
      candidateQuestions = QUESTION_BANK.filter(q => 
        q.topic.toLowerCase() === customTopic.toLowerCase() ||
        q.subtopic.toLowerCase().includes(customTopic.toLowerCase())
      );
    }

    // Fallback to standard filtered list
    if (candidateQuestions.length === 0) {
      candidateQuestions = getFilteredQuestions({
        technology: this.profile.technology,
        difficulty: this.profile.difficulty,
        interviewType: this.profile.interviewType,
        topic: customTopic
      });
    }

    // If still empty, broaden filters
    if (candidateQuestions.length === 0) {
      candidateQuestions = QUESTION_BANK.filter(q => 
        this.profile.technology === 'All' || q.technology.toLowerCase() === this.profile.technology.toLowerCase()
      );
    }

    if (candidateQuestions.length === 0) {
      candidateQuestions = QUESTION_BANK;
    }

    // Pick question avoiding recently answered if possible
    const answeredIds = new Set(this.history.map(h => h.questionId));
    let unasked = candidateQuestions.filter(q => !answeredIds.has(q.id));
    if (unasked.length === 0) unasked = candidateQuestions;

    const randomIndex = Math.floor(Math.random() * unasked.length);
    this.currentQuestion = unasked[randomIndex];
    this.currentQuestionIndex++;

    this.logToolCall(
      "Question Generator Tool",
      { technology: this.profile.technology, difficulty: this.profile.difficulty, mode: this.profile.mode },
      `Selected question "${this.currentQuestion.id}" (${this.currentQuestion.topic} - ${this.currentQuestion.difficulty})`
    );

    return this.currentQuestion;
  }

  // ==================== MOCK INTERVIEW MODE ====================
  startMockInterview() {
    this.profile.mode = 'mock';
    this.mockState.active = true;
    this.mockState.currentRound = 0;
    this.mockState.candidateAnswers = [];
    this.mockState.evaluations = [];
    this.mockState.startTime = Date.now();
    this.mockState.endTime = null;
    this.mockState.isCompleted = false;

    // Pick 5 diverse questions: 1 Conceptual, 2 Technical, 1 Scenario-based, 1 Coding
    const techPool = QUESTION_BANK.filter(q => 
      this.profile.technology === 'All' || q.technology.toLowerCase() === this.profile.technology.toLowerCase()
    );

    const questions = [];
    const types = ['Conceptual', 'Technical', 'Technical', 'Scenario-based', 'Coding'];

    for (const t of types) {
      let matching = techPool.filter(q => q.interviewType === t && !questions.includes(q));
      if (matching.length === 0) {
        matching = QUESTION_BANK.filter(q => q.interviewType === t && !questions.includes(q));
      }
      if (matching.length > 0) {
        questions.push(matching[Math.floor(Math.random() * matching.length)]);
      } else {
        questions.push(techPool[Math.floor(Math.random() * techPool.length)]);
      }
    }

    this.mockState.questions = questions.slice(0, 5);
    this.currentQuestion = this.mockState.questions[0];

    this.logToolCall(
      "Mock Interview Tool",
      { totalQuestions: 5, candidate: this.profile.candidateName },
      `Assembled full 5-question realistic mock interview syllabus.`
    );

    return this.currentQuestion;
  }

  nextMockQuestion() {
    this.mockState.currentRound++;
    if (this.mockState.currentRound < this.mockState.questions.length) {
      this.currentQuestion = this.mockState.questions[this.mockState.currentRound];
      return { done: false, question: this.currentQuestion, round: this.mockState.currentRound + 1 };
    } else {
      this.mockState.active = false;
      this.mockState.isCompleted = true;
      this.mockState.endTime = Date.now();
      return { done: true, scorecard: this.calculateMockScorecard() };
    }
  }

  calculateMockScorecard() {
    const totalScore = this.mockState.evaluations.reduce((acc, ev) => acc + (ev.score || 0), 0);
    const avgScore = (totalScore / this.mockState.evaluations.length).toFixed(1);
    const elapsedMinutes = Math.round((this.mockState.endTime - this.mockState.startTime) / 60000);

    let verdict = "";
    if (avgScore >= 8) verdict = "Strong Hire (Top 10% Candidate)";
    else if (avgScore >= 6.5) verdict = "Hire / Leaning Hire";
    else if (avgScore >= 5) verdict = "Needs Improvement (Borderline)";
    else verdict = "Not Ready (Significant Knowledge Gaps)";

    return {
      candidateName: this.profile.candidateName,
      targetRole: this.profile.targetRole,
      technology: this.profile.technology,
      averageScore: avgScore,
      totalScore,
      verdict,
      elapsedMinutes,
      evaluations: this.mockState.evaluations,
      questions: this.mockState.questions
    };
  }

  // ==================== ANSWER EVALUATION TOOL ====================
  async evaluateCurrentAnswer(candidateAnswer) {
    this.logToolCall(
      "Answer Evaluation Tool",
      {
        questionId: this.currentQuestion?.id,
        isFollowUp: this.isFollowUpActive,
        wordCount: candidateAnswer.split(/\s+/).length
      },
      "Evaluating response against correctness, depth, clarity, and key points..."
    );

    const evaluation = await this.evaluationEngine.evaluate({
      questionObj: this.currentQuestion,
      candidateAnswer,
      candidateProfile: this.profile,
      isFollowUp: this.isFollowUpActive
    });

    // Record stats and history
    this.recordEvaluation(this.currentQuestion, candidateAnswer, evaluation);

    // Adapt Difficulty (Section 5)
    this.handleAdaptiveProgression(evaluation.score);

    // Detect Weak & Strong Topics (Section 9)
    this.detectTopicMastery(this.currentQuestion.topic, evaluation.score);

    // Check for follow-up triggers (Section 8)
    if (evaluation.next_action === "trigger_followup" && this.currentQuestion.followUpQuestion && !this.isFollowUpActive) {
      this.pendingFollowUp = this.currentQuestion.followUpQuestion;
      this.logToolCall(
        "Follow-Up Trigger Tool",
        { concept: this.pendingFollowUp.concept },
        `Candidate had gaps in ${this.currentQuestion.topic}. Triggering follow-up question.`
      );
    }

    return evaluation;
  }

  // Activate the pending follow-up question
  activateFollowUp() {
    if (!this.pendingFollowUp) return null;

    this.isFollowUpActive = true;
    const parentQuestion = this.currentQuestion;

    this.currentQuestion = {
      id: `${parentQuestion.id}-followup`,
      technology: parentQuestion.technology,
      topic: parentQuestion.topic,
      subtopic: `${parentQuestion.subtopic} (Follow-Up)`,
      difficulty: parentQuestion.difficulty,
      interviewType: "Conceptual",
      question: this.pendingFollowUp.question,
      context: `Follow-up on concept: ${this.pendingFollowUp.concept}`,
      keyPoints: this.pendingFollowUp.keyPoints,
      commonMistakes: ["Failing to address the specific missing link in previous answer"],
      idealAnswer: `Clarifying ${this.pendingFollowUp.concept}: ${this.pendingFollowUp.keyPoints.join(" ")}`,
      hints: ["Address the exact follow-up prompt directly."],
      isFollowUp: true
    };

    this.pendingFollowUp = null;
    return this.currentQuestion;
  }

  // Adaptive Difficulty Progression (Section 5)
  handleAdaptiveProgression(score) {
    if (score >= 8) {
      this.consecutiveHighScores++;
      this.consecutiveLowScores = 0;
      if (this.consecutiveHighScores >= 2) {
        if (this.profile.difficulty === 'Beginner') {
          this.profile.difficulty = 'Intermediate';
          this.logToolCall("Adaptive Difficulty Tool", { score, streak: this.consecutiveHighScores }, "Promoted difficulty: Beginner → Intermediate");
        } else if (this.profile.difficulty === 'Intermediate') {
          this.profile.difficulty = 'Advanced';
          this.logToolCall("Adaptive Difficulty Tool", { score, streak: this.consecutiveHighScores }, "Promoted difficulty: Intermediate → Advanced");
        }
        this.consecutiveHighScores = 0;
      }
    } else if (score < 5) {
      this.consecutiveLowScores++;
      this.consecutiveHighScores = 0;
      if (this.consecutiveLowScores >= 2) {
        if (this.profile.difficulty === 'Advanced') {
          this.profile.difficulty = 'Intermediate';
          this.logToolCall("Adaptive Difficulty Tool", { score, streak: this.consecutiveLowScores }, "Eased difficulty: Advanced → Intermediate to rebuild confidence");
        } else if (this.profile.difficulty === 'Intermediate') {
          this.profile.difficulty = 'Beginner';
          this.logToolCall("Adaptive Difficulty Tool", { score, streak: this.consecutiveLowScores }, "Eased difficulty: Intermediate → Beginner with core explanations");
        }
        this.consecutiveLowScores = 0;
      }
    } else {
      this.consecutiveHighScores = 0;
      this.consecutiveLowScores = 0;
    }
    this.saveToStorage();
  }

  // Detect Weak & Strong Topics (Section 9)
  detectTopicMastery(topic, score) {
    if (!this.stats.topicScores[topic]) {
      this.stats.topicScores[topic] = { totalScore: 0, count: 0, avg: 0 };
    }
    const t = this.stats.topicScores[topic];
    t.totalScore += score;
    t.count += 1;
    t.avg = Number((t.totalScore / t.count).toFixed(1));

    // Recompute strong & weak topics
    const strong = [];
    const weak = [];

    for (const [topName, topData] of Object.entries(this.stats.topicScores)) {
      if (topData.avg >= 7.0 && topData.count >= 1) {
        strong.push(topName);
      } else if (topData.avg < 6.0 && topData.count >= 1) {
        weak.push(topName);
      }
    }

    this.stats.strongTopics = strong;
    this.stats.weakTopics = weak;
    this.saveToStorage();

    this.logToolCall(
      "Weak Topic Detection Tool",
      { topic, score, avg: t.avg },
      `Updated mastery for ${topic}. Strong: [${strong.join(", ")}], Weak: [${weak.join(", ")}]`
    );
  }

  recordEvaluation(question, answer, evaluation) {
    const historyItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      questionId: question.id,
      questionText: question.question,
      technology: question.technology,
      topic: question.topic,
      difficulty: question.difficulty,
      candidateAnswer: answer,
      evaluation
    };

    this.history.unshift(historyItem);
    this.stats.totalAnswered += 1;
    this.stats.totalScore += evaluation.score;
    this.stats.averageScore = Number((this.stats.totalScore / this.stats.totalAnswered).toFixed(1));

    if (this.mockState.active) {
      this.mockState.candidateAnswers.push(answer);
      this.mockState.evaluations.push(evaluation);
    }

    this.saveToStorage();
  }

  clearHistory() {
    this.history = [];
    this.stats = {
      totalAnswered: 0,
      totalScore: 0,
      averageScore: 0,
      strongTopics: [],
      weakTopics: [],
      topicScores: {}
    };
    this.saveToStorage();
  }
}
