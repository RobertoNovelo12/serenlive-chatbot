let conversationStep = 0;
let questions = [];
let questionMap = {};
let currentQuestionIndex = 0;
let userData = {};
let analysisData = {}; // Nuevo: almacenar análisis detallado
let shownOptions = new Set();

function showInitialOptions() {
    disableInput(); // oculta o desactiva el input del usuario

    const options = [
        { id: 'que_es', text: "¿Qué es Serenlive?" },
        { id: 'ingredientes', text: "¿De qué está hecho?" },
        { id: 'iniciar_test', text: "Hacer una prueba de estrés para darte una dosis adecuada" }
    ];

    renderBotMessage("¡Hola! ¿Cómo puedo ayudarte hoy?");
    renderButtonOptions(options, handleInitialOptionClick);
}

// Asegúrate también de que estas funciones estén correctamente implementadas:
function disableInput() {
    const input = document.getElementById("nameInput");
    if (!input) {
        console.error("❌ No se encontró el elemento con id 'nameInput'");
        // Buscar elementos alternativos
        const alternativeInput = document.querySelector('input[type="text"]') || 
                               document.querySelector('input') || 
                               document.querySelector('#chat-input');
        if (alternativeInput) {
            console.log("✅ Usando elemento alternativo:", alternativeInput.id || alternativeInput.className);
            alternativeInput.disabled = true;
            alternativeInput.placeholder = "Selecciona una opción para continuar...";
            return;
        }
        return;
    }
    input.disabled = true;
    input.placeholder = "Selecciona una opción para continuar...";
}

function handleInitialOptionClick(optionId) {
  shownOptions.add(optionId);

  if (optionId === 'que_es') {
    renderBotMessage("Serenlive es una tira sublingual, elaborada con una matriz polimérica de grado alimenticio...");
  } else if (optionId === 'ingredientes') {
    renderBotMessage("Serenlive es un suplemento alimenticio de origen natural, formulado con extractos estandarizados...");
  } else if (optionId === 'iniciar_test') {
    renderBotMessage("¡Perfecto! Para comenzar, por favor dime tu nombre.");
    const input = document.getElementById("nameInput");
    input.disabled = false;
    input.placeholder = "Escribe tu nombre...";
    input.focus();
    conversationStep = 0; // Ahora sí aceptamos nombre
    return; // no mostrar más opciones
  }

  // Mostrar las opciones restantes
  const remainingOptions = [
    { id: 'que_es', text: "¿Qué es Serenlive?" },
    { id: 'ingredientes', text: "¿De qué está hecho?" },
    { id: 'iniciar_test', text: "Hacer una prueba de estrés para darte una dosis adecuada" }
  ].filter(opt => !shownOptions.has(opt.id));

  if (remainingOptions.length > 0) {
    renderButtonOptions(remainingOptions, handleInitialOptionClick);
  }
}

function enableInput() {
    const input = document.getElementById("nameInput");
    if (!input) {
        console.error("❌ No se encontró el elemento con id 'nameInput'");
        const alternativeInput = document.querySelector('input[type="text"]') || 
                               document.querySelector('input') || 
                               document.querySelector('#chat-input');
        if (alternativeInput) {
            alternativeInput.disabled = false;
            alternativeInput.placeholder = "Escribe tu respuesta...";
            return;
        }
        return;
    }
    input.disabled = false;
    input.placeholder = "Escribe tu respuesta...";
}

function renderBotMessage(text) {
    addMessage("bot", text, "🤖");
}

function renderButtonOptions(options, callback) {
    const container = document.createElement("div");
    container.className = "option-buttons";

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "chat-option-button";
        btn.innerText = opt.text;

        btn.onclick = () => {
            btn.classList.add('exit'); // Animación de salida
            setTimeout(() => {
                container.remove();
                callback(opt.id);
            }, 150);
        };

        container.appendChild(btn);
    });

    const chatContainer = document.getElementById("chatMessages") || 
                         document.getElementById("chat") || 
                         document.querySelector('.chat-container') ||
                         document.querySelector('.messages-container') ||
                         document.querySelector('.chat-messages');

    if (chatContainer) {
        chatContainer.appendChild(container);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
        console.error("❌ No se encontró el contenedor de mensajes");
        const tempContainer = document.createElement("div");
        tempContainer.id = "chatMessages";
        tempContainer.appendChild(container);
        document.body.appendChild(tempContainer);
    }
}


// Sistema de análisis mejorado
class SerenliveAnalyzer {
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

// Instancia global del analizador
const analyzer = new SerenliveAnalyzer();

// Función mejorada para procesar respuestas
function processUserInput(answer) {
  const input = document.getElementById("nameInput");
  const q = questions[currentQuestionIndex];
  addMessage("user", answer, "👤");
  input.disabled = true;

  // Análisis mejorado de la respuesta
  const analysis = analyzer.analyzeResponse(q.id, answer, q);
  
  // Guardar datos crudos y análisis
  userData[q.id] = answer;
  analysisData[q.id] = analysis;
  
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
  localStorage.setItem("chat_serenlive_analysis", JSON.stringify(analysisData));

  // Distinguir tipo de pregunta
  if (q.type === "options") {
    handleOptionsQuestion(q, answer, analysis);
  } else if (q.type === "recommendation") {
    handleRecommendationGeneration();
  } else {
    handleInputQuestion(q, answer, analysis);
  }
}

// Función para generar recomendación final
function handleRecommendationGeneration() {
  const recommendation = analyzer.generateRecommendation();
  
  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    
    // Mostrar análisis completo
    const analysisMessage = generateAnalysisMessage(recommendation);
    addMessage("bot", analysisMessage, "🤖");
    
    // Mostrar recomendación de dosificación
    setTimeout(() => {
      const dosageMessage = generateDosageMessage(recommendation);
      addMessage("bot", dosageMessage, "💊");
      
      // Mostrar tips personalizados
      setTimeout(() => {
        const tipsMessage = generateTipsMessage(recommendation);
        addMessage("bot", tipsMessage, "💡");
        
        // Mostrar mensaje de cierre
        setTimeout(() => {
          const closingMessage = questions.find(q => q.type === "recommendation")?.closing_message || 
            "¡Gracias por confiar en Serenlive! Estoy aquí para acompañarte en tu bienestar. 💚🌿";
          addMessage("bot", closingMessage, "🤖");
          
          document.getElementById("nameInput").disabled = true;
        }, 1500);
      }, 2000);
    }, 2000);
  }, 1000);
}

function generateAnalysisMessage(recommendation) {
  return `<div style="margin-bottom: 15px;">
    <div style="font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 10px;">
      📊 Tu Análisis Personalizado
    </div>
    
    <div style="margin-bottom: 8px;">
      <span style="font-weight: bold;">🔍 Nivel de Estrés:</span> 
      <span style="color: ${recommendation.riskLevel === 'high' ? '#e74c3c' : recommendation.riskLevel === 'medium' ? '#f39c12' : '#27ae60'}; font-weight: bold;">
        ${recommendation.riskLevel === 'high' ? 'Alto' : recommendation.riskLevel === 'medium' ? 'Moderado' : 'Bajo'}
      </span> 
      (${recommendation.normalizedScore}%)
    </div>
    
    <div style="color: #555; line-height: 1.4;">
      <span style="font-weight: bold;">📈 Evaluación:</span> Basándome en tus respuestas, he identificado tus principales áreas de atención y he calculado la mejor estrategia de apoyo para ti.
    </div>
  </div>`;
}

function generateDosageMessage(recommendation) {
  return `<div style="margin-bottom: 15px;">
    <div style="font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 10px;">
      💊 Tu Recomendación Personalizada de Serenlive
    </div>
    
    <div style="margin-bottom: 8px;">
      <span style="font-weight: bold;">🥄 Dosificación:</span> ${recommendation.dosage}
    </div>
    
    <div style="margin-bottom: 8px;">
      <span style="font-weight: bold;">⏰ Horarios:</span> ${recommendation.timing}
    </div>
    
    <div style="margin-bottom: 8px;">
      <span style="font-weight: bold;">📅 Duración sugerida:</span> ${recommendation.duration}
    </div>
    
    <div style="color: #555; font-style: italic; margin-top: 10px;">
      Esta recomendación está calibrada específicamente para tu perfil de estrés y necesidades actuales.
    </div>
  </div>`;
}

function generateTipsMessage(recommendation) {
  const tipsHtml = recommendation.additionalTips.slice(0, 3)
    .map((tip, index) => `<div style="margin-bottom: 5px;">${index + 1}. ${tip}</div>`)
    .join('');
  
  return `<div style="margin-bottom: 15px;">
    <div style="font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 10px;">
      💡 Tips Personalizados para Ti
    </div>
    
    <div style="margin-bottom: 10px;">
      ${tipsHtml}
    </div>
    
    <div style="color: #27ae60; font-weight: bold; background-color: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 4px solid #27ae60;">
      🌱 <span style="font-weight: bold;">Recuerda:</span> Los cambios pequeños y constantes generan grandes resultados. ¡Tú puedes lograrlo!
    </div>
  </div>`;
}

// 1. Carga de preguntas y mapeo
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    data.forEach((q, idx) => questionMap[q.id] = idx);
  })
  .catch(error => {
    console.error("Error cargando preguntas:", error);
    // Fallback con preguntas básicas
    questions = [
      {
        id: "estado_animo",
        message: "¿Cómo te has sentido últimamente?",
        type: "input",
        keywords: ["mal", "bien", "regular", "estresado", "ansioso"],
        next: "recomendacion_final"
      }
    ];
  });

// 2. Función principal de envío (mejorada)
// Al iniciar el chatbot, llama esta función
function initChat() {
    console.log("🚀 Iniciando chat...");
    
    // Debug elementos
    debugElements();
    
    // Verificar que los elementos básicos existan
    const input = document.getElementById("nameInput") || 
                 document.querySelector('input[type="text"]') || 
                 document.querySelector('input');
    
    if (!input) {
        console.error("❌ No se pudo encontrar ningún input. Creando uno...");
        createMissingElements();
        return;
    }
    
    conversationStep = -1;
    showInitialOptions();
}

// Modifica sendNameOrResponse para que solo funcione si conversationStep >= 0

function sendNameOrResponse() {
  const input = document.getElementById("nameInput");
  const text = input.value.trim();
  if (!text) return;

  if (conversationStep === 0) {
    // Aquí recibes el nombre
    addMessage("user", text, "👤");
    input.value = "";
    input.disabled = true;
    setTimeout(showTypingIndicator, 300);

    setTimeout(() => {
      hideTypingIndicator();
      addMessage("bot", `¡Hola ${text}! 😊 Es un placer conocerte...`, "🤖");
      userData.nombre = text;
      localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));
      conversationStep = 1;
      input.placeholder = "Escribe tu respuesta...";
      input.disabled = false;
      input.focus();
      currentQuestionIndex = 0;
      startQuestionFlow();
    }, 1500);

  } else if (conversationStep > 0) {
    processUserInput(text);
    input.value = "";
  }
}


// Las demás funciones permanecen igual...
function startQuestionFlow() {
  if (currentQuestionIndex >= questions.length) return;
  const q = questions[currentQuestionIndex];
  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    addMessage("bot", q.message, "🤖");
  }, 800);
}

function handleInputQuestion(q, answer, analysis) {
  let matched = analysis && analysis.matches && analysis.matches.length > 0;

  if (matched && q.respuesta_si_detecta) {
    showBotResponse(q.respuesta_si_detecta, nextQuestionByIndex);
  } else if (q.confusion_keywords && q.confusion_keywords.some(kw => answer.toLowerCase().includes(kw))) {
    const confusionResponse = q.respuesta_confusion || "No te preocupes, vamos paso a paso.";
    showBotResponse(confusionResponse, () => {
      setTimeout(() => {
        const altQuestion = q.alternative_question || q.message;
        addMessage("bot", altQuestion, "🤖");
        setTimeout(() => {
          document.getElementById("nameInput").disabled = false;
          document.getElementById("nameInput").focus();
        }, 500);
      }, 1000);
    });
  } else {
    nextQuestionByIndex();
  }
}

function handleOptionsQuestion(q, answer, analysis) {
  const lower = answer.toLowerCase();
  let selected = null;

  for (let [value, kws] of Object.entries(q.keywords)) {
    if (kws.some(kw => lower.includes(kw))) {
      selected = value;
      break;
    }
  }

  if (!selected && q.options && q.options.length) {
    selected = q.options[0].value;
  }

  userData[q.id + '_selected'] = selected;
  localStorage.setItem("chat_serenlive_data", JSON.stringify(userData));

  const respMap = q.respuesta_si_detecta || {};
  const respText = respMap[selected];
  
  if (respText) {
    showBotResponse(respText, () => {
      const nextId = q.next && q.next[selected] ? q.next[selected] : q.next;
      if (typeof nextId === 'string') {
        nextQuestionById(nextId);
      } else {
        nextQuestionByIndex();
      }
    });
  } else {
    const nextId = q.next && q.next[selected] ? q.next[selected] : q.next;
    if (typeof nextId === 'string') {
      nextQuestionById(nextId);
    } else {
      nextQuestionByIndex();
    }
  }
}

function nextQuestionByIndex() {
  const input = document.getElementById("nameInput");
  currentQuestionIndex++;
  moveToNext(input);
}

function nextQuestionById(nextId) {
  const input = document.getElementById("nameInput");
  if (questionMap[nextId] !== undefined) {
    currentQuestionIndex = questionMap[nextId];
  } else {
    currentQuestionIndex++;
  }
  moveToNext(input);
}

function moveToNext(input) {
  if (currentQuestionIndex < questions.length) {
    const currentQ = questions[currentQuestionIndex];
    
    // 🔥 AGREGAMOS ESTA LÓGICA PARA RECOMENDACION_FINAL
    if (currentQ.id === "recomendacion_final") {
      // Aquí deberías generar y mostrar la recomendación
      handleRecommendationGeneration();
      return; // Importante: salir de la función
    }
    
    if (currentQ.type === "recommendation") {
      handleRecommendationGeneration();
    } else if (currentQ.type !== "end") {
      setTimeout(() => {
        input.disabled = false;
        input.focus();
        startQuestionFlow();
      }, 500);
    } else {
      const final = currentQ.message || "¡Gracias por conversar conmigo! 😊";
      setTimeout(() => {
        addMessage("bot", final, "🤖");
        input.disabled = true;
      }, 500);
    }
  } else {
    setTimeout(() => {
      addMessage("bot", "¡Gracias por compartir conmigo! Tu bienestar es importante. 😊", "🤖");
      input.disabled = true;
    }, 500);
  }
}

function showBotResponse(text, callback) {
  showTypingIndicator();
  setTimeout(() => {
    hideTypingIndicator();
    addMessage("bot", text, "🤖");
    if (typeof callback === "function") callback();
  }, 800);
}

// Añadir mensaje al chat
function addMessage(type, text, avatar) {
  const container = document.getElementById("chatMessages");
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.style.animationDelay = "0s";

  const avatarDiv = document.createElement("div");
  avatarDiv.className = `message-avatar ${type}-msg-avatar`;
  avatarDiv.textContent = avatar;

  const contentDiv = document.createElement("div");
  contentDiv.className = "message-content";
  // 🔥 CAMBIO AQUÍ: innerHTML en lugar de textContent
  contentDiv.innerHTML = text;

  if (type === "user") {
    msg.appendChild(contentDiv);
    msg.appendChild(avatarDiv);
  } else {
    msg.appendChild(avatarDiv);
    msg.appendChild(contentDiv);
  }

  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById("chatMessages");
  const typing = document.createElement("div");
  typing.className = "message bot";
  typing.id = "typingIndicator";
  typing.innerHTML = `
    <div class="message-avatar bot-msg-avatar">🤖</div>
    <div class="message-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>`;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function debugElements() {
    console.log("🔍 DEBUGGING ELEMENTOS DOM:");
    
    // Verificar input
    const input = document.getElementById("nameInput");
    console.log("nameInput:", input);
    
    // Buscar todos los inputs
    const allInputs = document.querySelectorAll('input');
    console.log("Todos los inputs encontrados:", allInputs);
    
    // Verificar contenedor de mensajes
    const chatContainer = document.getElementById("chatMessages");
    console.log("chatMessages:", chatContainer);
    
    // Buscar contenedores alternativos
    const allPossibleContainers = document.querySelectorAll('[id*="chat"], [class*="chat"], [id*="message"], [class*="message"]');
    console.log("Posibles contenedores:", allPossibleContainers);
}


function hideTypingIndicator() {
  const tip = document.getElementById("typingIndicator");
  if (tip) tip.remove();
}

// Enviar con Enter
document.getElementById("nameInput").addEventListener("keypress", e => {
  if (e.key === "Enter") sendNameOrResponse();
});

// Enviar con clic en el botón
document.querySelector(".send-button").addEventListener("click", sendNameOrResponse);

document.addEventListener('DOMContentLoaded', function() {
    initChat();
});