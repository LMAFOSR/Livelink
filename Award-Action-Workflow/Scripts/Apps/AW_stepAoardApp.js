define(["jquery"
    , generalVariablesApp
    , variablesObjectInitiate
    , coreAppURL
], function () {

    return {

        stepAoardSetDates: function () {

            var data;
            var dfd;
            var xogUpdate;

            if (coreVariables.clickedButton.attr("name") == "AOARD Upload Award") { // Step 16
					 xogUpdate = '{ "award_profile": [{ "code":"' + coreVariables.ActionWFVars.FK_AWARD_PROFILE_CODE + '", "x_parentcodeval_X":"' +
                                 coreVariables.ActionWFVars.FK_PROJECT_CODE + '", "afosr_pk_rec_date": "' + formatDateWithTimeForXOG(new Date())
								                                            + '", "afosr_package_date": "' + formatDateWithTimeForXOG(new Date())
								  + '" }] }'
			
			               

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
                        console.log("Finished stepAoardSetBuyerCompleteDate ... ");
                        for (n in results) {
                            console.log("" + n + ": " + results[n]);
                        }
                    }
                )
                .fail(
                    function (results) {
                        console.log("FAILED stepAoardSetBuyerCompleteDate ... ");
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
