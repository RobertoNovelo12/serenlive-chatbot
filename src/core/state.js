export let conversationStep = 0;
export let currentQuestionIndex = 0;
export let questions = [];
export let questionMap = {};
export let userData =
  JSON.parse(localStorage.getItem("chat_serenlive_data")) || {};
export let analysisData =
  JSON.parse(localStorage.getItem("chat_serenlive_analysis")) || {};
export const shownOptions = new Set();

export function setCurrentQuestionIndex(index) {
  currentQuestionIndex = index;
}

export function incrementQuestionIndex() {
  console.log(
    "⬆️ incrementQuestionIndex:",
    currentQuestionIndex,
    "→",
    currentQuestionIndex + 1
  );
  currentQuestionIndex++;
}

export function updateState(newState) {
  if (newState.questions) {
    questions.length = 0;
    questions.push(...newState.questions);
  }
  if (newState.questionMap) {
    Object.keys(questionMap).forEach((key) => delete questionMap[key]);
    Object.assign(questionMap, newState.questionMap);
  }
  if (newState.currentQuestionIndex !== undefined) {
    console.log(
      "📍 CurrentQuestionIndex updated:",
      currentQuestionIndex,
      "→",
      newState.currentQuestionIndex
    );
    currentQuestionIndex = newState.currentQuestionIndex;
  }
  if (newState.conversationStep !== undefined) {
    conversationStep = newState.conversationStep;
  }
}

export async function loadQuestions() {
  try {
    const res = await fetch("questions.json");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    const map = {};
    data.forEach((q, idx) => {
      map[q.id] = idx;
    });

    updateState({ questions: data, questionMap: map });
  } catch (error) {
    console.error("Error cargando preguntas:", error);

    const fallbackQuestions = [
      {
        id: "estado_animo",
        message: "¿Cómo te has sentido últimamente?",
        type: "input",
        keywords: ["mal", "bien", "regular", "estresado", "ansioso"],
        next: "recomendacion_final",
      },
    ];

    const map = {};
    fallbackQuestions.forEach((q, idx) => {
      map[q.id] = idx;
    });

    updateState({ questions: fallbackQuestions, questionMap: map });
  }
}

export function resetQuestionIndex() {
  console.log("🔄 Reseteando question index de", currentQuestionIndex, "a 0");
  currentQuestionIndex = 0;
}

export function resetConversationStep() {
  console.log("🔄 Reseteando conversation step de", conversationStep, "a 0");
  conversationStep = 0;
}

export function clearAnalysisData() {
  console.log("🧹 Limpiando analysisData");
  Object.keys(analysisData).forEach((key) => {
    delete analysisData[key];
  });
  console.log("✅ AnalysisData limpio:", analysisData);
}

export function resetUserData(keepName = true) {
  console.log("🔄 Reseteando userData (keepName:", keepName, ")");

  const currentName = keepName ? userData.name : undefined;

  Object.keys(userData).forEach((key) => {
    delete userData[key];
  });

  if (keepName && currentName) {
    userData.name = currentName;
    console.log("👤 Nombre mantenido:", currentName);
  }

  userData._waitingForName = false;

  console.log("✅ UserData reset:", userData);
}

export function clearShownOptions() {
  console.log("🧹 Limpiando shownOptions");
  shownOptions.clear();
  console.log("✅ ShownOptions limpio");
}

export function resetAnalyzer() {
  console.log("🔄 Intentando resetear analyzer");

  if (
    typeof window !== "undefined" &&
    window.analyzer &&
    window.analyzer.reset
  ) {
    window.analyzer.reset();
    console.log("✅ Analyzer reseteado via window");
  } else if (
    typeof global !== "undefined" &&
    global.analyzer &&
    global.analyzer.reset
  ) {
    global.analyzer.reset();
    console.log("✅ Analyzer reseteado via global");
  } else {
    console.log("ℹ️ Analyzer no disponible para reset o no tiene método reset");
  }
}

export function resetTestData(keepUserName = true) {
  console.log("🔄 INICIANDO RESET COMPLETO PARA NUEVO TEST");
  console.log("🔄 KeepUserName:", keepUserName);

  resetQuestionIndex();
  resetConversationStep();

  clearAnalysisData();

  resetUserData(keepUserName);

  clearShownOptions();

  resetAnalyzer();

  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
  localStorage.removeItem("chat_serenlive_analysis");

  console.log("✅ RESET COMPLETO TERMINADO");
  console.log("📊 Estado final:");
  console.log("   - currentQuestionIndex:", currentQuestionIndex);
  console.log("   - conversationStep:", conversationStep);
  console.log("   - userData:", userData);
  console.log("   - analysisData:", analysisData);
  console.log("   - shownOptions size:", shownOptions.size);
}

export function resetEverything() {
  console.log("🔄 RESET TOTAL - Limpiando todo incluyendo nombre");
  resetTestData(false);
  console.log("✅ RESET TOTAL COMPLETO");
}
