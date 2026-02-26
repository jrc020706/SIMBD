# Simulacro de Migración de Datos – Salud Pública API

## 📌 Objetivo

Desarrollar un proceso de migración de datos desde un archivo CSV (simulando MongoDB) hacia una base de datos relacional en PostgreSQL, aplicando buenas prácticas de modelado, integridad referencial y organización modular del backend.

---

## 🏗️ Tecnologías Utilizadas

* Node.js (ES Modules)
* Express (estructura preparada para API)
* PostgreSQL
* dotenv
* pg (cliente PostgreSQL)

---

## 🗂️ Estructura del Proyecto

```
src/
 ├── config/
 │   ├── env.js
 │   └── postgres.js
 ├── services/
 │   └── migrationService.js
 ├── server.js
 └── data/
     └── simulation_saludplus_data.csv
```

---

## 🧩 Modelo Relacional Implementado

Tablas creadas:

* patients
* doctors
* insurance_providers
* treatments
* appointments

Relaciones clave:

* appointments tiene claves foráneas hacia:

  * patients
  * doctors
  * insurance_providers
  * treatments

Se garantiza integridad referencial mediante FOREIGN KEY.

---

## 🔄 Proceso de Migración

1. Conexión a PostgreSQL.
2. Creación automática de tablas.
3. Lectura del archivo CSV.
4. Limpieza opcional de datos previos.
5. Inserción en orden correcto:

   * patients
   * doctors
   * insurance_providers
   * treatments
   * appointments
6. Manejo de duplicados con `ON CONFLICT DO NOTHING`.

---

## ⚠️ Problemas Encontrados

* Error de autenticación "Peer authentication" en PostgreSQL.
* Violación de clave foránea cuando no existían registros en `treatments`.
* Duplicación visual de tablas por distintos schemas en DBeaver.

---

## ✅ Soluciones Aplicadas

* Configuración correcta de `.env` con URI de conexión.
* Inserción de tratamientos antes de appointments.
* Verificación de schemas en PostgreSQL.
* Uso de integridad referencial para evitar datos huérfanos.

---

## 🎯 Resultado Final

* Migración funcional desde CSV.
* Base de datos relacional consistente.
* Proyecto estructurado por capas.
* Integridad de datos garantizada.

---

## 🚀 Posibles Mejoras

* Implementar transacciones (BEGIN / COMMIT / ROLLBACK).
* Agregar validaciones de datos.
* Crear logs detallados de inserciones.
* Separar script de migración en modo CLI.

---

## 📚 Conclusión

El simulacro permitió aplicar conceptos de modelado relacional, manejo de claves foráneas, migración de datos y organización modular en Node.js, consolidando conocimientos prácticos en integración de bases de datos.
