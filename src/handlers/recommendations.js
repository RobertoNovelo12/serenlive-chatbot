// recommendations.js - Sistema de recomendaciones corregido

export class RecommendationEngine {
  constructor() {
    this.riskLevels = {
      HIGH: 'high',
      MEDIUM: 'medium', 
      LOW: 'low'
    };
  }

  // Generar recomendación completa basada en scores - CORREGIDO
  generateRecommendation(weightedScores) {
    console.log('📊 Raw scores received:', weightedScores);
    
    // Calcular score total pero limitando lifestyle
    const adjustedScores = this.adjustScores(weightedScores);
    console.log('📊 Adjusted scores:', adjustedScores);
    
    const totalScore = Object.values(adjustedScores).reduce((a, b) => a + b, 0);
    
    // Máximo posible: stress_level(3) + frequency(3) + symptoms(3) + sleep_quality(3) + lifestyle(3) + need_intensity(3) = 18
    const maxPossibleScore = 18;
    const normalizedScore = Math.min((totalScore / maxPossibleScore) * 100, 100);
    
    console.log('📊 Final calculation:', {
      totalScore,
      maxPossibleScore,
      normalizedScore: Math.round(normalizedScore)
    });
    
    const riskLevel = this.calculateRiskLevel(normalizedScore);
    
    return {
      score: totalScore,
      normalizedScore: Math.round(normalizedScore),
      riskLevel,
      riskLabel: this.getRiskLabel(riskLevel),
      riskColor: this.getRiskColor(riskLevel),
      dosage: this.calculateDosage(totalScore),
      timing: this.calculateTiming(totalScore),
      duration: this.calculateDuration(totalScore),
      additionalTips: this.generatePersonalizedTips(weightedScores),
      lifestyle: this.generateLifestyleSuggestions(weightedScores),
      followUp: this.generateFollowUpPlan(riskLevel),
      breakdown: adjustedScores // Para debugging
    };
  }

  // Ajustar scores para que sean más precisos - NUEVO
  adjustScores(weightedScores) {
    const adjusted = { ...weightedScores };
    
    // Limitar lifestyle a máximo 3 puntos (en lugar de 4+)
    if (adjusted.lifestyle > 3) {
      console.log('⚠️ Limitando lifestyle de', adjusted.lifestyle, 'a 3');
      adjusted.lifestyle = 3;
    }
    
    // Asegurar que ningún score sea negativo
    Object.keys(adjusted).forEach(key => {
      if (adjusted[key] < 0) {
        console.log('⚠️ Corrigiendo score negativo:', key, adjusted[key], '→ 0');
        adjusted[key] = 0;
      }
    });
    
    return adjusted;
  }

  // Calcular nivel de riesgo - AJUSTADO
  calculateRiskLevel(normalizedScore) {
    // Umbrales más realistas
    if (normalizedScore >= 60) return this.riskLevels.HIGH;
    if (normalizedScore >= 30) return this.riskLevels.MEDIUM;
    return this.riskLevels.LOW;
  }

  // Obtener etiqueta de riesgo
  getRiskLabel(riskLevel) {
    const labels = {
      [this.riskLevels.HIGH]: 'Alto',
      [this.riskLevels.MEDIUM]: 'Moderado',
      [this.riskLevels.LOW]: 'Bajo'
    };
    return labels[riskLevel] || 'Moderado';
  }

  // Obtener color de riesgo
  getRiskColor(riskLevel) {
    const colors = {
      [this.riskLevels.HIGH]: '#e74c3c',
      [this.riskLevels.MEDIUM]: '#f39c12',
      [this.riskLevels.LOW]: '#27ae60'
    };
    return colors[riskLevel] || '#f39c12';
  }

  // Calcular dosificación recomendada - AJUSTADO
  calculateDosage(totalScore) {
    if (totalScore >= 11) {
      return "3-4 gotas sublingüales, 2-3 veces al día";
    } else if (totalScore >= 5) {
      return "2-3 gotas sublingüales, 2 veces al día";
    } else {
      return "1-2 gotas sublingüales cuando sea necesario";
    }
  }

  // Calcular horarios recomendados - AJUSTADO
  calculateTiming(totalScore) {
    if (totalScore >= 11) {
      return "Mañana (al despertar), tarde (después del almuerzo) y noche (30 min antes de dormir)";
    } else if (totalScore >= 5) {
      return "Mañana (para prepararte para el día) y tarde/noche (cuando sientas estrés)";
    } else {
      return "Cuando sientas estrés o antes de situaciones desafiantes";
    }
  }

  // Calcular duración del tratamiento - AJUSTADO
  calculateDuration(totalScore) {
    if (totalScore >= 11) {
      return "Uso constante por 4-6 semanas, luego evaluar";
    } else if (totalScore >= 5) {
      return "Uso regular por 2-4 semanas";
    } else {
      return "Uso según necesidad, máximo 2 semanas continuas";
    }
  }

  // Generar tips personalizados
  generatePersonalizedTips(weightedScores) {
    let tips = [];
    
    if (weightedScores.sleep_quality >= 2) {
      tips.push("Crea una rutina de sueño: misma hora para dormir y despertar");
      tips.push("Evita pantallas 1 hora antes de dormir");
    }
    
    if (weightedScores.stress_level >= 2) {
      tips.push("Practica respiración profunda: 4 segundos inhalar, 4 mantener, 4 exhalar");
      tips.push("Dedica 10 minutos diarios a una actividad que disfrutes");
    }
    
    if (weightedScores.lifestyle >= 2) {
      tips.push("Comienza con caminatas de 10 minutos diarios");
      tips.push("Programa 5 minutos de meditación o relajación");
    }

    if (weightedScores.symptoms >= 2) {
      tips.push("Lleva un diario de síntomas para identificar patrones");
      tips.push("Practica técnicas de relajación muscular progresiva");
    }

    if (weightedScores.frequency >= 2) {
      tips.push("Identifica tus principales desencadenantes de estrés");
      tips.push("Establece pausas regulares durante el día");
    }

    // Tips generales si no hay tips específicos o score bajo
    if (tips.length === 0 || Object.values(weightedScores).reduce((a, b) => a + b, 0) <= 3) {
      tips.push("Mantén una rutina diaria equilibrada");
      tips.push("Dedica tiempo a actividades que te generen bienestar");
      tips.push("Practica la gratitud: anota 3 cosas positivas cada día");
    }

    return tips;
  }

  // Generar sugerencias de estilo de vida
  generateLifestyleSuggestions(weightedScores) {
    return {
      nutrition: this.getNutritionSuggestions(weightedScores),
      exercise: this.getExerciseSuggestions(weightedScores),
      sleep: this.getSleepSuggestions(weightedScores),
      stress_management: this.getStressManagementSuggestions(weightedScores)
    };
  }

  // Sugerencias nutricionales
  getNutritionSuggestions(weightedScores) {
    const suggestions = [
      "Reduce el consumo de cafeína después de las 2 PM",
      "Incluye alimentos ricos en magnesio (nueces, semillas, vegetales verdes)",
      "Mantén horarios regulares de comidas"
    ];

    if (weightedScores.sleep_quality >= 2) {
      suggestions.push("Evita comidas pesadas 3 horas antes de dormir");
    }

    if (weightedScores.stress_level >= 2) {
      suggestions.push("Incorpora alimentos ricos en omega-3 (pescado, nueces)");
    }

    return suggestions;
  }

  // Sugerencias de ejercicio
  getExerciseSuggestions(weightedScores) {
    const suggestions = [
      "Caminata de 20-30 minutos diarios",
      "Ejercicios de estiramiento por las mañanas"
    ];

    if (weightedScores.stress_level >= 2) {
      suggestions.push("Yoga suave o tai chi para relajación");
      suggestions.push("Ejercicios de respiración durante el día");
    } else {
      suggestions.push("Actividad física moderada 3 veces por semana");
    }

    return suggestions;
  }

  // Sugerencias de sueño
  getSleepSuggestions(weightedScores) {
    const suggestions = [
      "Mantén la habitación fresca y oscura",
      "Establece una rutina relajante antes de dormir"
    ];

    if (weightedScores.sleep_quality >= 2) {
      suggestions.push("Evita pantallas 1 hora antes de acostarte");
      suggestions.push("Usa técnicas de relajación muscular progresiva");
    } else {
      suggestions.push("Mantén horarios consistentes de sueño");
    }

    return suggestions;
  }

  // Sugerencias de manejo del estrés
  getStressManagementSuggestions(weightedScores) {
    const suggestions = [
      "Técnicas de respiración consciente",
      "Establece límites claros entre trabajo y descanso"
    ];

    if (weightedScores.stress_level >= 2) {
      suggestions.push("Practica mindfulness o meditación diaria");
      suggestions.push("Journaling: escribe tus pensamientos y emociones");
    } else {
      suggestions.push("Dedica tiempo a hobbies que disfrutes");
    }

    return suggestions;
  }

  // Generar plan de seguimiento - AJUSTADO
  generateFollowUpPlan(riskLevel) {
    const plans = {
      [this.riskLevels.HIGH]: {
        frequency: "Seguimiento semanal",
        duration: "4-6 semanas",
        checkpoints: ["Calidad del sueño", "Nivel de estrés diario", "Efectividad del producto"]
      },
      [this.riskLevels.MEDIUM]: {
        frequency: "Seguimiento quincenal", 
        duration: "2-4 semanas",
        checkpoints: ["Mejoras en síntomas", "Adaptación a la rutina"]
      },
      [this.riskLevels.LOW]: {
        frequency: "Seguimiento mensual",
        duration: "1-2 meses", 
        checkpoints: ["Situaciones de estrés manejadas", "Satisfacción general"]
      }
    };

    return plans[riskLevel] || plans[this.riskLevels.MEDIUM];
  }

  // Generar mensaje final formateado
  generateFinalMessage(recommendation, questionData) {
    const { message, closing_message } = questionData;

    return `
${message}

📊 **Nivel de estrés detectado:** ${recommendation.riskLabel} (${recommendation.normalizedScore}%)

🔹 **Dosis recomendada:** ${recommendation.dosage}
🕒 **Horario sugerido:** ${recommendation.timing}
⏳ **Duración sugerida:** ${recommendation.duration}

💡 **Consejos adicionales:** 
- ${recommendation.additionalTips.join('\n- ')}

🍎 **Sugerencias de estilo de vida:**
• Nutrición: ${recommendation.lifestyle.nutrition.join('; ')}
• Ejercicio: ${recommendation.lifestyle.exercise.join('; ')}
• Sueño: ${recommendation.lifestyle.sleep.join('; ')}
• Manejo del estrés: ${recommendation.lifestyle.stress_management.join('; ')}

📋 **Plan de seguimiento:**
- Frecuencia: ${recommendation.followUp.frequency}
- Duración: ${recommendation.followUp.duration}
- Checkpoints: ${recommendation.followUp.checkpoints.join(', ')}

${closing_message}
    `.trim();
  }
}

// Instancia singleton
export const recommendationEngine = new RecommendationEngine();