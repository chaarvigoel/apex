/* Rule-based (no ML) Cycle-Aware Training Adjustment Engine */
(function () {
  const $ = (sel) => document.querySelector(sel);

  const els = {
    // Gauge + dashboard outputs
    readinessScore: $("#readinessScore"),
    readinessHeadline: $("#readinessHeadline"),
    readinessText: $("#readinessText"),
    cycleCaption: $("#cycleCaption"),
    cardTrainingValue: $("#cardTrainingValue"),
    cardTrainingHint: $("#cardTrainingHint"),
    cardRecoveryValue: $("#cardRecoveryValue"),
    cardRecoveryHint: $("#cardRecoveryHint"),
    cardInjuryValue: $("#cardInjuryValue"),
    cardInjuryHint: $("#cardInjuryHint"),
    cardSCValue: $("#cardSCValue"),
    cardSCHint: $("#cardSCHint"),

    // Week strip
    weekType: [
      $("#weekType0"),
      $("#weekType1"),
      $("#weekType2"),
      $("#weekType3"),
      $("#weekType4"),
      $("#weekType5"),
      $("#weekType6"),
    ],
    weekRisk: [
      $("#weekRisk0"),
      $("#weekRisk1"),
      $("#weekRisk2"),
      $("#weekRisk3"),
      $("#weekRisk4"),
      $("#weekRisk5"),
      $("#weekRisk6"),
    ],

    // Engine UI
    inputCyclePhase: $("#inputCyclePhase"),
    inputCycleDay: $("#inputCycleDay"),
    inputSleepQuality: $("#inputSleepQuality"),
    inputSoreness: $("#inputSoreness"),
    inputFatigue: $("#inputFatigue"),
    inputCramps: $("#inputCramps"),
    inputAlteredComfort: $("#inputAlteredComfort"),
    inputSessionType: $("#inputSessionType"),

    athleteFields: $("#athleteFields"),
    modeAthlete: $("#modeAthlete"),
    modeCoach: $("#modeCoach"),

    engineReadinessValue: $("#engineReadinessValue"),
    engineRecoveryNote: $("#engineRecoveryNote"),
    engineTrainingAdjustment: $("#engineTrainingAdjustment"),
    engineRuleReasons: $("#engineRuleReasons"),

    btnLogCheckin: $("#btnLogCheckin"),
    logStatus: $("#logStatus"),
    btnClearPattern: $("#btnClearPattern"),
    patternSummary: $("#patternSummary"),

    forecastGrid: $("#forecastGrid"),
  };

  if (!els.inputCyclePhase) return; // If this page changes, fail safe.

  const STORAGE_KEY = "apexCheckins";

  const PHASE_POINTS = {
    "Early follicular": 8,
    "Late follicular": 12,
    Ovulatory: 6,
    "Early luteal": 16,
    "Late luteal": 24,
    Menstrual: 22,
  };

  const SLEEP_POINTS = {
    good: 0,
    mixed: 10,
    poor: 18,
  };

  const SORENESS_POINTS = {
    low: 0,
    moderate: 10,
    high: 18,
  };

  const FATIGUE_POINTS = {
    low: 0,
    moderate: 10,
    high: 18,
  };

  // Symptom points are intentionally small enough to keep the rules explainable.
  const SYMPTOM_POINTS = {
    cramps: 12,
    alteredComfort: 7,
  };

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function readinessFromRisk(risk) {
    if (risk < 35) {
      return {
        key: "green",
        label: "Green",
        scoreText: "Green",
        needle: -20,
        weekText: "Stable",
      };
    }
    if (risk < 65) {
      return {
        key: "yellow",
        label: "Yellow",
        scoreText: "Yellow",
        needle: 0,
        weekText: "Watch",
      };
    }
    return {
      key: "red",
      label: "Red",
      scoreText: "Red",
      needle: 20,
      weekText: "High",
    };
  }

  function phaseFromCycleDay(day) {
    // Simple rule-based mapping for demo/preview.
    // This intentionally avoids ML and stays credible as a "MVP rules layer".
    if (day >= 1 && day <= 5) return "Menstrual";
    if (day >= 6 && day <= 9) return "Early follicular";
    if (day >= 10 && day <= 13) return "Late follicular";
    if (day === 14) return "Ovulatory";
    if (day >= 15 && day <= 18) return "Early luteal";
    if (day >= 19 && day <= 22) return "Late luteal";
    return "Late luteal";
  }

  function computeRisk({ phase, sleepQuality, soreness, fatigue, cramps, alteredComfort }) {
    const phasePts = PHASE_POINTS[phase] ?? 12;
    const sleepPts = SLEEP_POINTS[sleepQuality] ?? 10;
    const sorenessPts = SORENESS_POINTS[soreness] ?? 10;
    const fatiguePts = FATIGUE_POINTS[fatigue] ?? 10;
    const symptomPts =
      (cramps ? SYMPTOM_POINTS.cramps : 0) + (alteredComfort ? SYMPTOM_POINTS.alteredComfort : 0);

    const risk = clamp(phasePts + sleepPts + sorenessPts + fatiguePts + symptomPts, 0, 100);

    return { risk, phasePts, sleepPts, sorenessPts, fatiguePts, symptomPts };
  }

  function ruleReasons({ phase, sleepQuality, soreness, fatigue, cramps, alteredComfort, sessionType }) {
    const tags = [];
    tags.push(`Phase: ${phase}`);

    if (sleepQuality === "poor") tags.push("Poor sleep quality");
    if (sleepQuality === "mixed") tags.push("Mixed sleep quality");

    if (soreness === "high") tags.push("High soreness");
    if (soreness === "moderate") tags.push("Moderate soreness");

    if (fatigue === "high") tags.push("High fatigue");
    if (fatigue === "moderate") tags.push("Moderate fatigue");

    const isCoach = document.body.classList.contains("mode-coach");
    if (!isCoach) {
      if (cramps) tags.push("Cramps/discomfort reported");
      if (alteredComfort) tags.push("Altered comfort reported");
    }

    tags.push(`Session: ${prettySession(sessionType)}`);
    return tags.slice(0, 8);
  }

  function prettySession(sessionType) {
    switch (sessionType) {
      case "sprint":
        return "Sprint day";
      case "jump":
        return "Jump session";
      case "heavy":
        return "Heavy lift";
      case "strength":
        return "Strength + technique";
      case "match":
        return "Match";
      default:
        return "Session";
    }
  }

  function recoveryNote(levelKey, { sleepQuality, soreness, fatigue, cramps, alteredComfort, phase }) {
    const base = `Cycle-aware recovery note for ${phase}.`;

    if (levelKey === "green") {
      return `${base} Sleep + soreness + fatigue are within a normal range today. Keep warm-ups consistent and maintain technique quality.`;
    }

    if (levelKey === "yellow") {
      const sleepPart =
        sleepQuality === "poor"
          ? "sleep has been poor"
          : sleepQuality === "mixed"
          ? "sleep is mixed"
          : "sleep is adequate";
      return `${base} Your readiness is watch-level: ${sleepPart}, with elevated neuromuscular load sensitivity. Emphasize recovery behaviors and keep explosive work at reduced volume.`;
    }

    const isCoach = document.body.classList.contains("mode-coach");
    const symptomFlag = cramps || alteredComfort;
    const symptomPart = isCoach
      ? symptomFlag
        ? "Lower comfort reported"
        : "Symptoms may increase sensitivity"
      : cramps
      ? "Cramps/discomfort are present"
      : "Symptoms may increase sensitivity";

    return `${base} Red readiness: fatigue/soreness + cycle context suggest higher stress risk. ${symptomPart}. Prioritize recovery, reduce explosive load, and keep sessions focused on control + reactivity.`;
  }

  function trainingAdjustment(levelKey, sessionType, { cramps, alteredComfort, phase }) {
    // Session-specific mapping: this is the missing "risk → action" piece.
    if (levelKey === "green") {
      switch (sessionType) {
        case "jump":
          return "Proceed with jumps as written. Maintain landing mechanics; keep volume as planned.";
        case "sprint":
          return "Proceed with sprint work as written. Prioritize quality reps and full recovery between efforts.";
        case "heavy":
          return "Proceed with heavy lift loading as written, but avoid max-testing if technique degrades.";
        case "match":
          return "Proceed with match/high-intensity demands. Keep cooldown active and hydrate aggressively.";
        default:
          return "Proceed with training as planned; maintain warm-up consistency.";
      }
    }

    if (levelKey === "yellow") {
      if (sessionType === "jump") {
        const extra = cramps || alteredComfort ? "Given symptoms, keep landing volume conservative." : "";
        return `Monitor jump volume (reduce ~20-35%) and keep quality high. ${extra}`.trim();
      }
      if (sessionType === "sprint") {
        return "Reduce sprint intensity/volume (~15-30%) while preserving technique. Extend warm-up and shorten hard-set sequences.";
      }
      if (sessionType === "heavy") {
        return "Avoid max lifts; reduce load slightly (~5-10%) and shift to controlled tempo + accessory work.";
      }
      if (sessionType === "match") {
        return "Cap high-speed exposures in training. Keep strength/mobility work focused on recovery and movement quality.";
      }
      return "Adjust explosive work to maintain quality; reduce volume modestly.";
    }

    // Red
    if (sessionType === "jump") {
      return "Emphasize recovery and reduce explosive load (~40-60%). Replace plyo volume with technique drills, activation, and mobility.";
    }
    if (sessionType === "sprint") {
      return "Reduce sprint intensity and volume (~35-55%). Focus on mechanics, then shift later efforts to low/moderate intensity.";
    }
    if (sessionType === "heavy") {
      return "Reduce heavy loading (~10-25%) and avoid max-effort sets. Prioritize activation, single-joint work, and recovery support.";
    }
    if (sessionType === "match") {
      return "Protect recovery around the high-intensity day: reduce explosive training beforehand and keep session goals tactical/control-focused.";
    }
    return "Red readiness: emphasize recovery and avoid high-explosive volume; keep the day control-oriented.";
  }

  function trainingFocusCards(levelKey, sessionType) {
    // Drives the existing 4 cards.
    if (levelKey === "green") {
      return {
        focusValue: "Normal training intensity",
        focusHint: "Proceed with quality reps. Keep landing/sprint mechanics crisp.",
        recoveryValue: "Recovery support stays proactive",
        recoveryHint: "Maintain sleep + hydration habits; keep warm-ups consistent.",
        injuryValue: "No elevated risk",
        injuryHint: "Maintain neuromuscular control cues during explosive work.",
        scValue: "Execute the team plan; protect technique quality",
        scHint: "This is a service layer: your coach’s program stays intact. Apex only fine-tunes load and focus.",
      };
    }

    if (levelKey === "yellow") {
      if (sessionType === "jump") {
        return {
          focusValue: "Moderate intensity · monitor jumps",
          focusHint: "Good day for technical work; reduce jump volume and keep landing mechanics tight.",
          recoveryValue: "Recovery sensitivity elevated",
          recoveryHint: "Prioritize sleep routine and hydration; avoid back-to-back hard plyos.",
          injuryValue: "ACL risk window: watch",
          injuryHint: "Emphasize landing mechanics + neuromuscular control. Stop sets early if form slips.",
          scValue: "Neuromuscular control emphasis · reduce plyo volume",
          scHint: "Sync and adjust: keep quality high, cut volume, and match your staff’s decision rules.",
        };
      }
      return {
        focusValue: "Moderate intensity",
        focusHint: "Proceed with intent, but cap hard exposures and keep quality high.",
        recoveryValue: "Sleep + recovery behaviors matter more today",
        recoveryHint: "Extend warm-up activation and keep cooldown active. Avoid stacked max-intensity days.",
        injuryValue: "ACL risk window: elevated",
        injuryHint: "Use control cues (landing, decel, trunk stiffness) and reduce explosive volume modestly.",
        scValue: "Tactical load reduction · preserve quality",
        scHint: "Not generic rest: this is load modulation aligned with cycle and reported recovery.",
      };
    }

    // Red
    if (sessionType === "jump") {
      return {
        focusValue: "Recovery-forward day",
        focusHint: "Reduce explosive volume. Keep movement patterns clean; preserve reactivity at low stress.",
        recoveryValue: "Recovery is the priority",
        recoveryHint: "Emphasize sleep, hydration, and neuromuscular reset. Avoid high-impact plyo sets.",
        injuryValue: "ACL risk elevated",
        injuryHint: "Place strict landing mechanics focus. If discomfort increases, modify further or pause plyo.",
        scValue: "Emphasize recovery · reduce explosive load",
        scHint: "Service layer behavior: protect capacity while still supporting technical skill work.",
      };
    }
    return {
      focusValue: "Recovery emphasis (avoid explosive overload)",
      focusHint: "Reduce high-stress exposures and keep sessions controlled.",
      recoveryValue: "Higher recovery sensitivity window",
      recoveryHint: "Prioritize recovery behaviors. Shift training toward activation, technique, and mobility.",
      injuryValue: "ACL risk elevated",
      injuryHint: "Reduce intensity/volume. Emphasize neuromuscular control cues during any explosive attempts.",
      scValue: "Reduce intensity + volume; keep quality",
      scHint: "Align your team plan with individual physiology. No forced blanket rest; use targeted modding.",
    };
  }

  function sessionPlanForForecast(offset) {
    // Simple planned session labels so the week strip feels real.
    const planned = [
      { type: "Strength + technique", key: "strength" },
      { type: "High-speed running", key: "sprint" },
      { type: "Recovery", key: "strength" },
      { type: "Change of direction", key: "sprint" },
      { type: "Team session", key: "strength" },
      { type: "Match", key: "match" },
      { type: "Regeneration", key: "strength" },
    ];
    return planned[offset % planned.length];
  }

  function phaseKeyBucket(phase) {
    if (phase === "Menstrual") return "Menstrual";
    if (phase === "Ovulatory") return "Ovulatory";
    if (phase === "Early luteal" || phase === "Late luteal") return "Luteal";
    return "Follicular";
  }

  function phaseLabelForCycleCaption(phase, cycleDay) {
    return `You're here · ${phase} (Day ${cycleDay})`;
  }

  function setNeedle(levelKey) {
    const needle = levelKey === "green" ? -20 : levelKey === "yellow" ? 0 : 20;
    const gauge = document.querySelector(".risk-gauge");
    if (gauge) gauge.style.setProperty("--needle-rot", `${needle}deg`);
  }

  function setReadinessColor(levelKey) {
    if (!els.readinessScore) return;
    els.readinessScore.classList.remove("readiness-green", "readiness-yellow", "readiness-red");
    els.readinessScore.classList.add(`readiness-${levelKey}`);
  }

  function updateWeekStrip({ readinessKey }) {
    for (let i = 0; i < 7; i++) {
      const planned = sessionPlanForForecast(i);
      const weekTypeEl = els.weekType[i];
      const riskEl = els.weekRisk[i];
      if (!weekTypeEl || !riskEl) continue;

      // Use a slightly phase-shifted readiness for the preview:
      // The first day uses today's readiness, subsequent days drift based on forecast.
      const phaseOffset = i; // 0..6
      const baseDay = getCycleDay();
      const phaseDay = ((baseDay - 1 + phaseOffset) % 28) + 1;
      const phase = phaseFromCycleDay(phaseDay);
      const base = computeBaselineOtherInputs();
      const { risk } = computeRisk({
        phase,
        ...base,
      });
      const r = readinessFromRisk(risk);

      weekTypeEl.textContent = planned.type;

      riskEl.classList.remove("week-risk-green", "week-risk-yellow", "week-risk-red");
      riskEl.classList.add(
        r.key === "green" ? "week-risk-green" : r.key === "yellow" ? "week-risk-yellow" : "week-risk-red"
      );
      riskEl.textContent = r.weekText;
    }
  }

  function getCycleDay() {
    const val = Number(els.inputCycleDay.value || 10);
    return clamp(Number.isFinite(val) ? val : 10, 1, 28);
  }

  function getInputs() {
    const phase = els.inputCyclePhase.value;
    const cycleDay = getCycleDay();
    const sleepQuality = els.inputSleepQuality.value;
    const soreness = els.inputSoreness.value;
    const fatigue = els.inputFatigue.value;
    const cramps = Boolean(els.inputCramps.checked);
    const alteredComfort = Boolean(els.inputAlteredComfort.checked);
    const sessionType = els.inputSessionType.value;

    return { phase, cycleDay, sleepQuality, soreness, fatigue, cramps, alteredComfort, sessionType };
  }

  function computeBaselineOtherInputs() {
    // Baseline inputs excluding phase for forecast.
    const inputs = getInputs();
    const { sleepQuality, soreness, fatigue, cramps, alteredComfort } = inputs;
    return { sleepQuality, soreness, fatigue, cramps, alteredComfort };
  }

  function renderRuleReasons(tags) {
    if (!els.engineRuleReasons) return;
    els.engineRuleReasons.innerHTML = "";
    tags.forEach((t) => {
      const span = document.createElement("span");
      span.className = "rule-tag";
      span.textContent = t;
      els.engineRuleReasons.appendChild(span);
    });
  }

  function updateDashboard() {
    const inputs = getInputs();
    const { risk } = computeRisk({
      phase: inputs.phase,
      sleepQuality: inputs.sleepQuality,
      soreness: inputs.soreness,
      fatigue: inputs.fatigue,
      cramps: inputs.cramps,
      alteredComfort: inputs.alteredComfort,
    });

    const readiness = readinessFromRisk(risk);

    // Gauge
    if (els.readinessScore) els.readinessScore.textContent = readiness.scoreText;
    if (els.readinessHeadline) {
      els.readinessHeadline.textContent =
        readiness.key === "green"
          ? "Training matches capacity today."
          : readiness.key === "yellow"
          ? "Neuromuscular load in the watch zone."
          : "Recovery emphasis required before explosive work.";
    }
    if (els.readinessText) {
      els.readinessText.textContent = recoveryNote(readiness.key, inputs);
    }
    setNeedle(readiness.key);
    setReadinessColor(readiness.key);

    // Cards
    const focus = trainingFocusCards(readiness.key, inputs.sessionType);
    els.cardTrainingValue && (els.cardTrainingValue.textContent = focus.focusValue);
    els.cardTrainingHint && (els.cardTrainingHint.textContent = focus.focusHint);
    els.cardRecoveryValue && (els.cardRecoveryValue.textContent = focus.recoveryValue);
    els.cardRecoveryHint && (els.cardRecoveryHint.textContent = focus.recoveryHint);
    els.cardInjuryValue && (els.cardInjuryValue.textContent = focus.injuryValue);
    els.cardInjuryHint && (els.cardInjuryHint.textContent = focus.injuryHint);
    els.cardSCValue && (els.cardSCValue.textContent = focus.scValue);
    els.cardSCHint && (els.cardSCHint.textContent = focus.scHint);

    // Cycle caption
    if (els.cycleCaption) {
      els.cycleCaption.textContent = phaseLabelForCycleCaption(inputs.phase, inputs.cycleDay);
    }

    // Coach/athlete engine outputs
    if (els.engineReadinessValue) {
      els.engineReadinessValue.textContent = readiness.label;
      els.engineReadinessValue.classList.remove("readiness-green", "readiness-yellow", "readiness-red");
      els.engineReadinessValue.classList.add(`readiness-${readiness.key}`);
    }
    if (els.engineRecoveryNote) {
      els.engineRecoveryNote.textContent = `Recovery note: ${recoveryNote(readiness.key, inputs)}`;
    }
    if (els.engineTrainingAdjustment) {
      els.engineTrainingAdjustment.textContent = trainingAdjustment(
        readiness.key,
        inputs.sessionType,
        inputs
      );
    }
    renderRuleReasons(ruleReasons(inputs));

    // Update week preview using forecast drift
    updateWeekStrip({ readinessKey: readiness.key });

    // Update 14-day forecast
    renderForecast14();
  }

  function renderForecast14() {
    if (!els.forecastGrid) return;
    els.forecastGrid.innerHTML = "";

    const todayInputs = getInputs();
    const baseline = computeBaselineOtherInputs();

    for (let i = 0; i < 14; i++) {
      const dayNum = clamp(todayInputs.cycleDay + i, 1, 28);
      const dayCycle = ((todayInputs.cycleDay - 1 + i) % 28) + 1;
      const phase = phaseFromCycleDay(dayCycle);

      const { risk } = computeRisk({
        phase,
        ...baseline,
      });

      const r = readinessFromRisk(risk);
      const planned = sessionPlanForForecast(i % 7);

      const div = document.createElement("div");
      div.className = "forecast-day";
      div.innerHTML = `
        <div class="d-label">Day ${dayCycle}</div>
        <div class="d-phase">${phase}</div>
        <div class="d-readiness ${r.key === "green" ? "readiness-green" : r.key === "yellow" ? "readiness-yellow" : "readiness-red"}">
          ${r.label}
        </div>
        <div class="d-type" style="margin-top:0.35rem;color:var(--text-muted);font-size:0.85rem;">${planned.type}</div>
      `;
      els.forecastGrid.appendChild(div);
    }
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveHistory(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 30)));
  }

  function summarizePatterns(entries) {
    if (!entries.length) {
      return `
        <div class="pattern-metrics">
          <div class="pattern-metric"><span class="pattern-metric-label">No history yet</span><span>Add a few check-ins to see patterns.</span></div>
        </div>
      `;
    }

    const byBucket = {
      Follicular: { poorSleep: 0, anySleepPoorOrMixed: 0, cramps: 0, count: 0 },
      Ovulatory: { poorSleep: 0, anySleepPoorOrMixed: 0, cramps: 0, count: 0 },
      Luteal: { poorSleep: 0, anySleepPoorOrMixed: 0, cramps: 0, count: 0 },
      Menstrual: { poorSleep: 0, anySleepPoorOrMixed: 0, cramps: 0, count: 0 },
    };

    entries.forEach((e) => {
      const bucket = phaseKeyBucket(e.phase);
      if (!byBucket[bucket]) return;
      byBucket[bucket].count += 1;

      if (e.sleepQuality === "poor") byBucket[bucket].poorSleep += 1;
      if (e.sleepQuality === "poor" || e.sleepQuality === "mixed") byBucket[bucket].anySleepPoorOrMixed += 1;
      if (e.cramps) byBucket[bucket].cramps += 1;
    });

    const topPoor = Object.entries(byBucket).sort((a, b) => b[1].poorSleep - a[1].poorSleep)[0];
    const topCramps = Object.entries(byBucket).sort((a, b) => b[1].cramps - a[1].cramps)[0];

    const topPoorText = topPoor?.[1]?.poorSleep > 0 ? `${topPoor[0]} window` : "No clear hotspot yet";
    const topCrampsText = topCramps?.[1]?.cramps > 0 ? `${topCramps[0]} window` : "No clear hotspot yet";

    return `
      <div class="pattern-metrics">
        <div class="pattern-metric">
          <span class="pattern-metric-label">Poor sleep hotspot</span>
          <span>${topPoorText}</span>
        </div>
        <div class="pattern-metric">
          <span class="pattern-metric-label">Cramps hotspot</span>
          <span>${topCrampsText}</span>
        </div>
        <div class="pattern-metric">
          <span class="pattern-metric-label">Entries logged</span>
          <span>${entries.length}</span>
        </div>
      </div>
    `;
  }

  function updatePatternUI() {
    if (!els.patternSummary) return;
    const entries = loadHistory();
    els.patternSummary.innerHTML = summarizePatterns(entries);
  }

  function setMode(mode) {
    document.body.classList.toggle("mode-coach", mode === "coach");
    if (els.modeAthlete) els.modeAthlete.classList.toggle("active", mode === "athlete");
    if (els.modeCoach) els.modeCoach.classList.toggle("active", mode === "coach");
    updateDashboard();
  }

  function setupEvents() {
    const inputs = [
      els.inputCyclePhase,
      els.inputCycleDay,
      els.inputSleepQuality,
      els.inputSoreness,
      els.inputFatigue,
      els.inputCramps,
      els.inputAlteredComfort,
      els.inputSessionType,
    ];

    inputs.forEach((el) => {
      if (!el) return;
      const handler = () => updateDashboard();
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    });

    els.modeAthlete?.addEventListener("click", () => setMode("athlete"));
    els.modeCoach?.addEventListener("click", () => setMode("coach"));

    els.btnLogCheckin?.addEventListener("click", () => {
      const inputs = getInputs();
      const entry = {
        ts: new Date().toISOString(),
        phase: inputs.phase,
        cycleDay: inputs.cycleDay,
        sleepQuality: inputs.sleepQuality,
        soreness: inputs.soreness,
        fatigue: inputs.fatigue,
        cramps: inputs.cramps,
        alteredComfort: inputs.alteredComfort,
      };

      const history = loadHistory();
      history.unshift(entry);
      saveHistory(history);
      els.logStatus.textContent = "Saved. Pattern summary updated.";
      setTimeout(() => {
        els.logStatus.textContent = "";
      }, 2500);
      updatePatternUI();
    });

    els.btnClearPattern?.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      updatePatternUI();
      els.logStatus.textContent = "Cleared local history.";
      setTimeout(() => {
        els.logStatus.textContent = "";
      }, 1800);
    });
  }

  // Initialize
  function init() {
    // Default mode: athlete (symptoms visible)
    setMode("athlete");

    // Ensure gauge needle has a deterministic initial position.
    updateDashboard();
    updatePatternUI();
    setupEvents();
  }

  init();
})();

