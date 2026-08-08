# Checador Facial - Sistema de Control de Asistencia

Aplicación móvil completa (Frontend + Backend) para el control de asistencia mediante reconocimiento facial con inteligencia artificial.

---

## Stack Tecnológico

| Componente     | Tecnología                               |
|----------------|------------------------------------------|
| Backend        | Flask (Python)                           |
| IA / Biometría | DeepFace                                 |
| Frontend Móvil | React Native + NativeWind (Tailwind CSS) |
| Base de Datos  | PostgreSQL                               |

---

## Estructura del Proyecto

checador/
├── backend_python/ # Backend (Flask)
│ ├── app/
│ │ ├── controllers/ # Lógica de negocio
│ │ ├── models/ # Modelos SQLAlchemy
│ │ ├── routes/ # Endpoints API REST
│ │ ├── services/ # Servicio de IA (DeepFace)
│ │ └── database/ # Configuración BD
│ ├── uploads/faces/ # Fotos de usuarios
│ ├── run.py
│ └── requirements.txt
├── my-expo-app/ # Frontend (React Native)
│ ├── screens/ # Pantallas de la app
│ ├── components/ # Componentes reutilizables
│ ├── services/ # API y contexto
│ └── App.js # Punto de entrada
└── README.md

---

## Diagrama de Base de Datos

┌──────────────────────────────────────────────────────────────────────┐
│                              DATABASE                                │
│──────────────────────────────────────────────────────────────────────│
│   ┌──────────────────────┐                ┌──────────────────────┐   │
│   │       SCHEDULES      │                │        USERS         │   │
│   ├──────────────────────┤                ├──────────────────────┤   │
│   │ id (PK)              │◄───────────────│ schedule_id (FK)     │   │
│   │ name                 │                │ id (PK)              │   │
│   │ check_in             │                │ name                 │   │
│   │ check_out            │                │ lastname             │   │
│   │ worked_days          │                │ genre                │   │
│   │ late_minutes         │                │ occupation           │   │
│   │ created_at           │                │ area                 │   │
│   └──────────────────────┘                │ pin                  │   │
│                                           │ role (Enum)          │   │
│                                           │ face_img_path        │   │
│                                           │ active               │   │
│                                           │ created_at           │   │
│                                           │ updated_at           │   │
│                                           └───────────┬──────────┘   │
│                                                       │              │
│                                  user_id (FK)         │              │
│                                                       ▼              │
│   ┌──────────────────────┐                ┌──────────────────────┐   │
│   │        CHECKS        │                │     PERMISSIONS      │   │
│   ├──────────────────────┤                ├──────────────────────┤   │
│   │ id (PK)              │                │ id (PK)              │   │
│   │ user_id (FK)         │◄───────────────│ user_id (FK)         │   │
│   │ date                 │                │ start_date           │   │
│   │ check_in             │                │ end_date             │   │
│   │ check_out            │                │ reason               │   │
│   │ status               │                │ status               │   │
│   └──────────────────────┘                │ created_at           │   │
│                                           │ updated_at           │   │
│                                           └──────────────────────┘   │
│                                                                      │
│                           RELACIONES                                 │
│                                                                      │
│              SCHEDULES 1 ─────────── N USERS                         │
│              USERS     1 ─────────── N CHECKS                        │
│              USERS     1 ─────────── N PERMISSIONS                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

---

## Instrucciones de Ejecución...

### Requisitos Previos

- **Python 3.10 o 3.11** (no 3.14)
- **Node.js** (v18 o superior)
- **PostgreSQL** (o usar SQLite)
- **Expo Go** en el celular

---

### Backend (Flask)

```bash
# 1. Entrar a la carpeta del backend
cd backend_python

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno virtual
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar base de datos (.env)
# Editar el archivo .env con tus credenciales:
# DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/checador

# 6. Ejecutar migraciones
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# 7. Iniciar servidor
python run.py
```

---
### Frontend (React Native)

```bash
# 1. Entrar a la carpeta del frontend
cd my-expo-app

# 2. Instalar dependencias
npm install

# 3. Configurar IP del backend (.env)
# Editar .env con la IP de tu computadora:
# EXPO_PUBLIC_API_URL=http://192.168.X.X:5000/api

# 4. Iniciar Expo
npx expo start

# 5. Escanear QR con Expo Go
```

---

## Credenciales de Prueba

> **Nota:** Las credenciales dependen de la configuración inicial de cada instalación.

### Admin
- **PIN:** El definido al crear el usuario admin (ej: `1234`)
- **Primer uso:** Crear un usuario con rol `admin` y asignarle un PIN de 4 dígitos

### Empleado
- **Login:** Reconocimiento facial (requiere 20 fotos de registro)

---

## Flujo de la Aplicación

1. **Login:** Elegir "Soy Administrador" (PIN) o "Soy Empleado" (Rostro)
2. **Admin:** Gestionar usuarios, horarios, ver historial y aprobar/rechazar permisos
3. **Empleado:** Escanear rostro para check-in/out y gestionar permisos
4. **Check-out:** Escanear rostro nuevamente para registrar salida

---

## Endpoints API


### Auth
| Método |          Ruta         |     Descripción     |
|--------|-----------------------|---------------------|
| POST   | `/api/auth/login/pin` | Login admin con PIN |

### Usuarios
| Método |            Ruta           |      Descripción      |
|--------|---------------------------|-----------------------|
| POST   | `/api/users/`             | Crear usuario + fotos |
| GET    | `/api/users/`             | Listar usuarios       |
| GET    | `/api/users/:id`          | Obtener usuario       |
| PUT    | `/api/users/:id`          | Editar usuario        |
| DELETE | `/api/users/:id`          | Desactivar usuario    |
| PUT    | `/api/users/:id/activate` | Activar usuario       |

### Asistencia
| Método |               Ruta               |      Descripción     |
|--------|----------------------------------|----------------------|
| POST   | `/api/checks/facial`             | Check-in/out facial  |
| GET    | `/api/checks/today`              | Asistencias del día  |
| GET    | `/api/checks/user/:id/history`   | Historial usuario    |
| GET    | `/api/checks/area/:area/history` | Historial área       |

### Horarios
| Método |         Ruta         |   Descripción   |
|--------|----------------------|-----------------|
| POST   | `/api/schedules/`    | Crear horario   |
| GET    | `/api/schedules/`    | Listar horarios |
| PUT    | `/api/schedules/:id` | Editar horario  |

### Permisos
| Método |          Ruta          |    Descripción   |
|--------|------------------------|------------------|
| POST   | `/api/permissions/`    | Crear permiso    |
| GET    | `/api/permissions/`    | Listar permisos  |
| PUT    | `/api/permissions/:id` | Editar permiso   |
| DELETE | `/api/permissions/:id` | Eliminar permiso |

---

## IA - DeepFace

- Modelo: VGG-Face
- 20 fotos por usuario
- Detección: OpenCV backend
- Caché limpio automático al iniciar

---

## Autores

- Itzel Rivera - Desarrollo Full Stack

---

## Licencia

Proyecto final de la materia OPT/PIA.