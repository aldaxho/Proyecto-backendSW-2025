'use strict';
module.exports = (sequelize, DataTypes) => {
  const Asiento = sequelize.define('asiento', {
    id: { type: DataTypes.UUID, primaryKey: true,defaultValue: DataTypes.UUIDV4 },
    nivel_distribucion_id: DataTypes.UUID,
    etiqueta: DataTypes.STRING,
    tipo_asiento: DataTypes.ENUM('cama', 'semi_cama', 'normal'),
    x: DataTypes.INTEGER,
    y: DataTypes.INTEGER,
    width: DataTypes.INTEGER,
    height: DataTypes.INTEGER
  }, {
    tableName: 'asiento',
    timestamps: false
  });

  Asiento.associate = models => {
    Asiento.belongsTo(models.nivel_distribucion, { foreignKey: 'nivel_distribucion_id' });
    Asiento.hasMany(models.asiento_viaje, { foreignKey: 'asiento_id' });
    Asiento.hasMany(models.boleto, { foreignKey: 'asiento_id' });
  };

  return Asiento;
};
