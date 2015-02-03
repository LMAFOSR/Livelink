define(["jquery"
    , generalVariablesApp
    , variablesObjectInitiate
    , coreAppURL
], function () {

    return {

        step8SetBuyerCompleteDate: function () {

            var data;
            var dfd;
            var xogUpdate;

            if (coreVariables.clickedButton.attr("name") == "PK Officer") {
                xogUpdate = '{ "award_profile": [{ "code":"' + coreVariables.ActionWFVars.FK_AWARD_PROFILE_CODE + '", "x_parentcodeval_X":"' +
                                 coreVariables.ActionWFVars.FK_PROJECT_CODE + '", "afosr_ap_dbc": "' + formatDateWithTimeForXOG(new Date()) + '" }] }'

                data = {
                    "func": "cwewfeventscript.xogwrite"
                    , "jsondata": xogUpdate
                };

                dfd = $.ajax({
                    url: "/livelink/llisapi.dll"
                    , type: "POST"
                    , data: data
                    , jsonp: null
                    , jsonpCallback: null
                });

                dfd
                .done(
                    function (results) {
                        console.log("Finished step8SetBuyerCompleteDate ... ");
                        for (n in results) {
                            console.log("" + n + ": " + results[n]);
                        }
                    }
                )
                .fail(
                    function (results) {
                        console.log("FAILED step8SetBuyerCompleteDate ... ");
                        for (n in results) {
                            console.log("" + n + ": " + results[n]);
                        }
                    }
                );
            }
            else {
                dfd = new jQuery.Deferred().resolve();
            }

            return dfd.promise();
        }
    }

})
