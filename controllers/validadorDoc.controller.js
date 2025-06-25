const OpenAI = require('openai');
const dayjs = require('dayjs');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.validarDocumentos = async (req, res) => {
    console.log('Files recibidos:', Object.keys(req.files || {}));

  try {
    const files = req.files;

    if (!files || !files.ci_frontal || !files.ci_reverso) {
      return res.status(400).json({ error: 'Faltan imágenes: ci_frontal y/o ci_reverso' });
    }

    const imagenes = [...files.ci_frontal, ...files.ci_reverso];
    const hoy = dayjs();
    const documentos = [];

    for (const file of imagenes) {
      const base64 = file.buffer.toString('base64');

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:  `Observa la imagen y, si contiene texto con información personal legible, extrae lo siguiente:

- Nombre completo (campo: nombre)
- Un número identificador (campo: id)
- Una fecha de nacimiento con el formato YYYY-MM-DD (campo: fecha_nacimiento)

Devuelve únicamente un JSON exacto con estos campos, por ejemplo:
{
  "nombre": "Pedro Alvarez",
  "id": "83920123",
  "fecha_nacimiento": "2004-03-15"
}

Si no puedes extraerlos, responde con:
{ "error": "No se pudo extraer información útil" }`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      const respuesta = completion.choices[0]?.message?.content;

      let datos;
      try {
        datos = JSON.parse(respuesta);
      } catch (jsonErr) {
        return res.status(400).json({
          error: 'La IA devolvió un formato inválido',
          detalle: respuesta
        });
      }

      const edad = hoy.diff(dayjs(datos.fecha_nacimiento), 'year');

      documentos.push({
        ...datos,
        edad,
        esMenor: edad < 18,
        apellido: datos.nombre?.split(' ').slice(-1)[0] || ''
      });
    }

    const mayores = documentos.filter(d => !d.esMenor);
    const menores = documentos.filter(d => d.esMenor);

    const apellidosAdultos = mayores.map(m => m.apellido);
    const menoresSinPadre = menores.filter(menor =>
      !apellidosAdultos.includes(menor.apellido)
    );

    return res.json({
      total_documentos: documentos.length,
      mayores,
      menores,
      menores_sin_padre: menoresSinPadre,
      viajeAutorizado: menoresSinPadre.length === 0,
      advertencia: menoresSinPadre.length > 0
        ? 'Uno o más menores podrían estar viajando sin un adulto con el mismo apellido.'
        : 'Todos los menores están acompañados por un adulto con el mismo apellido.'
    });

  } catch (err) {
    console.error('OCR/IA error:', err);
    res.status(500).json({ error: 'Error al validar documentos', detalle: err.message });
  }
};
