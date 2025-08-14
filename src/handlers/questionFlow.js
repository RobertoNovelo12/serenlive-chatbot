import {
  questions,
  questionMap,
  currentQuestionIndex,
  userData,
  setCurrentQuestionIndex,
  incrementQuestionIndex,
} from "../core/state.js";
import { renderBotMessage } from "../ui/render.js";
import { disableInput, enableInput } from "../ui/input.js";
import { handleRecommendationGeneration } from "./recommendation-handler.js";

export function nextQuestionByIndex() {
  incrementQuestionIndex();
  moveToNext();
}

export function nextQuestionById(nextId) {
  if (questionMap[nextId] !== undefined) {
    setCurrentQuestionIndex(questionMap[nextId]);
  } else {
    incrementQuestionIndex();
  }
  moveToNext();
}

function moveToNext() {
  const currentQ = questions[currentQuestionIndex];

  if (!currentQ) {
    renderBotMessage("¡Gracias por compartir conmigo! 😊", "bot", () => {
      disableInput();
    });
    return;
  }

  if (
    currentQ.id === "recomendacion_final" ||
    currentQ.type === "recommendation"
  ) {
    handleRecommendationGeneration();
    return;
  }

  if (currentQ.type === "end") {
    renderBotMessage(
      currentQ.message || "¡Gracias por conversar conmigo! 😊",
      "bot",
      () => {
        disableInput();
      }
    );
  } else {
    setTimeout(() => {
      renderBotMessage(currentQ.message, "bot", () => {
        enableInput();

        setTimeout(() => {
          const input = document.getElementById("nameInput");
          if (input) {
            input.focus();
          }
        }, 200);
      });
    }, 500);
  }
}
