'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bus = sequelize.define('bus', {
    id: { type: DataTypes.UUID, primaryKey: true,defaultValue: DataTypes.UUIDV4 },
    placa: DataTypes.STRING,
    imagen: DataTypes.STRING,
    descripcion: DataTypes.STRING,
    capacidad_pasajeros: DataTypes.INTEGER,
    distribucion_asientos_id: DataTypes.UUID
  }, {
    tableName: 'bus',
    timestamps: false
  });

  Bus.associate = models => {
    Bus.belongsTo(models.distribucion_asientos, { foreignKey: 'distribucion_asientos_id' });
    Bus.hasMany(models.viaje, { foreignKey: 'bus_id' });
  };

  return Bus;
};
