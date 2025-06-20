<<<<<<< HEAD
import { 
  questions, 
  currentQuestionIndex, 
  userData, 
  analysisData,
  loadQuestions,
  incrementQuestionIndex,
  questionMap
} from "../core/state.js";

import { addMessage } from "../ui/render.js";

import { analyzer } from "../core/analyzer.js";
import { nextQuestionByIndex, nextQuestionById } from "./questionFlow.js";
import { renderBotMessage, showTyping, hideTyping } from "../ui/render.js";
import { disableInput, enableInput } from "../ui/input.js";
import { handleNameInput } from "./initialOptions.js"

// Para asegurar que las preguntas están cargadas antes
export async function initializeChat() {
  await loadQuestions();

  if (questions.length === 0) {
    console.error("No se pudieron cargar preguntas para iniciar la conversación.");
    enableInput();
    return;
  }
}

export function processUserInput(answer) {
  if (userData._waitingForName) {
    return handleNameInput(answer);
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    console.error("Error: no hay preguntas cargadas.");
    enableInput();
    return;
  }

  if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
    console.error("Error: currentQuestionIndex fuera de rango.", currentQuestionIndex);
    enableInput();
    return;
  }

 const q = questions[currentQuestionIndex];

  if (!q) {
    console.error("Error: current question is undefined. currentQuestionIndex:", currentQuestionIndex);
    enableInput();
    return;
  }

  addMessage("user", answer, "👤");
  disableInput();

  const analysis = analyzer.analyzeResponse(q.id, answer, q);

  userData[q.id] = answer;
  analysisData[q.id] = analysis;

  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
  localStorage.setItem("chat_serenlive_analysis", JSON.stringify(analysisData));

  if (q.type === "options") {
    handleOptionsQuestion(q, answer, analysis);
  } else if (q.type === "recommendation") {
    handleRecommendationGeneration();
  } else {
    handleInputQuestion(q, answer, analysis);
  }
}

function handleInputQuestion(q, answer, analysis) {
  console.log("🔍 handleInputQuestion - question:", q.id, "analysis:", analysis);
  console.log("🔍 Question object:", JSON.stringify(q, null, 2));
  console.log("🔍 Analysis object:", JSON.stringify(analysis, null, 2));
  
  const matched = analysis?.matches?.length > 0;
  console.log("🎯 Matched:", matched, "Matches:", analysis?.matches);
  console.log("🎯 respuesta_si_detecta exists:", !!q.respuesta_si_detecta);
  console.log("🎯 respuesta_si_detecta value:", q.respuesta_si_detecta);

  if (matched && q.respuesta_si_detecta) {
    console.log("✅ Entrando en rama de respuesta_si_detecta");
    
    const resp = typeof q.respuesta_si_detecta === "string"
      ? q.respuesta_si_detecta
      : JSON.stringify(q.respuesta_si_detecta);

    console.log("💬 Mostrando respuesta de detección:", resp);
    
    renderBotMessage(resp, "bot", () => {
      console.log("✅ Callback de renderBotMessage ejecutado");
      console.log("⏱️ Iniciando setTimeout para avanzar pregunta");
      
      setTimeout(() => {
        console.log("⏰ setTimeout ejecutado, llamando goToNextQuestion");
        goToNextQuestion(q);
      }, 1500);
    });

  } else if (q.confusion_keywords?.some(kw => answer.toLowerCase().includes(kw))) {
    console.log("😕 Entrando en rama de confusión");
    console.log("😕 Confusion keywords:", q.confusion_keywords);
    
    const confusionResponse = q.respuesta_confusion || "No te preocupes, vamos paso a paso.";
    renderBotMessage(confusionResponse, "bot", () => {
      setTimeout(() => {
        renderBotMessage(q.alternative_question || q.message, "bot", () => {
          console.log("✅ Habilitando input después de pregunta alternativa");
          enableInput();
        });
      }, 1000);
    });

  } else {
    console.log("➡️ Entrando en rama sin coincidencias");
    console.log("➡️ No hay matches ni confusion keywords, avanzando directamente");
    
    setTimeout(() => {
      console.log("⏰ setTimeout sin coincidencias ejecutado");
      goToNextQuestion(q);
    }, 500);
  }
}

// Función auxiliar para avanzar a la siguiente pregunta - CORREGIDA
function goToNextQuestion(currentQuestion) {
  console.log("🔄 goToNextQuestion - Avanzando desde:", currentQuestion.id);
  console.log("📊 Estado actual - currentQuestionIndex:", currentQuestionIndex, "total questions:", questions.length);
  
  // Verificar si hay un 'next' específico
  if (currentQuestion.next) {
    console.log("🎯 Pregunta tiene 'next' específico:", currentQuestion.next);
    
    if (typeof currentQuestion.next === 'string') {
      // Es un ID específico
      const nextIndex = questionMap[currentQuestion.next];
      if (nextIndex !== undefined) {
        console.log("➡️ Navegando por ID a:", currentQuestion.next, "índice:", nextIndex);
        nextQuestionById(currentQuestion.next);
        return;
      } else {
        console.error("❌ ID de siguiente pregunta no encontrado:", currentQuestion.next);
        // Fallback: avanzar al siguiente índice
        console.log("🔄 Fallback: avanzando al siguiente índice");
        nextQuestionByIndex();
        return;
      }
    } else if (typeof currentQuestion.next === 'object') {
      console.log("⚠️ 'next' es un objeto, esto debería manejarse en handleOptionsQuestion");
      // Fallback: avanzar al siguiente índice
      nextQuestionByIndex();
      return;
    }
  }
  
  console.log("📈 Avanzando al siguiente índice...");
  nextQuestionByIndex();
}

function handleOptionsQuestion(q, answer, analysis) {
  console.log("🔘 handleOptionsQuestion - question:", q.id);
  
  const lower = answer.toLowerCase();
  let selected = null;

  for (let [value, kws] of Object.entries(q.keywords)) {
    if (kws.some(kw => lower.includes(kw))) {
      selected = value;
      break;
    }
  }

  if (!selected && q.options?.length) {
    selected = q.options[0].value;
  }

  console.log("🎯 Opción seleccionada:", selected);

  userData[q.id + "_selected"] = selected;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  const resp = q.respuesta_si_detecta?.[selected];
  if (resp) {
    console.log("💬 Mostrando respuesta para opción:", selected);
    renderBotMessage(resp, "bot", () => {
      setTimeout(() => {
        const nextId = q.next?.[selected] || q.next;
        if (nextId) {
          console.log("➡️ Navegando por opción a:", nextId);
          nextQuestionById(nextId);
        } else {
          console.log("➡️ Sin 'next' específico, avanzando normalmente");
          goToNextQuestion(q);
        }
      }, 1500);
    });
  } else {
    console.log("➡️ Sin respuesta específica, avanzando directamente");
    setTimeout(() => {
      const nextId = q.next?.[selected] || q.next;
      if (nextId) {
        console.log("➡️ Navegando por opción a:", nextId);
        nextQuestionById(nextId);
      } else {
        console.log("➡️ Sin 'next' específico, avanzando normalmente");
        goToNextQuestion(q);
      }
    }, 500);
  }
}

// Función para manejar la generación de recomendaciones
function handleRecommendationGeneration() {
  console.log("🎯 Generando recomendación final...");
  // Aquí implementarías la lógica para generar la recomendación final
  renderBotMessage("Generando tu recomendación personalizada...", "bot", () => {
    // Lógica de recomendación aquí
    enableInput();
  });
=======
import { 
  questions, 
  currentQuestionIndex, 
  userData, 
  analysisData,
  loadQuestions,
  incrementQuestionIndex,
  questionMap
} from "../core/state.js";

import { addMessage } from "../ui/render.js";

import { analyzer } from "../core/analyzer.js";
import { nextQuestionByIndex, nextQuestionById } from "./questionFlow.js";
import { renderBotMessage, showTyping, hideTyping } from "../ui/render.js";
import { disableInput, enableInput } from "../ui/input.js";
import { handleNameInput } from "./initialOptions.js"

// Para asegurar que las preguntas están cargadas antes
export async function initializeChat() {
  await loadQuestions();

  if (questions.length === 0) {
    console.error("No se pudieron cargar preguntas para iniciar la conversación.");
    enableInput();
    return;
  }
}

export function processUserInput(answer) {
  if (userData._waitingForName) {
    return handleNameInput(answer);
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    console.error("Error: no hay preguntas cargadas.");
    enableInput();
    return;
  }

  if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
    console.error("Error: currentQuestionIndex fuera de rango.", currentQuestionIndex);
    enableInput();
    return;
  }

 const q = questions[currentQuestionIndex];

  if (!q) {
    console.error("Error: current question is undefined. currentQuestionIndex:", currentQuestionIndex);
    enableInput();
    return;
  }

  addMessage("user", answer, "👤");
  disableInput();

  const analysis = analyzer.analyzeResponse(q.id, answer, q);

  userData[q.id] = answer;
  analysisData[q.id] = analysis;

  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
  localStorage.setItem("chat_serenlive_analysis", JSON.stringify(analysisData));

  if (q.type === "options") {
    handleOptionsQuestion(q, answer, analysis);
  } else if (q.type === "recommendation") {
    handleRecommendationGeneration();
  } else {
    handleInputQuestion(q, answer, analysis);
  }
}

function handleInputQuestion(q, answer, analysis) {
  console.log("🔍 handleInputQuestion - question:", q.id, "analysis:", analysis);
  console.log("🔍 Question object:", JSON.stringify(q, null, 2));
  console.log("🔍 Analysis object:", JSON.stringify(analysis, null, 2));
  
  const matched = analysis?.matches?.length > 0;
  console.log("🎯 Matched:", matched, "Matches:", analysis?.matches);
  console.log("🎯 respuesta_si_detecta exists:", !!q.respuesta_si_detecta);
  console.log("🎯 respuesta_si_detecta value:", q.respuesta_si_detecta);

  if (matched && q.respuesta_si_detecta) {
    console.log("✅ Entrando en rama de respuesta_si_detecta");
    
    const resp = typeof q.respuesta_si_detecta === "string"
      ? q.respuesta_si_detecta
      : JSON.stringify(q.respuesta_si_detecta);

    console.log("💬 Mostrando respuesta de detección:", resp);
    
    renderBotMessage(resp, "bot", () => {
      console.log("✅ Callback de renderBotMessage ejecutado");
      console.log("⏱️ Iniciando setTimeout para avanzar pregunta");
      
      setTimeout(() => {
        console.log("⏰ setTimeout ejecutado, llamando goToNextQuestion");
        goToNextQuestion(q);
      }, 1500);
    });

  } else if (q.confusion_keywords?.some(kw => answer.toLowerCase().includes(kw))) {
    console.log("😕 Entrando en rama de confusión");
    console.log("😕 Confusion keywords:", q.confusion_keywords);
    
    const confusionResponse = q.respuesta_confusion || "No te preocupes, vamos paso a paso.";
    renderBotMessage(confusionResponse, "bot", () => {
      setTimeout(() => {
        renderBotMessage(q.alternative_question || q.message, "bot", () => {
          console.log("✅ Habilitando input después de pregunta alternativa");
          enableInput();
        });
      }, 1000);
    });

  } else {
    console.log("➡️ Entrando en rama sin coincidencias");
    console.log("➡️ No hay matches ni confusion keywords, avanzando directamente");
    
    setTimeout(() => {
      console.log("⏰ setTimeout sin coincidencias ejecutado");
      goToNextQuestion(q);
    }, 500);
  }
}

// Función auxiliar para avanzar a la siguiente pregunta - CORREGIDA
function goToNextQuestion(currentQuestion) {
  console.log("🔄 goToNextQuestion - Avanzando desde:", currentQuestion.id);
  console.log("📊 Estado actual - currentQuestionIndex:", currentQuestionIndex, "total questions:", questions.length);
  
  // Verificar si hay un 'next' específico
  if (currentQuestion.next) {
    console.log("🎯 Pregunta tiene 'next' específico:", currentQuestion.next);
    
    if (typeof currentQuestion.next === 'string') {
      // Es un ID específico
      const nextIndex = questionMap[currentQuestion.next];
      if (nextIndex !== undefined) {
        console.log("➡️ Navegando por ID a:", currentQuestion.next, "índice:", nextIndex);
        nextQuestionById(currentQuestion.next);
        return;
      } else {
        console.error("❌ ID de siguiente pregunta no encontrado:", currentQuestion.next);
        // Fallback: avanzar al siguiente índice
        console.log("🔄 Fallback: avanzando al siguiente índice");
        nextQuestionByIndex();
        return;
      }
    } else if (typeof currentQuestion.next === 'object') {
      console.log("⚠️ 'next' es un objeto, esto debería manejarse en handleOptionsQuestion");
      // Fallback: avanzar al siguiente índice
      nextQuestionByIndex();
      return;
    }
  }
  
  console.log("📈 Avanzando al siguiente índice...");
  nextQuestionByIndex();
}

function handleOptionsQuestion(q, answer, analysis) {
  console.log("🔘 handleOptionsQuestion - question:", q.id);
  
  const lower = answer.toLowerCase();
  let selected = null;

  for (let [value, kws] of Object.entries(q.keywords)) {
    if (kws.some(kw => lower.includes(kw))) {
      selected = value;
      break;
    }
  }

  if (!selected && q.options?.length) {
    selected = q.options[0].value;
  }

  console.log("🎯 Opción seleccionada:", selected);

  userData[q.id + "_selected"] = selected;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  const resp = q.respuesta_si_detecta?.[selected];
  if (resp) {
    console.log("💬 Mostrando respuesta para opción:", selected);
    renderBotMessage(resp, "bot", () => {
      setTimeout(() => {
        const nextId = q.next?.[selected] || q.next;
        if (nextId) {
          console.log("➡️ Navegando por opción a:", nextId);
          nextQuestionById(nextId);
        } else {
          console.log("➡️ Sin 'next' específico, avanzando normalmente");
          goToNextQuestion(q);
        }
      }, 1500);
    });
  } else {
    console.log("➡️ Sin respuesta específica, avanzando directamente");
    setTimeout(() => {
      const nextId = q.next?.[selected] || q.next;
      if (nextId) {
        console.log("➡️ Navegando por opción a:", nextId);
        nextQuestionById(nextId);
      } else {
        console.log("➡️ Sin 'next' específico, avanzando normalmente");
        goToNextQuestion(q);
      }
    }, 500);
  }
}

// Función para manejar la generación de recomendaciones
function handleRecommendationGeneration() {
  console.log("🎯 Generando recomendación final...");
  // Aquí implementarías la lógica para generar la recomendación final
  renderBotMessage("Generando tu recomendación personalizada...", "bot", () => {
    // Lógica de recomendación aquí
    enableInput();
  });
>>>>>>> 72b7a7ab7e4d140805bcfcaefeaa82eaabdc049f
}