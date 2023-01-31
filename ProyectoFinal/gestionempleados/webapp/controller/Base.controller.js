sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(Controller) {
      "use strict";
  
      return Controller.extend("logaligroup.gestionempleados.controller.Base", {
        onInit() {
        },

        onFileChange : function (oEvent) {

            var oToken =  new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: this.getView().getModel("empleadosModel").getSecurityToken()
               });

            oEvent.getSource().addHeaderParameter(oToken);
        },

        onFileBeforeUpload : function (oEvent) {
              var fileName = oEvent.getParameter("fileName");
              var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                  name: "slug",
                  value: this.getOwnerComponent().SapId+";"+this._employeeId+";"+fileName
              })

              oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
        },

        onStartUpload : function () {
            this.getView().byId("uploadCollection").upload();
        },

        onFileDeleted: function (oEvent) {
          var oUploadCollection = oEvent.getSource();
          var sPath = oEvent.getParameter("item").getBindingContext("empleadosModel").getPath();
          this.getView().getModel("empleadosModel").remove(sPath, {
              success: function () {
                  oUploadCollection.getBinding("items").refresh();
              },
              error: function () {

              }
          });
      },

      onFileUploadComplete: function (oEvent) {
        oEvent.getSource().getBinding("items").refresh();
      },
        
      });
    }
  );
  