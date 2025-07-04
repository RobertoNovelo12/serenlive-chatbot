import { disableInput, enableInput } from "../ui/input.js";
import {
  renderBotMessage,
  renderButtonOptions,
  addMessage,
} from "../ui/render.js";
import {
  shownOptions,
  userData,
  questions,
  resetTestData,
} from "../core/state.js";
import { nextQuestionByIndex } from "./questionFlow.js";

export function showInitialOptions() {
  const options = [
    { id: "que_es", text: "¿Qué es Serenlive?" },
    { id: "ingredientes", text: "¿De qué está hecho?" },
    {
      id: "iniciar_test",
      text: "Hacer una prueba de estrés para darte una dosis adecuada",
    },
  ];

  renderBotMessage("¡Hola! ¿Cómo puedo ayudarte hoy?", () => {
    renderButtonOptions(options, handleInitialOptionClick);
  });
}

export function showPostRecommendationOptions() {
  console.log("🔄 Mostrando opciones post-recomendación");

  const options = [
    { id: "nuevo_test", text: "Hacer otro test" },
    { id: "que_es", text: "¿Qué es Serenlive?" },
    { id: "ingredientes", text: "¿De qué está hecho?" },
    { id: "fin", text: "Terminar conversación" },
  ];

  renderBotMessage("¿Te gustaría hacer algo más?", () => {
    renderButtonOptions(options, handlePostRecommendationOptionClick);
  });
}

export function handlePostRecommendationOptionClick(optionId) {
  console.log("🔘 Opción post-recomendación seleccionada:", optionId);

  if (optionId === "nuevo_test") {
    resetForNewTest();
    startTestFlow();
  } else if (optionId === "que_es") {
    renderBotMessage(
      "Serenlive es una tira sublingual, elaborada con una matriz polimérica de grado alimenticio que permite una absorción rápida y efectiva de sus ingredientes naturales. Su formulación está diseñada para ayudar a reducir el estrés y promover la relajación de manera natural.",
      () => {
        showPostRecommendationOptions();
      }
    );
  } else if (optionId === "ingredientes") {
    renderBotMessage(
      "Serenlive es un suplemento alimenticio de origen natural, formulado con extractos estandarizados de plantas adaptógenas como la ashwagandha, pasiflora y valeriana, junto con vitaminas del complejo B que ayudan al sistema nervioso. Todos los ingredientes son de grado farmacéutico y cumplen con los más altos estándares de calidad.",
      () => {
        showPostRecommendationOptions();
      }
    );
  } else if (optionId === "fin") {
    renderBotMessage(
      "¡Gracias por usar Serenlive! 😊 Espero que la información te haya sido útil. ¡Que tengas un excelente día!",
      () => {
        console.log("✅ Conversación terminada");

        setTimeout(() => {
          renderButtonOptions(
            [{ id: "reiniciar", text: "Reiniciar conversación" }],
            (optionId) => {
              if (optionId === "reiniciar") {
                location.reload();
              }
            }
          );
        }, 2000);
      }
    );
  }
}

export function resetForNewTest() {
  console.log("🔄 Reseteando sistema para nuevo test");

  try {
    resetTestData(true);
    console.log("✅ Sistema reseteado para nuevo test usando resetTestData");
  } catch (error) {
    console.error("Error usando resetTestData:", error);

    console.log("🔄 Ejecutando fallback manual");
    const currentName = userData.name;

    Object.keys(userData).forEach((key) => {
      if (key !== "name") {
        delete userData[key];
      }
    });

    userData.name = currentName;
    userData._waitingForName = false;
    localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    localStorage.removeItem("chat_serenlive_analysis");

    console.log("✅ Sistema reseteado manualmente");
  }
}

export function handleInitialOptionClick(optionId) {
  shownOptions.add(optionId);

  if (optionId === "que_es") {
    renderBotMessage(
      "Serenlive es una tira sublingual, elaborada con una matriz polimérica de grado alimenticio que permite una absorción rápida y efectiva de sus ingredientes naturales. Su formulación está diseñada para ayudar a reducir el estrés y promover la relajación de manera natural.",
      () => {
        showRemainingOptions();
      }
    );
  } else if (optionId === "ingredientes") {
    renderBotMessage(
      "Serenlive es un suplemento alimenticio de origen natural, formulado con extractos estandarizados de plantas adaptógenas como la ashwagandha, pasiflora y valeriana, junto con vitaminas del complejo B que ayudan al sistema nervioso. Todos los ingredientes son de grado farmacéutico y cumplen con los más altos estándares de calidad.",
      () => {
        showRemainingOptions();
      }
    );
  } else if (optionId === "iniciar_test") {
    startTestFlow();
    return;
  }
}

function showRemainingOptions() {
  const remainingOptions = [
    { id: "que_es", text: "¿Qué es Serenlive?" },
    { id: "ingredientes", text: "¿De qué está hecho?" },
    {
      id: "iniciar_test",
      text: "Hacer una prueba de estrés para darte una dosis adecuada",
    },
  ].filter((opt) => !shownOptions.has(opt.id));

  if (remainingOptions.length > 0) {
    setTimeout(() => {
      renderBotMessage("¿Te gustaría saber algo más?", () => {
        renderButtonOptions(remainingOptions, handleInitialOptionClick);
      });
    }, 1000);
  } else {
    setTimeout(() => {
      renderBotMessage(
        "¡Perfecto! ¿Estás listo para comenzar con la prueba de estrés?",
        () => {
          renderButtonOptions(
            [{ id: "iniciar_test", text: "Sí, comenzar la prueba" }],
            handleInitialOptionClick
          );
        }
      );
    }, 1000);
  }
}

function startTestFlow() {
  if (!questions || questions.length === 0) {
    renderBotMessage(
      "Lo siento, hay un problema técnico. Por favor, recarga la página."
    );
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
  if (!name || name.trim().length === 0) {
    renderBotMessage("Por favor, escribe tu nombre para continuar.", () => {});
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
  if (!questions || questions.length === 0) {
    console.error("No se pueden iniciar las preguntas: array vacío");
    renderBotMessage(
      "Lo siento, hay un problema técnico. Por favor, recarga la página."
    );
    return;
  }

  try {
    nextQuestionByIndex();
  } catch (error) {
    console.error("Error iniciando el flujo de preguntas:", error);
    renderBotMessage(
      "Lo siento, ocurrió un error. Por favor, recarga la página."
    );
  }
}
