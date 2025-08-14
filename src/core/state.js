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
  currentQuestionIndex = 0;
}

export function resetConversationStep() {
  conversationStep = 0;
}

export function clearAnalysisData() {
  Object.keys(analysisData).forEach((key) => {
    delete analysisData[key];
  });
}

export function resetUserData(keepName = true) {

  const currentName = keepName ? userData.name : undefined;

  Object.keys(userData).forEach((key) => {
    delete userData[key];
  });

  if (keepName && currentName) {
    userData.name = currentName;
  }

  userData._waitingForName = false;

}

export function clearShownOptions() {
  shownOptions.clear();
}

export function resetAnalyzer() {
  if (
    typeof window !== "undefined" &&
    window.analyzer &&
    window.analyzer.reset
  ) {
    window.analyzer.reset();
    } else if (
    typeof global !== "undefined" &&
    global.analyzer &&
    global.analyzer.reset
  ) {
    global.analyzer.reset();
  }
}

export function resetTestData(keepUserName = true) {
  resetQuestionIndex();
  resetConversationStep();
  clearAnalysisData();
  resetUserData(keepUserName);
  clearShownOptions();
  resetAnalyzer();
}