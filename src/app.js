// Main Application Controller for AI Interview Preparation Agent
import { InterviewAgent } from './services/agentEngine.js';
import { VoiceEngine } from './services/voiceEngine.js';
import { StudyPlanGenerator } from './services/studyPlanGenerator.js';
import { QUESTION_BANK, getFilteredQuestions } from './data/questionBank.js';

class PrepAIApp {
  constructor() {
    this.agent = new InterviewAgent();
    this.voice = new VoiceEngine();
    this.currentCodeMode = false;
    this.mockTimerInterval = null;

    this.initDOM();
    this.bindEvents();
    this.renderCandidateSummary();
    this.renderToolsConsole();
    this.loadQuestion();
    this.renderAnalytics();
    this.renderExplorer();
  }

  initDOM() {
    // Nav
    this.navBtns = document.querySelectorAll('.nav-tab-btn');
    this.views = document.querySelectorAll('.view-section');

    // Candidate Ribbon
    this.candidateNameDisplay = document.getElementById('candidateNameDisplay');
    this.candidateRoleDisplay = document.getElementById('candidateRoleDisplay');
    this.candidateTechTag = document.getElementById('candidateTechTag');
    this.candidateExpTag = document.getElementById('candidateExpTag');
    this.candidateDiffTag = document.getElementById('candidateDiffTag');
    this.candidateInitials = document.getElementById('candidateInitials');

    // Modes
    this.modeCards = document.querySelectorAll('.mode-card');

    // Question
    this.qBreadcrumbTech = document.getElementById('qBreadcrumbTech');
    this.qBreadcrumbTopic = document.getElementById('qBreadcrumbTopic');
    this.qTypeBadge = document.getElementById('qTypeBadge');
    this.qDifficultyBadge = document.getElementById('qDifficultyBadge');
    this.qTitle = document.getElementById('qTitle');
    this.qContext = document.getElementById('qContext');
    this.codingContainer = document.getElementById('codingContainer');
    this.codingProblemStatement = document.getElementById('codingProblemStatement');
    this.codingConstraints = document.getElementById('codingConstraints');
    this.codingExamples = document.getElementById('codingExamples');

    // Voice & Audio
    this.btnSpeakQuestion = document.getElementById('btnSpeakQuestion');
    this.btnMicDictate = document.getElementById('btnMicDictate');
    this.audioWaves = document.getElementById('audioWaves');

    // Response Editor
    this.candidateAnswerInput = document.getElementById('candidateAnswerInput');
    this.btnModeText = document.getElementById('btnModeText');
    this.btnModeCode = document.getElementById('btnModeCode');
    this.wordCountDisplay = document.getElementById('wordCountDisplay');
    this.charCountDisplay = document.getElementById('charCountDisplay');
    this.btnSubmitAnswer = document.getElementById('btnSubmitAnswer');
    this.btnHint = document.getElementById('btnHint');
    this.btnClearAnswer = document.getElementById('btnClearAnswer');

    // Evaluation
    this.evaluationSection = document.getElementById('evaluationSection');
    this.evalScoreGauge = document.getElementById('evalScoreGauge');
    this.evalScoreText = document.getElementById('evalScoreText');
    this.evalVerdictText = document.getElementById('evalVerdictText');
    this.evalWellList = document.getElementById('evalWellList');
    this.evalMissingList = document.getElementById('evalMissingList');
    this.evalMistakesList = document.getElementById('evalMistakesList');
    this.evalImprovementText = document.getElementById('evalImprovementText');
    this.evalIdealAnswerText = document.getElementById('evalIdealAnswerText');
    this.btnNextQuestion = document.getElementById('btnNextQuestion');
    this.btnTakeFollowUp = document.getElementById('btnTakeFollowUp');
    this.nextActionBanner = document.getElementById('nextActionBanner');
    this.nextActionText = document.getElementById('nextActionText');

    // Tools Console
    this.toolLogsList = document.getElementById('toolLogsList');

    // Analytics
    this.statAvgScore = document.getElementById('statAvgScore');
    this.statTotalAnswered = document.getElementById('statTotalAnswered');
    this.statReadiness = document.getElementById('statReadiness');
    this.strongTopicsList = document.getElementById('strongTopicsList');
    this.weakTopicsList = document.getElementById('weakTopicsList');
    this.historyList = document.getElementById('historyList');
    this.btnClearHistory = document.getElementById('btnClearHistory');

    // Study Plan
    this.btnGeneratePlan = document.getElementById('btnGeneratePlan');
    this.studyPlanOutput = document.getElementById('studyPlanOutput');
    this.btnExportPlanMd = document.getElementById('btnExportPlanMd');
    this.btnPrintPlan = document.getElementById('btnPrintPlan');

    // Question Explorer
    this.explorerSearch = document.getElementById('explorerSearch');
    this.explorerTechFilter = document.getElementById('explorerTechFilter');
    this.explorerDiffFilter = document.getElementById('explorerDiffFilter');
    this.explorerTypeFilter = document.getElementById('explorerTypeFilter');
    this.explorerGrid = document.getElementById('explorerGrid');

    // Profile Settings Form
    this.profileForm = document.getElementById('profileForm');
    this.inputCandName = document.getElementById('inputCandName');
    this.selectTargetRole = document.getElementById('selectTargetRole');
    this.selectTech = document.getElementById('selectTech');
    this.selectExp = document.getElementById('selectExp');
    this.selectDiff = document.getElementById('selectDiff');
    this.selectInterviewType = document.getElementById('selectInterviewType');
    this.inputApiKey = document.getElementById('inputApiKey');
    this.btnSaveProfile = document.getElementById('btnSaveProfile');
    this.btnTestApiKey = document.getElementById('btnTestApiKey');
    this.apiKeyStatus = document.getElementById('apiKeyStatus');

    // Mock Modal
    this.mockModal = document.getElementById('mockModal');
    this.mockModalContent = document.getElementById('mockModalContent');
    this.btnCloseMockModal = document.getElementById('btnCloseMockModal');
  }

  bindEvents() {
    // Navigation
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const viewId = btn.getAttribute('data-view');
        this.switchView(viewId);
      });
    });

    // Mode Selection
    this.modeCards.forEach(card => {
      card.addEventListener('click', () => {
        const selectedMode = card.getAttribute('data-mode');
        this.setMode(selectedMode);
      });
    });

    // Voice - Read Question
    this.btnSpeakQuestion.addEventListener('click', () => {
      if (this.voice.isSpeaking) {
        this.voice.stopSpeaking();
        this.audioWaves.classList.remove('active');
        this.btnSpeakQuestion.classList.remove('active');
      } else {
        if (!this.agent.currentQuestion) return;
        this.voice.speak(
          this.agent.currentQuestion.question,
          () => {
            this.audioWaves.classList.add('active');
            this.btnSpeakQuestion.classList.add('active');
          },
          () => {
            this.audioWaves.classList.remove('active');
            this.btnSpeakQuestion.classList.remove('active');
          }
        );
      }
    });

    // Voice - Dictate Answer
    this.btnMicDictate.addEventListener('click', () => {
      if (this.voice.isListening) {
        this.voice.stopListening();
        this.btnMicDictate.classList.remove('listening');
      } else {
        this.voice.playChime('hint');
        this.btnMicDictate.classList.add('listening');
        this.voice.startListening({
          onTranscript: (text) => {
            const current = this.candidateAnswerInput.value;
            this.candidateAnswerInput.value = current ? current + " " + text : text;
            this.updateWordCount();
          },
          onError: (err) => {
            alert(`Speech Recognition Error: ${err}`);
            this.btnMicDictate.classList.remove('listening');
          },
          onEnd: () => {
            this.btnMicDictate.classList.remove('listening');
          }
        });
      }
    });

    // Textarea input count
    this.candidateAnswerInput.addEventListener('input', () => this.updateWordCount());

    // Toggle Text vs Code Mode
    this.btnModeText.addEventListener('click', () => this.setCodeMode(false));
    this.btnModeCode.addEventListener('click', () => this.setCodeMode(true));

    // Submit Answer
    this.btnSubmitAnswer.addEventListener('click', () => this.handleSubmitAnswer());

    // Next Question
    this.btnNextQuestion.addEventListener('click', () => {
      this.loadQuestion();
      this.evaluationSection.style.display = 'none';
      this.btnNextQuestion.style.display = 'none';
      this.btnTakeFollowUp.style.display = 'none';
      this.candidateAnswerInput.value = '';
      this.updateWordCount();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Take Follow-Up
    this.btnTakeFollowUp.addEventListener('click', () => {
      const followUpQ = this.agent.activateFollowUp();
      if (followUpQ) {
        this.renderQuestion(followUpQ);
        this.evaluationSection.style.display = 'none';
        this.btnNextQuestion.style.display = 'none';
        this.btnTakeFollowUp.style.display = 'none';
        this.candidateAnswerInput.value = '';
        this.updateWordCount();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // Clear Answer
    this.btnClearAnswer.addEventListener('click', () => {
      this.candidateAnswerInput.value = '';
      this.updateWordCount();
    });

    // Hint
    this.btnHint.addEventListener('click', () => {
      this.voice.playChime('hint');
      const hints = this.agent.currentQuestion?.hints;
      if (hints && hints.length > 0) {
        alert(`💡 Interviewer Nudge:\n\n${hints[0]}`);
      } else {
        alert("💡 Focus on articulating your core technical mechanisms and edge cases.");
      }
    });

    // Study Plan Generator
    this.btnGeneratePlan?.addEventListener('click', () => this.handleGenerateStudyPlan());
    this.btnExportPlanMd?.addEventListener('click', () => this.handleExportStudyPlanMarkdown());
    this.btnPrintPlan?.addEventListener('click', () => window.print());

    // Explorer Filters
    const filterHandler = () => this.renderExplorer();
    this.explorerSearch.addEventListener('input', filterHandler);
    this.explorerTechFilter.addEventListener('change', filterHandler);
    this.explorerDiffFilter.addEventListener('change', filterHandler);
    this.explorerTypeFilter.addEventListener('change', filterHandler);

    // Profile Settings
    this.btnSaveProfile.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSaveProfile();
    });

    this.btnTestApiKey.addEventListener('click', () => this.handleTestApiKey());

    // Clear History
    this.btnClearHistory.addEventListener('click', () => {
      if (confirm("Reset all interview history and topic mastery scores?")) {
        this.agent.clearHistory();
        this.renderAnalytics();
        this.renderCandidateSummary();
      }
    });

    // Close Mock Modal
    this.btnCloseMockModal.addEventListener('click', () => {
      this.mockModal.classList.remove('active');
    });
  }

  switchView(viewId) {
    this.navBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-view') === viewId));
    this.views.forEach(v => v.classList.toggle('active', v.id === viewId));

    if (viewId === 'analytics-view') this.renderAnalytics();
    if (viewId === 'explorer-view') this.renderExplorer();
    if (viewId === 'profile-view') this.populateProfileForm();
  }

  setMode(mode) {
    this.agent.profile.mode = mode;
    this.agent.saveToStorage();
    this.modeCards.forEach(c => c.classList.toggle('active', c.getAttribute('data-mode') === mode));

    if (mode === 'mock') {
      const firstQ = this.agent.startMockInterview();
      this.renderQuestion(firstQ);
      alert("🎙️ Starting 5-Question Mock Interview Mode!\nQuestions will be asked sequentially. Detailed scorecard report will be provided at the end.");
    } else {
      this.loadQuestion();
    }
  }

  setCodeMode(enabled) {
    this.currentCodeMode = enabled;
    this.btnModeText.classList.toggle('active', !enabled);
    this.btnModeCode.classList.toggle('active', enabled);
    this.candidateAnswerInput.classList.toggle('code-mode', enabled);
    this.candidateAnswerInput.placeholder = enabled 
      ? "// Write your implementation here...\nfunction solution() {\n  \n}"
      : "Type or speak your answer here. Explain your technical reasoning, internal mechanics, and real-world examples...";
  }

  updateWordCount() {
    const val = this.candidateAnswerInput.value.trim();
    const words = val ? val.split(/\s+/).length : 0;
    this.wordCountDisplay.textContent = `${words} words`;
    this.charCountDisplay.textContent = `${val.length} chars`;
  }

  renderCandidateSummary() {
    const p = this.agent.profile;
    this.candidateNameDisplay.textContent = p.candidateName || "Candidate";
    this.candidateRoleDisplay.textContent = `${p.targetRole} • ${p.experienceLevel}`;
    this.candidateTechTag.textContent = p.technology;
    this.candidateExpTag.textContent = p.experienceLevel;

    this.candidateDiffTag.textContent = p.difficulty;
    this.candidateDiffTag.className = `meta-tag difficulty-${p.difficulty}`;

    const initials = (p.candidateName || "Candidate")
      .split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    this.candidateInitials.textContent = initials || "AI";
  }

  renderToolsConsole() {
    this.toolLogsList.innerHTML = '';
    const logs = this.agent.toolLogs.slice(0, 10);
    if (logs.length === 0) {
      this.toolLogsList.innerHTML = `<div style="color:var(--text-dim); text-align:center; padding:1rem 0;">Awaiting agent tool invocation...</div>`;
      return;
    }

    logs.forEach(log => {
      const item = document.createElement('div');
      item.className = 'tool-log-item';
      item.innerHTML = `
        <div class="tool-log-time">${log.timestamp}</div>
        <div class="tool-log-name">⚡ ${log.toolName}</div>
        <div class="tool-log-output">${log.output}</div>
      `;
      this.toolLogsList.appendChild(item);
    });
  }

  loadQuestion(customTopic = null) {
    const q = this.agent.getNextQuestion(customTopic);
    this.renderQuestion(q);
    this.renderToolsConsole();
  }

  renderQuestion(q) {
    if (!q) return;

    this.qBreadcrumbTech.textContent = q.technology;
    this.qBreadcrumbTopic.textContent = `${q.topic} › ${q.subtopic}`;
    this.qTypeBadge.textContent = q.interviewType;
    this.qDifficultyBadge.textContent = q.difficulty;
    this.qDifficultyBadge.className = `meta-tag difficulty-${q.difficulty}`;

    this.qTitle.textContent = q.question;
    this.qContext.textContent = q.context || "";

    // Coding specific section
    if (q.codingDetails) {
      this.codingContainer.style.display = 'block';
      this.codingProblemStatement.textContent = q.codingDetails.problemStatement;
      this.codingConstraints.textContent = q.codingDetails.constraints || "None";
      
      let examplesHtml = "";
      (q.codingDetails.examples || []).forEach((ex, idx) => {
        examplesHtml += `
          <div class="coding-example-box">
            <div class="coding-example-row"><strong>Example ${idx + 1} Input:</strong> <code>${ex.input}</code></div>
            <div class="coding-example-row"><strong>Output:</strong> <code>${ex.output}</code></div>
            ${ex.explanation ? `<div class="coding-example-row"><strong>Explanation:</strong> ${ex.explanation}</div>` : ""}
          </div>
        `;
      });
      this.codingExamples.innerHTML = examplesHtml;

      // Auto switch to code mode and inject starter code if empty
      this.setCodeMode(true);
      if (!this.candidateAnswerInput.value.trim() && q.codingDetails.starterCode) {
        this.candidateAnswerInput.value = q.codingDetails.starterCode;
        this.updateWordCount();
      }
    } else {
      this.codingContainer.style.display = 'none';
      if (!this.candidateAnswerInput.value.trim()) {
        this.setCodeMode(false);
      }
    }
  }

  async handleSubmitAnswer() {
    const answer = this.candidateAnswerInput.value.trim();
    if (!answer) {
      alert("Please provide an answer (or speak via microphone) before submitting.");
      return;
    }

    this.btnSubmitAnswer.disabled = true;
    this.btnSubmitAnswer.innerHTML = `<span>Evaluating...</span>`;

    try {
      const evaluation = await this.agent.evaluateCurrentAnswer(answer);
      this.voice.playChime(evaluation.score >= 7 ? 'success' : 'submit');

      this.renderEvaluation(evaluation);
      this.renderToolsConsole();
      this.renderCandidateSummary();
      this.renderAnalytics();

      // Check if in Mock Interview mode
      if (this.agent.mockState.active) {
        const nextRound = this.agent.nextMockQuestion();
        if (nextRound.done) {
          this.showMockScorecardModal(nextRound.scorecard);
        } else {
          setTimeout(() => {
            alert(`Mock Round ${nextRound.round} of 5 loading...`);
            this.renderQuestion(nextRound.question);
            this.candidateAnswerInput.value = '';
            this.updateWordCount();
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      alert("Evaluation encountered an issue. Please try again.");
    } finally {
      this.btnSubmitAnswer.disabled = false;
      this.btnSubmitAnswer.innerHTML = `<span>Submit Answer</span> <span>➔</span>`;
    }
  }

  renderEvaluation(ev) {
    this.evaluationSection.style.display = 'block';

    // Radial gauge class & styling
    const scorePct = Math.round((ev.score / 10) * 100);
    this.evalScoreGauge.style.setProperty('--score-pct', scorePct);
    this.evalScoreText.textContent = `${ev.score}/10`;

    this.evalScoreGauge.className = 'radial-score-gauge ' + (
      ev.score >= 8 ? 'score-green' : ev.score >= 5 ? 'score-yellow' : 'score-red'
    );

    if (ev.score >= 8) {
      this.evalVerdictText.textContent = "Outstanding Response — Strong Hire quality";
      this.evalVerdictText.className = "text-emerald";
    } else if (ev.score >= 6) {
      this.evalVerdictText.textContent = "Good Response — Minor gaps in mechanics";
      this.evalVerdictText.className = "text-amber";
    } else {
      this.evalVerdictText.textContent = "Knowledge Gap Detected — Concept remediation needed";
      this.evalVerdictText.className = "text-rose";
    }

    // Correct Points
    this.evalWellList.innerHTML = (ev.correct_points || [])
      .map(p => `<li>${p}</li>`)
      .join("") || "<li>Attempted the question.</li>";

    // Missing Points
    this.evalMissingList.innerHTML = (ev.missing_points || [])
      .map(p => `<li>${p}</li>`)
      .join("") || "<li>No major concepts omitted.</li>";

    // Mistakes
    this.evalMistakesList.innerHTML = (ev.mistakes || [])
      .map(m => `<li>${m}</li>`)
      .join("") || "<li>No major technical mistakes detected.</li>";

    // Improvement advice
    this.evalImprovementText.textContent = ev.improvement || "";

    // Ideal answer
    this.evalIdealAnswerText.textContent = ev.ideal_answer || "";

    // Action buttons & Next Action Banner
    if (ev.next_action === "trigger_followup" && this.agent.pendingFollowUp) {
      this.nextActionBanner.className = "next-action-banner follow-up-needed";
      this.nextActionText.innerHTML = `<strong>Follow-Up Needed:</strong> You had gaps in <em>${this.agent.pendingFollowUp.concept}</em>. Take the targeted follow-up question below before continuing.`;
      this.btnTakeFollowUp.style.display = 'inline-flex';
      this.btnNextQuestion.style.display = 'none';
    } else {
      this.nextActionBanner.className = "next-action-banner";
      this.nextActionText.innerHTML = `<strong>Next Step:</strong> Adaptive progression updated. Click Next Question to proceed.`;
      this.btnNextQuestion.style.display = 'inline-flex';
      this.btnTakeFollowUp.style.display = 'none';
    }

    // Scroll to evaluation
    this.evaluationSection.scrollIntoView({ behavior: 'smooth' });
  }

  showMockScorecardModal(scorecard) {
    this.mockModal.classList.add('active');
    this.mockModalContent.innerHTML = `
      <div style="text-align:center; margin-bottom:1.5rem;">
        <div style="font-size:3rem; margin-bottom:0.5rem;">🏆</div>
        <h2 style="font-family:var(--font-heading); font-size:1.6rem; color:#fff;">Mock Interview Completed</h2>
        <p style="color:var(--text-muted); font-size:0.9rem;">Candidate: <strong>${scorecard.candidateName}</strong> • Role: <strong>${scorecard.targetRole}</strong></p>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
        <div style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:var(--radius-md); text-align:center;">
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Overall Score</div>
          <div style="font-size:2.2rem; font-weight:800; color:${scorecard.averageScore >= 7 ? '#10b981' : '#f59e0b'}; font-family:var(--font-heading);">
            ${scorecard.averageScore} / 10
          </div>
        </div>
        <div style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:var(--radius-md); text-align:center;">
          <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Hiring Recommendation</div>
          <div style="font-size:1.1rem; font-weight:700; color:#fff; margin-top:0.4rem;">
            ${scorecard.verdict}
          </div>
        </div>
      </div>

      <h4 style="font-family:var(--font-heading); font-size:1.05rem; margin-bottom:0.85rem; color:#a5b4fc;">Question Breakdown</h4>
      <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.5rem;">
        ${scorecard.evaluations.map((ev, i) => `
          <div style="background:#090c14; border:1px solid var(--border-subtle); padding:0.85rem; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:0.85rem; font-weight:600; color:#fff;">Q${i+1}: ${scorecard.questions[i]?.topic} (${scorecard.questions[i]?.interviewType})</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${scorecard.questions[i]?.question.slice(0, 75)}...</div>
            </div>
            <div style="font-size:1.1rem; font-weight:700; color:${ev.score >= 8 ? '#10b981' : ev.score >= 5 ? '#f59e0b' : '#f43f5e'};">
              ${ev.score}/10
            </div>
          </div>
        `).join("")}
      </div>

      <button class="btn-primary" style="width:100%; justify-content:center;" onclick="document.getElementById('mockModal').classList.remove('active')">
        Close Scorecard
      </button>
    `;
  }

  renderAnalytics() {
    const s = this.agent.stats;
    this.statAvgScore.innerHTML = `${s.averageScore} <span>/ 10</span>`;
    this.statTotalAnswered.textContent = s.totalAnswered;

    // Readiness calculation
    let readiness = 0;
    if (s.totalAnswered > 0) {
      readiness = Math.min(100, Math.round((s.averageScore / 10) * 85 + Math.min(15, s.totalAnswered * 3)));
    }
    this.statReadiness.textContent = `${readiness}%`;

    // Strong Topics
    if (s.strongTopics.length > 0) {
      this.strongTopicsList.innerHTML = s.strongTopics.map(t => `
        <span class="topic-pill strong">🟢 ${t}</span>
      `).join("");
    } else {
      this.strongTopicsList.innerHTML = `<span style="font-size:0.82rem; color:var(--text-dim);">Answer questions with score >= 7 to unlock strong topics.</span>`;
    }

    // Weak Topics
    if (s.weakTopics.length > 0) {
      this.weakTopicsList.innerHTML = s.weakTopics.map(t => `
        <span class="topic-pill weak">
          🔴 ${t}
          <button class="topic-action-btn" data-topic="${t}">Practice</button>
        </span>
      `).join("");

      // Bind Practice button on weak topics
      this.weakTopicsList.querySelectorAll('.topic-action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const topic = btn.getAttribute('data-topic');
          this.switchView('interview-view');
          this.setMode('topic');
          this.loadQuestion(topic);
        });
      });
    } else {
      this.weakTopicsList.innerHTML = `<span style="font-size:0.82rem; color:var(--text-dim);">No recurring weak topics detected yet. Great job!</span>`;
    }

    // History Timeline
    if (this.agent.history.length > 0) {
      this.historyList.innerHTML = this.agent.history.slice(0, 15).map(h => `
        <div class="history-item">
          <div class="history-item-left">
            <h5>${h.questionText.slice(0, 85)}...</h5>
            <div class="history-item-meta">
              <span><strong>${h.technology}</strong></span>
              <span>${h.topic}</span>
              <span>${new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div style="font-size:1.15rem; font-weight:800; font-family:var(--font-heading); color:${h.evaluation.score >= 8 ? '#10b981' : h.evaluation.score >= 5 ? '#f59e0b' : '#f43f5e'};">
            ${h.evaluation.score}/10
          </div>
        </div>
      `).join("");
    } else {
      this.historyList.innerHTML = `<div style="text-align:center; color:var(--text-dim); padding:1.5rem 0;">No interview answers recorded yet. Start practicing in the Interview Room!</div>`;
    }
  }

  handleGenerateStudyPlan() {
    const days = parseInt(document.getElementById('planDaysInput').value) || 7;
    const interviewDate = document.getElementById('planDateInput').value;

    const plan = StudyPlanGenerator.generate({
      targetRole: this.agent.profile.targetRole,
      technology: this.agent.profile.technology,
      days,
      skillLevel: this.agent.profile.experienceLevel,
      weakTopics: this.agent.stats.weakTopics,
      strongTopics: this.agent.stats.strongTopics,
      interviewDate
    });

    this.currentPlanData = plan;
    this.renderStudyPlan(plan);
  }

  renderStudyPlan(plan) {
    this.studyPlanOutput.style.display = 'block';

    let scheduleHtml = plan.schedule.map(d => `
      <div class="roadmap-day-card">
        <div class="day-badge-row">
          <span class="day-number-badge">DAY ${d.dayNumber}</span>
          <span class="meta-tag highlight">${d.priorityBadge}</span>
          <span class="meta-tag">⏱️ ${d.recommendedTime}</span>
        </div>
        <h4 class="day-title">${d.title}</h4>

        <div class="day-details-grid">
          <div class="day-sub-box">
            <h5>Practice Questions</h5>
            <ul>
              ${d.practiceQuestions.map(q => `<li>${q}</li>`).join("")}
            </ul>
          </div>
          <div class="day-sub-box">
            <h5>Coding Exercises</h5>
            <ul>
              ${d.codingExercises.map(c => `<li>${c}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); background:rgba(255,255,255,0.03); padding:0.5rem 0.85rem; border-radius:var(--radius-sm);">
          <strong>Revision Schedule:</strong> ${d.revisionSchedule}
        </div>
      </div>
    `).join("");

    this.studyPlanOutput.innerHTML = `
      <div class="study-plan-header-banner">
        <div>
          <h3 style="font-family:var(--font-heading); font-size:1.35rem; color:#fff; margin-bottom:0.25rem;">
            Personalized Roadmap for ${plan.metadata.targetRole} (${plan.metadata.technology})
          </h3>
          <p style="font-size:0.85rem; color:var(--text-muted);">
            Target Date: <strong>${plan.metadata.interviewDate}</strong> • Estimated Total Study: <strong>${plan.metadata.totalStudyHours} Hours</strong>
          </p>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn-secondary" id="btnExportPlanMd">📥 Export Markdown</button>
          <button class="btn-secondary" id="btnPrintPlan">🖨️ Print / PDF</button>
        </div>
      </div>

      <div class="roadmap-timeline">
        ${scheduleHtml}
      </div>
    `;

    document.getElementById('btnExportPlanMd').addEventListener('click', () => this.handleExportStudyPlanMarkdown());
    document.getElementById('btnPrintPlan').addEventListener('click', () => window.print());

    this.studyPlanOutput.scrollIntoView({ behavior: 'smooth' });
  }

  handleExportStudyPlanMarkdown() {
    if (!this.currentPlanData) return;
    const p = this.currentPlanData;

    let md = `# Personalized Interview Preparation Roadmap\n\n`;
    md += `- **Target Role:** ${p.metadata.targetRole}\n`;
    md += `- **Technology:** ${p.metadata.technology}\n`;
    md += `- **Duration:** ${p.metadata.days} Days (${p.metadata.totalStudyHours} total study hours)\n`;
    md += `- **Generated On:** ${p.metadata.generatedAt}\n\n---\n\n`;

    p.schedule.forEach(d => {
      md += `## Day ${d.dayNumber}: ${d.title}\n`;
      md += `- **Priority:** ${d.priority}\n`;
      md += `- **Recommended Time:** ${d.recommendedTime}\n\n`;
      md += `### Practice Questions\n`;
      d.practiceQuestions.forEach(q => { md += `- ${q}\n`; });
      md += `\n### Coding Exercises\n`;
      d.codingExercises.forEach(c => { md += `- ${c}\n`; });
      md += `\n**Revision:** ${d.revisionSchedule}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Interview_Study_Plan_${p.metadata.technology}_${p.metadata.days}Days.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  renderExplorer() {
    const search = this.explorerSearch.value.toLowerCase();
    const tech = this.explorerTechFilter.value;
    const diff = this.explorerDiffFilter.value;
    const type = this.explorerTypeFilter.value;

    const filtered = QUESTION_BANK.filter(q => {
      if (tech !== 'All' && q.technology.toLowerCase() !== tech.toLowerCase()) return false;
      if (diff !== 'All' && q.difficulty.toLowerCase() !== diff.toLowerCase()) return false;
      if (type !== 'All' && q.interviewType.toLowerCase() !== type.toLowerCase()) return false;
      if (search && !q.question.toLowerCase().includes(search) && !q.topic.toLowerCase().includes(search)) return false;
      return true;
    });

    if (filtered.length === 0) {
      this.explorerGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--text-dim); padding:2rem;">No questions matching filters.</div>`;
      return;
    }

    this.explorerGrid.innerHTML = filtered.map(q => `
      <div class="explorer-question-card">
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
            <span class="meta-tag highlight">${q.technology}</span>
            <span class="meta-tag difficulty-${q.difficulty}">${q.difficulty}</span>
          </div>
          <h4 style="font-size:0.95rem; font-weight:600; line-height:1.45; margin-bottom:0.5rem; color:#fff;">
            ${q.question}
          </h4>
          <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:1rem;">
            ${q.topic} • ${q.interviewType}
          </p>
        </div>
        <button class="btn-secondary" style="width:100%; justify-content:center;" data-question-id="${q.id}">
          Practice This Question ➔
        </button>
      </div>
    `).join("");

    this.explorerGrid.querySelectorAll('button[data-question-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-question-id');
        const q = QUESTION_BANK.find(item => item.id === id);
        if (q) {
          this.switchView('interview-view');
          this.agent.currentQuestion = q;
          this.renderQuestion(q);
          this.evaluationSection.style.display = 'none';
          this.candidateAnswerInput.value = '';
          this.updateWordCount();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  populateProfileForm() {
    const p = this.agent.profile;
    this.inputCandName.value = p.candidateName || "";
    this.selectTargetRole.value = p.targetRole || "Full Stack Engineer";
    this.selectTech.value = p.technology || "Java";
    this.selectExp.value = p.experienceLevel || "Intermediate";
    this.selectDiff.value = p.difficulty || "Intermediate";
    this.selectInterviewType.value = p.interviewType || "Conceptual";
    this.inputApiKey.value = p.apiKey || "";
  }

  handleSaveProfile() {
    const updated = {
      candidateName: this.inputCandName.value.trim() || "Candidate",
      targetRole: this.selectTargetRole.value,
      technology: this.selectTech.value,
      experienceLevel: this.selectExp.value,
      difficulty: this.selectDiff.value,
      interviewType: this.selectInterviewType.value,
      apiKey: this.inputApiKey.value.trim()
    };

    this.agent.updateProfile(updated);
    this.renderCandidateSummary();
    alert("Profile settings saved successfully!");
  }

  async handleTestApiKey() {
    const key = this.inputApiKey.value.trim();
    if (!key) {
      alert("Please enter a Google Gemini API Key first.");
      return;
    }

    this.apiKeyStatus.innerHTML = `<span style="color:#fbbf24;">Testing Gemini API connection...</span>`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Respond with the word 'OK'" }] }]
          })
        }
      );

      if (response.ok) {
        this.apiKeyStatus.innerHTML = `<span style="color:#34d399;">✓ API Key Valid & Connected! Real-time LLM evaluations active.</span>`;
      } else {
        this.apiKeyStatus.innerHTML = `<span style="color:#fb7185;">✗ API Key Invalid or Quota Exceeded (Status ${response.status}).</span>`;
      }
    } catch (e) {
      this.apiKeyStatus.innerHTML = `<span style="color:#fb7185;">✗ Network error: ${e.message}</span>`;
    }
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.prepApp = new PrepAIApp();
});
