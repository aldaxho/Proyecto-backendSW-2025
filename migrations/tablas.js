
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`CREATE TYPE tipo_usuario AS ENUM ('administrador', 'controlador_abordaje', 'pasajero');`);
    await queryInterface.sequelize.query(`CREATE TYPE tipo_asiento AS ENUM ('cama', 'semi_cama', 'normal');`);

    await queryInterface.createTable('usuario', {
      id: { type: Sequelize.UUID, primaryKey: true },
      correo: { type: Sequelize.STRING, allowNull: false },
      contraseña: { type: Sequelize.STRING, allowNull: false },
      tipo_usuario: { type: 'tipo_usuario', allowNull: false },
      fecha_registro: { type: Sequelize.DATE, allowNull: false },
      nombre: { type: Sequelize.STRING, allowNull: false },
      ci: { type: Sequelize.STRING, allowNull: false },
      fecha_nacimiento: { type: Sequelize.DATEONLY, allowNull: false }
    });

    await queryInterface.createTable('distribucion_asientos', {
      id: { type: Sequelize.UUID, primaryKey: true },
      nombre: { type: Sequelize.STRING, allowNull: false },
      cantidad_niveles: { type: Sequelize.INTEGER, allowNull: false }
    });

    await queryInterface.createTable('nivel_distribucion', {
      id: { type: Sequelize.UUID, primaryKey: true },
      distribucion_asientos_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'distribucion_asientos', key: 'id' },
        onDelete: 'CASCADE'
      },
      nivel: { type: Sequelize.INTEGER, allowNull: false },
      descripcion: { type: Sequelize.STRING, allowNull: false },
      imagen: { type: Sequelize.STRING, allowNull: false }
    });

    await queryInterface.createTable('asiento', {
      id: { type: Sequelize.UUID, primaryKey: true },
      nivel_distribucion_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'nivel_distribucion', key: 'id' },
        onDelete: 'CASCADE'
      },
      etiqueta: { type: Sequelize.STRING, allowNull: false, unique: true },
      tipo_asiento: { type: 'tipo_asiento', allowNull: false },
      x: { type: Sequelize.INTEGER, allowNull: false },
      y: { type: Sequelize.INTEGER, allowNull: false },
      width: { type: Sequelize.INTEGER, allowNull: false },
      height: { type: Sequelize.INTEGER, allowNull: false }
    });

    await queryInterface.createTable('bus', {
      id: { type: Sequelize.UUID, primaryKey: true },
      placa: { type: Sequelize.STRING, allowNull: false, unique: true },
      imagen: { type: Sequelize.STRING, allowNull: false },
      descripcion: { type: Sequelize.STRING, allowNull: false },
      capacidad_pasajeros: { type: Sequelize.INTEGER, allowNull: false },
      distribucion_asientos_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'distribucion_asientos', key: 'id' },
        onDelete: 'RESTRICT'
      }
    });

    await queryInterface.createTable('lugar', {
      id: { type: Sequelize.UUID, primaryKey: true },
      nombre: { type: Sequelize.STRING, allowNull: false }
    });

    await queryInterface.createTable('ruta', {
      id: { type: Sequelize.UUID, primaryKey: true },
      lugar_origen: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'lugar', key: 'id' },
        onDelete: 'RESTRICT'
      },
      lugar_destino: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'lugar', key: 'id' },
        onDelete: 'RESTRICT'
      },
      distancia_km: { type: Sequelize.INTEGER, allowNull: false },
      tiempo_viaje: { type: Sequelize.TIME, allowNull: false }
    });

    await queryInterface.createTable('viaje', {
      id: { type: Sequelize.UUID, primaryKey: true },
      bus_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'bus', key: 'id' },
        onDelete: 'RESTRICT'
      },
      ruta_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'ruta', key: 'id' },
        onDelete: 'CASCADE'
      },
      hora_salida: { type: Sequelize.DATE, allowNull: false },
      hora_llegada: { type: Sequelize.DATE, allowNull: false }
    });

   await queryInterface.createTable('asiento_viaje', {
  id: { type: Sequelize.UUID, primaryKey: true },
  asiento_id: {
    type: Sequelize.UUID,
    allowNull: false,
    references: { model: 'asiento', key: 'id' },
    onDelete: 'CASCADE'
  },
  viaje_id: {
    type: Sequelize.UUID,
    allowNull: false,
    references: { model: 'viaje', key: 'id' },
    onDelete: 'CASCADE'
  },
  precio: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
  disponible: { type: Sequelize.BOOLEAN, allowNull: false }
},
{
  uniqueKeys: {
    asiento_viaje_unique: {
      fields: ['asiento_id', 'viaje_id']
    }
  }
});


    await queryInterface.createTable('compra_boletos', {
      id: { type: Sequelize.UUID, primaryKey: true },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'usuario', key: 'id' },
        onDelete: 'CASCADE'
      },
      viaje_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'viaje', key: 'id' },
        onDelete: 'CASCADE'
      },
      monto_total: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      fecha: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('boleto', {
      id: { type: Sequelize.UUID, primaryKey: true },
      compra_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'compra_boletos', key: 'id' },
        onDelete: 'CASCADE'
      },
      asiento_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'asiento', key: 'id' },
        onDelete: 'RESTRICT'
      },
      precio: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      pasajero_ci: { type: Sequelize.STRING, allowNull: false },
      pasajero_nombre: { type: Sequelize.STRING, allowNull: false },
      pasajero_fecha_nacimiento: { type: Sequelize.DATEONLY, allowNull: false }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('boleto');
    await queryInterface.dropTable('compra_boletos');
    await queryInterface.dropTable('asiento_viaje');
    await queryInterface.dropTable('viaje');
    await queryInterface.dropTable('ruta');
    await queryInterface.dropTable('lugar');
    await queryInterface.dropTable('bus');
    await queryInterface.dropTable('asiento');
    await queryInterface.dropTable('nivel_distribucion');
    await queryInterface.dropTable('distribucion_asientos');
    await queryInterface.dropTable('usuario');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS tipo_usuario;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS tipo_asiento;');
  }
};
