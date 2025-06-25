const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const db = require('../models');
//const { consultarNoticiasLugar, verificarFeriadoFecha } = require('../utils/geminiHelper'); // Gemini
const { preguntarAGemini } = require('../utils/geminiHelper');
// PROMPTS fallback
function generarPromptFeriadoFallback(origen, destino, fecha) {
  return `Aunque no hay datos confirmados de feriado para el ${fecha}, evalúa si podría haber afectaciones comunes en la ruta ${origen} - ${destino} ese día, como tráfico o eventos. Sé realista y breve.`;
}

function generarPromptSituacionFallback(origen, destino, fecha) {
  return `No hay noticias recientes disponibles. Considera posibles factores generales que podrían afectar un viaje de ${origen} a ${destino} el ${fecha}, como clima, protestas, o estado de las carreteras. Sé realista, no inventes, pero ofrece una evaluación lógica.`;
}

// PROMPTS principales
function generarPromptFeriado(origen, destino, fecha, feriadoTexto) {
  return `El ${fecha} es feriado en Bolivia: ${feriadoTexto}. ¿Puede haber demoras o interrupciones en la ruta ${origen} - ${destino}? Responde brevemente.`;
}

function generarPromptSituacion(origen, destino, fecha, resumenGemini) {
  return `
Noticias recientes:
${resumenGemini}
¿Hay algún riesgo para viajar de ${origen} a ${destino} el ${fecha}? Responde directo.`;
}

function generarPromptRecomendacion(viaje) {
  return `Evaluar viaje: Origen: ${viaje.origen}, Destino: ${viaje.destino}, Fecha: ${viaje.fecha}, Sale: ${viaje.hora_salida}, Llega: ${viaje.hora_llegada}, Precio: ${viaje.precio}.
¿Es recomendable este viaje en base a precio y horario? Responde sí o no con una frase.`;
}

async function consultarIA(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4", // Puedes cambiar por "gpt-3.5-turbo" si no tienes acceso
    messages: [{ role: "user", content: prompt }]
  });
  return completion.choices[0].message.content;
}

// ✅ CONTROLADOR PRINCIPAL
// ✅ CONTROLADOR PRINCIPAL MEJORADO Y REFACTORIZADO
// ✅ CONTROLADOR FINAL Y DEFINITIVO
exports.analizarYRecomendarViajes = async (req, res) => {
  try {
    const { viaje_id } = req.body;

    const viajeActual = await db.viaje.findByPk(viaje_id, {
      include: [{
        model: db.ruta, // Sin 'as', dejamos que Sequelize haga lo que quiera
        include: [
          { model: db.lugar, as: 'origen' },
          { model: db.lugar, as: 'destino' }
        ]
      }]
    });

    if (!viajeActual) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    // *** LA CORRECCIÓN ESTÁ AQUÍ ***
    // Leemos de '.rutum' porque es lo que Sequelize está creando según el log de SQL.
    if (!viajeActual.rutum) {
        return res.status(404).json({ error: "Datos de la ruta no encontrados para este viaje." });
    }
    const origen = viajeActual.rutum.origen.nombre;
    const destino = viajeActual.rutum.destino.nombre;
    const rutaId = viajeActual.rutum.id;

    // El resto del código continúa igual...
    const salidaDate = new Date(viajeActual.hora_salida);
    const llegadaDate = new Date(viajeActual.hora_llegada);

    if (llegadaDate <= salidaDate) {
      return res.status(400).json({
        error: "Error de lógica en los datos del viaje.",
        message: `La fecha de llegada (${llegadaDate.toISOString()}) no puede ser anterior o igual a la fecha de salida (${salidaDate.toISOString()}).`
      });
    }

    const opcionesDeFormato = { timeZone: 'America/La_Paz', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    
    const resultadoPrecio = await db.asiento_viaje.findOne({
        where: { viaje_id },
        attributes: [[db.Sequelize.fn('AVG', db.Sequelize.col('precio')), 'precioPromedio']],
        raw: true
    });
    const precioPromedio = parseFloat(resultadoPrecio.precioPromedio) || 0;
    
    const viajeParaAnalisis = {
      origen,
      destino,
      fecha_salida: salidaDate.toLocaleString('es-BO', opcionesDeFormato),
      fecha_llegada: llegadaDate.toLocaleString('es-BO', opcionesDeFormato),
      precio: precioPromedio
    };
    
    const prompt = generarPromptMaestro(viajeParaAnalisis);
    const analisisIA = await preguntarAGemini(prompt);

    if (analisisIA.error) {
        return res.status(503).json({ error: "El servicio de análisis de IA no está disponible.", details: analisisIA.message });
    }
    
    const otrasOpciones = await db.viaje.findAll({
      where: {
        ruta_id: rutaId,
        id: { [db.Sequelize.Op.ne]: viaje_id }
      },
      include: [db.bus]
    });
    const alternativas = otrasOpciones.map(v => ({
        id: v.id,
        hora_salida: new Date(v.hora_salida).toLocaleString('es-BO', opcionesDeFormato),
        hora_llegada: new Date(v.hora_llegada).toLocaleString('es-BO', opcionesDeFormato),
        bus: v.bus?.placa || 'No asignado'
    }));

    res.json({
        viaje_evaluado: viajeParaAnalisis,
        analisis_ia: analisisIA,
        alternativas
    });

  } catch (err) {
    console.error("Error crítico en analizarYRecomendarViajes:", err);
    res.status(500).json({ error: "Ocurrió un error inesperado.", message: err.message });
  }
};


// La función para generar el prompt no cambia, la incluyo por completitud
function generarPromptMaestro(viaje) {
  const fechaActual = new Date().toLocaleDateString('es-BO', { timeZone: 'America/La_Paz' });
  return `
    Eres un asistente experto en análisis de viajes por carretera en Bolivia. Tu tarea es evaluar la viabilidad y conveniencia de un viaje en bus basado en los datos proporcionados.
    Toma en cuenta la lógica del horario, el precio promedio para esa ruta, y cualquier posible evento externo como feriados nacionales/regionales, bloqueos de carreteras, problemas climáticos o noticias relevantes para la ruta y la fecha.
    **Datos del Viaje a Analizar:**
    - **Origen:** ${viaje.origen}
    - **Destino:** ${viaje.destino}
    - **Fecha y Hora de Salida:** ${viaje.fecha_salida}
    - **Fecha y Hora de Llegada:** ${viaje.fecha_llegada}
    - **Precio Promedio (Bs):** ${viaje.precio.toFixed(2)}
    - **Fecha de la consulta:** ${fechaActual}
    **Instrucciones de Respuesta:**
    Analiza toda la información y responde EXCLUSIVAMENTE con un objeto JSON válido, sin texto adicional antes o después del objeto. El objeto JSON debe tener la siguiente estructura exacta:
    {
      "es_recomendable": <boolean>,
      "resumen_analisis": "<string con un resumen corto y directo de tu conclusión en una sola frase>",
      "puntos_positivos": ["<array de strings con aspectos positivos>"],
      "puntos_negativos": ["<array de strings con aspectos negativos>"],
      "advertencias_contexto": ["<array de strings con advertencias sobre feriados, noticias, etc. Si no hay nada, el array debe estar vacío []>"]
    }
  `;
}
/**
 * Genera un "prompt maestro" que le pide a la IA toda la información de una vez
 * y solicita una respuesta en formato JSON.
 * @param {object} viaje - El objeto con los datos del viaje.
 * @returns {string} - El prompt completo para enviar a Gemini.
 */
function generarPromptMaestro(viaje) {
  const fechaActual = new Date().toLocaleDateString('es-BO', { timeZone: 'America/La_Paz' });

  return `
    Eres un asistente experto en análisis de viajes por carretera en Bolivia. Tu tarea es evaluar la viabilidad y conveniencia de un viaje en bus basado en los datos proporcionados.
    Toma en cuenta la lógica del horario, el precio promedio para esa ruta, y cualquier posible evento externo como feriados nacionales/regionales, bloqueos de carreteras, problemas climáticos o noticias relevantes para la ruta y la fecha.

    **Datos del Viaje a Analizar:**
    - **Origen:** ${viaje.origen}
    - **Destino:** ${viaje.destino}
    - **Fecha y Hora de Salida:** ${viaje.fecha_salida}
    - **Fecha y Hora de Llegada:** ${viaje.fecha_llegada}
    - **Precio Promedio (Bs):** ${viaje.precio.toFixed(2)}
    - **Fecha de la consulta:** ${fechaActual}

    **Instrucciones de Respuesta:**
    Analiza toda la información y responde EXCLUSIVAMENTE con un objeto JSON válido, sin texto adicional antes o después del objeto. El objeto JSON debe tener la siguiente estructura exacta:
    {
      "es_recomendable": <boolean>,
      "resumen_analisis": "<string con un resumen corto y directo de tu conclusión en una sola frase>",
      "puntos_positivos": ["<array de strings con aspectos positivos, ej: 'El precio es competitivo.'>"],
      "puntos_negativos": ["<array de strings con aspectos negativos, ej: 'El horario de llegada es muy tarde.'>"],
      "advertencias_contexto": ["<array de strings con advertencias sobre feriados, noticias relevantes como bloqueos, mal clima, etc. Si no hay nada, devuelve un array vacío [].>"]
    }
  `;
}