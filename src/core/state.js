<<<<<<< HEAD
export let conversationStep = 0;
export let currentQuestionIndex = 0;
export let questions = [];
export let questionMap = {};
export let userData = JSON.parse(localStorage.getItem("chat_serenlive_data")) || {};
export let analysisData = JSON.parse(localStorage.getItem("chat_serenlive_analysis")) || {};
export const shownOptions = new Set();

export function setCurrentQuestionIndex(index) {
  console.log("🔄 setCurrentQuestionIndex:", currentQuestionIndex, "→", index);
  currentQuestionIndex = index;
}

export function incrementQuestionIndex() {
  console.log("⬆️ incrementQuestionIndex:", currentQuestionIndex, "→", currentQuestionIndex + 1);
  currentQuestionIndex++;
}

export function updateState(newState) {
  if (newState.questions) {
    questions.length = 0;
    questions.push(...newState.questions);
    console.log("📝 Questions updated, count:", questions.length);
  }
  if (newState.questionMap) {
    Object.keys(questionMap).forEach(key => delete questionMap[key]);
    Object.assign(questionMap, newState.questionMap);
    console.log("🗺️ QuestionMap updated:", questionMap);
  }
  if (newState.currentQuestionIndex !== undefined) {
    console.log("📍 CurrentQuestionIndex updated:", currentQuestionIndex, "→", newState.currentQuestionIndex);
    currentQuestionIndex = newState.currentQuestionIndex;
  }
  if (newState.conversationStep !== undefined) {
    conversationStep = newState.conversationStep;
  }
}

// Función para cargar preguntas desde JSON
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

    console.log("Preguntas cargadas correctamente.");
    console.log("Primera pregunta:", questions[0]?.id);
    console.log("Mapa de preguntas:", Object.keys(map));

  } catch (error) {
    console.error("Error cargando preguntas:", error);

    // Preguntas fallback básicas para no romper el flujo
    const fallbackQuestions = [
      {
        id: "estado_animo",
        message: "¿Cómo te has sentido últimamente?",
        type: "input",
        keywords: ["mal", "bien", "regular", "estresado", "ansioso"],
        next: "recomendacion_final"
      }
    ];

    const map = {};
    fallbackQuestions.forEach((q, idx) => {
      map[q.id] = idx;
    });

    updateState({ questions: fallbackQuestions, questionMap: map });
  }
=======
export let conversationStep = 0;
export let currentQuestionIndex = 0;
export let questions = [];
export let questionMap = {};
export let userData = JSON.parse(localStorage.getItem("chat_serenlive_data")) || {};
export let analysisData = JSON.parse(localStorage.getItem("chat_serenlive_analysis")) || {};
export const shownOptions = new Set();

export function setCurrentQuestionIndex(index) {
  console.log("🔄 setCurrentQuestionIndex:", currentQuestionIndex, "→", index);
  currentQuestionIndex = index;
}

export function incrementQuestionIndex() {
  console.log("⬆️ incrementQuestionIndex:", currentQuestionIndex, "→", currentQuestionIndex + 1);
  currentQuestionIndex++;
}

export function updateState(newState) {
  if (newState.questions) {
    questions.length = 0;
    questions.push(...newState.questions);
    console.log("📝 Questions updated, count:", questions.length);
  }
  if (newState.questionMap) {
    Object.keys(questionMap).forEach(key => delete questionMap[key]);
    Object.assign(questionMap, newState.questionMap);
    console.log("🗺️ QuestionMap updated:", questionMap);
  }
  if (newState.currentQuestionIndex !== undefined) {
    console.log("📍 CurrentQuestionIndex updated:", currentQuestionIndex, "→", newState.currentQuestionIndex);
    currentQuestionIndex = newState.currentQuestionIndex;
  }
  if (newState.conversationStep !== undefined) {
    conversationStep = newState.conversationStep;
  }
}

// Función para cargar preguntas desde JSON
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

    console.log("Preguntas cargadas correctamente.");
    console.log("Primera pregunta:", questions[0]?.id);
    console.log("Mapa de preguntas:", Object.keys(map));

  } catch (error) {
    console.error("Error cargando preguntas:", error);

    // Preguntas fallback básicas para no romper el flujo
    const fallbackQuestions = [
      {
        id: "estado_animo",
        message: "¿Cómo te has sentido últimamente?",
        type: "input",
        keywords: ["mal", "bien", "regular", "estresado", "ansioso"],
        next: "recomendacion_final"
      }
    ];

    const map = {};
    fallbackQuestions.forEach((q, idx) => {
      map[q.id] = idx;
    });

    updateState({ questions: fallbackQuestions, questionMap: map });
  }
>>>>>>> 72b7a7ab7e4d140805bcfcaefeaa82eaabdc049f
}