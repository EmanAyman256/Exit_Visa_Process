sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Button",
    "sap/m/Dialog",
    "sap/m/library" // Import sap/m/library for enums
], (Controller, MessageBox, MessageToast, Button, Dialog, mobileLibrary) => {
    "use strict";

    // Access enums from mobileLibrary
    const { ButtonType, DialogType } = mobileLibrary;

    return Controller.extend("project1.controller.View1", {
        // Adding All The Initializations
        onInit() {
            // Initialize The Model
            const viewModel = new sap.ui.model.json.JSONModel({
                employee: "",
                employeeData: {},
                formVisible: false,
                sponsorshipOption: ""
            });
            this.getView().setModel(viewModel, "viewModel");
        },

        // For The Search Help That Showed Table of Employees 
        onValueHelpRequest() {
            if (!this._oValueHelpDialog) {
                this._oValueHelpDialog = new Dialog({
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
                                new sap.m.Column({ header: new sap.m.Label({ text: "EmployeeStatus" }) }),
                                new sap.m.Column({ header: new sap.m.Label({ text: "JobTitle" }) }),
                                new sap.m.Column({ header: new sap.m.Label({ text: "ManagerId" }) })
                            ],
                            items: {
                                path: "/Employment",
                                parameters: { $select: "userId,endDate,emplStatus,emplStatusLabel,jobTitle,managerId" },
                                template: new sap.m.ColumnListItem({
                                    type: "Active",
                                    cells: [
                                        new sap.m.Text({ text: "{userId}" }),
                                        new sap.m.Text({ text: "{endDate}" }), // Corrected from startDate to endDate
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
                                            MessageBox.warning("No terminated employees found.");
                                        }
                                    }
                                }
                            }
                        })
                    ],
                    beginButton: new Button({
                        text: "Confirm",
                        press: (oEvent) => {
                            const oTable = this.byId("EmployeeTable");
                            const oSelectedItem = oTable.getSelectedItem();
                            if (oSelectedItem) {
                                const oContext = oSelectedItem.getBindingContext();
                                const oSelectedData = oContext.getObject();
                                const sQuotation = oSelectedData.userId;
                                const viewModel = this.getView().getModel("viewModel");
                                viewModel.setProperty("/employee", sQuotation);
                                viewModel.setProperty("/employeeData", oSelectedData);
                                viewModel.setProperty("/formVisible", true);
                                this.byId("employeeInput").setValue(sQuotation);
                                this._oValueHelpDialog.close();
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => {
                            this._oValueHelpDialog.close();
                        }
                    })
                });

                const oODataModel = this.getOwnerComponent().getModel();
                this._oValueHelpDialog.setModel(oODataModel);
                this.getView().addDependent(this._oValueHelpDialog);
            }
            this._oValueHelpDialog.open();
        },

        // Send the Email ALERT NOTIF FOR THE TERMINATED EMPLOYEES' EXIT REQUEST
        onSendExitRequest() {
            const viewModel = this.getView().getModel("viewModel");
            const employeeId = viewModel.getProperty("/employee");
            const name = viewModel.getProperty("/employeeData/jobTitle") || "Unknown Employee";

            if (!employeeId) {
                MessageBox.error("Please select an employee.");
                return;
            }

            if (!this.oApproveDialog) {
                this.oApproveDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Confirm",
                    content: new sap.m.Text({ text: "Do you want to confirm the exit request?" }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "Confirm",
                        press: async () => {
                            try {
                               // MessageToast.show("Submit pressed!");
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

                                await oAction.invoke();
                                const sMessage = oAction.getBoundContext().getObject()?.value || "Exit request notification sent successfully!";
                                MessageToast.show(sMessage);
                            } catch (oError) {
                                MessageBox.error("Failed to send notification: " + oError.message);
                            } finally {
                                this.oApproveDialog.close();
                            }
                        }
                    }),
                    endButton: new Button({
                        text: "Cancel",
                        press: () => {
                            this.oApproveDialog.close();
                        }
                    })
                });
            }

            this.oApproveDialog.open();
        }
    });
});