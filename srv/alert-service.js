const xsenv = require('@sap/xsenv');
const axios = require('axios');

module.exports = async function sendExitRequestNotification({ employeeId, name }) {
  try {
    // Read Destination service credentials
    const services = xsenv.getServices({ alert: { name: 'alert-notification-instance' } });
    if (!services.alert) {
      throw new Error('Alert Notification Destination binding not found in VCAP_SERVICES');
    }
    const { clientId: clientid, clientSecret: clientsecret, url:url,tokenurl:tokenurl } = services.alert;

    // Obtain OAuth token
    const tokenResponse = await axios({
      method: 'GET',
      url: `https://02508e03trial.authentication.us10.hana.ondemand.com/oauth/token?grant_type=client_credentials`,
      auth: { username: "sb-62c44389-e515-4e7b-9ed5-9f36ce083f50!b444440|ans-xsuaa!b673", password: "dc86cf44-328e-468a-91ba-9906b63ca110$dq4AZUa9yYAxDUTq1_1xsK7-J2_th-I-O5K-YWh_1TE=" }
    });
    const accessToken = tokenResponse.data.access_token;

    // Prepare event payload
    const eventPayload = {
      eventType: 'ExitRequestNotification',
      resource: {
        resourceName: 'EmployeeExitRequest',
        resourceType: 'CAPApplication'
      },
      severity: 'INFO',
      category: 'NOTIFICATION',
      subject: `Exit Request for Employee ${employeeId}`,
      body: `An exit request has been submitted for employee:(ID: ${employeeId}).\n\nKind regards,\nSAP Alert Notification Service for SAP BTP`
    };

    // Send event to Alert Notification Service
    await axios({
      method: 'POST',
      url: `${url}/cf/producer/v1/resource-events`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: eventPayload
    });

    return { status: 'Notification sent successfully' };
  } catch (error) {
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};