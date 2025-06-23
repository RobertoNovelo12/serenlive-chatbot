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
    // ✅ REMOVIDO: enableInput();
    return;
  }

  if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
    console.error("Error: currentQuestionIndex fuera de rango.", currentQuestionIndex);
    // ✅ REMOVIDO: enableInput();
    return;
  }

 const q = questions[currentQuestionIndex];

  if (!q) {
    console.error("Error: current question is undefined. currentQuestionIndex:", currentQuestionIndex);
    // ✅ REMOVIDO: enableInput();
    return;
  }

  addMessage("user", answer, "👤");
  // ✅ REMOVIDO: disableInput(); - Ya no bloqueamos el input

  // 🔥 MOSTRAR TYPING MIENTRAS SE ANALIZA
  console.log("💭 Iniciando análisis - mostrando typing");
  showTyping();

  // Simular delay realista para análisis + mostrar la animación
  setTimeout(() => {
    console.log("🔍 Analizando respuesta del usuario");
    
    // 🔧 CORRECCIÓN: Orden correcto de parámetros
    const analysis = analyzer.analyzeResponse(answer, q);

    userData[q.id] = answer;
    analysisData[q.id] = analysis;

    localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    localStorage.setItem("chat_serenlive_analysis", JSON.stringify(analysisData));

    // 🔥 OCULTAR TYPING ANTES DE MOSTRAR RESPUESTA
    console.log("✅ Análisis completado - ocultando typing");
    hideTyping();

    if (q.type === "options") {
      handleOptionsQuestion(q, answer, analysis);
    } else if (q.type === "recommendation") {
      handleRecommendationGeneration();
    } else {
      handleInputQuestion(q, answer, analysis);
    }
  }, 1200); // 1.2 segundos para que se vea bien la animación
}

function handleInputQuestion(q, answer, analysis) {
  console.log("🔍 handleInputQuestion - question:", q.id, "analysis:", analysis);
  
  const hasDetection = (analysis.foundKeywords && analysis.foundKeywords.length > 0) || 
                      (analysis.category && analysis.category !== 'neutral' && analysis.category !== 'unknown');
  
  console.log("🎯 Detection found:", hasDetection);

  // Caso 1: Si el usuario está confundido
  if (analysis.isConfused) {
    console.log("😕 Usuario confundido, mostrando pregunta alternativa");
    
    const confusionResponse = analysis.responseMessage || q.respuesta_confusion || "No te preocupes, vamos paso a paso.";
    renderBotMessage(confusionResponse, "bot", () => {
      // 🔥 MOSTRAR TYPING PARA LA PREGUNTA ALTERNATIVA
      showTyping();
      setTimeout(() => {
        hideTyping();
        const alternativeQuestion = analysis.alternativeQuestion || q.alternative_question || q.message;
        renderBotMessage(alternativeQuestion, "bot", () => {
          console.log("✅ Pregunta alternativa mostrada - input sigue disponible");
          // ✅ REMOVIDO: enableInput(); - El input nunca se bloqueó
        });
      }, 800);
    });
    return;
  }

  // Caso 2: Si se detectó algo (keywords o categoría válida)
  if (hasDetection && analysis.responseMessage) {
    console.log("✅ Detección exitosa, mostrando mensaje de respuesta");
    console.log("💬 Mensaje a mostrar:", analysis.responseMessage);
    
    renderBotMessage(analysis.responseMessage, "bot", () => {
      console.log("✅ Callback de renderBotMessage ejecutado");
      
      // 🔥 MOSTRAR TYPING ANTES DE LA SIGUIENTE PREGUNTA
      showTyping();
      setTimeout(() => {
        hideTyping();
        console.log("⏰ Avanzando a siguiente pregunta");
        goToNextQuestion(q, analysis);
      }, 1000);
    });
    return;
  }

  // Caso 3: No se detectó nada específico - avanzar directamente
  console.log("➡️ No se detectó nada específico, avanzando directamente");
  
  // 🔥 BREVE TYPING ANTES DE CONTINUAR
  showTyping();
  setTimeout(() => {
    hideTyping();
    console.log("⏰ Avanzando sin detección específica");
    goToNextQuestion(q, analysis);
  }, 600);
}

// Función auxiliar para avanzar a la siguiente pregunta - CORREGIDA
function goToNextQuestion(currentQuestion, analysis = null) {
  console.log("🔄 goToNextQuestion - Avanzando desde:", currentQuestion.id);
  console.log("📊 Estado actual - currentQuestionIndex:", currentQuestionIndex, "total questions:", questions.length);
  
  // 1. Usar nextQuestion del analysis si está disponible
  if (analysis && analysis.nextQuestion) {
    console.log("🎯 Analysis tiene nextQuestion específico:", analysis.nextQuestion);
    const nextIndex = questionMap[analysis.nextQuestion];
    if (nextIndex !== undefined) {
      console.log("➡️ Navegando por analysis a:", analysis.nextQuestion, "índice:", nextIndex);
      nextQuestionById(analysis.nextQuestion);
      return;
    }
  }
  
  // 2. Verificar si hay un 'next' específico en la pregunta
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
  console.log("🔘 Analysis:", analysis);
  
  // Usar el analysis del analyzer si está disponible
  let selected = analysis.selectedOption || analysis.category;
  
  // Fallback a la lógica anterior si no se detectó en el analyzer
  if (!selected) {
    const lower = answer.toLowerCase();
    
    for (let [value, kws] of Object.entries(q.keywords || {})) {
      if (Array.isArray(kws) && kws.some(kw => lower.includes(kw))) {
        selected = value;
        break;
      }
    }

    // Si aún no hay selección, usar la primera opción
    if (!selected && q.options?.length) {
      selected = q.options[0].value;
    }
  }

  console.log("🎯 Opción seleccionada:", selected);

  userData[q.id + "_selected"] = selected;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  // Usar el mensaje del analysis si está disponible
  let responseMessage = analysis.responseMessage;
  
  // Fallback a la respuesta específica de la opción
  if (!responseMessage && q.respuesta_si_detecta && typeof q.respuesta_si_detecta === 'object') {
    responseMessage = q.respuesta_si_detecta[selected];
  }

  if (responseMessage) {
    console.log("💬 Mostrando respuesta para opción:", selected);
    console.log("💬 Mensaje:", responseMessage);
    
    renderBotMessage(responseMessage, "bot", () => {
      // 🔥 TYPING ANTES DE LA SIGUIENTE PREGUNTA
      showTyping();
      setTimeout(() => {
        hideTyping();
        const nextId = (analysis && analysis.nextQuestion) || 
                      (q.next && typeof q.next === 'object' ? q.next[selected] : q.next);
        
        if (nextId) {
          console.log("➡️ Navegando por opción a:", nextId);
          nextQuestionById(nextId);
        } else {
          console.log("➡️ Sin 'next' específico, avanzando normalmente");
          goToNextQuestion(q, analysis);
        }
      }, 1000);
    });
  } else {
    console.log("➡️ Sin respuesta específica, avanzando directamente");
    
    // 🔥 BREVE TYPING ANTES DE CONTINUAR
    showTyping();
    setTimeout(() => {
      hideTyping();
      const nextId = (analysis && analysis.nextQuestion) || 
                    (q.next && typeof q.next === 'object' ? q.next[selected] : q.next);
      
      if (nextId) {
        console.log("➡️ Navegando por opción a:", nextId);
        nextQuestionById(nextId);
      } else {
        console.log("➡️ Sin 'next' específico, avanzando normalmente");
        goToNextQuestion(q, analysis);
      }
    }, 600);
  }
}

// Función para manejar la generación de recomendaciones
function handleRecommendationGeneration() {
  console.log("🎯 Generando recomendación final...");
  // Aquí implementarías la lógica para generar la recomendación final
  renderBotMessage("Generando tu recomendación personalizada...", "bot", () => {
    // Lógica de recomendación aquí
    // ✅ REMOVIDO: enableInput(); - El input nunca se bloqueó
    console.log("✅ Recomendación generada - input sigue disponible");
  });
}