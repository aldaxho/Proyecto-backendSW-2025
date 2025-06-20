'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hash = await bcrypt.hash('admin123', 10); // puedes cambiar la contraseña aquí

    return queryInterface.bulkInsert('usuario', [{
      id: uuidv4(),
      correo: 'aldo@gmail.com',
      contraseña: hash,
      tipo_usuario: 'administrador',
      fecha_registro: new Date(),
      nombre: 'Administrador',
      ci: '1000000',
      fecha_nacimiento: '1990-01-01',
     
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('usuario', { correo: 'aldo@gmail.com' }, {});
  }
};
