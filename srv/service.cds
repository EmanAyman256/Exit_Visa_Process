using { ECEmploymentInformation as external } from './external/ECEmploymentInformation';

service ECEmployeeProfileService  {
entity Employment as projection on external.EmpJob {
    
   key userId,
    key seqNumber,
    key startDate,
    endDate,
    emplStatus,
    contractType,
    managerId,
    jobTitle,
    virtual emplStatusLabel: String

};
}
service NotifService {
  action sendExitRequest(employeeId: String, reason: String) returns String;
}


