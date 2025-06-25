# 🚌 Sistema de Venta de Boletos de Bus

Proyecto académico para la gestión de buses, viajes y compra de boletos.

## ✅ Requisitos

* Node.js ≥ 18
* PostgreSQL
* Sequelize CLI (`npm install -g sequelize-cli`)

---

## 🔧 Instalación

```bash
git clone <repo>
cd backend
npm install
npm install cors
npm install qrcode
npm install axios
npm install @google/generative-ai


```

### Configura `.env`

```env
PORT=3000
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=nombre_bd
DB_HOST=localhost
JWT_SECRET=clave_secreta_jwt
```

---

## ⚙️ Comandos útiles

### Crear base de datos y estructura

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

### Insertar usuario administrador por seeder

```bash
npx sequelize-cli db:seed:all
```

---

## 🚀 Iniciar servidor

```bash
npm run dev || npx nodemon

```

---

## 📌 Endpoints disponibles

### 🔐 Autenticación

| Método | Ruta              | Descripción       |
| ------ | ----------------- | ----------------- |
| POST   | `/api/auth/login` | Iniciar sesión    |
| POST   | `/api/usuarios`   | Registrar usuario |

---

### 👤 Usuarios

| Método | Ruta            | Descripción     |
| ------ | --------------- | --------------- |
| GET    | `/api/usuarios` | Listar usuarios |
| POST   | `/api/usuarios` | Crear usuario   |

---

### 🌍 Lugares

| Método | Ruta           | Descripción    |
| ------ | -------------- | -------------- |
| GET    | `/api/lugares` | Listar lugares |
| POST   | `/api/lugares` | Crear lugar    |

---

### 🛃️ Rutas

| Método | Ruta         | Descripción  |
| ------ | ------------ | ------------ |
| GET    | `/api/rutas` | Listar rutas |
| POST   | `/api/rutas` | Crear ruta   |

---

### 🚌 Buses

| Método | Ruta         | Descripción  |
| ------ | ------------ | ------------ |
| GET    | `/api/buses` | Listar buses |
| POST   | `/api/buses` | Crear bus    |

---

### 🗕️ Viajes

| Método | Ruta                 | Descripción               |
| ------ | -------------------- | ------------------------- |
| GET    | `/api/viajes/buscar` | Buscar viajes por filtros |
| POST   | `/api/viajes/create` | Crear nuevo viaje         |

---

### 👖 Distribución de asientos

| Método | Ruta                     | Descripción                            |
| ------ | ------------------------ | -------------------------------------- |
| POST   | `/api/distribucion/demo` | Crear demo de distribución de asientos |

---

### 🎟️ Asientos por viaje

| Método | Ruta                                       | Descripción                            |
| ------ | ------------------------------------------ | -------------------------------------- |
| POST   | `/api/asiento-viaje/generar/:viaje_id`     | Generar asientos para un viaje         |
| GET    | `/api/asiento-viaje/:viaje_id/disponibles` | Ver asientos disponibles para un viaje |

---

### 🎟️️ Compra de boletos

| Método | Ruta                  | Descripción                      |
| ------ | --------------------- | -------------------------------- |
| POST   | `/api/boletos/create` | Comprar uno o varios boletos     |
| GET    | `/api/boletos`        | Listar todos los boletos (admin) |

---

### 💼 Historial de compras

| Método | Ruta                       | Descripción                            |
| ------ | -------------------------- | -------------------------------------- |
| GET    | `/api/compras/:usuario_id` | Ver historial de compras por usuario   |
| DELETE | `/api/compras/:compra_id`  | Cancelar una compra y liberar asientos |

---
### :🧠 Análisis Inteligente (OpenAI)

| Método | Ruta                 | Descripción                                                             |
| ------ | -------------------- | ----------------------------------------------------------------------- |
| POST   | `/api/analizar`   | Analiza si hay feriado, conflictos sociales y recomienda el viaje       |
| POST   | `/api/recomendar` | Evalúa un viaje específico y recomienda opciones alternativas similares |



## 🔐 Autenticación

* Todas las rutas protegidas requieren **token JWT**.
* Envía el token en los headers:

```http
Authorization: Bearer <token>
```

---

## 🧪 Usuario administrador por defecto

Creado por el seeder:

* **Correo:** `aldo@gmail.com`
* **Contraseña:** `admin123`

---


