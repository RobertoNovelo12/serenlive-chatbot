import { disableInput, enableInput } from '../ui/input.js';
import { renderBotMessage, renderButtonOptions, addMessage } from '../ui/render.js';
import { shownOptions, userData, questions } from '../core/state.js';
import { nextQuestionByIndex } from './questionFlow.js';

export function showInitialOptions() {
  disableInput();

  const options = [
    { id: 'que_es', text: "¿Qué es Serenlive?" },
    { id: 'ingredientes', text: "¿De qué está hecho?" },
    { id: 'iniciar_test', text: "Hacer una prueba de estrés para darte una dosis adecuada" }
  ];

  renderBotMessage("¡Hola! ¿Cómo puedo ayudarte hoy?", () => {
    renderButtonOptions(options, handleInitialOptionClick);
  });
}

export function handleInitialOptionClick(optionId) {
  shownOptions.add(optionId);

  if (optionId === 'que_es') {
    renderBotMessage("Serenlive es una tira sublingual, elaborada con una matriz polimérica de grado alimenticio que permite una absorción rápida y efectiva de sus ingredientes naturales. Su formulación está diseñada para ayudar a reducir el estrés y promover la relajación de manera natural.", () => {
      showRemainingOptions();
    });
  } else if (optionId === 'ingredientes') {
    renderBotMessage("Serenlive es un suplemento alimenticio de origen natural, formulado con extractos estandarizados de plantas adaptógenas como la ashwagandha, pasiflora y valeriana, junto con vitaminas del complejo B que ayudan al sistema nervioso. Todos los ingredientes son de grado farmacéutico y cumplen con los más altos estándares de calidad.", () => {
      showRemainingOptions();
    });
  } else if (optionId === 'iniciar_test') {
    startTestFlow();
    return;
  }
}

function showRemainingOptions() {
  const remainingOptions = [
    { id: 'que_es', text: "¿Qué es Serenlive?" },
    { id: 'ingredientes', text: "¿De qué está hecho?" },
    { id: 'iniciar_test', text: "Hacer una prueba de estrés para darte una dosis adecuada" }
  ].filter(opt => !shownOptions.has(opt.id));

  if (remainingOptions.length > 0) {
    setTimeout(() => {
      renderBotMessage("¿Te gustaría saber algo más?", () => {
        renderButtonOptions(remainingOptions, handleInitialOptionClick);
      });
    }, 1000);
  } else {
    setTimeout(() => {
      renderBotMessage("¡Perfecto! ¿Estás listo para comenzar con la prueba de estrés?", () => {
        renderButtonOptions([
          { id: 'iniciar_test', text: "Sí, comenzar la prueba" }
        ], handleInitialOptionClick);
      });
    }, 1000);
  }
}

function startTestFlow() {
  if (!questions || questions.length === 0) {
    renderBotMessage("Lo siento, hay un problema técnico. Por favor, recarga la página.");
    return;
  }

  renderBotMessage("¡Perfecto! Para comenzar con la prueba de estrés, primero necesito conocer tu nombre.", () => {
    enableInput();
    const input = document.getElementById("nameInput");
    if (input) {
      input.placeholder = "Escribe tu nombre aquí...";
      input.focus();

      userData._waitingForName = true;
      localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    }
  });
}

export function handleNameInput(name) {
  console.log("handleNameInput llamado con:", name);
  
  if (!name || name.trim().length === 0) {
    console.log("Nombre vacío, pidiendo de nuevo");
    renderBotMessage("Por favor, escribe tu nombre para continuar.", () => {
      enableInput();
    });
    return false;
  }

  const cleanName = name.trim();
  console.log("Nombre limpio:", cleanName);
  
  userData.name = cleanName;
  userData._waitingForName = false;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  // 👇 Mostrar el mensaje del usuario (tu nombre)
  console.log("Agregando mensaje de usuario:", cleanName);
  addMessage("user", cleanName, "👤");

  // 👇 Respuesta del bot
  console.log("Renderizando mensaje de bienvenida");
  renderBotMessage(
    `¡Hola ${cleanName}! 😊 Es un placer conocerte. Ahora comenzaremos con algunas preguntas para evaluar tu nivel de estrés y poder recomendarte la dosis más adecuada de Serenlive.`,
    () => {
      console.log("Ejecutando callback de bienvenida");
      shownOptions.clear();
      startQuestionFlow();
    }
  );

  return true;
}

export function startQuestionFlow() {
  if (!questions || questions.length === 0) {
    console.error("No se pueden iniciar las preguntas: array vacío");
    renderBotMessage("Lo siento, hay un problema técnico. Por favor, recarga la página.");
    return;
  }

  try {
    nextQuestionByIndex();
  } catch (error) {
    console.error("Error iniciando el flujo de preguntas:", error);
    renderBotMessage("Lo siento, ocurrió un error. Por favor, recarga la página.");
  }
}