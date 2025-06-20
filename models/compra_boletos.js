'use strict';
module.exports = (sequelize, DataTypes) => {
  const CompraBoletos = sequelize.define('compra_boletos', {
    id: { type: DataTypes.UUID, primaryKey: true },
    usuario_id: DataTypes.UUID,
    viaje_id: DataTypes.UUID,
    monto_total: DataTypes.DECIMAL(10, 2),
    fecha: DataTypes.DATE
  }, {
    tableName: 'compra_boletos',
    timestamps: false
  });

  CompraBoletos.associate = models => {
    CompraBoletos.belongsTo(models.usuario, { foreignKey: 'usuario_id' });
    CompraBoletos.belongsTo(models.viaje, { foreignKey: 'viaje_id' });
    CompraBoletos.hasMany(models.boleto, { foreignKey: 'compra_id' });
  };

  return CompraBoletos;
};
