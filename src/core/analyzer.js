<<<<<<< HEAD
export class SerenliveAnalyzer {
  constructor() {
    this.weightedScores = {
      stress_level: 0,
      frequency: 0,
      symptoms: 0,
      sleep_quality: 0,
      lifestyle: 0,
      need_intensity: 0
    };
    this.patterns = [];
    this.riskFactors = [];
  }

  // Análisis de texto con NLP básico y detección de emociones
analyzeText(text, keywords = [], emotionalKeywords = {}) {
  const normalizedText = this.normalizeText(text);
  const words = normalizedText.split(/\s+/);
  
  let matches = [];
  let intensity = 0;
  let emotionalState = 'neutral';
  
  // Validar que keywords sea un array
  if (!Array.isArray(keywords)) {
    keywords = [];
  }
  
  // Detección de keywords con contexto
  for (let keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const keywordMatches = normalizedText.match(regex);
    if (keywordMatches) {
      matches.push({
        keyword,
        count: keywordMatches.length,
        intensity: this.calculateKeywordIntensity(keyword, normalizedText)
      });
    }
  }
  
  // Análisis emocional
  if (emotionalKeywords.negative && Array.isArray(emotionalKeywords.negative)) {
    const negativeCount = emotionalKeywords.negative.filter(word => 
      normalizedText.includes(word)).length;
    if (negativeCount > 0) emotionalState = 'negative';
  }
  
  if (emotionalKeywords.positive && Array.isArray(emotionalKeywords.positive)) {
    const positiveCount = emotionalKeywords.positive.filter(word => 
      normalizedText.includes(word)).length;
    if (positiveCount > 0) emotionalState = 'positive';
  }
  
  return {
    matches,
    emotionalState,
    intensity: this.calculateOverallIntensity(matches),
    wordCount: words.length,
    sentiment: this.analyzeSentiment(normalizedText)
  };
}

  normalizeText(text) {
    return text.toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  calculateKeywordIntensity(keyword, text) {
    // Palabras intensificadoras
    const intensifiers = ['muy', 'mucho', 'demasiado', 'bastante', 'super', 'extremadamente'];
    const diminishers = ['poco', 'algo', 'un poco', 'ligeramente', 'apenas'];
    
    let intensity = 1;
    
    for (let intensifier of intensifiers) {
      if (text.includes(intensifier + ' ' + keyword) || text.includes(keyword + ' ' + intensifier)) {
        intensity *= 1.5;
      }
    }
    
    for (let diminisher of diminishers) {
      if (text.includes(diminisher + ' ' + keyword) || text.includes(keyword + ' ' + diminisher)) {
        intensity *= 0.7;
      }
    }
    
    return Math.min(intensity, 3); // Cap at 3x intensity
  }

  calculateOverallIntensity(matches) {
    if (matches.length === 0) return 0;
    const totalIntensity = matches.reduce((sum, match) => sum + match.intensity * match.count, 0);
    return totalIntensity / matches.length;
  }

  analyzeSentiment(text) {
    const positiveWords = ['bien', 'mejor', 'genial', 'excelente', 'tranquilo', 'relajado', 'feliz', 'bueno'];
    const negativeWords = ['mal', 'terrible', 'horrible', 'estresado', 'ansioso', 'preocupado', 'triste', 'agotado'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 1;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 1;
    });
    
    return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  }

  // Análisis específico por pregunta
analyzeResponse(userInput, questionData) {
  const safeInput = this.normalizeText(userInput);
  const safeQuestionData = questionData || {};
  const questionId = safeQuestionData.id;

  // ⬇️ Aquí va el bloque para "recomendacion_final"
  if (questionId === "recomendacion_final") {
    const recommendation = this.generateRecommendation(); // genera el objeto
    const message = this.generateFinalMessageFromRecommendation(recommendation, safeQuestionData); // genera el texto final
    return message; // o usa tu método de mostrar texto si tienes uno
  }

  // ⬇️ Aquí sigue tu switch normal
  switch (questionId) {
    case 'estado_animo':
      return this.analyzeMoodState(safeInput, safeQuestionData);
    case 'frecuencia_estres':
      return this.analyzeStressFrequency(safeInput, safeQuestionData);
    case 'sintomas':
      return this.analyzeSymptoms(safeInput, safeQuestionData);
    case 'rutina_sueno':
      return this.analyzeSleep(safeInput, safeQuestionData);
    case 'actividades_relajacion':
      return this.analyzeRelaxationActivities(safeInput, safeQuestionData);
    case 'alimentacion':
      return this.analyzeDiet(safeInput, safeQuestionData);
    case 'intensidad_necesidad':
      return this.analyzeNeedIntensity(safeInput, safeQuestionData);
    default:
      return "Gracias por tu respuesta.";
  }
}

  analyzeMoodState(analysis, questionData) {
    let score = 0;
    let category = 'neutral';
    
    const scoring = questionData.scoring || {};
    
    if (scoring.high_stress) {
      const highStressMatches = scoring.high_stress.filter(keyword => 
        analysis.matches.some(match => match.keyword === keyword));
      if (highStressMatches.length > 0) {
        score = 3;
        category = 'high_stress';
      }
    }
    
    if (scoring.medium_stress && score === 0) {
      const mediumStressMatches = scoring.medium_stress.filter(keyword => 
        analysis.matches.some(match => match.keyword === keyword));
      if (mediumStressMatches.length > 0) {
        score = 2;
        category = 'medium_stress';
      }
    }
    
    if (scoring.low_stress && score === 0) {
      const lowStressMatches = scoring.low_stress.filter(keyword => 
        analysis.matches.some(match => match.keyword === keyword));
      if (lowStressMatches.length > 0) {
        score = 1;
        category = 'low_stress';
      }
    }

    this.weightedScores.stress_level = score;
    
    return {
      ...analysis,
      score,
      category,
      interpretation: this.getStressInterpretation(category),
      recommendations: this.getStressRecommendations(category)
    };
  }

analyzeDiet(analysis, questionData) {
  const { text = '', keywords = [] } = questionData;
  const score = this.analyzeText(text, keywords);

  if (score >= 2) {
    analysis.diet = {
      status: 'saludable',
      message: 'Tu alimentación parece equilibrada y adecuada. ¡Sigue así!'
    };
  } else if (score === 1) {
    analysis.diet = {
      status: 'moderada',
      message: 'Tu alimentación tiene algunos aspectos positivos, pero podría mejorar.'
    };
  } else {
    analysis.diet = {
      status: 'desequilibrada',
      message: 'Tu alimentación podría estar afectando tu bienestar. Considera revisar tus hábitos nutricionales.'
    };
  }

  return analysis;
}

analyzeNeedIntensity(analysis, questionData) {
  const { text = '', keywords = [] } = questionData;
  const score = this.analyzeText(text, keywords);

  let intensity;
  if (score >= 3) {
    intensity = 'alta';
  } else if (score === 2) {
    intensity = 'media';
  } else {
    intensity = 'baja';
  }

  analysis.needIntensity = {
    level: intensity,
    message: {
      alta: 'Parece que sientes una necesidad fuerte de apoyo o cambio. Es importante atender esto pronto.',
      media: 'Tienes una necesidad moderada, que podrías explorar más a fondo.',
      baja: 'Tu nivel de necesidad actual no parece urgente, pero siempre es bueno reflexionar al respecto.'
    }[intensity]
  };

  return analysis;
}


  analyzeStressFrequency(analysis, questionData) {
    let score = 0;
    let category = 'low';
    
    const scoring = questionData.scoring || {};
    
    if (scoring.high_frequency) {
      const matches = scoring.high_frequency.filter(freq => 
        analysis.matches.some(match => match.keyword === freq));
      if (matches.length > 0) {
        score = 3;
        category = 'high';
      }
    }
    
    if (scoring.medium_frequency && score === 0) {
      const matches = scoring.medium_frequency.filter(freq => 
        analysis.matches.some(match => match.keyword === freq));
      if (matches.length > 0) {
        score = 2;
        category = 'medium';
      }
    }

    this.weightedScores.frequency = score;
    
    return {
      ...analysis,
      score,
      category,
      frequency_pattern: this.detectFrequencyPattern(analysis.matches)
    };
  }

  analyzeSymptoms(analysis, questionData) {
    const symptomTypes = {
      physical: 0,
      cognitive: 0,
      emotional: 0,
      sleep: 0
    };

    const scoring = questionData.scoring || {};
    
    // Contar síntomas por categoría
    if (scoring.physical_symptoms) {
      symptomTypes.physical = scoring.physical_symptoms.filter(symptom => 
        analysis.matches.some(match => match.keyword === symptom)).length;
    }
    
    if (scoring.cognitive_symptoms) {
      symptomTypes.cognitive = scoring.cognitive_symptoms.filter(symptom => 
        analysis.matches.some(match => match.keyword === symptom)).length;
    }
    
    if (scoring.sleep_symptoms) {
      symptomTypes.sleep = scoring.sleep_symptoms.filter(symptom => 
        analysis.matches.some(match => match.keyword === symptom)).length;
    }

    const totalSymptoms = Object.values(symptomTypes).reduce((a, b) => a + b, 0);
    const symptomSeverity = totalSymptoms > 4 ? 'high' : totalSymptoms > 2 ? 'medium' : 'low';
    
    this.weightedScores.symptoms = totalSymptoms > 4 ? 3 : totalSymptoms > 2 ? 2 : 1;

    return {
      ...analysis,
      symptomTypes,
      totalSymptoms,
      severity: symptomSeverity,
      predominantType: Object.keys(symptomTypes).reduce((a, b) => 
        symptomTypes[a] > symptomTypes[b] ? a : b)
    };
  }

  analyzeSleep(analysis, questionData) {
    let sleepQuality = 'good';
    let score = 0;
    
    const scoring = questionData.scoring || {};
    
    if (scoring.poor_sleep) {
      const poorSleepMatches = scoring.poor_sleep.filter(issue => 
        analysis.matches.some(match => match.keyword === issue));
      if (poorSleepMatches.length > 0) {
        sleepQuality = 'poor';
        score = 3;
      }
    }
    
    if (scoring.fair_sleep && score === 0) {
      const fairSleepMatches = scoring.fair_sleep.filter(issue => 
        analysis.matches.some(match => match.keyword === issue));
      if (fairSleepMatches.length > 0) {
        sleepQuality = 'fair';
        score = 2;
      }
    }

    this.weightedScores.sleep_quality = score;

    return {
      ...analysis,
      sleepQuality,
      score,
      sleepIssues: this.identifySleepIssues(analysis.matches),
      impactLevel: score > 2 ? 'high' : score > 1 ? 'medium' : 'low'
    };
  }

  analyzeRelaxationActivities(analysis, questionData) {
    let activityLevel = 'none';
    let score = 0;
    
    const scoring = questionData.scoring || {};
    
    if (scoring.regular_activities) {
      const regularMatches = scoring.regular_activities.filter(activity => 
        analysis.matches.some(match => match.keyword === activity));
      if (regularMatches.length > 0) {
        activityLevel = 'regular';
        score = -1; // Positive factor
      }
    }
    
    if (scoring.no_activities) {
      const noActivityMatches = scoring.no_activities.filter(reason => 
        analysis.matches.some(match => match.keyword === reason));
      if (noActivityMatches.length > 0) {
        activityLevel = 'none';
        score = 1;
      }
    }

    this.weightedScores.lifestyle += score;

    return {
      ...analysis,
      activityLevel,
      score,
      barriers: this.identifyBarriers(analysis.matches),
      suggestions: this.generateActivitySuggestions(activityLevel)
    };
  }

  generateFinalMessageFromRecommendation(recommendation, questionData) {
  const { message, closing_message } = questionData;

  const fullMessage = `
${message}

🔹 **Dosis recomendada:** ${recommendation.dosage}
🕒 **Horario sugerido:** ${recommendation.timing}
⏳ **Duración sugerida:** ${recommendation.duration}
💡 **Consejos adicionales:** ${recommendation.additionalTips.join('\n- ')}

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

  return fullMessage;
}


  // Generar recomendación final mejorada
  generateRecommendation() {
    const totalScore = Object.values(this.weightedScores).reduce((a, b) => a + b, 0);
    const maxPossibleScore = 18; // 6 categories × 3 max points each
    const normalizedScore = (totalScore / maxPossibleScore) * 100;
    
    let recommendation = {
      score: totalScore,
      normalizedScore: Math.round(normalizedScore),
      riskLevel: this.calculateRiskLevel(normalizedScore),
      dosage: this.calculateDosage(totalScore),
      timing: this.calculateTiming(totalScore),
      duration: this.calculateDuration(totalScore),
      additionalTips: this.generatePersonalizedTips(),
      lifestyle: this.generateLifestyleSuggestions(),
      followUp: this.generateFollowUpPlan()
    };

    return recommendation;
  }

  calculateRiskLevel(normalizedScore) {
    if (normalizedScore >= 70) return 'high';
    if (normalizedScore >= 40) return 'medium';
    return 'low';
  }

  calculateDosage(totalScore) {
    if (totalScore >= 13) {
      return "3-4 gotas sublingüales, 2-3 veces al día";
    } else if (totalScore >= 7) {
      return "2-3 gotas sublingüales, 2 veces al día";
    } else {
      return "1-2 gotas sublingüales cuando sea necesario";
    }
  }

  calculateTiming(totalScore) {
    if (totalScore >= 13) {
      return "Mañana (al despertar), tarde (después del almuerzo) y noche (30 min antes de dormir)";
    } else if (totalScore >= 7) {
      return "Mañana (para prepararte para el día) y tarde/noche (cuando sientas estrés)";
    } else {
      return "Cuando sientas estrés o antes de situaciones desafiantes";
    }
  }

  calculateDuration(totalScore) {
    if (totalScore >= 13) {
      return "Uso constante por 4-6 semanas, luego evaluar";
    } else if (totalScore >= 7) {
      return "Uso regular por 2-4 semanas";
    } else {
      return "Uso según necesidad, máximo 2 semanas continuas";
    }
  }

  generatePersonalizedTips() {
    let tips = [];
    
    if (this.weightedScores.sleep_quality >= 2) {
      tips.push("Crea una rutina de sueño: misma hora para dormir y despertar");
      tips.push("Evita pantallas 1 hora antes de dormir");
    }
    
    if (this.weightedScores.stress_level >= 2) {
      tips.push("Practica respiración profunda: 4 segundos inhalar, 4 mantener, 4 exhalar");
      tips.push("Dedica 10 minutos diarios a una actividad que disfrutes");
    }
    
    if (this.weightedScores.lifestyle >= 1) {
      tips.push("Comienza con caminatas de 10 minutos diarios");
      tips.push("Programa 5 minutos de meditación o relajación");
    }

    return tips;
  }

  generateLifestyleSuggestions() {
    return {
      nutrition: this.getNutritionSuggestions(),
      exercise: this.getExerciseSuggestions(),
      sleep: this.getSleepSuggestions(),
      stress_management: this.getStressManagementSuggestions()
    };
  }

  generateFollowUpPlan() {
    const riskLevel = this.calculateRiskLevel(this.weightedScores.total);
    
    if (riskLevel === 'high') {
      return {
        frequency: "Seguimiento semanal",
        duration: "4-6 semanas",
        checkpoints: ["Calidad del sueño", "Nivel de estrés diario", "Efectividad del producto"]
      };
    } else if (riskLevel === 'medium') {
      return {
        frequency: "Seguimiento quincenal",
        duration: "2-4 semanas",
        checkpoints: ["Mejoras en síntomas", "Adaptación a la rutina"]
      };
    } else {
      return {
        frequency: "Seguimiento mensual",
        duration: "1-2 meses",
        checkpoints: ["Situaciones de estrés manejadas", "Satisfacción general"]
      };
    }
  }

  // Métodos auxiliares para generar sugerencias específicas
  getNutritionSuggestions() {
    return [
      "Reduce el consumo de cafeína después de las 2 PM",
      "Incluye alimentos ricos en magnesio (nueces, semillas, vegetales verdes)",
      "Mantén horarios regulares de comidas"
    ];
  }

  getExerciseSuggestions() {
    return [
      "Caminata de 20-30 minutos diarios",
      "Ejercicios de estiramiento por las mañanas",
      "Yoga suave o tai chi para relajación"
    ];
  }

  getSleepSuggestions() {
    return [
      "Mantén la habitación fresca y oscura",
      "Usa técnicas de relajación antes de dormir",
      "Evita comidas pesadas 3 horas antes de acostarte"
    ];
  }

  getStressManagementSuggestions() {
    return [
      "Técnicas de respiración consciente",
      "Journaling: escribe 3 cosas positivas del día",
      "Establece límites claros entre trabajo y descanso"
    ];
  }

  // Métodos auxiliares para análisis específicos
  detectFrequencyPattern(matches) {
    // Implementar lógica para detectar patrones de frecuencia
    return "pattern_detected";
  }

  identifySleepIssues(matches) {
    // Implementar lógica para identificar problemas específicos de sueño
    return ["insomnio", "sueño_interrumpido"];
  }

  identifyBarriers(matches) {
    // Implementar lógica para identificar barreras para actividades
    return ["falta_tiempo", "falta_motivacion"];
  }

  generateActivitySuggestions(activityLevel) {
    const suggestions = {
      none: ["Respiración profunda (2 min)", "Caminar al aire libre", "Escuchar música relajante"],
      some: ["Yoga básico", "Meditación guiada", "Ejercicio ligero"],
      regular: ["Mantener rutina actual", "Agregar variedad", "Aumentar intensidad gradualmente"]
    };
    return suggestions[activityLevel] || suggestions.none;
  }

  getStressInterpretation(category) {
    const interpretations = {
      high_stress: "Experimentas un nivel alto de estrés que puede estar afectando significativamente tu calidad de vida",
      medium_stress: "Tienes un nivel moderado de estrés que es manejable pero requiere atención",
      low_stress: "Tu nivel de estrés es relativamente bajo, mantienes un buen equilibrio",
      neutral: "Tu estado emocional parece estable en este momento"
    };
    return interpretations[category] || interpretations.neutral;
  }

  getStressRecommendations(category) {
    const recommendations = {
      high_stress: ["Considera apoyo profesional", "Usa Serenlive regularmente", "Implementa técnicas de manejo del estrés"],
      medium_stress: ["Establece rutinas de relajación", "Usa Serenlive según necesidad", "Mantén hábitos saludables"],
      low_stress: ["Continúa con tus estrategias actuales", "Usa Serenlive ocasionalmente", "Mantén el equilibrio"]
    };
    return recommendations[category] || recommendations.low_stress;
  }
}

=======
export class SerenliveAnalyzer {
  constructor() {
    this.weightedScores = {
      stress_level: 0,
      frequency: 0,
      symptoms: 0,
      sleep_quality: 0,
      lifestyle: 0,
      need_intensity: 0
    };
    this.patterns = [];
    this.riskFactors = [];
  }

  // Análisis de texto con NLP básico y detección de emociones
analyzeText(text, keywords = [], emotionalKeywords = {}) {
  const normalizedText = this.normalizeText(text);
  const words = normalizedText.split(/\s+/);
  
  let matches = [];
  let intensity = 0;
  let emotionalState = 'neutral';
  
  // Validar que keywords sea un array
  if (!Array.isArray(keywords)) {
    keywords = [];
  }
  
  // Detección de keywords con contexto
  for (let keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const keywordMatches = normalizedText.match(regex);
    if (keywordMatches) {
      matches.push({
        keyword,
        count: keywordMatches.length,
        intensity: this.calculateKeywordIntensity(keyword, normalizedText)
      });
    }
  }
  
  // Análisis emocional
  if (emotionalKeywords.negative && Array.isArray(emotionalKeywords.negative)) {
    const negativeCount = emotionalKeywords.negative.filter(word => 
      normalizedText.includes(word)).length;
    if (negativeCount > 0) emotionalState = 'negative';
  }
  
  if (emotionalKeywords.positive && Array.isArray(emotionalKeywords.positive)) {
    const positiveCount = emotionalKeywords.positive.filter(word => 
      normalizedText.includes(word)).length;
    if (positiveCount > 0) emotionalState = 'positive';
  }
  
  return {
    matches,
    emotionalState,
    intensity: this.calculateOverallIntensity(matches),
    wordCount: words.length,
    sentiment: this.analyzeSentiment(normalizedText)
  };
}

  normalizeText(text) {
    return text.toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  calculateKeywordIntensity(keyword, text) {
    // Palabras intensificadoras
    const intensifiers = ['muy', 'mucho', 'demasiado', 'bastante', 'super', 'extremadamente'];
    const diminishers = ['poco', 'algo', 'un poco', 'ligeramente', 'apenas'];
    
    let intensity = 1;
    
    for (let intensifier of intensifiers) {
      if (text.includes(intensifier + ' ' + keyword) || text.includes(keyword + ' ' + intensifier)) {
        intensity *= 1.5;
      }
    }
    
    for (let diminisher of diminishers) {
      if (text.includes(diminisher + ' ' + keyword) || text.includes(keyword + ' ' + diminisher)) {
        intensity *= 0.7;
      }
    }
    
    return Math.min(intensity, 3); // Cap at 3x intensity
  }

  calculateOverallIntensity(matches) {
    if (matches.length === 0) return 0;
    const totalIntensity = matches.reduce((sum, match) => sum + match.intensity * match.count, 0);
    return totalIntensity / matches.length;
  }

  analyzeSentiment(text) {
    const positiveWords = ['bien', 'mejor', 'genial', 'excelente', 'tranquilo', 'relajado', 'feliz', 'bueno'];
    const negativeWords = ['mal', 'terrible', 'horrible', 'estresado', 'ansioso', 'preocupado', 'triste', 'agotado'];
    
    let score = 0;
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 1;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 1;
    });
    
    return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  }

  // Análisis específico por pregunta
analyzeResponse(userInput, questionData) {
  const safeInput = this.normalizeText(userInput);
  const safeQuestionData = questionData || {};
  const questionId = safeQuestionData.id;

  // ⬇️ Aquí va el bloque para "recomendacion_final"
  if (questionId === "recomendacion_final") {
    const recommendation = this.generateRecommendation(); // genera el objeto
    const message = this.generateFinalMessageFromRecommendation(recommendation, safeQuestionData); // genera el texto final
    return message; // o usa tu método de mostrar texto si tienes uno
  }

  // ⬇️ Aquí sigue tu switch normal
  switch (questionId) {
    case 'estado_animo':
      return this.analyzeMoodState(safeInput, safeQuestionData);
    case 'frecuencia_estres':
      return this.analyzeStressFrequency(safeInput, safeQuestionData);
    case 'sintomas':
      return this.analyzeSymptoms(safeInput, safeQuestionData);
    case 'rutina_sueno':
      return this.analyzeSleep(safeInput, safeQuestionData);
    case 'actividades_relajacion':
      return this.analyzeRelaxationActivities(safeInput, safeQuestionData);
    case 'alimentacion':
      return this.analyzeDiet(safeInput, safeQuestionData);
    case 'intensidad_necesidad':
      return this.analyzeNeedIntensity(safeInput, safeQuestionData);
    default:
      return "Gracias por tu respuesta.";
  }
}

  analyzeMoodState(analysis, questionData) {
    let score = 0;
    let category = 'neutral';
    
    const scoring = questionData.scoring || {};
    
    if (scoring.high_stress) {
      const highStressMatches = scoring.high_stress.filter(keyword => 
        analysis.matches.some(match => match.keyword === keyword));
      if (highStressMatches.length > 0) {
        score = 3;
        category = 'high_stress';
      }
    }
    
    if (scoring.medium_stress && score === 0) {
      const mediumStressMatches = scoring.medium_stress.filter(keyword => 
        analysis.matches.some(match => match.keyword === keyword));
      if (mediumStressMatches.length > 0) {
        score = 2;
        category = 'medium_stress';
      }
    }
    
    if (scoring.low_stress && score === 0) {
      const lowStressMatches = scoring.low_stress.filter(keyword => 
        analysis.matches.some(match => match.keyword === keyword));
      if (lowStressMatches.length > 0) {
        score = 1;
        category = 'low_stress';
      }
    }

    this.weightedScores.stress_level = score;
    
    return {
      ...analysis,
      score,
      category,
      interpretation: this.getStressInterpretation(category),
      recommendations: this.getStressRecommendations(category)
    };
  }

analyzeDiet(analysis, questionData) {
  const { text = '', keywords = [] } = questionData;
  const score = this.analyzeText(text, keywords);

  if (score >= 2) {
    analysis.diet = {
      status: 'saludable',
      message: 'Tu alimentación parece equilibrada y adecuada. ¡Sigue así!'
    };
  } else if (score === 1) {
    analysis.diet = {
      status: 'moderada',
      message: 'Tu alimentación tiene algunos aspectos positivos, pero podría mejorar.'
    };
  } else {
    analysis.diet = {
      status: 'desequilibrada',
      message: 'Tu alimentación podría estar afectando tu bienestar. Considera revisar tus hábitos nutricionales.'
    };
  }

  return analysis;
}

analyzeNeedIntensity(analysis, questionData) {
  const { text = '', keywords = [] } = questionData;
  const score = this.analyzeText(text, keywords);

  let intensity;
  if (score >= 3) {
    intensity = 'alta';
  } else if (score === 2) {
    intensity = 'media';
  } else {
    intensity = 'baja';
  }

  analysis.needIntensity = {
    level: intensity,
    message: {
      alta: 'Parece que sientes una necesidad fuerte de apoyo o cambio. Es importante atender esto pronto.',
      media: 'Tienes una necesidad moderada, que podrías explorar más a fondo.',
      baja: 'Tu nivel de necesidad actual no parece urgente, pero siempre es bueno reflexionar al respecto.'
    }[intensity]
  };

  return analysis;
}


  analyzeStressFrequency(analysis, questionData) {
    let score = 0;
    let category = 'low';
    
    const scoring = questionData.scoring || {};
    
    if (scoring.high_frequency) {
      const matches = scoring.high_frequency.filter(freq => 
        analysis.matches.some(match => match.keyword === freq));
      if (matches.length > 0) {
        score = 3;
        category = 'high';
      }
    }
    
    if (scoring.medium_frequency && score === 0) {
      const matches = scoring.medium_frequency.filter(freq => 
        analysis.matches.some(match => match.keyword === freq));
      if (matches.length > 0) {
        score = 2;
        category = 'medium';
      }
    }

    this.weightedScores.frequency = score;
    
    return {
      ...analysis,
      score,
      category,
      frequency_pattern: this.detectFrequencyPattern(analysis.matches)
    };
  }

  analyzeSymptoms(analysis, questionData) {
    const symptomTypes = {
      physical: 0,
      cognitive: 0,
      emotional: 0,
      sleep: 0
    };

    const scoring = questionData.scoring || {};
    
    // Contar síntomas por categoría
    if (scoring.physical_symptoms) {
      symptomTypes.physical = scoring.physical_symptoms.filter(symptom => 
        analysis.matches.some(match => match.keyword === symptom)).length;
    }
    
    if (scoring.cognitive_symptoms) {
      symptomTypes.cognitive = scoring.cognitive_symptoms.filter(symptom => 
        analysis.matches.some(match => match.keyword === symptom)).length;
    }
    
    if (scoring.sleep_symptoms) {
      symptomTypes.sleep = scoring.sleep_symptoms.filter(symptom => 
        analysis.matches.some(match => match.keyword === symptom)).length;
    }

    const totalSymptoms = Object.values(symptomTypes).reduce((a, b) => a + b, 0);
    const symptomSeverity = totalSymptoms > 4 ? 'high' : totalSymptoms > 2 ? 'medium' : 'low';
    
    this.weightedScores.symptoms = totalSymptoms > 4 ? 3 : totalSymptoms > 2 ? 2 : 1;

    return {
      ...analysis,
      symptomTypes,
      totalSymptoms,
      severity: symptomSeverity,
      predominantType: Object.keys(symptomTypes).reduce((a, b) => 
        symptomTypes[a] > symptomTypes[b] ? a : b)
    };
  }

  analyzeSleep(analysis, questionData) {
    let sleepQuality = 'good';
    let score = 0;
    
    const scoring = questionData.scoring || {};
    
    if (scoring.poor_sleep) {
      const poorSleepMatches = scoring.poor_sleep.filter(issue => 
        analysis.matches.some(match => match.keyword === issue));
      if (poorSleepMatches.length > 0) {
        sleepQuality = 'poor';
        score = 3;
      }
    }
    
    if (scoring.fair_sleep && score === 0) {
      const fairSleepMatches = scoring.fair_sleep.filter(issue => 
        analysis.matches.some(match => match.keyword === issue));
      if (fairSleepMatches.length > 0) {
        sleepQuality = 'fair';
        score = 2;
      }
    }

    this.weightedScores.sleep_quality = score;

    return {
      ...analysis,
      sleepQuality,
      score,
      sleepIssues: this.identifySleepIssues(analysis.matches),
      impactLevel: score > 2 ? 'high' : score > 1 ? 'medium' : 'low'
    };
  }

  analyzeRelaxationActivities(analysis, questionData) {
    let activityLevel = 'none';
    let score = 0;
    
    const scoring = questionData.scoring || {};
    
    if (scoring.regular_activities) {
      const regularMatches = scoring.regular_activities.filter(activity => 
        analysis.matches.some(match => match.keyword === activity));
      if (regularMatches.length > 0) {
        activityLevel = 'regular';
        score = -1; // Positive factor
      }
    }
    
    if (scoring.no_activities) {
      const noActivityMatches = scoring.no_activities.filter(reason => 
        analysis.matches.some(match => match.keyword === reason));
      if (noActivityMatches.length > 0) {
        activityLevel = 'none';
        score = 1;
      }
    }

    this.weightedScores.lifestyle += score;

    return {
      ...analysis,
      activityLevel,
      score,
      barriers: this.identifyBarriers(analysis.matches),
      suggestions: this.generateActivitySuggestions(activityLevel)
    };
  }

  generateFinalMessageFromRecommendation(recommendation, questionData) {
  const { message, closing_message } = questionData;

  const fullMessage = `
${message}

🔹 **Dosis recomendada:** ${recommendation.dosage}
🕒 **Horario sugerido:** ${recommendation.timing}
⏳ **Duración sugerida:** ${recommendation.duration}
💡 **Consejos adicionales:** ${recommendation.additionalTips.join('\n- ')}

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

  return fullMessage;
}


  // Generar recomendación final mejorada
  generateRecommendation() {
    const totalScore = Object.values(this.weightedScores).reduce((a, b) => a + b, 0);
    const maxPossibleScore = 18; // 6 categories × 3 max points each
    const normalizedScore = (totalScore / maxPossibleScore) * 100;
    
    let recommendation = {
      score: totalScore,
      normalizedScore: Math.round(normalizedScore),
      riskLevel: this.calculateRiskLevel(normalizedScore),
      dosage: this.calculateDosage(totalScore),
      timing: this.calculateTiming(totalScore),
      duration: this.calculateDuration(totalScore),
      additionalTips: this.generatePersonalizedTips(),
      lifestyle: this.generateLifestyleSuggestions(),
      followUp: this.generateFollowUpPlan()
    };

    return recommendation;
  }

  calculateRiskLevel(normalizedScore) {
    if (normalizedScore >= 70) return 'high';
    if (normalizedScore >= 40) return 'medium';
    return 'low';
  }

  calculateDosage(totalScore) {
    if (totalScore >= 13) {
      return "3-4 gotas sublingüales, 2-3 veces al día";
    } else if (totalScore >= 7) {
      return "2-3 gotas sublingüales, 2 veces al día";
    } else {
      return "1-2 gotas sublingüales cuando sea necesario";
    }
  }

  calculateTiming(totalScore) {
    if (totalScore >= 13) {
      return "Mañana (al despertar), tarde (después del almuerzo) y noche (30 min antes de dormir)";
    } else if (totalScore >= 7) {
      return "Mañana (para prepararte para el día) y tarde/noche (cuando sientas estrés)";
    } else {
      return "Cuando sientas estrés o antes de situaciones desafiantes";
    }
  }

  calculateDuration(totalScore) {
    if (totalScore >= 13) {
      return "Uso constante por 4-6 semanas, luego evaluar";
    } else if (totalScore >= 7) {
      return "Uso regular por 2-4 semanas";
    } else {
      return "Uso según necesidad, máximo 2 semanas continuas";
    }
  }

  generatePersonalizedTips() {
    let tips = [];
    
    if (this.weightedScores.sleep_quality >= 2) {
      tips.push("Crea una rutina de sueño: misma hora para dormir y despertar");
      tips.push("Evita pantallas 1 hora antes de dormir");
    }
    
    if (this.weightedScores.stress_level >= 2) {
      tips.push("Practica respiración profunda: 4 segundos inhalar, 4 mantener, 4 exhalar");
      tips.push("Dedica 10 minutos diarios a una actividad que disfrutes");
    }
    
    if (this.weightedScores.lifestyle >= 1) {
      tips.push("Comienza con caminatas de 10 minutos diarios");
      tips.push("Programa 5 minutos de meditación o relajación");
    }

    return tips;
  }

  generateLifestyleSuggestions() {
    return {
      nutrition: this.getNutritionSuggestions(),
      exercise: this.getExerciseSuggestions(),
      sleep: this.getSleepSuggestions(),
      stress_management: this.getStressManagementSuggestions()
    };
  }

  generateFollowUpPlan() {
    const riskLevel = this.calculateRiskLevel(this.weightedScores.total);
    
    if (riskLevel === 'high') {
      return {
        frequency: "Seguimiento semanal",
        duration: "4-6 semanas",
        checkpoints: ["Calidad del sueño", "Nivel de estrés diario", "Efectividad del producto"]
      };
    } else if (riskLevel === 'medium') {
      return {
        frequency: "Seguimiento quincenal",
        duration: "2-4 semanas",
        checkpoints: ["Mejoras en síntomas", "Adaptación a la rutina"]
      };
    } else {
      return {
        frequency: "Seguimiento mensual",
        duration: "1-2 meses",
        checkpoints: ["Situaciones de estrés manejadas", "Satisfacción general"]
      };
    }
  }

  // Métodos auxiliares para generar sugerencias específicas
  getNutritionSuggestions() {
    return [
      "Reduce el consumo de cafeína después de las 2 PM",
      "Incluye alimentos ricos en magnesio (nueces, semillas, vegetales verdes)",
      "Mantén horarios regulares de comidas"
    ];
  }

  getExerciseSuggestions() {
    return [
      "Caminata de 20-30 minutos diarios",
      "Ejercicios de estiramiento por las mañanas",
      "Yoga suave o tai chi para relajación"
    ];
  }

  getSleepSuggestions() {
    return [
      "Mantén la habitación fresca y oscura",
      "Usa técnicas de relajación antes de dormir",
      "Evita comidas pesadas 3 horas antes de acostarte"
    ];
  }

  getStressManagementSuggestions() {
    return [
      "Técnicas de respiración consciente",
      "Journaling: escribe 3 cosas positivas del día",
      "Establece límites claros entre trabajo y descanso"
    ];
  }

  // Métodos auxiliares para análisis específicos
  detectFrequencyPattern(matches) {
    // Implementar lógica para detectar patrones de frecuencia
    return "pattern_detected";
  }

  identifySleepIssues(matches) {
    // Implementar lógica para identificar problemas específicos de sueño
    return ["insomnio", "sueño_interrumpido"];
  }

  identifyBarriers(matches) {
    // Implementar lógica para identificar barreras para actividades
    return ["falta_tiempo", "falta_motivacion"];
  }

  generateActivitySuggestions(activityLevel) {
    const suggestions = {
      none: ["Respiración profunda (2 min)", "Caminar al aire libre", "Escuchar música relajante"],
      some: ["Yoga básico", "Meditación guiada", "Ejercicio ligero"],
      regular: ["Mantener rutina actual", "Agregar variedad", "Aumentar intensidad gradualmente"]
    };
    return suggestions[activityLevel] || suggestions.none;
  }

  getStressInterpretation(category) {
    const interpretations = {
      high_stress: "Experimentas un nivel alto de estrés que puede estar afectando significativamente tu calidad de vida",
      medium_stress: "Tienes un nivel moderado de estrés que es manejable pero requiere atención",
      low_stress: "Tu nivel de estrés es relativamente bajo, mantienes un buen equilibrio",
      neutral: "Tu estado emocional parece estable en este momento"
    };
    return interpretations[category] || interpretations.neutral;
  }

  getStressRecommendations(category) {
    const recommendations = {
      high_stress: ["Considera apoyo profesional", "Usa Serenlive regularmente", "Implementa técnicas de manejo del estrés"],
      medium_stress: ["Establece rutinas de relajación", "Usa Serenlive según necesidad", "Mantén hábitos saludables"],
      low_stress: ["Continúa con tus estrategias actuales", "Usa Serenlive ocasionalmente", "Mantén el equilibrio"]
    };
    return recommendations[category] || recommendations.low_stress;
  }
}

>>>>>>> 72b7a7ab7e4d140805bcfcaefeaa82eaabdc049f
export const analyzer = new SerenliveAnalyzer();