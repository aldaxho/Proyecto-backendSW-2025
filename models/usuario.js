'use strict';
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('usuario', {
    id: { type: DataTypes.UUID, primaryKey: true },
    correo: DataTypes.STRING,
    contraseña: DataTypes.STRING,
    tipo_usuario: DataTypes.ENUM('administrador', 'controlador_abordaje', 'pasajero'),
    fecha_registro: DataTypes.DATE,
    nombre: DataTypes.STRING,
    ci: DataTypes.STRING,
    fecha_nacimiento: DataTypes.DATEONLY
  }, {
    tableName: 'usuario',
    timestamps: false
  });

  Usuario.associate = models => {
    Usuario.hasMany(models.compra_boletos, { foreignKey: 'usuario_id' });
  };

  return Usuario;
};
