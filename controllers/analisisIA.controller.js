// controllers/analisisIA.controller.js
const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Utilidades para prompts
function generarPromptFeriado(origen, destino, fecha) {
  return `Consulta si el día "${fecha}" en Bolivia es feriado o tiene algún evento importante que afecte los viajes entre "${origen}" y "${destino}". Responde con:

- ¿Es feriado? Sí/No
- ¿Qué se celebra?
- ¿Afecta el transporte? ¿Cómo?`;
}

function generarPromptSituacion(origen, destino, fecha, hora) {
  return `Revisa si hay bloqueos, conflictos sociales, protestas o problemas de seguridad en Bolivia para un viaje desde "${origen}" hasta "${destino}" el día "${fecha}" a las "${hora}". Evalúa si es seguro viajar o si debería evitarse.`;
}

function generarPromptRecomendacion(viaje) {
  return `Se están evaluando varios viajes. Este viaje tiene los siguientes datos:

- Origen: ${viaje.origen}
- Destino: ${viaje.destino}
- Fecha: ${viaje.fecha}
- Hora de salida: ${viaje.hora_salida}
- Hora de llegada: ${viaje.hora_llegada}
- Precio: ${viaje.precio}

Con base en eso, dime:

- ¿Vale la pena este viaje?
- ¿Está barato, justo o caro?
- ¿Qué ventajas o desventajas ves?
- ¿Lo recomendarías? ¿Por qué?`;
}

// ✅ Función correcta
async function consultarIA(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });

  return completion.choices[0].message.content;
}

// Controlador principal
exports.analizarViaje = async (req, res) => {
  try {
    const { origen, destino, fecha, hora_salida, hora_llegada, precio } = req.body;

    const promptFeriado = generarPromptFeriado(origen, destino, fecha);
    const promptSituacion = generarPromptSituacion(origen, destino, fecha, hora_salida);
    const promptRecomendacion = generarPromptRecomendacion({ origen, destino, fecha, hora_salida, hora_llegada, precio });

    const [feriado, situacion, recomendacion] = await Promise.all([
      consultarIA(promptFeriado),
      consultarIA(promptSituacion),
      consultarIA(promptRecomendacion)
    ]);

    res.json({ feriado, situacion, recomendacion });
  } catch (err) {
    console.error("Error al analizar viaje:", err);
    res.status(500).json({ error: "Error al analizar el viaje con IA" });
  }
};

exports.analizarYRecomendarViajes = async (req, res) => {
  try {
    const { viaje_id } = req.body;

    // Traer el viaje específico
    const viajeActual = await db.viaje.findByPk(viaje_id, {
      include: [
        {
          model: db.ruta,
          include: ['origen', 'destino']
        }
      ]
    });

    if (!viajeActual) {
      return res.status(404).json({ error: "Viaje no encontrado" });
    }

    const origen = viajeActual.ruta.origen.nombre;
    const destino = viajeActual.ruta.destino.nombre;
    const fecha = viajeActual.hora_salida.toISOString().split('T')[0];
    const hora_salida = viajeActual.hora_salida.toTimeString().split(' ')[0];
    const hora_llegada = viajeActual.hora_llegada.toTimeString().split(' ')[0];

    // Calcular el precio promedio
    const asientoViajes = await db.asiento_viaje.findAll({
      where: { viaje_id },
    });
    const precio = asientoViajes.length > 0
      ? asientoViajes.reduce((sum, a) => sum + parseFloat(a.precio), 0) / asientoViajes.length
      : 0;

    // Prompts
    const promptFeriado = generarPromptFeriado(origen, destino, fecha);
    const promptSituacion = generarPromptSituacion(origen, destino, fecha, hora_salida);
    const promptRecomendacion = generarPromptRecomendacion({ origen, destino, fecha, hora_salida, hora_llegada, precio });

    // Prompts paralelos
    const [feriado, situacion, recomendacion] = await Promise.all([
      consultarIA(promptFeriado),
      consultarIA(promptSituacion),
      consultarIA(promptRecomendacion)
    ]);

    // ✅ Otras opciones de viaje similares
    const otrasOpciones = await db.viaje.findAll({
      where: {
        ruta_id: viajeActual.ruta_id,
        id: { [db.Sequelize.Op.ne]: viaje_id }
      },
      include: [db.bus]
    });

    // Simplificar respuesta de otras opciones
    const alternativas = otrasOpciones.map(v => ({
      id: v.id,
      hora_salida: v.hora_salida,
      hora_llegada: v.hora_llegada,
      bus: v.bus?.placa
    }));

    res.json({
      viaje: { origen, destino, fecha, hora_salida, hora_llegada, precio },
      feriado,
      situacion,
      recomendacion,
      alternativas
    });

  } catch (err) {
    console.error("Error en análisis IA:", err);
    res.status(500).json({ error: "Fallo al analizar viaje y sugerencias" });
  }
};
