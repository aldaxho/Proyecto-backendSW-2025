'use strict';
module.exports = (sequelize, DataTypes) => {
  const Boleto = sequelize.define('boleto', {
    id: { type: DataTypes.UUID, primaryKey: true,defaultValue: DataTypes.UUIDV4 },
    compra_id: DataTypes.UUID,
    asiento_id: DataTypes.UUID,
    precio: DataTypes.DECIMAL(10, 2),
    pasajero_ci: DataTypes.STRING,
    pasajero_nombre: DataTypes.STRING,
    pasajero_fecha_nacimiento: DataTypes.DATEONLY
  }, {
    tableName: 'boleto',
    timestamps: false
  });

  Boleto.associate = models => {
    Boleto.belongsTo(models.compra_boletos, { foreignKey: 'compra_id' });
    Boleto.belongsTo(models.asiento, { foreignKey: 'asiento_id' });
  };

  return Boleto;
};
