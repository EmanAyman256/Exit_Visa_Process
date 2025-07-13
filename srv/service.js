const cds = require('@sap/cds');
const sendExitRequestNotification = require('./alert-service');

module.exports = cds.service.impl(async function () {
  const service = await cds.connect.to('ECEmploymentInformation');
  const { Employment } = this.entities;

  const statusMap = {
    '4595': 'Active',
    '4600': 'Terminated',
    '9999': 'Unknown'
  };

  this.on('READ', 'ECEmployeeProfileService.Employment', async (req) => {
    try {
      const result = await service.run(req.query);
      const enriched = Array.isArray(result)
        ? result.map(emp => ({ ...emp, emplStatusLabel: statusMap[emp.emplStatus] || 'Unknown' }))
        : { ...result, emplStatusLabel: statusMap[result.emplStatus] || 'Unknown' };
      return enriched;
    } catch (error) {
      console.error('Error reading Employment Info:', error.message);
      req.error(500, `Failed to fetch data: ${error.message}`);
    }
  });

  this.on('sendExitRequest', async (req) => {
    const { employeeId, name } = req.data;
    try {
      const result = await sendExitRequestNotification({ employeeId, name });
      return result.status;
    } catch (error) {
      req.error(500, `Failed to send notification: ${error.message}`);
    }
  });
});