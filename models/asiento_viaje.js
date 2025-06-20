'use strict';
module.exports = (sequelize, DataTypes) => {
  const AsientoViaje = sequelize.define('asiento_viaje', {
    id: { type: DataTypes.UUID, primaryKey: true,defaultValue: DataTypes.UUIDV4 },
    asiento_id: DataTypes.UUID,
    viaje_id: DataTypes.UUID,
    precio: DataTypes.DECIMAL(10, 2),
    disponible: DataTypes.BOOLEAN
  }, {
    tableName: 'asiento_viaje',
    timestamps: false
  });

  AsientoViaje.associate = models => {
    AsientoViaje.belongsTo(models.asiento, { foreignKey: 'asiento_id' });
    AsientoViaje.belongsTo(models.viaje, { foreignKey: 'viaje_id' });
  };

  return AsientoViaje;
};
