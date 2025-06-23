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

  console.log("💭 Iniciando análisis - mostrando typing");
  showTyping();

  setTimeout(() => {
    console.log("🔍 Analizando respuesta del usuario");

    const analysis = analyzer.analyzeResponse(answer, q);

    userData[q.id] = answer;
    analysisData[q.id] = analysis;

    localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
    localStorage.setItem(
      "chat_serenlive_analysis",
      JSON.stringify(analysisData)
    );

    console.log("✅ Análisis completado - ocultando typing");
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
  console.log(
    "🔍 handleInputQuestion - question:",
    q.id,
    "analysis:",
    analysis
  );

  const hasDetection =
    (analysis.foundKeywords && analysis.foundKeywords.length > 0) ||
    (analysis.category &&
      analysis.category !== "neutral" &&
      analysis.category !== "unknown");

  console.log("🎯 Detection found:", hasDetection);

  if (analysis.isConfused) {
    console.log("😕 Usuario confundido, mostrando pregunta alternativa");

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
        renderBotMessage(alternativeQuestion, "bot", () => {
          console.log(
            "✅ Pregunta alternativa mostrada - input sigue disponible"
          );
        });
      }, 800);
    });
    return;
  }

  if (hasDetection && analysis.responseMessage) {
    console.log("✅ Detección exitosa, mostrando mensaje de respuesta");
    console.log("💬 Mensaje a mostrar:", analysis.responseMessage);

    renderBotMessage(analysis.responseMessage, "bot", () => {
      console.log("✅ Callback de renderBotMessage ejecutado");

      showTyping();
      setTimeout(() => {
        hideTyping();
        console.log("⏰ Avanzando a siguiente pregunta");
        goToNextQuestion(q, analysis);
      }, 1000);
    });
    return;
  }

  console.log("➡️ No se detectó nada específico, avanzando directamente");

  showTyping();
  setTimeout(() => {
    hideTyping();
    console.log("⏰ Avanzando sin detección específica");
    goToNextQuestion(q, analysis);
  }, 600);
}

function goToNextQuestion(currentQuestion, analysis = null) {
  console.log("🔄 goToNextQuestion - Avanzando desde:", currentQuestion.id);
  console.log(
    "📊 Estado actual - currentQuestionIndex:",
    currentQuestionIndex,
    "total questions:",
    questions.length
  );

  if (analysis && analysis.nextQuestion) {
    console.log(
      "🎯 Analysis tiene nextQuestion específico:",
      analysis.nextQuestion
    );
    const nextIndex = questionMap[analysis.nextQuestion];
    if (nextIndex !== undefined) {
      console.log(
        "➡️ Navegando por analysis a:",
        analysis.nextQuestion,
        "índice:",
        nextIndex
      );
      nextQuestionById(analysis.nextQuestion);
      return;
    }
  }

  if (currentQuestion.next) {
    console.log("🎯 Pregunta tiene 'next' específico:", currentQuestion.next);

    if (typeof currentQuestion.next === "string") {
      const nextIndex = questionMap[currentQuestion.next];
      if (nextIndex !== undefined) {
        console.log(
          "➡️ Navegando por ID a:",
          currentQuestion.next,
          "índice:",
          nextIndex
        );
        nextQuestionById(currentQuestion.next);
        return;
      } else {
        console.error(
          "❌ ID de siguiente pregunta no encontrado:",
          currentQuestion.next
        );

        console.log("🔄 Fallback: avanzando al siguiente índice");
        nextQuestionByIndex();
        return;
      }
    } else if (typeof currentQuestion.next === "object") {
      console.log(
        "⚠️ 'next' es un objeto, esto debería manejarse en handleOptionsQuestion"
      );

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

  if (q.id === "recomendacion_final") {
    console.log("🎯 Detectada pregunta de recomendación final");

    const selected = analysis.selectedOption || analysis.category;
    console.log("🎯 Opción seleccionada para recomendación:", selected);

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
      console.log("✅ Usuario quiere recomendación - iniciando generación");

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
      console.log("🤔 Usuario tiene más preguntas");
      renderBotMessage(
        "¿Qué te gustaría saber antes de recibir tu recomendación?",
        "bot",
        () => {
          console.log("✅ Input habilitado para preguntas adicionales");
        }
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

  console.log("🎯 Opción seleccionada:", selected);

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
    console.log("💬 Mostrando respuesta para opción:", selected);
    console.log("💬 Mensaje:", responseMessage);

    renderBotMessage(responseMessage, "bot", () => {
      showTyping();
      setTimeout(() => {
        hideTyping();
        const nextId =
          (analysis && analysis.nextQuestion) ||
          (q.next && typeof q.next === "object" ? q.next[selected] : q.next);

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

    showTyping();
    setTimeout(() => {
      hideTyping();
      const nextId =
        (analysis && analysis.nextQuestion) ||
        (q.next && typeof q.next === "object" ? q.next[selected] : q.next);

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

function handleRecommendationGeneration() {
  console.log("🎯 Generando recomendación final...");

  renderBotMessage("Generando tu recomendación personalizada...", "bot", () => {
    console.log("💭 Iniciando análisis de recomendación");

    showTyping();

    setTimeout(() => {
      hideTyping();
      console.log("🔍 Generando recomendación con analyzer");

      try {
        const recommendation = analyzer.generateRecommendation();
        console.log("📊 Recomendación generada:", recommendation);

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

        console.log("💬 Mensaje final preparado");

        renderBotMessage(finalMessage, "bot", () => {
          console.log(
            "✅ Recomendación mostrada - iniciando timeout para opciones"
          );

          setTimeout(() => {
            console.log("⏰ Timeout completado - importando opciones");

            import("./initialOptions.js")
              .then(({ showPostRecommendationOptions }) => {
                console.log("📥 Módulo importado exitosamente");
                showPostRecommendationOptions();
              })
              .catch((error) => {
                console.error(
                  "❌ Error importando showPostRecommendationOptions:",
                  error
                );

                console.log("🔄 Ejecutando fallback manual");
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
                        console.log("🔘 Opción seleccionada:", optionId);

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
