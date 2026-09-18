import { sql } from "@/lib/db";

export type IngestionJobType =
  | "met_warnings"
  | "met_forecasts";

export type IngestionRunStatus =
  | "success"
  | "partial_success"
  | "error";

type RecordIngestionRunInput = {
  jobType: IngestionJobType;
  batchNumber?: number | null;
  runStatus: IngestionRunStatus;

  recordsReceived?: number;
  recordsProcessed?: number;
  recordsSaved?: number;
  errorCount?: number;

  startedAt: Date;
  completedAt: Date;

  details?: Record<string, unknown>;
};

export async function recordIngestionRun({
  jobType,
  batchNumber = null,
  runStatus,
  recordsReceived = 0,
  recordsProcessed = 0,
  recordsSaved = 0,
  errorCount = 0,
  startedAt,
  completedAt,
  details = {}
}: RecordIngestionRunInput) {
  const durationMs = Math.max(
    0,
    completedAt.getTime() -
      startedAt.getTime()
  );

  /*
   * Gunakan JSON.stringify dan cast PostgreSQL.
   * Ini mengelakkan konflik TypeScript
   * antara Record<string, unknown> dan JSONValue.
   */
  const detailsJson =
    JSON.stringify(details);

  await sql`
    insert into public.ingestion_runs (
      job_type,
      batch_number,
      run_status,
      records_received,
      records_processed,
      records_saved,
      error_count,
      started_at,
      completed_at,
      duration_ms,
      details,
      created_at
    )
    values (
      ${jobType},
      ${batchNumber},
      ${runStatus},
      ${recordsReceived},
      ${recordsProcessed},
      ${recordsSaved},
      ${errorCount},
      ${startedAt},
      ${completedAt},
      ${durationMs},
      ${detailsJson}::jsonb,
      now()
    )
  `;
}
