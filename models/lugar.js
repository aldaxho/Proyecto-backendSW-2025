'use strict';
module.exports = (sequelize, DataTypes) => {
  const Lugar = sequelize.define('lugar', {
    id: { type: DataTypes.UUID, primaryKey: true ,defaultValue: DataTypes.UUIDV4 },
    nombre: DataTypes.STRING
  }, {
    tableName: 'lugar',
    timestamps: false
  });

  Lugar.associate = models => {
    Lugar.hasMany(models.ruta, { foreignKey: 'lugar_origen', as: 'rutas_origen' });
    Lugar.hasMany(models.ruta, { foreignKey: 'lugar_destino', as: 'rutas_destino' });
  };

  return Lugar;
};
