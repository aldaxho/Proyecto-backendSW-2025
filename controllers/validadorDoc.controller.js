const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const dayjs = require('dayjs');

exports.validarDocumentos = async (req, res) => {
  try {
    const files = req.files; // archivos subidos (por ejemplo con multer)
    const documentos = [];

    for (const file of files) {
      const base64 = file.buffer.toString('base64');

      const completion = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Extrae el nombre completo, CI y fecha de nacimiento del documento en la imagen. Devuélvelo en formato JSON con los campos: nombre, ci, fecha_nacimiento (YYYY-MM-DD)." },
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

      const texto = completion.choices[0].message.content;
      const datos = JSON.parse(texto);
      documentos.push(datos);
    }

    // Verificar edades
    const hoy = dayjs();
    const mayores = [];
    const menores = [];

    for (const doc of documentos) {
      const edad = hoy.diff(dayjs(doc.fecha_nacimiento), 'year');
      if (edad >= 18) mayores.push({ ...doc, edad });
      else menores.push({ ...doc, edad });
    }

    // Verificar si los menores están acompañados
    const apellidosAdultos = mayores.map(m => m.nombre.split(' ').slice(-1)[0]);
    const menoresSinPadre = menores.filter(menor => {
      const apellido = menor.nombre.split(' ').slice(-1)[0];
      return !apellidosAdultos.includes(apellido);
    });

    res.json({
      total: documentos.length,
      mayores,
      menores,
      menores_sin_padre: menoresSinPadre,
      advertencia: menoresSinPadre.length > 0
        ? 'Hay menores que podrían estar viajando solos.'
        : 'Todos los menores están acompañados por un adulto con mismo apellido.'
    });

  } catch (err) {
    res.status(500).json({ error: 'Error al validar documentos', detalle: err.message });
  }
};
