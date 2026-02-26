import { readFile } from "fs/promises";
import { resolve } from "path";
import { parse } from "csv-parse/sync";
import { pool } from "../config/postgres.js";
import { env } from "../config/env.js";

export async function migrate(clearBefore = false) {
  const client = await pool.connect();

  try {
    const csvPath = resolve(env.fileDataCsv);
    const fileContent = await readFile(csvPath, "utf-8");

    const rows = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`Read ${rows.length} rows from CSV file`);

    await client.query("BEGIN");

    if (clearBefore) {
      await client.query(`
        TRUNCATE TABLE patients, treatments, 
        insurances_providers, specialitys,
        doctors, appointments CASCADE
      `);
      console.log("Previous data cleared");
    }

    for (const row of rows) {

      // ── Patient ──
      await client.query(`
        INSERT INTO patients (name, email, phone, address)
        VALUES ($1,$2,$3,$4)
        ON CONFLICT (email) DO NOTHING
      `, [
        row.patient_name,
        row.patient_email,
        row.patient_phone,
        row.patient_address
      ]);

      // ── Specialty ──
      await client.query(`
        INSERT INTO specialitys (name)
        VALUES ($1)
        ON CONFLICT (name) DO NOTHING
      `, [row.specialty]);

      const { rows: [specialty] } = await client.query(
        `SELECT id FROM specialitys WHERE name=$1`,
        [row.specialty]
      );

      // ── Doctor ──
      await client.query(`
        INSERT INTO doctors (name, email, speciality_id)
        VALUES ($1,$2,$3)
        ON CONFLICT (email) DO NOTHING
      `, [
        row.doctor_name,
        row.doctor_email,
        specialty.id
      ]);

      const { rows: [doctor] } = await client.query(
        `SELECT id FROM doctors WHERE email=$1`,
        [row.doctor_email]
      );

      // ── Treatment ──
      await client.query(`
        INSERT INTO treatments (code, description, cost)
        VALUES ($1,$2,$3)
        ON CONFLICT (code) DO NOTHING
      `, [
        row.treatment_code,
        row.treatment_description,
        Number(row.treatment_cost)
      ]);

      // ── Insurance ──
      await client.query(`
        INSERT INTO insurances_providers (name, coverage_percentage)
        VALUES ($1,$2)
        ON CONFLICT (name) DO NOTHING
      `, [
        row.insurance_provider,
        Number(row.coverage_percentage)
      ]);

      const { rows: [insurance] } = await client.query(
        `SELECT id FROM insurances_providers WHERE name=$1`,
        [row.insurance_provider]
      );

      // ── Patient ID ──
      const { rows: [patient] } = await client.query(
        `SELECT id FROM patients WHERE email=$1`,
        [row.patient_email]
      );

      // ── Appointment ──
      await client.query(`
        INSERT INTO appointments 
        (id, date, patient_id, doctor_id, treatment_code, insurance_provider_id, amount_paid)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (id) DO NOTHING
      `, [
        row.appointment_id,
        row.appointment_date,
        patient.id,
        doctor.id,
        row.treatment_code,
        insurance.id,
        Number(row.amount_paid)
      ]);
    }

    await client.query("COMMIT");

    console.log("Migration completed successfully");
    return { message: "Migration completed" };

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error migrating data:", error);
    throw error;
  } finally {
    client.release();
  }
}