import incident from "incident";

export type Name = "InvalidTimestamp";
export const name: Name = "InvalidTimestamp";

export interface Data {
  date: Date;
}

export type Cause = undefined;
export type InvalidTimestampError = incident.Incident<Data, Name, Cause>;

export function format({date}: Data): string {
  return `Invalid timestamp for the date: ${JSON.stringify(date)}`;
}

export function createInvalidTimestampError(date: Date): InvalidTimestampError {
  return incident.Incident(name, {date}, format);
}
