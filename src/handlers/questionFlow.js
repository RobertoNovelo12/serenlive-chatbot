import { questions, questionMap, currentQuestionIndex, userData, setCurrentQuestionIndex, incrementQuestionIndex } from "../core/state.js";
import { renderBotMessage } from "../ui/render.js";
import { disableInput, enableInput } from "../ui/input.js";
import { handleRecommendationGeneration } from "./recommendation-handler.js";

export function nextQuestionByIndex() {
  console.log("🔄 nextQuestionByIndex called, current index:", currentQuestionIndex);
  incrementQuestionIndex();
  moveToNext();
}

export function nextQuestionById(nextId) {
  console.log("🔄 nextQuestionById called with ID:", nextId);
  if (questionMap[nextId] !== undefined) {
    console.log("✅ Found question ID in map, setting index to:", questionMap[nextId]);
    setCurrentQuestionIndex(questionMap[nextId]);
  } else {
    console.log("❌ Question ID not found in map, incrementing index");
    incrementQuestionIndex();
  }
  moveToNext();
}

function moveToNext() {
  console.log("➡️ moveToNext called, currentQuestionIndex:", currentQuestionIndex);
  const currentQ = questions[currentQuestionIndex];

  if (!currentQ) {
    console.log("🏁 No more questions, ending conversation");
    renderBotMessage("¡Gracias por compartir conmigo! 😊", "bot", () => {
      disableInput();
    });
    return;
  }

  console.log("📋 Current question:", currentQ.id, currentQ.type);

  if (currentQ.id === "recomendacion_final" || currentQ.type === "recommendation") {
    console.log("🎯 Generating recommendation");
    handleRecommendationGeneration();
    return;
  }

  if (currentQ.type === "end") {
    console.log("🏁 End type question");
    renderBotMessage(currentQ.message || "¡Gracias por conversar conmigo! 😊", "bot", () => {
      disableInput();
    });
  } else {
    console.log("📝 Rendering question:", currentQ.message);
    setTimeout(() => {
      renderBotMessage(currentQ.message, "bot", () => {
        console.log("✅ Question rendered, enabling input and focusing");
        enableInput();
        
        // Asegurar que el input tenga focus
        setTimeout(() => {
          const input = document.getElementById("nameInput");
          if (input) {
            input.focus();
            console.log("🎯 Input focused");
          }
        }, 200);
      });
    }, 500);
  }
}