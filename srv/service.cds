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

}
}
// entity EmploymentStatus as projection on external.EmpEmploymentStatus {
//   key externalCode as code,
//       label
// }
