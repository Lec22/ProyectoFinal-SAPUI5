sap.ui.define([
	"logaligroup/gestionempleados/controller/Base.controller"
], function(Base) {
	"use strict";

	return Base.extend("logaligroup.gestionempleados.controller.VerEmpleados", {
		
		onAfterRendering : function () {
		},
		
		onInit : function () {
			var oTabBar = this.byId("tabBar");
			oTabBar.attachSelect(this.filtrarArchivos, this);
		
		},

		filtrarArchivos : function (oEvent) {

			if (oEvent) {
				var oSelectedItem = oEvent.getParameter("selectedItem");
			} else {
				var oSelectedItem = {
					mProperties : {
						icon : ""
					}
				}
			};
			
			if (oSelectedItem.mProperties.icon === "sap-icon://attachment" || !oEvent) {
			this.byId("uploadCollection").bindAggregation("items", {
				path: "empleadosModel>UserToAttachment",
				filters: [
					new sap.ui.model.Filter("SapId", sap.ui.model.FilterOperator.EQ, this.SapId),
					new sap.ui.model. Filter("EmployeeId", sap.ui.model.FilterOperator.EQ, this._employeeId),
				],
				template: new sap.m.UploadCollectionItem({
					documentId: "{empleadosModel>AttId}",
					visibleEdit: false,
					fileName: "{empleadosModel>DocName}"
				}).attachPress(this.descargarArchivo)
			});
		};
		},

		buscarEmpleado : function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			var aFiltro = [];
			if (sQuery && sQuery.length > 0) {
				aFiltro = [new sap.ui.model.Filter([
					new sap.ui.model.Filter("FirstName", sap.ui.model.FilterOperator.Contains, sQuery),
					new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.Contains, sQuery)
				], false)];
			}
			var listaEmpleados = this.byId("listaEmpleados");
			var binding = listaEmpleados.getBinding("items");
			binding.filter(aFiltro);
		},

		seleccionarEmpleado : function (oEvent) {
			this.byId("splitGestionEmpleados").to(this.createId("detalleEmpleado"));
			var context = oEvent.getParameter("listItem").getBindingContext("empleadosModel");
			
			this._employeeId = context.getProperty("EmployeeId");
			this._SapId = context.getProperty("SapId");

			const bindingParams = "empleadosModel>/Users(EmployeeId='"+
								  this._employeeId + 
								  "',SapId='"+
								  this._SapId+
								  "')";

			this.byId("detalleEmpleado").bindElement(bindingParams);

			this.filtrarArchivos();
		},

		volver : function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("Menu", {}, true);
		},

		onChange : function (oEvent) {
			var oUploadCollection = oEvent.getSource();
			
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: this.getView().getModel("empleadosModel").getSecurityToken()
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},

		onUploadCompleted : function (oEvent) {
        	oEvent.getSource().getBinding("items").refresh();
		},

		ascender : function () {
			var oEmpleadosModel = this.getView().getModel("empleadosModel");
			var oI18n = this.getView().getModel("i18n");
			var oResourceBundle = oI18n.getResourceBundle();

			var sSapId = this._SapId;
			var sEmployeeId = this._employeeId;
			var oDialog = new sap.m.Dialog({
				title: oResourceBundle.getText("nuevoAscenso"),
				content: [
					new sap.m.Label({ text: oResourceBundle.getText("salario") }),
					new sap.m.Input({ type: "Number", id: "salarioDialog" }),
					new sap.m.Label({ text: oResourceBundle.getText("fecha") }),
					new sap.m.DatePicker({ id: "fechaDialog" }),
					new sap.m.Label({ text: oResourceBundle.getText("comentario") }),
					new sap.m.Input({ type: "Text", id: "comentarioDialog" })
				],
				buttons: [
					new sap.m.Button({
						text: "Aceptar",
						press: function () {
							var sSalario = sap.ui.getCore().byId("salarioDialog").getValue();
							var sFecha = sap.ui.getCore().byId("fechaDialog").getDateValue();
							var sComentario = sap.ui.getCore().byId("comentarioDialog").getValue();

							var body = {
								Amount : sSalario.toString(),
								CreationDate : sFecha,
								Comments : sComentario,
								SapId : sSapId,
								EmployeeId : sEmployeeId
							};
							oEmpleadosModel.create("/Salaries",body,{
								success : function () {
									sap.m.MessageToast.show(oResourceBundle.getText("ascensoOK"));
									oDialog.close();
								}.bind(this),
								error : function () {
									sap.m.MessageToast.show(oResourceBundle.getText("ascensoNotOK"));
								}.bind(this)
							});
						}
					}),
					new sap.m.Button({
						text: oResourceBundle.getText("cancel"),
						press: function () {
							oDialog.close();
						}
					})
				],
				afterClose: function () {
					oDialog.destroy();
				}
			});

			oDialog.open();
		},

		descargarArchivo : function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("empleadosModel").getPath();
        	window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV"+sPath+"/$value");
		},

		darDeBaja : function () {

			var oEmpleadosModel = this.getView().getModel("empleadosModel");
			var oI18n = this.getView().getModel("i18n");
			var oResourceBundle = oI18n.getResourceBundle();
			var sSapId = this._SapId;
			var sEmployeeId = this._employeeId;
			var sGestionEmpleados = this.byId("splitGestionEmpleados");
			var sPantallaInicial = this.createId("detalleMensajeInicial");

			var oDialog = new sap.m.Dialog({
				title : oResourceBundle.getText("confirmar"),
				type : "Message",
				content : new sap.m.Text({ text: oResourceBundle.getText("deseaEliminar") }),
				beginButton : new sap.m.Button({
					text : oResourceBundle.getText("ok"),
					press : function() {
						oDialog.close();
						oEmpleadosModel.remove("/Users(EmployeeId='"+ 
												sEmployeeId+ 
												"',SapId='"+
												sSapId+
												"')",{
							success : function (data) {
								sap.m.MessageToast.show(oResourceBundle.getText("empleadoEliminado"));
								sGestionEmpleados.to(sPantallaInicial);
							}.bind(this),
							error : function (e) {
								sap.m.MessageToast.error(e);
							}.bind(this)
						});
					}
				}),
				endButton: new sap.m.Button({
					text : oResourceBundle.getText("cancel"),
					press : function () {
						oDialog.close();
					}
				})
			});
			oDialog.open();
		}	
	});
  }
);
