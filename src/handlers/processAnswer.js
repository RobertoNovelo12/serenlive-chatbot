import {
  questions, currentQuestionIndex, userData, analysisData,
  loadQuestions, incrementQuestionIndex, questionMap,
} from "../core/state.js";
import { addMessage, renderBotMessage, showTyping, hideTyping, renderButtonOptions } from "../ui/render.js";
import { analyzer } from "../core/analyzer.js";
import { nextQuestionByIndex, nextQuestionById } from "./questionFlow.js";
import { handleNameInput } from "./initialOptions.js";
import { RESPONSES, QUESTION_PATTERNS, SMALL_TALK, SMALL_TALK_RESPONSES } from "../config/responses.js";

// Cache de funciones importadas
let cachedModules = {};

export async function initializeChat() {
  await loadQuestions();
  if (questions.length === 0) {
    console.error("No se pudieron cargar preguntas para iniciar la conversación.");
    return;
  }
}

export function processUserInput(answer) {
  const lowerAnswer = answer.trim().toLowerCase();

  // Limpiar opciones existentes
  cleanupExistingOptions();

  // Manejar small talk
  if (SMALL_TALK.includes(lowerAnswer)) {
    return handleSmallTalk(answer);
  }

  // Manejar entrada de nombre
  if (userData._waitingForName) {
    return handleNameInput(answer);
  }

  // Procesar según el estado
  if (userData._testInProgress) {
    return processStressTestAnswer(answer);
  }

  // Detectar preguntas informativas
  const questionId = detectQuestion(lowerAnswer);
  if (questionId) {
    addMessage("user", answer, "👤");
    showTypingAndRespond(() => handleDirectQuestion(questionId));
    return;
  }

  // Mensaje de ayuda por defecto
  addMessage("user", answer, "👤");
  renderBotMessage("No estoy seguro de entender. ¿Podrías elegir una de las opciones disponibles o hacer una pregunta más específica?", "bot");
}

function handleSmallTalk(answer) {
  addMessage("user", answer, "👤");
  const randomResponse = SMALL_TALK_RESPONSES[Math.floor(Math.random() * SMALL_TALK_RESPONSES.length)];
  showTypingAndRespond(() => renderBotMessage(randomResponse, "bot"), 800);
}

function detectQuestion(lowerAnswer) {
  for (const [id, patterns] of Object.entries(QUESTION_PATTERNS)) {
    if (patterns.some(pattern => lowerAnswer === pattern || lowerAnswer.includes(pattern))) {
      return id;
    }
  }
  return null;
}

function showTypingAndRespond(callback, delay = 800) {
  showTyping();
  setTimeout(() => {
    hideTyping();
    callback();
  }, delay);
}

function cleanupExistingOptions() {
  const selectors = ['.option-buttons', '.option-button', '.chat-option', '.chat-option-button'];
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.remove());
  });
}

// Manejador unificado de preguntas directas
function handleDirectQuestion(questionId) {
  const response = RESPONSES[questionId];
  if (!response) return;

  renderBotMessage(response, "bot", () => {
    setTimeout(() => {
      const hasCompletedTest = userData._testCompleted === true;
      const nextAction = hasCompletedTest ? showPostTestOptions : showInitialOptions;
      const message = hasCompletedTest ? "¿Te gustaría hacer algo más?" : "¿Te gustaría saber algo más?";

      renderBotMessage(message, "bot", () => nextAction(questionId));
    }, 1000);
  });
}

function showInitialOptions(excludeId = null) {
  const options = getFilteredOptions([
    { id: "que_es", text: "¿Qué es Serenlive?" },
    { id: "ingredientes", text: "¿De qué está hecho?" },
    { id: "que_es_preocupacion", text: "¿Qué es la preocupación?" },
    { id: "que_es_estres", text: "¿Qué es el estrés?" },
    { id: "modo_empleo", text: "Modo de empleo y dosis" },
    { id: "es_seguro", text: "¿Cómo puedo saber si es seguro?" },
    { id: "iniciar_test", text: "Hacer una prueba de estrés para darte una dosis adecuada" }
  ], excludeId);

  renderButtonOptions(options, handleInitialOption);
}

function showPostTestOptions(excludeId = null) {
  const options = getFilteredOptions([
    { id: "nuevo_test", text: "Hacer otro test" },
    { id: "que_es", text: "¿Qué es Serenlive?" },
    { id: "ingredientes", text: "¿De qué está hecho?" },
    { id: "que_es_preocupacion", text: "¿Qué es la preocupación?" },
    { id: "que_es_estres", text: "¿Qué es el estrés?" },
    { id: "modo_empleo", text: "Modo de empleo y dosis" },
    { id: "es_seguro", text: "¿Cómo puedo saber si es seguro?" },
    { id: "fin", text: "Terminar conversación" }
  ], excludeId);

  renderButtonOptions(options, handlePostTestOption);
}

function getFilteredOptions(allOptions, excludeId) {
  return excludeId ? allOptions.filter(opt => opt.id !== excludeId) : allOptions;
}

// Manejadores de opciones unificados
function handleInitialOption(optionId) {
  if (optionId === "iniciar_test") {
    return importAndCall("./initialOptions.js", "handleInitialOptionClick", optionId);
  }
  handleDirectQuestion(optionId);
}

function handlePostTestOption(optionId) {
  if (optionId === "nuevo_test") {
    localStorage.clear();
    location.reload();
  } else if (optionId === "fin") {
    renderBotMessage(RESPONSES.gracias_final, "bot", () => {
      setTimeout(() => {
        renderButtonOptions([{ id: "reiniciar", text: "Reiniciar conversación" }],
          () => location.reload());
      }, 2000);
    });
  } else {
    handleDirectQuestion(optionId);
  }
}

// Función utilitaria para imports dinámicos
async function importAndCall(modulePath, functionName, ...args) {
  if (!cachedModules[modulePath]) {
    cachedModules[modulePath] = await import(modulePath);
  }
  return cachedModules[modulePath][functionName](...args);
}

// Funciones del test
function processStressTestAnswer(answer) {
  if (!questions[currentQuestionIndex]) {
    console.error("Error: pregunta no encontrada");
    return;
  }

  addMessage("user", answer, "👤");
  showTypingAndRespond(() => {
    const q = questions[currentQuestionIndex];
    const analysis = analyzer.analyzeResponse(answer, q);

    userData[q.id] = answer;
    analysisData[q.id] = analysis;
    localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    localStorage.setItem("chat_serenlive_analysis", JSON.stringify(analysisData));

    processQuestionType(q, answer, analysis);
  }, 1200);
}

function processQuestionType(q, answer, analysis) {
  if (q.type === "options") {
    handleOptionsQuestion(q, answer, analysis);
  } else if (q.type === "recommendation") {
    handleRecommendationGeneration();
  } else {
    handleInputQuestion(q, answer, analysis);
  }
}

function handleInputQuestion(q, answer, analysis) {
  if (analysis.isConfused) {
    const confusionResponse = analysis.responseMessage || q.respuesta_confusion || "No te preocupes, vamos paso a paso.";
    renderBotMessage(confusionResponse, "bot", () => {
      showTypingAndRespond(() => {
        const alternativeQuestion = analysis.alternativeQuestion || q.alternative_question || q.message;
        renderBotMessage(alternativeQuestion, "bot");
      });
    });
    return;
  }

  const hasDetection = (analysis.foundKeywords?.length > 0) ||
    (analysis.category && !["neutral", "unknown"].includes(analysis.category));

  if (hasDetection && analysis.responseMessage) {
    renderBotMessage(analysis.responseMessage, "bot", () => {
      showTypingAndRespond(() => goToNextQuestion(q, analysis), 1000);
    });
  } else {
    showTypingAndRespond(() => goToNextQuestion(q, analysis), 600);
  }
}

function goToNextQuestion(currentQuestion, analysis = null) {
  if (analysis?.nextQuestion && questionMap[analysis.nextQuestion] !== undefined) {
    return nextQuestionById(analysis.nextQuestion);
  }

  if (currentQuestion.next) {
    if (typeof currentQuestion.next === "string" && questionMap[currentQuestion.next] !== undefined) {
      return nextQuestionById(currentQuestion.next);
    }
  }

  nextQuestionByIndex();
}

function handleOptionsQuestion(q, answer, analysis) {
  let selected = analysis.selectedOption || analysis.category;

  if (!selected && q.options?.length) {
    selected = q.options[0].value;
  }

  userData[q.id + "_selected"] = selected;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  const responseMessage = analysis.responseMessage ||
    (q.respuesta_si_detecta?.[selected]);

  if (responseMessage) {
    renderBotMessage(responseMessage, "bot", () => {
      showTypingAndRespond(() => {
        const nextId = analysis?.nextQuestion ||
          (typeof q.next === "object" ? q.next[selected] : q.next);
        nextId ? nextQuestionById(nextId) : goToNextQuestion(q, analysis);
      }, 1000);
    });
  } else {
    showTypingAndRespond(() => {
      const nextId = analysis?.nextQuestion ||
        (typeof q.next === "object" ? q.next[selected] : q.next);
      nextId ? nextQuestionById(nextId) : goToNextQuestion(q, analysis);
    }, 600);
  }
}

function handleRecommendationGeneration() {
  renderBotMessage("Generando tu recomendación personalizada...", "bot", () => {
    showTypingAndRespond(() => {
      try {
        const recommendation = analyzer.generateRecommendation();
        const finalMessage = buildRecommendationMessage(recommendation);

        renderBotMessage(finalMessage, "bot", () => {
          // Marcar test como completado
          userData._testCompleted = true;
          userData._testInProgress = false;
          localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

          setTimeout(() => importAndCall("./initialOptions.js", "showPostRecommendationOptions"), 3000);
        });
      } catch (error) {
        console.error("❌ Error generando recomendación:", error);
        renderBotMessage("✅ **Análisis Completado**\n\nBasado en tus respuestas, te recomendamos usar Serenlive según las indicaciones del producto para ayudarte a manejar el estrés de manera natural.\n\n¡Gracias por confiar en Serenlive! 💚", "bot");
      }
    }, 2000);
  });
}

function buildRecommendationMessage(recommendation) {
  return `🎯 **Tu Análisis Personalizado Completo**

📊 **Nivel de estrés detectado:** ${recommendation.riskLabel} (${recommendation.normalizedScore}%)
🔹 **Dosis recomendada:** ${recommendation.dosage}
🕒 **Horario sugerido:** ${recommendation.timing}
⏳ **Duración sugerida:** ${recommendation.duration}

💡 **Consejos adicionales:**
${recommendation.additionalTips.map(tip => `• ${tip}`).join("\n")}

🍎 **Sugerencias de estilo de vida:**
• **Nutrición:** ${recommendation.lifestyle.nutrition.join(", ")}
• **Ejercicio:** ${recommendation.lifestyle.exercise.join(", ")}
• **Sueño:** ${recommendation.lifestyle.sleep.join(", ")}

📋 **Plan de seguimiento:**
• Frecuencia: ${recommendation.followUp.frequency}
• Duración: ${recommendation.followUp.duration}

¡Gracias por confiar en Serenlive! Estoy aquí para acompañarte en tu bienestar. 💚🌿`;
}