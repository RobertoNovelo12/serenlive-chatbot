import { disableInput, enableInput } from "../ui/input.js";
import { renderBotMessage, renderButtonOptions, addMessage } from "../ui/render.js";
import { shownOptions, userData, questions, resetTestData } from "../core/state.js";
import { nextQuestionByIndex } from "./questionFlow.js";
import { RESPONSES } from "../config/responses.js";

// Configuración de opciones
const INITIAL_OPTIONS = [
  { id: "iniciar_test", text: "Hacer una prueba de estrés para darte una dosis adecuada"},
  { id: "que_es", text: "¿Qué es Serenlive?" },
  { id: "ingredientes", text: "¿De qué está hecho?" },
  { id: "que_es_preocupacion", text: "¿Qué es la preocupación?" },
  { id: "que_es_estres", text: "¿Qué es el estrés?" },
  { id: "modo_empleo", text: "Modo de empleo y dosis" },
  { id: "es_seguro", text: "¿Cómo puedo saber si es seguro?" }
];

const POST_RECOMMENDATION_OPTIONS = [
  { id: "nuevo_test", text: "Hacer otro test" },
  ...INITIAL_OPTIONS.filter(opt => opt.id !== "iniciar_test"),
  { id: "fin", text: "Terminar conversación" }
];

export function showInitialOptions() {
  userData._testInProgress = false;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  renderBotMessage("¡Hola! ¿Cómo puedo ayudarte hoy?", () => {
    renderButtonOptions(INITIAL_OPTIONS, handleInitialOptionClick);
  });
}

export function showPostRecommendationOptions() {
  userData._testInProgress = false;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  renderBotMessage("¿Te gustaría hacer algo más?", () => {
    renderButtonOptions(POST_RECOMMENDATION_OPTIONS, handlePostRecommendationOptionClick);
  });
}

// Manejador unificado para respuestas informativas
function handleInformativeResponse(optionId, callback) {
  const response = RESPONSES[optionId];
  if (response) {
    renderBotMessage(response, callback);
  }
}

export function handlePostRecommendationOptionClick(optionId) {
  switch (optionId) {
    case "nuevo_test":
      resetForNewTest();
      startTestFlow();
      break;
      
    case "fin":
      renderBotMessage(RESPONSES.gracias_final, () => {
        setTimeout(() => {
          renderButtonOptions(
            [{ id: "reiniciar", text: "Reiniciar conversación" }],
            () => location.reload()
          );
        }, 2000);
      });
      break;
      
    default:
      // Para todas las preguntas informativas
      handleInformativeResponse(optionId, () => {
        showPostRecommendationOptions();
      });
  }
}

export function handleInitialOptionClick(optionId) {
  if (optionId === "iniciar_test") {
    startTestFlow();
    return;
  }

  shownOptions.add(optionId);
  handleInformativeResponse(optionId, () => {
    showRemainingOptions();
  });
}

function showRemainingOptions() {
  const remainingOptions = INITIAL_OPTIONS
    .filter(opt => opt.id !== "iniciar_test" && !shownOptions.has(opt.id));

  if (remainingOptions.length > 0) {
    setTimeout(() => {
      renderBotMessage("¿Te gustaría saber algo más?", () => {
        renderButtonOptions(remainingOptions, handleInitialOptionClick);
      });
    }, 1000);
  } else {
    setTimeout(() => {
      renderBotMessage("¡Perfecto! ¿Estás listo para comenzar con la prueba de estrés?", () => {
        renderButtonOptions(
          [{ id: "iniciar_test", text: "Sí, comenzar la prueba" }],
          handleInitialOptionClick
        );
      });
    }, 1000);
  }
}

export function resetForNewTest() {
  try {
    resetTestData(true);
  } catch (error) {
    console.error("Error usando resetTestData:", error);
    
    const currentName = userData.name;
    Object.keys(userData).forEach((key) => {
      if (key !== "name") {
        delete userData[key];
      }
    });

    userData.name = currentName;
    userData._waitingForName = false;
    userData._testInProgress = false;
    userData._testCompleted = false;
    localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    localStorage.removeItem("chat_serenlive_analysis");
  }
}

function startTestFlow() {
  if (!questions?.length) {
    renderBotMessage("Lo siento, hay un problema técnico. Por favor, recarga la página.");
    return;
  }

  renderBotMessage(
    "¡Perfecto! Para comenzar con la prueba de estrés, primero necesito conocer tu nombre.",
    () => {
      const input = document.getElementById("nameInput");
      if (input) {
        input.placeholder = "Escribe tu nombre aquí...";
      }

      userData._waitingForName = true;
      localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    }
  );
}

export function handleNameInput(name) {
  if (!name?.trim()) {
    renderBotMessage("Por favor, escribe tu nombre para continuar.");
    return false;
  }

  const cleanName = name.trim();
  userData.name = cleanName;
  userData._waitingForName = false;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  addMessage("user", cleanName, "👤");

  renderBotMessage(
    `¡Hola ${cleanName}! 😊 Es un placer conocerte. Ahora comenzaremos con algunas preguntas para evaluar tu nivel de estrés y poder recomendarte la dosis más adecuada de Serenlive.`,
    () => {
      shownOptions.clear();
      startQuestionFlow();
    }
  );

  return true;
}

export function startQuestionFlow() {
  if (!questions?.length) {
    console.error("No se pueden iniciar las preguntas: array vacío");
    renderBotMessage("Lo siento, hay un problema técnico. Por favor, recarga la página.");
    return;
  }

  try {
    userData._testInProgress = true;
    localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    console.log("🚀 Test iniciado - _testInProgress:", userData._testInProgress);
    nextQuestionByIndex();
  } catch (error) {
    console.error("Error iniciando el flujo de preguntas:", error);
    renderBotMessage("Lo siento, ocurrió un error. Por favor, recarga la página.");
  }
}