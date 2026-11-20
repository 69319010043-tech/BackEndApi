const repairRequestModel = require("../models/repairRequestModel");

const { VALID_STATUSES } = repairRequestModel;
const UPDATE_FIELDS = new Set([
  "computerId",
  "symptom",
  "status",
  "technicianId",
  "resultNote",
]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function parseId(rawId, res) {
  const id = Number(rawId);
  if (!isPositiveInteger(id)) {
    res.status(400).json({ message: "id must be a positive integer" });
    return null;
  }
  return id;
}

function sendNotFound(res) {
  return res.status(404).json({ message: "Request not found" });
}

function listRepairRequests(req, res) {
  const { status } = req.query;

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `status must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  return res.status(200).json(repairRequestModel.list({ status }));
}

function getRepairRequest(req, res) {
  const id = parseId(req.params.id, res);
  if (id === null) return undefined;

  const repairRequest = repairRequestModel.findById(id);
  if (!repairRequest) return sendNotFound(res);

  return res.status(200).json(repairRequest);
}

function createRepairRequest(req, res) {
  const body = req.body;
  if (!isObject(body)) {
    return res.status(400).json({ message: "Request body must be a JSON object" });
  }

  const errors = [];
  if (!isPositiveInteger(body.computerId)) {
    errors.push("computerId must be a positive integer");
  }
  if (typeof body.symptom !== "string" || body.symptom.trim().length === 0) {
    errors.push("symptom must be a non-empty string");
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Invalid repair request", errors });
  }

  const repairRequest = repairRequestModel.create({
    computerId: body.computerId,
    symptom: body.symptom,
  });

  return res.status(201).json(repairRequest);
}

function updateRepairRequest(req, res) {
  const id = parseId(req.params.id, res);
  if (id === null) return undefined;

  const existing = repairRequestModel.findById(id);
  if (!existing) return sendNotFound(res);

  const body = req.body;
  if (!isObject(body)) {
    return res.status(400).json({ message: "Request body must be a JSON object" });
  }

  const unknownFields = Object.keys(body).filter((field) => !UPDATE_FIELDS.has(field));
  if (unknownFields.length > 0) {
    return res.status(400).json({
      message: "Request contains unsupported fields",
      errors: unknownFields,
    });
  }

  const fields = {};
  const errors = [];

  if ("computerId" in body) {
    if (!isPositiveInteger(body.computerId)) {
      errors.push("computerId must be a positive integer");
    } else {
      fields.computerId = body.computerId;
    }
  }

  if ("symptom" in body) {
    if (typeof body.symptom !== "string" || body.symptom.trim().length === 0) {
      errors.push("symptom must be a non-empty string");
    } else {
      fields.symptom = body.symptom.trim();
    }
  }

  if ("status" in body) {
    if (!VALID_STATUSES.includes(body.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    } else {
      fields.status = body.status;
    }
  }

  if ("technicianId" in body) {
    if (body.technicianId !== null && !isPositiveInteger(body.technicianId)) {
      errors.push("technicianId must be a positive integer or null");
    } else {
      fields.technicianId = body.technicianId;
    }
  }

  if ("resultNote" in body) {
    if (body.resultNote !== null && typeof body.resultNote !== "string") {
      errors.push("resultNote must be a string or null");
    } else {
      fields.resultNote = body.resultNote;
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: "Invalid repair request", errors });
  }
  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ message: "At least one repair request field is required" });
  }

  const repairRequest = repairRequestModel.update(id, fields);
  return res.status(200).json(repairRequest);
}

function deleteRepairRequest(req, res) {
  const id = parseId(req.params.id, res);
  if (id === null) return undefined;

  const repairRequest = repairRequestModel.findById(id);
  if (!repairRequest) return sendNotFound(res);

  if (repairRequest.status !== "pending" || repairRequest.technicianId !== null) {
    return res.status(409).json({
      message: "Request cannot be cancelled after a technician has accepted it",
    });
  }

  repairRequestModel.remove(id);
  return res.status(204).end();
}

module.exports = {
  createRepairRequest,
  deleteRepairRequest,
  getRepairRequest,
  listRepairRequests,
  updateRepairRequest,
};
