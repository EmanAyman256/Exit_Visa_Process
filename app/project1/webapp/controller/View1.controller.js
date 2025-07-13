sap.ui.define([
    "sap/ui/core/mvc/Controller",
     "sap/m/MessageBox",
     "sap/m/MessageToast",

], (Controller,MessageBox,MessageToast) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {


            const viewModel = new sap.ui.model.json.JSONModel({
                employee: "",
                employeeData: {},
                formVisible: false,
                sponsorshipOption: ""
            });
            this.getView().setModel(viewModel, "viewModel");
        },
        onValueHelpRequest() {
            if (!this._oValueHelpDialog) {
                this._oValueHelpDialog = new sap.m.Dialog({
                    title: "Select Employee",
                    content: [
                        new sap.m.Table({
                            id: this.createId("EmployeeTable"),
                            mode: "SingleSelectMaster",
                            growing: true,
                            growingThreshold: 50,
                            columns: [
                                new sap.m.Column({ header: new sap.m.Label({ text: "EmployeeId" }) }),
                                new sap.m.Column({ header: new sap.m.Label({ text: "Termination Date" }) }),

                                // new sap.m.Column({ header: new sap.m.Label({ text: "EndDate" }) }),
                                new sap.m.Column({ header: new sap.m.Label({ text: "EmployeeStatus" }) }),
                                new sap.m.Column({ header: new sap.m.Label({ text: "JobTitle" }) }),
                                new sap.m.Column({ header: new sap.m.Label({ text: "ManagerId" }) }),

                            ],
                            items: {
                                path: "/Employment",
                                parameters: { $select: "userId,endDate,emplStatus,emplStatusLabel,jobTitle" },
                                template: new sap.m.ColumnListItem({
                                    type: "Active",
                                    cells: [
                                        new sap.m.Text({ text: "{userId}" }),
                                        new sap.m.Text({ text: "{startDate}" }),

                                        // new sap.m.Text({ text: "{endDate}" }),
                                        new sap.m.Text({ text: "{emplStatusLabel}" }),
                                        new sap.m.Text({ text: "{jobTitle}" }),
                                        new sap.m.Text({ text: "{managerId}" })



                                    ]
                                }),
                                filters: [
                                    new sap.ui.model.Filter("emplStatus", sap.ui.model.FilterOperator.EQ, "4600")
                                ],
                                events: {
                                    dataReceived: (oEvent) => {
                                        const oTable = this.byId("EmployeeTable");
                                        const aItems = oTable.getItems();
                                        const oContext = oEvent.getParameter("data");
                                        console.log("Filtered items received:", aItems.length);
                                        console.log("Count from server:", oContext?.__count || "N/A");
                                        if (aItems.length === 0) {
                                            sap.m.MessageBox.warning("No terminated employees found.");
                                        }
                                    }
                                }
                            }

                        })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Confirm",
                        press: (oEvent) => {
                            const oTable = this.byId("EmployeeTable");
                            const oSelectedItem = oTable.getSelectedItem();
                            const sQuotation = oSelectedItem.getCells()[0].getText();
                            const oContext = oSelectedItem.getBindingContext();
                            const oSelectedData = oContext.getObject();
                            const viewModel = this.getView().getModel("viewModel");
                            if (oSelectedItem) {
                                // const sQuotation = oSelectedItem.getCells()[0].getText();
                                viewModel.setProperty("/employee", sQuotation);
                                viewModel.setProperty("/employeeData", oSelectedData);
                                viewModel.setProperty("/formVisible", true);
                                this.byId("employeeInput").setValue(sQuotation);
                                this.getView().getModel("viewModel").setProperty("/employee", sQuotation);
                                this._oValueHelpDialog.close();
                            }
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: () => {
                            this._oValueHelpDialog.close();
                        }
                    })
                });

                var oODataModel = this.getOwnerComponent().getModel();
                this._oValueHelpDialog.setModel(oODataModel);
                this.getView().addDependent(this._oValueHelpDialog);
            }
            this._oValueHelpDialog.open();
        },
        onSubmitExitRequest: function () {
            const data = this.getView().getModel("viewModel").getProperty("/employeeData");
            const sponsorship = this.getView().getModel("viewModel").getProperty("/sponsorshipOption");

            // You can now send this info to backend or show it
            console.log("Exit Request Submitted for:", data.userId);
            console.log("Sponsorship Option:", sponsorship);

            sap.m.MessageToast.show("Exit request sent for " + data.userId);
        },
        onSendAlert: function () {
            var oTable = this.byId("employmentTable");
            var oSelectedItem = oTable.getSelectedItem();
            var sUserId = oSelectedItem
                ? oSelectedItem.getBindingContext().getProperty("userId")
                : "unknown";

            var oNotifModel = this.getView().getModel("notif");
            if (!oNotifModel) {
                MessageBox.error("Notification model is not initialized.");
                return;
            }

            // Bind and invoke the sendAlert action
            var oAction = oNotifModel.bindAction("/NotifService.sendAlert", {
                userId: sUserId
            });

            oAction.invoke().then(
                function () {
                    var sMessage = oAction.getBoundContext().getObject().value || "Alert sent successfully!";
                    MessageBox.success(sMessage);
                    MessageToast.show("Notification triggered!");
                },
                function (oError) {
                    var sError = oError.message || "Failed to invoke action.";
                    MessageBox.error("Failed to send alert: " + sError);
                }
            );
        },
        onSendExitRequest() {
            const viewModel = this.getView().getModel("viewModel");
            const employeeId = viewModel.getProperty("/employee");
            const name = viewModel.getProperty("/employeeData/jobTitle") || "Unknown Employee";
      
            if (!employeeId) {
              MessageBox.error("Please select an employee.");
              return;
            }
      
            const oNotifModel = this.getOwnerComponent().getModel("notif");
            if (!oNotifModel) {
              MessageBox.error("Notification model is not initialized.");
              return;
            }
            
      
            const oAction = oNotifModel.bindContext("/sendExitRequest(...)", undefined, {
              $$updateGroupId: "submitGroup"
            });
            oAction.setParameter("employeeId", employeeId);
            oAction.setParameter("name", name);
      
            oAction.invoke().then(
              () => {
                const sMessage = oAction.getBoundContext().getObject()?.value || "Exit request notification sent successfully!";
                MessageToast.show(sMessage);
              },
              (oError) => {
                MessageBox.error("Failed to send notification: " + oError.message);
              }
            );
          }
          



    });
});