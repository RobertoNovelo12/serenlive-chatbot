import { analyzer } from "../core/analyzer.js";
import { recommendationEngine } from "./recommendations.js";
import { renderBotMessage, showTyping, hideTyping } from "../ui/render.js";
import { disableInput } from "../ui/input.js";
import { questions } from "../core/state.js";

export function handleRecommendationGeneration() {
  const recommendation = analyzer.generateRecommendation();

  showTyping();
  setTimeout(() => {
    hideTyping();

    // Mensaje de análisis personalizado
    renderBotMessage(generateAnalysisMessage(recommendation));

    setTimeout(() => {
      // Mensaje de dosificación
      renderBotMessage(generateDosageMessage(recommendation));

      setTimeout(() => {
        // Mensaje de tips personalizados
        renderBotMessage(generateTipsMessage(recommendation));

        setTimeout(() => {
          // Mensaje de estilo de vida (nuevo)
          renderBotMessage(generateLifestyleMessage(recommendation));

          setTimeout(() => {
            // Mensaje de seguimiento (nuevo)
            renderBotMessage(generateFollowUpMessage(recommendation));

            setTimeout(() => {
              // Mensaje de cierre
              const closing = questions.find(q => q.type === "recommendation")?.closing_message ||
                "¡Gracias por confiar en Serenlive! Estoy aquí para acompañarte en tu bienestar. 💚🌿";
              renderBotMessage(closing);
              disableInput();
            }, 1500);
          }, 2000);
        }, 2000);
      }, 2000);
    }, 2000);
  }, 1000);
}

// Mensaje de análisis con más detalles
function generateAnalysisMessage(reco) {
  return `
    <div>
      <strong>📊 Tu Análisis Personalizado</strong><br/>
      <b>🔍 Nivel de Estrés:</b> <span style="color:${reco.riskColor}">${reco.riskLabel}</span> (${reco.normalizedScore}%)<br/>
      📈 Puntuación total: ${reco.score}/18 puntos<br/>
      📋 Evaluación: Se han identificado tus principales áreas de atención para un enfoque personalizado.
    </div>`;
}

// Mensaje de dosificación mejorado
function generateDosageMessage(reco) {
  return `
    <div>
      <strong>💊 Tu Recomendación Personalizada de Serenlive</strong><br/>
      🥄 <b>Dosificación:</b> ${reco.dosage}<br/>
      ⏰ <b>Horarios óptimos:</b> ${reco.timing}<br/>
      📅 <b>Duración sugerida:</b> ${reco.duration}<br/>
      <div>
        💡 <b>Tip:</b> Para mejores resultados, mantén las gotas bajo la lengua por 30-60 segundos antes de tragar.
      </div>
    </div>`;
}

// Mensaje de tips personalizados ampliado
function generateTipsMessage(reco) {
  const tips = reco.additionalTips.slice(0, 4); // Mostrar hasta 4 tips
  return `
    <div>
      <strong>💡 Tips Personalizados para Ti</strong><br/>
      ${tips.map((tip, i) => `${i + 1}. ${tip}`).join("<br/>")}
      <div>
        🌱 Recuerda: Los pequeños cambios consistentes generan grandes transformaciones.
      </div>
    </div>`;
}

// Nueva función: Mensaje de estilo de vida
function generateLifestyleMessage(reco) {
  const lifestyle = reco.lifestyle;
  return `
    <div>
      <strong>🌿 Plan de Bienestar Integral</strong><br/>
      
      <b>🍎 Nutrición:</b><br/>
      ${lifestyle.nutrition.slice(0, 2).map(tip => `• ${tip}`).join("<br/>")}<br/>
      
      <b>🏃‍♀️ Actividad física:</b><br/>
      ${lifestyle.exercise.slice(0, 2).map(tip => `• ${tip}`).join("<br/>")}<br/>
      
      <b>😴 Descanso:</b><br/>
      ${lifestyle.sleep.slice(0, 2).map(tip => `• ${tip}`).join("<br/>")}<br/>
      
      <div>
        ℹ️ Estos hábitos potenciarán los efectos de Serenlive y mejorarán tu bienestar general.
      </div>
    </div>`;
}

// Nueva función: Mensaje de seguimiento
function generateFollowUpMessage(reco) {
  const followUp = reco.followUp;
  return `
    <div>
      <strong>📋 Tu Plan de Seguimiento</strong><br/>
      
      ⏱️ <b>Frecuencia de evaluación:</b> ${followUp.frequency}<br/>
      📅 <b>Duración del plan:</b> ${followUp.duration}<br/>
      
      <b>🎯 Puntos de control:</b><br/>
      ${followUp.checkpoints.map(checkpoint => `• ${checkpoint}`).join("<br/>")}<br/>
      
      <div>
        📞 <b>Soporte continuo:</b> Estaremos aquí para acompañarte en cada paso de tu proceso de bienestar.
      </div>
    </div>`;
}

// Función alternativa para generar recomendación completa de una vez (opcional)
export function generateCompleteRecommendation() {
  const recommendation = analyzer.generateRecommendation();
  
  return `
    <div>
      ${generateAnalysisMessage(recommendation)}
      <br/>
      ${generateDosageMessage(recommendation)}
      <br/>
      ${generateTipsMessage(recommendation)}
      <br/>
      ${generateLifestyleMessage(recommendation)}
      <br/>
      ${generateFollowUpMessage(recommendation)}
    </div>
  `;
}

// Función para obtener solo la recomendación de dosificación rápida
export function getQuickDosageRecommendation() {
  const recommendation = analyzer.generateRecommendation();
  return {
    dosage: recommendation.dosage,
    timing: recommendation.timing,
    riskLevel: recommendation.riskLevel,
    riskLabel: recommendation.riskLabel
  };
}