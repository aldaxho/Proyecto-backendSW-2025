'use strict';
module.exports = (sequelize, DataTypes) => {
  const Ruta = sequelize.define('ruta', {
    id: { type: DataTypes.UUID, primaryKey: true },
    lugar_origen: DataTypes.UUID,
    lugar_destino: DataTypes.UUID,
    distancia_km: DataTypes.INTEGER,
    tiempo_viaje: DataTypes.TIME
  }, {
    tableName: 'ruta',
    timestamps: false
  });

  Ruta.associate = models => {
    Ruta.belongsTo(models.lugar, { foreignKey: 'lugar_origen', as: 'origen' });
    Ruta.belongsTo(models.lugar, { foreignKey: 'lugar_destino', as: 'destino' });
    Ruta.hasMany(models.viaje, { foreignKey: 'ruta_id' });
  };

  return Ruta;
};
