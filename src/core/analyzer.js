import { recommendationEngine } from "../handlers/recommendations.js";

export class SerenliveAnalyzer {
  constructor() {
    this.weightedScores = {
      stress_level: 0,
      frequency: 0,
      symptoms: 0,
      sleep_quality: 0,
      lifestyle: 0,
      need_intensity: 0,
    };
    this.lifestyleFactors = {};
  }

  normalizeText(text) {
    if (!text) return "";

    return text
      .toLowerCase()
      .replace(/[áàäâ]/g, "a")
      .replace(/[éèëê]/g, "e")
      .replace(/[íìïî]/g, "i")
      .replace(/[óòöô]/g, "o")
      .replace(/[úùüû]/g, "u")
      .replace(/ñ/g, "n")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  findKeywordsInText(text, keywords) {
    if (!text || !Array.isArray(keywords)) return [];

    const normalizedText = this.normalizeText(text);
    const foundKeywords = [];

    keywords.forEach((keyword) => {
      const normalizedKeyword = this.normalizeText(keyword);
      if (normalizedText.includes(normalizedKeyword)) {
        foundKeywords.push(keyword);
      }
    });

    return foundKeywords;
  }

  analyzeResponse(userInput, questionData) {

    if (!questionData || !userInput) {
      return {
        category: "unknown",
        score: 0,
        responseMessage: "No se pudo procesar la respuesta.",
      };
    }

    const questionId = questionData.id;

    if (questionId === "recomendacion_final") {

      const wantsRecommendation = this.checkForRecommendationRequest(
        userInput,
        questionData
      );

      if (wantsRecommendation) {
        return {
          category: "si_recomendacion",
          selectedOption: "si_recomendacion",
          responseMessage:
            "¡Perfecto! Vamos a generar tu recomendación personalizada.",
          foundKeywords: this.findKeywordsInText(
            userInput,
            questionData.keywords?.si_recomendacion || []
          ),
          triggerRecommendation: true,
        };
      } else {
        return {
          category: "mas_preguntas",
          selectedOption: "mas_preguntas",
          responseMessage: "Por supuesto, ¿qué te gustaría saber?",
          foundKeywords: this.findKeywordsInText(
            userInput,
            questionData.keywords?.mas_preguntas || []
          ),
        };
      }
    }

    if (this.isConfused(userInput, questionData)) {
      return {
        isConfused: true,
        alternativeQuestion: questionData.alternative_question,
        responseMessage:
          questionData.respuesta_confusion ||
          "No te preocupes, te ayudo a aclarar esto.",
        nextQuestion: questionData.id,
      };
    }

    const result = this.analyzeByQuestionType(userInput, questionData);

    result.responseMessage = this.getResponseMessage(result, questionData);

    result.nextQuestion = this.getNextQuestion(result, questionData);


    return result;
  }

  checkForRecommendationRequest(userInput, questionData) {
    const yesKeywords = questionData.keywords?.si_recomendacion || [
      "si",
      "sí",
      "dale",
      "adelante",
      "perfecto",
      "genial",
    ];

    const foundYesKeywords = this.findKeywordsInText(userInput, yesKeywords);

    return foundYesKeywords.length > 0;
  }
  isConfused(userInput, questionData) {
    if (
      !questionData.confusion_keywords ||
      !Array.isArray(questionData.confusion_keywords)
    ) {
      return false;
    }

    const foundConfusionKeywords = this.findKeywordsInText(
      userInput,
      questionData.confusion_keywords
    );
    return foundConfusionKeywords.length > 0;
  }

  analyzeByQuestionType(userInput, questionData) {
    const questionId = questionData.id;


    switch (questionId) {
      case "estado_animo":
        return this.analyzeEstadoAnimo(userInput, questionData);

      case "frecuencia_estres":
        return this.analyzeFrecuenciaEstres(userInput, questionData);

      case "sintomas":
        return this.analyzeSintomas(userInput, questionData);

      case "uso_producto":
        return this.analyzeUsoProducto(userInput, questionData);

      case "frecuencia_uso":
        return this.analyzeFrecuenciaUso(userInput, questionData);

      case "efectividad":
        return this.analyzeEfectividad(userInput, questionData);

      case "rutina_sueno":
        return this.analyzeRutinaSueno(userInput, questionData);

      case "actividades_relajacion":
        return this.analyzeActividadesRelajacion(userInput, questionData);

      case "alimentacion":
        return this.analyzeAlimentacion(userInput, questionData);

      case "intensidad_necesidad":
        return this.analyzeIntensidadNecesidad(userInput, questionData);

      default:
        return { category: "unknown", score: 0 };
    }
  }

  analyzeEstadoAnimo(userInput, questionData) {
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);

    if (foundKeywords.length > 0) {
      const scoring = questionData.scoring || {};

      if (this.hasKeywordsInCategory(foundKeywords, scoring.high_stress)) {
        this.weightedScores.stress_level = 3;
        return { category: "high_stress", score: 3, foundKeywords };
      } else if (
        this.hasKeywordsInCategory(foundKeywords, scoring.medium_stress)
      ) {
        this.weightedScores.stress_level = 2;
        return { category: "medium_stress", score: 2, foundKeywords };
      } else if (
        this.hasKeywordsInCategory(foundKeywords, scoring.low_stress)
      ) {
        this.weightedScores.stress_level = 1;
        return { category: "low_stress", score: 1, foundKeywords };
      } else {
        this.weightedScores.stress_level = 2;
        return { category: "medium_stress", score: 2, foundKeywords };
      }
    }

    return { category: "neutral", score: 0, foundKeywords: [] };
  }

  analyzeFrecuenciaEstres(userInput, questionData) {
    const keywords = questionData.keywords || {};

    for (const [optionValue, optionKeywords] of Object.entries(keywords)) {
      if (Array.isArray(optionKeywords)) {
        const foundKeywords = this.findKeywordsInText(
          userInput,
          optionKeywords
        );
        if (foundKeywords.length > 0) {
          let score = this.getFrequencyScore(optionValue);
          this.weightedScores.frequency = score;

          return {
            category: optionValue,
            score,
            foundKeywords,
            selectedOption: optionValue,
          };
        }
      }
    }

    return { category: "unknown", score: 0, foundKeywords: [] };
  }

  analyzeSintomas(userInput, questionData) {
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
    if (foundKeywords.length === 0) {
      return { category: "no_symptoms", score: 0, foundKeywords: [] };
    }

    const scoring = questionData.scoring || {};
    const symptomTypes = {};
    let totalSymptoms = foundKeywords.length;

    Object.entries(scoring).forEach(([symptomType, categoryKeywords]) => {
      if (Array.isArray(categoryKeywords)) {
        const matchedInCategory = foundKeywords.filter((keyword) =>
          categoryKeywords.some(
            (catKeyword) =>
              this.normalizeText(keyword).includes(
                this.normalizeText(catKeyword)
              ) ||
              this.normalizeText(catKeyword).includes(
                this.normalizeText(keyword)
              )
          )
        );
        symptomTypes[symptomType] = matchedInCategory.length;
      }
    });

    let severity = "symptoms_detected";
    let score = 1;

    if (totalSymptoms >= 3) {
      severity = "high_symptoms";
      score = 3;
    } else if (totalSymptoms >= 2) {
      severity = "medium_symptoms";
      score = 2;
    } else if (totalSymptoms >= 1) {
      severity = "symptoms_detected";
      score = 1;
    }

    this.weightedScores.symptoms = score;

    return {
      category: severity,
      score,
      symptomTypes,
      totalSymptoms,
      foundKeywords,
      severity,
    };
  }

  analyzeUsoProducto(userInput, questionData) {
    const keywords = questionData.keywords || {};

    for (const [optionValue, optionKeywords] of Object.entries(keywords)) {
      if (Array.isArray(optionKeywords)) {
        const foundKeywords = this.findKeywordsInText(
          userInput,
          optionKeywords
        );
        if (foundKeywords.length > 0) {
          return {
            category: optionValue,
            score: 0,
            foundKeywords,
            selectedOption: optionValue,
          };
        }
      }
    }

    return { category: "unknown", score: 0, foundKeywords: [] };
  }

  analyzeFrecuenciaUso(userInput, questionData) {
    return this.scoreByScoringCategories(userInput, questionData);
  }

  analyzeEfectividad(userInput, questionData) {
    return this.scoreByScoringCategories(userInput, questionData);
  }

  analyzeRutinaSueno(userInput, questionData) {
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);
    if (foundKeywords.length > 0) {
      this.weightedScores.sleep_quality = 3;

      return {
        category: "poor_sleep",
        score: 3,
        foundKeywords,
      };
    }

    const result = this.scoreByScoringCategories(userInput, questionData);

    let sleepScore = 0;
    switch (result.category) {
      case "poor_sleep":
        sleepScore = 3;
        break;
      case "fair_sleep":
        sleepScore = 2;
        break;
      case "good_sleep":
        sleepScore = 1;
        break;
      default:
        sleepScore = 0;
    }

    this.weightedScores.sleep_quality = sleepScore;
    result.score = sleepScore;

    return result;
  }

  analyzeActividadesRelajacion(userInput, questionData) {
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);

    if (foundKeywords.length > 0) {
      this.lifestyleFactors["relaxation"] = 2;
      this.weightedScores.lifestyle = Object.values(
        this.lifestyleFactors
      ).reduce((sum, val) => sum + val, 0);

      return {
        category: "no_activities",
        score: 2,
        foundKeywords,
        factorName: "relaxation",
        lifestyleScore: 2,
      };
    }

    return this.scoreLifestyleFactor(userInput, questionData, "relaxation");
  }

  analyzeAlimentacion(userInput, questionData) {
    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);

    if (foundKeywords.length > 0) {
      this.lifestyleFactors["diet"] = 2;
      this.weightedScores.lifestyle = Object.values(
        this.lifestyleFactors
      ).reduce((sum, val) => sum + val, 0);

      return {
        category: "poor_diet",
        score: 2,
        foundKeywords,
        factorName: "diet",
        lifestyleScore: 2,
      };
    }

    return this.scoreLifestyleFactor(userInput, questionData, "diet");
  }

  analyzeIntensidadNecesidad(userInput, questionData) {
    const result = this.scoreByScoringCategories(userInput, questionData);
    let needScore = 0;
    switch (result.category) {
      case "high_need":
        needScore = 3;
        break;
      case "medium_need":
        needScore = 2;
        break;
      case "low_need":
        needScore = 1;
        break;
      default:
        const allKeywords = questionData.keywords || [];
        const foundKeywords = this.findKeywordsInText(userInput, allKeywords);

        if (foundKeywords.length > 0) {
          const highNeedKeywords = [
            "constante",
            "siempre",
            "mucho",
            "necesito ayuda",
          ];
          const hasHighNeed = foundKeywords.some((kw) =>
            highNeedKeywords.some((hnk) =>
              this.normalizeText(kw).includes(this.normalizeText(hnk))
            )
          );

          if (hasHighNeed) {
            needScore = 3;
            result.category = "high_need";
          } else {
            needScore = 2;
            result.category = "medium_need";
          }

          result.foundKeywords = foundKeywords;
        } else {
          needScore = 1;
          result.category = "low_need";
        }
    }

    this.weightedScores.need_intensity = needScore;
    result.score = needScore;


    return result;
  }

  hasKeywordsInCategory(foundKeywords, categoryKeywords) {
    if (!Array.isArray(categoryKeywords)) return false;

    return foundKeywords.some((keyword) =>
      categoryKeywords.some(
        (catKeyword) =>
          this.normalizeText(keyword).includes(
            this.normalizeText(catKeyword)
          ) ||
          this.normalizeText(catKeyword).includes(this.normalizeText(keyword))
      )
    );
  }

  scoreByScoringCategories(userInput, questionData) {
    const scoring = questionData.scoring || {};

    for (const [categoryName, keywords] of Object.entries(scoring)) {
      if (Array.isArray(keywords)) {
        const foundKeywords = this.findKeywordsInText(userInput, keywords);
        if (foundKeywords.length > 0) {
          let score = this.getScoreByCategory(categoryName);

          return {
            category: categoryName,
            score,
            foundKeywords,
            matchedCategory: categoryName,
          };
        }
      }
    }

    const allKeywords = questionData.keywords || [];
    const foundKeywords = this.findKeywordsInText(userInput, allKeywords);

    if (foundKeywords.length > 0) {
      return {
        category: "detected",
        score: 1,
        foundKeywords,
      };
    }

    return { category: "neutral", score: 0, foundKeywords: [] };
  }

  scoreLifestyleFactor(userInput, questionData, factorName) {
    const result = this.scoreByScoringCategories(userInput, questionData);

    if (result.category === "neutral") {
      const allKeywords = questionData.keywords || [];
      const foundKeywords = this.findKeywordsInText(userInput, allKeywords);

      if (foundKeywords.length > 0) {
        result.category =
          factorName === "relaxation" ? "no_activities" : "poor_diet";
        result.foundKeywords = foundKeywords;
      }
    }

    let lifestyleScore = 0;

    switch (result.category) {
      case "no_activities":
      case "poor_diet":
        lifestyleScore = 2;
        break;
      case "some_activities":
      case "fair_diet":
        lifestyleScore = 1;
        break;
      case "regular_activities":
      case "good_diet":
        lifestyleScore = 0;
        break;
      default:
        if (result.foundKeywords && result.foundKeywords.length > 0) {
          lifestyleScore = 1;
        }
    }

    this.lifestyleFactors[factorName] = lifestyleScore;
    this.weightedScores.lifestyle = Object.values(this.lifestyleFactors).reduce(
      (sum, val) => sum + val,
      0
    );

    return {
      ...result,
      lifestyleScore,
      factorName,
    };
  }

  getFrequencyScore(optionValue) {
    const scores = {
      siempre: 3,
      a_menudo: 2,
      a_veces: 1,
      nunca: 0,
    };
    return scores[optionValue] || 0;
  }

  getScoreByCategory(categoryName) {
    const categoryScores = {
      high_stress: 3,
      medium_stress: 2,
      low_stress: 1,
      high_frequency: 3,
      medium_frequency: 2,
      low_frequency: 1,
      poor_sleep: 3,
      fair_sleep: 2,
      good_sleep: 1,
      high_need: 3,
      medium_need: 2,
      low_need: 1,
      effective: 1,
      somewhat_effective: 0,
      not_effective: -1,
      regular_user: 1,
      occasional_user: 0,
      no_activities: 2,
      some_activities: 1,
      regular_activities: 0,
      poor_diet: 2,
      fair_diet: 1,
      good_diet: 0,
    };

    return categoryScores[categoryName] || 0;
  }

  getResponseMessage(result, questionData) {
    const respuesta = questionData.respuesta_si_detecta;

    if (respuesta && typeof respuesta === "object") {
      const messageKey = result.category || result.selectedOption;
      if (messageKey && respuesta[messageKey]) {
        return respuesta[messageKey];
      }
    }

    if (typeof respuesta === "string") {
      if (
        (result.foundKeywords && result.foundKeywords.length > 0) ||
        (result.category &&
          result.category !== "neutral" &&
          result.category !== "unknown")
      ) {
        return respuesta;
      }
    }

    if (
      (result.foundKeywords && result.foundKeywords.length > 0) ||
      (result.category &&
        result.category !== "neutral" &&
        result.category !== "unknown")
    ) {
      return "Gracias por compartir esa información conmigo.";
    }

    return "Entiendo. Continuemos con las siguientes preguntas.";
  }

  getNextQuestion(result, questionData) {
    const next = questionData.next;

    if (next && typeof next === "object") {
      const nextKey = result.category || result.selectedOption;
      return next[nextKey] || Object.values(next)[0];
    }

    if (typeof next === "string") {
      return next;
    }

    return null;
  }

  generateRecommendation() {
    this.getScores();
    return recommendationEngine.generateRecommendation(this.weightedScores);
  }

  getScores() {
    return {
      ...this.weightedScores,
      lifestyle_factors: { ...this.lifestyleFactors },
    };
  }

  resetScores() {
    this.weightedScores = {
      stress_level: 0,
      frequency: 0,
      symptoms: 0,
      sleep_quality: 0,
      lifestyle: 0,
      need_intensity: 0,
    };
    this.lifestyleFactors = {};
  }
}

export const analyzer = new SerenliveAnalyzer();