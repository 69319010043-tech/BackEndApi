const express = require("express");
const repairRequestsRouter = require("./routes/repairRequests");

const app = express();

app.use(express.json());
app.use("/api/v1/repair-requests", repairRequestsRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Request body must be valid JSON" });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
