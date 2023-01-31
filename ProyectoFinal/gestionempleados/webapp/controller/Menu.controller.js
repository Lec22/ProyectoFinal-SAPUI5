sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     * @param {typeof sap.ui.core.UIComponent} UIComponent
     * @param {typeof sap.m.library} library
     */
    function (Controller, UIComponent, library) {
        "use strict";

        return Controller.extend("logaligroup.gestionempleados.controller.Menu", {
            onInit: function () {
                
            },

            onBeforeRendering : function () {
            },

            irACrearEmpleado : function () {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("CrearEmpleado", {}, false);
            },

            irAVerEmpleados : function () {
                var oRouter = UIComponent.getRouterFor(this);

                oRouter.navTo("VerEmpleados", {}, false);
            },


            irAFirmarPedido : function () {
                var sURL = this.getOwnerComponent().FirmarPedidosURL;
                var { URLHelper } = library;
                URLHelper.redirect(sURL);
            }

        });
    });
