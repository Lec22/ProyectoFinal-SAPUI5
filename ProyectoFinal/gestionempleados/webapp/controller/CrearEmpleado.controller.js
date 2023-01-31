sap.ui.define(
    [
        //"sap/ui/core/mvc/Controller",
        "logaligroup/gestionempleados/controller/Base.controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageBox",
        "sap/ui/core/UIComponent"
    ],

    
    function(Base, JSONModel, MessageBox, UIComponent) {
      "use strict";
  
      return Base.extend("logaligroup.gestionempleados.controller.CrearEmpleado", {
        onInit : function () {
        },

        irAStep2: function (oEvent) {
          
          var sTipoEmpleado = oEvent.getSource().getText().toLowerCase();

          //Valores por defecto y determinacion de campos a mostrar en el paso 2
          var oSueldoTipoEmpleado = {
            "interno": {
                Salario: 24000,
                Tipo: "0"
            },
            "autonomo": {
                Salario: 400,
                Tipo: "1"
            },
            "gerente": {
                Salario: 70000,
                Tipo: "2"
            }
        }

          this._model.setData({
            _tipoEmpleado : sTipoEmpleado,
            _tipo : oSueldoTipoEmpleado[sTipoEmpleado].Tipo,
            _salario : oSueldoTipoEmpleado[sTipoEmpleado].Salario,
            _fechaInc : "",
            _StatusPaso2 : "false"
          })

          this._wizard.nextStep();

        },

        onBeforeRendering : function () {
          
          this._model = new JSONModel({});
          this.getView().setModel(this._model);

          this._wizard = this.byId("wizardCrearEmpleado");

        },

        validarDatos : function () {
          var oData = this.getView().getModel().getData();
          var sTipo = oData._tipo;

          var oView = this.getView();
          var sNombre = oView.byId("inputNombre").getValue();
          var sApellido = oView.byId("inputApellido").getValue();
          var sDNI = oView.byId("inputDNI").getValue();
          var sCIF = oView.byId("inputCIF").getValue();
          var sFechaInc = oView.byId("inputFechaInc").getDateValue();
          var sError = false;

          if (!sNombre) {
            oView.byId("inputNombre").setValueState("Error");
            sError = true;
          } else {
            oView.byId("inputNombre").setValueState("None");
          }

          if (!sApellido && !sError) {
            oView.byId("inputApellido").setValueState("Error");
            sError = true;
          } else {
            oView.byId("inputApellido").setValueState("None");
          }

          if (!sDNI && !sError && sTipo !== "1") {
            oView.byId("inputDNI").setValueState("Error");
            sError = true;
          } else {
            oView.byId("inputDNI").setValueState("None");
          }

          if (!sCIF && !sError && sTipo === "1") {
            oView.byId("inputCIF").setValueState("Error");
            sError = true;
          } else {
            oView.byId("inputCIF").setValueState("None");
          }

          if (!sFechaInc && !sError) {
            oView.byId("inputFechaInc").setValueState("Error");
            sError = true;
          } else {
            oView.byId("inputFechaInc").setValueState("None");
          }

          //this.getView().getModel().setProperty("/_StatusPaso2", !sError);
          this.getView().getModel().setProperty("/_fechaInc", sFechaInc);

          //this._model._fechaInc = sFechaInc;

          //this._StatusPaso2 = !sError;
          this._model._StatusPaso2 = !sError;

          var oWizardStep = this.byId("wizardPaso2");
          oWizardStep.setValidated(!sError);
        },

        validarDNI : function (oEvent) {
          var dni = oEvent.getParameter("value");
          var number;
          var letter;
          var letterList;
          var regularExp = /^\d{8}[a-zA-Z]$/;
          
          //Se comprueba que el formato es válido
          if (regularExp.test(dni) === true) {
            //Número
            number = dni.substr(0, dni.length - 1);
            //Letra
            letter = dni.substr(dni.length - 1, 1);
            number = number % 23;
            letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
            letterList = letterList.substring(number, number + 1);
            if (letterList !== letter.toUpperCase()) {
              this._model.setProperty("/_StatusDNI","Error");
            } else {
              this._model.setProperty("/_StatusDNI","None");
              this.validarDatos();
            }
          } else {
            this._model.setProperty("/_StatusDNI","Error");
          }
          
        },

        cancelar : function () {
          var oResourceBundle = this.oView.getModel("i18n").getResourceBundle();
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

          MessageBox.confirm(oResourceBundle.getText("deseaCancelar"), {
            onClose : function (oDecision) {
              if (oDecision === "OK") {

                this._wizard.discardProgress(this._wizard.getSteps()[0]);
                this._wizard.goToStep(this._wizard.getSteps()[0]);

                oRouter.navTo("Menu", {}, true);
              }
            }.bind(this)
          })
        },

        wizardCompletedHandler : function () {
         
         // this.validarDatos(oEvent,function(){
         //   if(isValid){
              var wizardNavContainer = this.byId("wizardNavContainer");
              wizardNavContainer.to(this.byId("wizardReviewPage"));
              var uploadCollection = this.byId("uploadCollection");
              var files = uploadCollection.getItems();
              var numFiles = uploadCollection.getItems().length;
              this._model.setProperty("/_numFiles",numFiles);
              if (numFiles > 0) {
                var arrayFiles = [];
                for(var i in files){
                  arrayFiles.push({DocName:files[i].getFileName(),MimeType:files[i].getMimeType()});	
                }
                this._model.setProperty("/_files",arrayFiles);
              }else{
                this._model.setProperty("/_files",[]);
              }
          //  }else{
          //    this._wizard.goToStep(this.byId("dataEmployeeStep"));
          //  }
         // }.bind(this));
        },

        guardarEmpleado : function () {
          const oData = this.getView().getModel().getData();
          const body = {};
          var sFechaInc = this.getView().byId("inputFechaInc").getDateValue();
          // Recorrer los campos del objeto json, excluyendo aquellos que empiezan con "_"

          if (oData._tipo === "1") {
            body.Dni = oData._CIF;
          } else {
            body.Dni = oData._DNI;
          }

          body.Type = oData._tipo;
          body.FirstName = oData._Nombre;
          body.LastName = oData._Apellido;
          body.CreationDate = sFechaInc;
          body.Comments = oData._Comentario;

          body.SapId = this.getOwnerComponent().SapId;
          body.UserToSalary = [{
            Amount: parseFloat(oData._salario).toString(),
            Comments: oData._Comentario,
            Waers: "ARS"
          }];

          this.getView().getModel("empleadosModel").create("/Users", body, {
            success: function(data){
              this._employeeId = data.EmployeeId;

              this.onStartUpload();

              sap.m.MessageBox.information(
                this.oView.getModel("i18n").getResourceBundle().getText("empleadoNuevo") + ": " + this._employeeId, {
                onClose: () => {
                  this.byId("wizardNavContainer").back();
                  this._wizard.discardProgress(this._wizard.getSteps()[0]);
                  this._wizard.goToStep(this._wizard.getSteps()[0]);
                  UIComponent.getRouterFor(this).navTo("Menu", {}, true);;
                }
              }
              );
            }.bind(this),
            error: (e) => {
              MessageBox.error(e);
            }
          });
        },

        
        editarPaso1 : function (){
        var oPaso1 = this.byId("wizardPaso1");
        this._wizard.setCurrentStep(oPaso1);
        this._wizard.goToStep(oPaso1);
        this.byId("wizardNavContainer").back();
        },
        
        editarPaso2 : function (){
          var oPaso2 = this.byId("wizardPaso2");
          this._wizard.setCurrentStep(oPaso2);
          this._wizard.goToStep(oPaso2);
          this.byId("wizardNavContainer").back();
        },
        
        editarPaso3 : function (){
          var oPaso3 = this.byId("wizardPaso3");
          this._wizard.setCurrentStep(oPaso3);
          this._wizard.goToStep(oPaso3);
          this.byId("wizardNavContainer").back();
        },


      });
    }
  );
  