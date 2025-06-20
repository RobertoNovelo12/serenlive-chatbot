import { analyzer } from "../core/analyzer.js";
import { renderBotMessage, showTyping, hideTyping } from "../ui/render.js";
import { disableInput } from "../ui/input.js";
import { questions } from "../core/state.js";

export function handleRecommendationGeneration() {
  const recommendation = analyzer.generateRecommendation();

  showTyping();
  setTimeout(() => {
    hideTyping();

    renderBotMessage(generateAnalysisMessage(recommendation));

    setTimeout(() => {
      renderBotMessage(generateDosageMessage(recommendation));

      setTimeout(() => {
        renderBotMessage(generateTipsMessage(recommendation));

        setTimeout(() => {
          const closing = questions.find(q => q.type === "recommendation")?.closing_message ||
            "¡Gracias por confiar en Serenlive! Estoy aquí para acompañarte en tu bienestar. 💚🌿";
          renderBotMessage(closing);
          disableInput();
        }, 1500);
      }, 2000);
    }, 2000);
  }, 1000);
}

function generateAnalysisMessage(reco) {
  return `
    <div>
      <strong>📊 Tu Análisis Personalizado</strong><br/>
      <b>🔍 Nivel de Estrés:</b> <span style="color:${reco.riskColor}">${reco.riskLabel}</span> (${reco.normalizedScore}%)<br/>
      📈 Evaluación: Se han detectado tus principales áreas de atención.
    </div>`;
}

function generateDosageMessage(reco) {
  return `
    <div>
      <strong>💊 Tu Recomendación de Serenlive</strong><br/>
      🥄 Dosificación: ${reco.dosage}<br/>
      ⏰ Horarios: ${reco.timing}<br/>
      📅 Duración sugerida: ${reco.duration}
    </div>`;
}

function generateTipsMessage(reco) {
  return `
    <div>
      <strong>💡 Tips Personalizados</strong><br/>
      ${reco.additionalTips.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join("<br/>")}
      <div style="margin-top:10px; color:#27ae60;">🌱 Recuerda: Los pequeños cambios generan grandes resultados.</div>
    </div>`;
}