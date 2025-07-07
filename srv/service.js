const cds = require('@sap/cds');

module.exports = async function () {
  const service = await cds.connect.to('ECEmploymentInformation');
  const { Employment } = this.entities;
  const statusMap = {
    "4595": "Active",
    "4600": "Terminated",
    "9999": "Unknown"
  };
  this.on('READ', Employment, async (req) => {
    try {
      const result = await service.run(req.query);
      const enriched = result.map(emp => {
        const label = statusMap[emp.emplStatus] || "Unknown";
        return { ...emp, emplStatusLabel: label };
      });

      return enriched;
    } catch (error) {
      console.error("Error reading Employment Info:", error.message);
      req.error(500, `Failed to fetch data: ${error.message}`);
    }
  });
};
