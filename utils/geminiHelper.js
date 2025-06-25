// utils/geminiHelper.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Asegúrate de que tu API Key se carga de forma segura desde el archivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configura el modelo para que devuelva respuestas en formato JSON
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

/**
 * Envía un prompt a Gemini y espera una respuesta en formato de texto.
 * La respuesta de texto debería ser un JSON parseable.
 * @param {string} prompt El prompt para enviar a la IA.
 * @returns {Promise<object>} Un objeto con la respuesta parseada o con un error.
 */
exports.preguntarAGemini = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    
    // El texto devuelto por Gemini debe ser un JSON, lo parseamos.
    return JSON.parse(textResponse);

  } catch (err) {
    console.error("Error en la llamada o parseo de Gemini:", err);
    // Devolvemos un objeto de error estructurado para un mejor manejo en el controlador.
    return { 
      error: true, 
      message: "No se pudo obtener una respuesta válida de la IA.",
      details: err.message 
    };
  }
};