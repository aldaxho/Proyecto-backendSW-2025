'use strict';
module.exports = (sequelize, DataTypes) => {
  const NivelDistribucion = sequelize.define('nivel_distribucion', {
    id: { type: DataTypes.UUID, primaryKey: true ,defaultValue: DataTypes.UUIDV4},
    distribucion_asientos_id: DataTypes.UUID,
    nivel: DataTypes.INTEGER,
    descripcion: DataTypes.STRING,
    imagen: DataTypes.STRING
  }, {
    tableName: 'nivel_distribucion',
    timestamps: false
  });

  NivelDistribucion.associate = models => {
    NivelDistribucion.belongsTo(models.distribucion_asientos, { foreignKey: 'distribucion_asientos_id' });
    NivelDistribucion.hasMany(models.asiento, { foreignKey: 'nivel_distribucion_id' });
  };

  return NivelDistribucion;
};
