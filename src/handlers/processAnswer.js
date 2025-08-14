import {
  questions,
  currentQuestionIndex,
  userData,
  analysisData,
  loadQuestions,
  incrementQuestionIndex,
  questionMap,
} from "../core/state.js";

import { addMessage } from "../ui/render.js";

import { analyzer } from "../core/analyzer.js";
import { recommendationEngine } from "../handlers/recommendations.js";
import { nextQuestionByIndex, nextQuestionById } from "./questionFlow.js";
import { renderBotMessage, showTyping, hideTyping } from "../ui/render.js";
import { disableInput, enableInput } from "../ui/input.js";
import { handleNameInput } from "./initialOptions.js";

export async function initializeChat() {
  await loadQuestions();

  if (questions.length === 0) {
    console.error(
      "No se pudieron cargar preguntas para iniciar la conversación."
    );
    enableInput();
    return;
  }
}

export function processUserInput(answer) {

  const lowerAnswer = answer.trim().toLowerCase();
  
    const smallTalkPatterns = [
    "hola", "buenos días", "buenas tardes", "buenas noches",
    "hey", "holi", "holis", "qué tal", "como estas", "cómo estás",
    "todo bien", "que hay", "que tal", "buen día", "buenas"
  ];

    if (smallTalkPatterns.includes(lowerAnswer)) {
    addMessage("user", answer, "👤");
    showTyping();
    setTimeout(() => {
      hideTyping();
      const responses = [
        "¡Hola! 😊 ¿Listo para comenzar?",
        "¡Qué gusto saludarte! 💚",
        "¡Hola! Espero que estés muy bien 🌿",
        "¡Hey! Bienvenido/a, vamos a comenzar"
      ];
      // Elegir respuesta aleatoria
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      renderBotMessage(randomResponse, "bot");
    }, 800);
    return; // 👈 Detener aquí para que no avance el flujo
  }
  if (userData._waitingForName) {
    return handleNameInput(answer);
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    console.error("Error: no hay preguntas cargadas.");
    return;
  }

  if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
    console.error(
      "Error: currentQuestionIndex fuera de rango.",
      currentQuestionIndex
    );
    return;
  }

  const q = questions[currentQuestionIndex];

  if (!q) {
    console.error(
      "Error: current question is undefined. currentQuestionIndex:",
      currentQuestionIndex
    );
    return;
  }

  addMessage("user", answer, "👤");

  showTyping();

  setTimeout(() => {
    const analysis = analyzer.analyzeResponse(answer, q);

    userData[q.id] = answer;
    analysisData[q.id] = analysis;

    localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    localStorage.setItem(
      "chat_serenlive_analysis",
      JSON.stringify(analysisData)
    );

    hideTyping();

    if (q.type === "options") {
      handleOptionsQuestion(q, answer, analysis);
    } else if (q.type === "recommendation") {
      handleRecommendationGeneration();
    } else {
      handleInputQuestion(q, answer, analysis);
    }
  }, 1200);
}

function handleInputQuestion(q, answer, analysis) {
  const hasDetection =
    (analysis.foundKeywords && analysis.foundKeywords.length > 0) ||
    (analysis.category &&
      analysis.category !== "neutral" &&
      analysis.category !== "unknown");

  if (analysis.isConfused) {
    const confusionResponse =
      analysis.responseMessage ||
      q.respuesta_confusion ||
      "No te preocupes, vamos paso a paso.";
    renderBotMessage(confusionResponse, "bot", () => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        const alternativeQuestion =
          analysis.alternativeQuestion || q.alternative_question || q.message;
        renderBotMessage(alternativeQuestion, "bot");
      }, 800);
    });
    return;
  }

  if (hasDetection && analysis.responseMessage) {
    renderBotMessage(analysis.responseMessage, "bot", () => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        goToNextQuestion(q, analysis);
      }, 1000);
    });
    return;
  }

  showTyping();
  setTimeout(() => {
    hideTyping();
    goToNextQuestion(q, analysis);
  }, 600);
}

function goToNextQuestion(currentQuestion, analysis = null) {
  if (analysis && analysis.nextQuestion) {
    const nextIndex = questionMap[analysis.nextQuestion];
    if (nextIndex !== undefined) {
      nextQuestionById(analysis.nextQuestion);
      return;
    }
  }

  if (currentQuestion.next) {
    if (typeof currentQuestion.next === "string") {
      const nextIndex = questionMap[currentQuestion.next];
      if (nextIndex !== undefined) {
        nextQuestionById(currentQuestion.next);
        return;
      } else {
        console.error(
          "❌ ID de siguiente pregunta no encontrado:",
          currentQuestion.next
        );
        nextQuestionByIndex();
        return;
      }
    } else if (typeof currentQuestion.next === "object") {
      nextQuestionByIndex();
      return;
    }
  }

  nextQuestionByIndex();
}

function handleOptionsQuestion(q, answer, analysis) {
  if (q.id === "recomendacion_final") {
    const selected = analysis.selectedOption || analysis.category;

    if (
      selected === "si_recomendacion" ||
      selected === "usado" ||
      (analysis.foundKeywords &&
        analysis.foundKeywords.some((kw) =>
          ["si", "sí", "dale", "adelante", "perfecto", "genial"].includes(
            kw.toLowerCase()
          )
        ))
    ) {
      if (analysis.responseMessage) {
        renderBotMessage(analysis.responseMessage, "bot", () => {
          setTimeout(() => {
            handleRecommendationGeneration();
          }, 1000);
        });
      } else {
        handleRecommendationGeneration();
      }
      return;
    } else if (selected === "mas_preguntas") {
      renderBotMessage(
        "¿Qué te gustaría saber antes de recibir tu recomendación?",
        "bot"
      );
      return;
    }
  }

  let selected = analysis.selectedOption || analysis.category;

  if (!selected) {
    const lower = answer.toLowerCase();

    for (let [value, kws] of Object.entries(q.keywords || {})) {
      if (Array.isArray(kws) && kws.some((kw) => lower.includes(kw))) {
        selected = value;
        break;
      }
    }

    if (!selected && q.options?.length) {
      selected = q.options[0].value;
    }
  }

  userData[q.id + "_selected"] = selected;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  let responseMessage = analysis.responseMessage;

  if (
    !responseMessage &&
    q.respuesta_si_detecta &&
    typeof q.respuesta_si_detecta === "object"
  ) {
    responseMessage = q.respuesta_si_detecta[selected];
  }

  if (responseMessage) {
    renderBotMessage(responseMessage, "bot", () => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        const nextId =
          (analysis && analysis.nextQuestion) ||
          (q.next && typeof q.next === "object" ? q.next[selected] : q.next);

        if (nextId) {
          nextQuestionById(nextId);
        } else {
          goToNextQuestion(q, analysis);
        }
      }, 1000);
    });
  } else {
    showTyping();
    setTimeout(() => {
      hideTyping();
      const nextId =
        (analysis && analysis.nextQuestion) ||
        (q.next && typeof q.next === "object" ? q.next[selected] : q.next);

      if (nextId) {
        nextQuestionById(nextId);
      } else {
        goToNextQuestion(q, analysis);
      }
    }, 600);
  }
}

function handleRecommendationGeneration() {
  renderBotMessage("Generando tu recomendación personalizada...", "bot", () => {
    showTyping();

    setTimeout(() => {
      hideTyping();

      try {
        const recommendation = analyzer.generateRecommendation();

        const finalMessage = `🎯 **Tu Análisis Personalizado Completo**

📊 **Nivel de estrés detectado:** ${recommendation.riskLabel} (${
          recommendation.normalizedScore
        }%)

🔹 **Dosis recomendada:** ${recommendation.dosage}
🕒 **Horario sugerido:** ${recommendation.timing}
⏳ **Duración sugerida:** ${recommendation.duration}

💡 **Consejos adicionales:**
${recommendation.additionalTips.map((tip) => `• ${tip}`).join("\n")}

🍎 **Sugerencias de estilo de vida:**
• **Nutrición:** ${recommendation.lifestyle.nutrition.join(", ")}
• **Ejercicio:** ${recommendation.lifestyle.exercise.join(", ")}
• **Sueño:** ${recommendation.lifestyle.sleep.join(", ")}

📋 **Plan de seguimiento:**
• Frecuencia: ${recommendation.followUp.frequency}
• Duración: ${recommendation.followUp.duration}

¡Gracias por confiar en Serenlive! Estoy aquí para acompañarte en tu bienestar. 💚🌿`;

        renderBotMessage(finalMessage, "bot", () => {
          setTimeout(() => {
            import("./initialOptions.js")
              .then(({ showPostRecommendationOptions }) => {
                showPostRecommendationOptions();
              })
              .catch((error) => {
                console.error(
                  "❌ Error importando showPostRecommendationOptions:",
                  error
                );

                renderBotMessage("¿Te gustaría hacer algo más?", "bot", () => {
                  import("../ui/render.js")
                    .then(({ renderButtonOptions }) => {
                      const options = [
                        { id: "nuevo_test", text: "Hacer otro test" },
                        { id: "que_es", text: "¿Qué es Serenlive?" },
                        { id: "ingredientes", text: "¿De qué está hecho?" },
                        { id: "fin", text: "Terminar conversación" },
                      ];

                      renderButtonOptions(options, (optionId) => {
                        if (optionId === "nuevo_test") {
                          location.reload();
                        } else if (optionId === "fin") {
                          renderBotMessage(
                            "¡Gracias por usar Serenlive! 😊 ¡Que tengas un excelente día!",
                            "bot"
                          );
                        } else if (optionId === "que_es") {
                          renderBotMessage(
                            "Serenlive es una tira sublingual natural para el manejo del estrés...",
                            "bot"
                          );
                        } else if (optionId === "ingredientes") {
                          renderBotMessage(
                            "Serenlive contiene extractos naturales de ashwagandha, pasiflora y valeriana...",
                            "bot"
                          );
                        }
                      });
                    })
                    .catch(console.error);
                });
              });
          }, 3000);
        });
      } catch (error) {
        console.error("❌ Error generando recomendación:", error);

        renderBotMessage(
          "✅ **Análisis Completado**\n\nBasado en tus respuestas, te recomendamos usar Serenlive según las indicaciones del producto para ayudarte a manejar el estrés de manera natural.\n\n¡Gracias por confiar en Serenlive! 💚",
          "bot",
          () => {
            setTimeout(() => {
              renderBotMessage("¿Te gustaría hacer algo más?", "bot", () => {
                import("../ui/render.js")
                  .then(({ renderButtonOptions }) => {
                    const options = [
                      { id: "nuevo_test", text: "Hacer otro test" },
                      { id: "fin", text: "Terminar conversación" },
                    ];

                    renderButtonOptions(options, (optionId) => {
                      if (optionId === "nuevo_test") {
                        location.reload();
                      } else {
                        renderBotMessage("¡Hasta pronto! 😊", "bot");
                      }
                    });
                  })
                  .catch(console.error);
              });
            }, 2000);
          }
        );
      }
    }, 2000);
  });
}