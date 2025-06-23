// analyzer.js - Versión corregida que usa correctamente el JSON
import { recommendationEngine } from '../handlers/recommendations.js'

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
    this.lifestyleFactors = {};
  }

  // Normalizar texto - mejorado para mejor matching
  normalizeText(text) {
    if (!text) return '';
    
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

  // Buscar keywords en el texto - mejorado
  findKeywordsInText(text, keywords) {
    if (!text || !Array.isArray(keywords)) return [];
    
    const normalizedText = this.normalizeText(text);
    const foundKeywords = [];
    
    keywords.forEach(keyword => {
      const normalizedKeyword = this.normalizeText(keyword);
      if (normalizedText.includes(normalizedKeyword)) {
        foundKeywords.push(keyword);
      }
    });
    
    return foundKeywords;
  }

  // Método principal - CORREGIDO
  analyzeResponse(userInput, questionData) {
    console.log('Analizando respuesta:', userInput);
    console.log('Datos de pregunta:', questionData);

    if (!questionData || !userInput) {
      return { 
        category: 'unknown', 
        score: 0, 
        responseMessage: 'No se pudo procesar la respuesta.' 
      };
    }

    const questionId = questionData.id;

    // Caso especial para recomendación final
    if (questionId === "recomendacion_final") {
      const recommendation = this.generateRecommendation();
      return recommendationEngine.generateFinalMessage(recommendation, questionData);
    }

    // 1. Verificar confusión PRIMERO
    if (this.isConfused(userInput, questionData)) {
      return {
        isConfused: true,
        alternativeQuestion: questionData.alternative_question,
        responseMessage: questionData.respuesta_confusion || "No te preocupes, te ayudo a aclarar esto.",
        nextQuestion: questionData.id // Mantener la misma pregunta
      };
    }

    // 2. Analizar según el tipo de pregunta
    const result = this.analyzeByQuestionType(userInput, questionData);
    
    // 3. Agregar mensaje de respuesta del JSON
    result.responseMessage = this.getResponseMessage(result, questionData);
    
    // 4. Determinar siguiente pregunta
    result.nextQuestion = this.getNextQuestion(result, questionData);
    
    console.log('Resultado del análisis:', result);
    
    return result;
  }

  // Verificar confusión
  isConfused(userInput, questionData) {
    if (!questionData.confusion_keywords || !Array.isArray(questionData.confusion_keywords)) {
      return false;
    }
    
    const foundConfusionKeywords = this.findKeywordsInText(userInput, questionData.confusion_keywords);
    console.log('Keywords de confusión encontradas:', foundConfusionKeywords);
    return foundConfusionKeywords.length > 0;
  }

  // Analizar según el tipo de pregunta
  analyzeByQuestionType(userInput, questionData) {
    const questionId = questionData.id;
    
    console.log(`Analizando pregunta tipo: ${questionId}`);
    
    switch (questionId) {
      case 'estado_animo':
        return this.analyzeEstadoAnimo(userInput, questionData);
        
      case 'frecuencia_estres':
        return this.analyzeFrecuenciaEstres(userInput, questionData);
        
      case 'sintomas':
        return this.analyzeSintomas(userInput, questionData);
        
      case 'uso_producto':
        return this.analyzeUsoProducto(userInput, questionData);
        
      case 'frecuencia_uso':
        return this.analyzeFrecuenciaUso(userInput, questionData);
        
      case 'efectividad':
        return this.analyzeEfectividad(userInput, questionData);
        
      case 'rutina_sueno':
        return this.analyzeRutinaSueno(userInput, questionData);
        
      case 'actividades_relajacion':
        return this.analyzeActividadesRelajacion(userInput, questionData);
        
      case 'alimentacion':
        return this.analyzeAlimentacion(userInput, questionData);
        
      case 'intensidad_necesidad':
        return this.analyzeIntensidadNecesidad(userInput, questionData);
        
      default:
        return { category: 'unknown', score: 0 };
    }
  }

  // Análisis específico para estado de ánimo
  analyzeEstadoAnimo(userInput, questionData) {
    // Primero buscar en keywords generales
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
    
    if (foundKeywords.length > 0) {
      // Determinar severidad basada en scoring
      const scoring = questionData.scoring || {};
      
      if (this.hasKeywordsInCategory(foundKeywords, scoring.high_stress)) {
        this.weightedScores.stress_level = 3;
        return { category: 'high_stress', score: 3, foundKeywords };
      } else if (this.hasKeywordsInCategory(foundKeywords, scoring.medium_stress)) {
        this.weightedScores.stress_level = 2;
        return { category: 'medium_stress', score: 2, foundKeywords };
      } else if (this.hasKeywordsInCategory(foundKeywords, scoring.low_stress)) {
        this.weightedScores.stress_level = 1;
        return { category: 'low_stress', score: 1, foundKeywords };
      } else {
        // Keyword encontrada pero no en scoring, asumir stress medio
        this.weightedScores.stress_level = 2;
        return { category: 'medium_stress', score: 2, foundKeywords };
      }
    }
    
    return { category: 'neutral', score: 0, foundKeywords: [] };
  }

  // Análisis específico para frecuencia estrés
  analyzeFrecuenciaEstres(userInput, questionData) {
    const keywords = questionData.keywords || {};
    
    for (const [optionValue, optionKeywords] of Object.entries(keywords)) {
      if (Array.isArray(optionKeywords)) {
        const foundKeywords = this.findKeywordsInText(userInput, optionKeywords);
        if (foundKeywords.length > 0) {
          let score = this.getFrequencyScore(optionValue);
          this.weightedScores.frequency = score;
          
          return {
            category: optionValue,
            score,
            foundKeywords,
            selectedOption: optionValue
          };
        }
      }
    }
    
    return { category: 'unknown', score: 0, foundKeywords: [] };
  }

  // Análisis específico para síntomas - CORREGIDO
  analyzeSintomas(userInput, questionData) {
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
    
    console.log('Keywords de síntomas encontradas:', foundKeywords);
    
    if (foundKeywords.length === 0) {
      return { category: 'no_symptoms', score: 0, foundKeywords: [] };
    }

    // Analizar tipos de síntomas usando scoring
    const scoring = questionData.scoring || {};
    const symptomTypes = {};
    let totalSymptoms = foundKeywords.length; // Contar keywords totales encontradas
    
    // Clasificar síntomas por tipo
    Object.entries(scoring).forEach(([symptomType, categoryKeywords]) => {
      if (Array.isArray(categoryKeywords)) {
        const matchedInCategory = foundKeywords.filter(keyword => 
          categoryKeywords.some(catKeyword => 
            this.normalizeText(keyword).includes(this.normalizeText(catKeyword)) ||
            this.normalizeText(catKeyword).includes(this.normalizeText(keyword))
          )
        );
        symptomTypes[symptomType] = matchedInCategory.length;
      }
    });
    
    // Calcular severidad basada en total de keywords encontradas
    let severity = 'symptoms_detected'; // Nueva categoría para asegurar respuesta
    let score = 1;
    
    if (totalSymptoms >= 3) {
      severity = 'high_symptoms';
      score = 3;
    } else if (totalSymptoms >= 2) {
      severity = 'medium_symptoms';
      score = 2;
    } else if (totalSymptoms >= 1) {
      severity = 'symptoms_detected';
      score = 1;
    }
    
    this.weightedScores.symptoms = score;
    
    console.log('Análisis de síntomas:', { severity, score, symptomTypes, totalSymptoms, foundKeywords });
    
    return {
      category: severity,
      score,
      symptomTypes,
      totalSymptoms,
      foundKeywords,
      severity
    };
  }

  // Análisis para uso de producto - VERIFICADO QUE NO SUME
  analyzeUsoProducto(userInput, questionData) {
    const keywords = questionData.keywords || {};
    
    for (const [optionValue, optionKeywords] of Object.entries(keywords)) {
      if (Array.isArray(optionKeywords)) {
        const foundKeywords = this.findKeywordsInText(userInput, optionKeywords);
        if (foundKeywords.length > 0) {
          console.log('🔍 UsoProducto - NO afecta scoring:', optionValue);
          
          // ✅ CONFIRMADO: NO actualiza ningún weightedScore
          return {
            category: optionValue,
            score: 0, // Explícitamente 0
            foundKeywords,
            selectedOption: optionValue
          };
        }
      }
    }
    
    return { category: 'unknown', score: 0, foundKeywords: [] };
  }

  // Análisis para frecuencia de uso
  analyzeFrecuenciaUso(userInput, questionData) {
    return this.scoreByScoringCategories(userInput, questionData);
  }

  // Análisis para efectividad
  analyzeEfectividad(userInput, questionData) {
    return this.scoreByScoringCategories(userInput, questionData);
  }

  // Análisis para rutina de sueño - SIMPLIFICADO
  analyzeRutinaSueno(userInput, questionData) {
    // Primero buscar en keywords generales
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
    
    console.log('Análisis de sueño - keywords encontradas:', foundKeywords);
    
    if (foundKeywords.length > 0) {
      // Si encontramos keywords de problemas de sueño, es sueño malo
      this.weightedScores.sleep_quality = 3;
      
      return {
        category: 'poor_sleep',
        score: 3,
        foundKeywords
      };
    }
    
    // Si no se encontraron keywords específicas, buscar en scoring
    const result = this.scoreByScoringCategories(userInput, questionData);
    
    let sleepScore = 0;
    switch (result.category) {
      case 'poor_sleep':
        sleepScore = 3;
        break;
      case 'fair_sleep':
        sleepScore = 2;
        break;
      case 'good_sleep':
        sleepScore = 1;
        break;
      default:
        sleepScore = 0;
    }
    
    this.weightedScores.sleep_quality = sleepScore;
    result.score = sleepScore;
    
    return result;
  }

  // Análisis para actividades de relajación - SIMPLIFICADO
  analyzeActividadesRelajacion(userInput, questionData) {
    // Primero buscar keywords de "no hacer nada"
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
    
    console.log('Análisis de actividades - keywords encontradas:', foundKeywords);
    
    if (foundKeywords.length > 0) {
      // Si encontramos keywords, probablemente es negativo (no hace actividades)
      this.lifestyleFactors['relaxation'] = 2;
      this.weightedScores.lifestyle = Object.values(this.lifestyleFactors).reduce((sum, val) => sum + val, 0);
      
      return {
        category: 'no_activities',
        score: 2,
        foundKeywords,
        factorName: 'relaxation',
        lifestyleScore: 2
      };
    }
    
    // Si no se encontraron keywords, usar scoring
    return this.scoreLifestyleFactor(userInput, questionData, 'relaxation');
  }

  // Análisis para alimentación - SIMPLIFICADO
  analyzeAlimentacion(userInput, questionData) {
    // Primero buscar keywords de mala alimentación
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
    
    console.log('Análisis de alimentación - keywords encontradas:', foundKeywords);
    
    if (foundKeywords.length > 0) {
      // Si encontramos keywords, probablemente es mala alimentación
      this.lifestyleFactors['diet'] = 2;
      this.weightedScores.lifestyle = Object.values(this.lifestyleFactors).reduce((sum, val) => sum + val, 0);
      
      return {
        category: 'poor_diet',
        score: 2,
        foundKeywords,
        factorName: 'diet',
        lifestyleScore: 2
      };
    }
    
    // Si no se encontraron keywords, usar scoring
    return this.scoreLifestyleFactor(userInput, questionData, 'diet');
  }

  // Análisis para intensidad de necesidad - MEJORADO
  analyzeIntensidadNecesidad(userInput, questionData) {
    const result = this.scoreByScoringCategories(userInput, questionData);
    
    console.log('🔍 IntensidadNecesidad - input:', userInput);
    console.log('🔍 IntensidadNecesidad - result:', result);
    
    // Asignar score para need_intensity
    let needScore = 0;
    switch (result.category) {
      case 'high_need':
        needScore = 3;
        break;
      case 'medium_need':
        needScore = 2;
        break;
      case 'low_need':
        needScore = 1;
        break;
      default:
        // Buscar en keywords generales
        const allKeywords = questionData.keywords || [];
        const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
        
        console.log('🔍 IntensidadNecesidad - keywords encontradas:', foundKeywords);
        
        if (foundKeywords.length > 0) {
          // Si encontramos keywords de "mucho apoyo", es alta necesidad
          const highNeedKeywords = ['constante', 'siempre', 'mucho', 'necesito ayuda'];
          const hasHighNeed = foundKeywords.some(kw => 
            highNeedKeywords.some(hnk => 
              this.normalizeText(kw).includes(this.normalizeText(hnk))
            )
          );
          
          if (hasHighNeed) {
            needScore = 3;
            result.category = 'high_need';
          } else {
            needScore = 2; // Asumir necesidad moderada
            result.category = 'medium_need';
          }
          
          result.foundKeywords = foundKeywords;
        } else {
          // Si la respuesta es ambigua como "si", asumir necesidad baja
          console.log('⚠️ Respuesta ambigua para intensidad, asignando score bajo');
          needScore = 1;
          result.category = 'low_need';
        }
    }
    
    this.weightedScores.need_intensity = needScore;
    result.score = needScore;
    
    console.log('🔍 IntensidadNecesidad - final score:', needScore);
    
    return result;
  }

  // Helper: verificar si hay keywords en una categoría
  hasKeywordsInCategory(foundKeywords, categoryKeywords) {
    if (!Array.isArray(categoryKeywords)) return false;
    
    return foundKeywords.some(keyword => 
      categoryKeywords.some(catKeyword => 
        this.normalizeText(keyword).includes(this.normalizeText(catKeyword)) ||
        this.normalizeText(catKeyword).includes(this.normalizeText(keyword))
      )
    );
  }

  // Scoring usando las categorías de scoring del JSON
  scoreByScoringCategories(userInput, questionData) {
    const scoring = questionData.scoring || {};
    
    // Buscar en cada categoría de scoring
    for (const [categoryName, keywords] of Object.entries(scoring)) {
      if (Array.isArray(keywords)) {
        const foundKeywords = this.findKeywordsInText(userInput, keywords);
        if (foundKeywords.length > 0) {
          let score = this.getScoreByCategory(categoryName);
          
          return {
            category: categoryName,
            score,
            foundKeywords,
            matchedCategory: categoryName
          };
        }
      }
    }
    
    // Si no se encontró en scoring, buscar en keywords generales
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
    
    if (foundKeywords.length > 0) {
      return {
        category: 'detected',
        score: 1,
        foundKeywords
      };
    }
    
    return { category: 'neutral', score: 0, foundKeywords: [] };
  }

  // Scoring para factores de lifestyle
  scoreLifestyleFactor(userInput, questionData, factorName) {
    const result = this.scoreByScoringCategories(userInput, questionData);
    
    // Si no se detectó en scoring, buscar en keywords generales
    if (result.category === 'neutral') {
      const allKeywords = questionData.keywords || [];
      const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
      
      if (foundKeywords.length > 0) {
        // Asumir que es negativo si se encontraron keywords (típicamente problemas)
        result.category = factorName === 'relaxation' ? 'no_activities' : 'poor_diet';
        result.foundKeywords = foundKeywords;
      }
    }
    
    // Convertir categoría a score numérico para lifestyle
    let lifestyleScore = 0;
    
    switch (result.category) {
      case 'no_activities':
      case 'poor_diet':
        lifestyleScore = 2;
        break;
      case 'some_activities':
      case 'fair_diet':
        lifestyleScore = 1;
        break;
      case 'regular_activities':
      case 'good_diet':
        lifestyleScore = 0;
        break;
      default:
        if (result.foundKeywords && result.foundKeywords.length > 0) {
          lifestyleScore = 1; // Score moderado si se detectaron keywords
        }
    }
    
    this.lifestyleFactors[factorName] = lifestyleScore;
    this.weightedScores.lifestyle = Object.values(this.lifestyleFactors).reduce((sum, val) => sum + val, 0);
    
    return {
      ...result,
      lifestyleScore,
      factorName
    };
  }

  // Obtener score de frecuencia
  getFrequencyScore(optionValue) {
    const scores = {
      'siempre': 3,
      'a_menudo': 2,
      'a_veces': 1,
      'nunca': 0
    };
    return scores[optionValue] || 0;
  }

  // Obtener score según categoría
  getScoreByCategory(categoryName) {
    const categoryScores = {
      'high_stress': 3,
      'medium_stress': 2,
      'low_stress': 1,
      'high_frequency': 3,
      'medium_frequency': 2,
      'low_frequency': 1,
      'poor_sleep': 3,
      'fair_sleep': 2,
      'good_sleep': 1,
      'high_need': 3,
      'medium_need': 2,
      'low_need': 1,
      'effective': 1,
      'somewhat_effective': 0,
      'not_effective': -1,
      'regular_user': 1,
      'occasional_user': 0,
      'no_activities': 2,
      'some_activities': 1,
      'regular_activities': 0,
      'poor_diet': 2,
      'fair_diet': 1,
      'good_diet': 0
    };
    
    return categoryScores[categoryName] || 0;
  }

  // Obtener mensaje de respuesta del JSON - SIMPLIFICADO Y CORREGIDO
  getResponseMessage(result, questionData) {
    const respuesta = questionData.respuesta_si_detecta;
    
    console.log('Obteniendo mensaje de respuesta:', {
      questionId: questionData.id,
      category: result.category,
      selectedOption: result.selectedOption,
      foundKeywords: result.foundKeywords,
      respuesta: respuesta
    });
    
    // Caso 1: Si hay respuestas específicas por categoría/opción (objeto)
    if (respuesta && typeof respuesta === 'object') {
      const messageKey = result.category || result.selectedOption;
      if (messageKey && respuesta[messageKey]) {
        console.log('✅ Usando respuesta específica para:', messageKey);
        return respuesta[messageKey];
      }
    }
    
    // Caso 2: Si hay respuesta general (string) y se detectó ALGO
    if (typeof respuesta === 'string') {
      // Si se encontraron keywords O se detectó una categoría válida
      if ((result.foundKeywords && result.foundKeywords.length > 0) || 
          (result.category && result.category !== 'neutral' && result.category !== 'unknown')) {
        console.log('✅ Usando respuesta general del JSON');
        return respuesta;
      }
    }
    
    // Caso 3: Fallback - Si se detectó algo pero no hay respuesta específica
    if ((result.foundKeywords && result.foundKeywords.length > 0) || 
        (result.category && result.category !== 'neutral' && result.category !== 'unknown')) {
      console.log('⚠️ Detectado pero sin respuesta específica, usando genérico');
      return "Gracias por compartir esa información conmigo.";
    }
    
    // Caso 4: No se detectó nada
    console.log('❌ No se detectó nada específico');
    return "Entiendo. Continuemos con las siguientes preguntas.";
  }

  // Obtener siguiente pregunta
  getNextQuestion(result, questionData) {
    const next = questionData.next;
    
    // Si next es un objeto (depende de la respuesta)
    if (next && typeof next === 'object') {
      const nextKey = result.category || result.selectedOption;
      return next[nextKey] || Object.values(next)[0]; // Tomar primera opción como fallback
    }
    
    // Si next es un string
    if (typeof next === 'string') {
      return next;
    }
    
    return null;
  }

  // Generar recomendación - CON DEBUG
  generateRecommendation() {
    console.log('🎯 GENERANDO RECOMENDACIÓN FINAL');
    this.getScores(); // Esto mostrará el breakdown completo
    return recommendationEngine.generateRecommendation(this.weightedScores);
  }

  // Debug
  getScores() {
    return { 
      ...this.weightedScores,
      lifestyle_factors: { ...this.lifestyleFactors }
    };
  }

  // Reset
  resetScores() {
    this.weightedScores = {
      stress_level: 0,
      frequency: 0,
      symptoms: 0,
      sleep_quality: 0,
      lifestyle: 0,
      need_intensity: 0
    };
    this.lifestyleFactors = {};
  }
}

export const analyzer = new SerenliveAnalyzer();