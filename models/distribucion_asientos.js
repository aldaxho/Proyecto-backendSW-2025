'use strict';
module.exports = (sequelize, DataTypes) => {
  const DistribucionAsientos = sequelize.define('distribucion_asientos', {
    id: { type: DataTypes.UUID, primaryKey: true,defaultValue: DataTypes.UUIDV4 },
    nombre: DataTypes.STRING,
    cantidad_niveles: DataTypes.INTEGER
  }, {
    tableName: 'distribucion_asientos',
    timestamps: false
  });

  DistribucionAsientos.associate = models => {
    DistribucionAsientos.hasMany(models.bus, { foreignKey: 'distribucion_asientos_id' });
    DistribucionAsientos.hasMany(models.nivel_distribucion, { foreignKey: 'distribucion_asientos_id' });
  };

  return DistribucionAsientos;
};
