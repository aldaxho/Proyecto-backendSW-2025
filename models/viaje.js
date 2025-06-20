'use strict';
module.exports = (sequelize, DataTypes) => {
  const Viaje = sequelize.define('viaje', {
    id: { type: DataTypes.UUID, primaryKey: true ,defaultValue: DataTypes.UUIDV4},
    bus_id: DataTypes.UUID,
    ruta_id: DataTypes.UUID,
    hora_salida: DataTypes.DATE,
    hora_llegada: DataTypes.DATE
  }, {
    tableName: 'viaje',
    timestamps: false
  });

  Viaje.associate = models => {
    Viaje.belongsTo(models.bus, { foreignKey: 'bus_id' });
    Viaje.belongsTo(models.ruta, { foreignKey: 'ruta_id' });
    Viaje.hasMany(models.asiento_viaje, { foreignKey: 'viaje_id' });
    Viaje.hasMany(models.compra_boletos, { foreignKey: 'viaje_id' });
  };

  return Viaje;
};
