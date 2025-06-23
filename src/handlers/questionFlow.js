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
  console.log(
    "🔄 nextQuestionByIndex called, current index:",
    currentQuestionIndex
  );
  incrementQuestionIndex();
  moveToNext();
}

export function nextQuestionById(nextId) {
  if (questionMap[nextId] !== undefined) {
    console.log(
      "✅ Found question ID in map, setting index to:",
      questionMap[nextId]
    );
    setCurrentQuestionIndex(questionMap[nextId]);
  } else {
    incrementQuestionIndex();
  }
  moveToNext();
}

function moveToNext() {
  console.log(
    "➡️ moveToNext called, currentQuestionIndex:",
    currentQuestionIndex
  );
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
