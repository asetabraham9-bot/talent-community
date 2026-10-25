import AuditLog from "../models/AuditLog.js";

export const createAuditLog = (logData) => {
  return AuditLog.create(logData);
};

export const findAuditLogById = (logId) => {
  return AuditLog.findById(logId);
};

export const findAuditLogs = (filter = {}, options = {}) => {
  const { skip = 0, limit = 20 } = options;

  return AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const countAuditLogs = (filter = {}) => {
  return AuditLog.countDocuments(filter);
};
