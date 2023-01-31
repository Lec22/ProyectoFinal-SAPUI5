/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "logaligroup/gestionempleados/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("logaligroup.gestionempleados.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            },

            SapId : "lcarretero@pampaenergia.com",
            FirmarPedidosURL : "https://c4aa9992trial-dev-mta-approuter.cfapps.us10-001.hana.ondemand.com/logaligroupemployees/index.html"
        });
    }
);