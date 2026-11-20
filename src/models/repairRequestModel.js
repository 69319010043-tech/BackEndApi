const VALID_STATUSES = Object.freeze([
  "pending",
  "in_progress",
  "waiting_parts",
  "done",
]);

const repairRequests = [];
let nextId = 1;

function list({ status } = {}) {
  if (!status) return [...repairRequests];
  return repairRequests.filter((request) => request.status === status);
}

function findById(id) {
  return repairRequests.find((request) => request.id === id) ?? null;
}

function create({ computerId, symptom }) {
  const repairRequest = {
    id: nextId++,
    computerId,
    symptom: symptom.trim(),
    status: "pending",
    technicianId: null,
    resultNote: null,
  };

  repairRequests.push(repairRequest);
  return repairRequest;
}

function update(id, fields) {
  const repairRequest = findById(id);
  if (!repairRequest) return null;

  Object.assign(repairRequest, fields);
  return repairRequest;
}

function remove(id) {
  const index = repairRequests.findIndex((request) => request.id === id);
  if (index === -1) return null;

  return repairRequests.splice(index, 1)[0];
}

module.exports = {
  VALID_STATUSES,
  create,
  findById,
  list,
  remove,
  update,
};
