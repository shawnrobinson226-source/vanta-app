export type TraceStatus = "started" | "passed" | "blocked" | "failed" | "completed";

export type TraceEvent = {
  stage: string;
  status: TraceStatus;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
};

export type ExecutionTrace = {
  traceId: string;
  operatorId?: string;
  input: string;
  events: TraceEvent[];
  finalStatus: TraceStatus;
  createdAt: string;
  updatedAt: string;
};

const STATUS_RANK: Record<TraceStatus, number> = {
  started: 0,
  passed: 1,
  completed: 2,
  blocked: 3,
  failed: 4
};

function now(): string {
  return new Date().toISOString();
}

function makeTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function resolveFinalStatus(current: TraceStatus, next: TraceStatus): TraceStatus {
  return STATUS_RANK[next] > STATUS_RANK[current] ? next : current;
}

function sanitizeTraceData(
  data?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!data) return undefined;

  try {
    return JSON.parse(
      JSON.stringify(data, (_key, value) => {
        if (typeof value === "function") return "[Function]";
        if (typeof value === "symbol") return "[Symbol]";
        if (typeof value === "bigint") return value.toString();
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack
          };
        }
        return value;
      })
    );
  } catch {
    return {
      serialization_error: "Trace data could not be safely serialized."
    };
  }
}

export function createExecutionTrace(input: {
  operatorId?: string;
  userInput: string;
}): ExecutionTrace {
  const timestamp = now();

  return {
    traceId: makeTraceId(),
    operatorId: input.operatorId,
    input: input.userInput,
    events: [
      {
        stage: "trace",
        status: "started",
        message: "Execution trace started.",
        timestamp
      }
    ],
    finalStatus: "started",
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function addTraceEvent(
  trace: ExecutionTrace,
  event: Omit<TraceEvent, "timestamp">
): ExecutionTrace {
  const timestamp = now();

  return {
    ...trace,
    events: [
      ...trace.events,
      {
        ...event,
        data: sanitizeTraceData(event.data),
        timestamp
      }
    ],
    finalStatus: resolveFinalStatus(trace.finalStatus, event.status),
    updatedAt: timestamp
  };
}

export function completeTrace(
  trace: ExecutionTrace,
  message = "Execution completed."
): ExecutionTrace {
  return addTraceEvent(trace, {
    stage: "complete",
    status: "completed",
    message
  });
}

export function failTrace(
  trace: ExecutionTrace,
  stage: string,
  message: string,
  data?: Record<string, unknown>
): ExecutionTrace {
  return addTraceEvent(trace, {
    stage,
    status: "failed",
    message,
    data
  });
}

export function blockTrace(
  trace: ExecutionTrace,
  stage: string,
  message: string,
  data?: Record<string, unknown>
): ExecutionTrace {
  return addTraceEvent(trace, {
    stage,
    status: "blocked",
    message,
    data
  });
}