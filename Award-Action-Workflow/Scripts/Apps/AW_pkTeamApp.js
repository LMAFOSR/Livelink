define(["jquery", "jqueryui"
   , generalVariablesApp
   , variablesObjectInitiate
   , coreAppURL
   , validationAppURL
], function () {

    var retrievePKTeam, setUpPKTeam, setUpPKTeamControls, pktCheckComplete, pktValidateSave, pktUpdateClarity;

    retrievePKTeam = function (data) {

        var dfd = new jQuery.Deferred();

        $.ajax({
            url: "/livelink/llisapi.dll"
        , data: data
        , type: "POST"
        , success: function (data) {
            $("#pkTeamHolder").append(data);
            dfd.resolve();
        }
        , error: function () {
            alert("PK Team failed to load");
            dfd.reject();
        }
        });

        return dfd.promise();
    };

    setUpPKTeam = function () {

        $('.pktSaveType').button().button("disable");

        setUpPKTeamControls();

        // Turn on our validation for the form
        $("#pktForm").rsValidator();

        // Put up the complete/incomplete message
        pktCheckComplete();

        $('.pktSaveTeam').button("enable");


        // Send save now to LL in case user exits step without saving -> make sure the value in LL is updated to match Clarity
        if (window.activeWorkflow) {
            var pkTeamTEAM = $("#assignedPKT").attr("TEAM");

            if (pkTeamTEAM == "" || typeof (pkTeamTEAM) != undefined || pkTeamTEAM != null) {
                pktUpdate(pkTeamTEAM);
            }
        }
    };

    setUpPKTeamControls = function () {

        $(".pktSaveTeam").button().button("disable");
        $(".pktSaveTeam")
        .off("click.pkt") // Remove the click func, since the save button lasts between refreshes
        .on(
            "click.pkt"
            , function () {
                pktSave("tab");
            }
        );

        $(".selPKT.selectGroupIcon").on("click", function () {

            var ctrl = $(this);
            var newTeam = ctrl.attr("TEAM");
            var origTeam = $("#assignedPKT").attr("TEAM");

            if (newTeam != origTeam) {

                $(".awButton,.pktSaveTeam").button("disable");

                $(".selPKT.selectPersonTitle").removeClass("selectPersonSelected"); // remove selectedness from all teams
                ctrl.prev().addClass("selectPersonSelected"); // add selectedness to the selected team
                $("#assignedPKT").removeClass("awFieldIncomplete invalid personNotSelectedMessage").addClass("personSelectedMessage awFieldComplete").text(newTeam).attr("TEAM", newTeam);

                $.when(pktUpdateClarity(newTeam), pktUpdate(newTeam))
                .done(function () {

                    pktCheckComplete();
                })
                .always(function () {
                    $(".awButton,.pktSaveTeam").button("enable");
                });
            }
            else {
                $(".awButton,.pktSaveTeam").button("enable");
            }
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////
    //
    // validate/save for pkt Tab
    //
    ////////////////////////////////////////////////////////////////////////////////////////////

    pktCheckComplete = function () {
        var complete = $("#pktForm").rsValidator('completed');
    };

    pktValidateSave = function () {

        var valid;
        var section = $("#pktForm");


        if (coreVariables.devServer) {
            $("#pktForm").rsValidator('missingNames');
        }

        return $("#pktForm").rsValidator("validated");
    };

    pktUpdate = function (pkt) {

        var teamData = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objid": coreVariables.AW_U_RS_ACTION_WF_PK_TEAM
            , "inputLabel1": $("#actionWFRS_ACTION_WF_ID").val()
            , "inputLabel2": pkt
        };

        var deferredAjaxResult = $.ajax({
            url: "/livelink/llisapi.dll",
            data: teamData,
            type: "POST"
        });

        deferredAjaxResult.done(function (updateReturn) {

            genericAjaxInsUpdDelErrHandling(updateReturn)
            .fail(function (result) {
                alert("Error saving in pktUpdate");
            })
            .done(function (result) {
                $("#actionWFPK_TEAM").val(pkt);
                coreVariables.ActionWFVars.PK_TEAM = pkt;
            });
        });

        return deferredAjaxResult;
    };

    ////////////////////////////////////////////////////////////////////////////////////////////
    //
    // call LL to XOG the new val to clarity and create folders if necessary
    //
    ////////////////////////////////////////////////////////////////////////////////////////////

    pktUpdateClarity = function (pkt) {

        var xogUpdate = '{ "project": [{ "code": "' + coreVariables.ActionWFVars.FK_PROJECT_CODE + '", "X_PROJNAME_X": "' + coreVariables.ActionWFVars.FK_PROJECT_NAME + '", "afosr_pkteam": "' + pkt + '" }] }'

        var data = {
            "func": "cwewfeventscript.xogwrite",
            "jsondata": xogUpdate
        };

        return $.ajax({
            url: "/livelink/llisapi.dll"
            , type: "POST"
            , data: data
            , jsonp: null
            , jsonpCallback: null
            , success: function (results) {
                console.log("Finished pktSave ... ");
                for (n in results) {
                    console.log("" + n + ": " + results[n]);
                }
            }
            , fail: function (results) {
                console.log("FAILED pktSave ... ");
                for (n in results) {
                    console.log("" + n + ": " + results[n]);
                }
            }
        });
    };

    //START APPLICATION HERE !!!!!!

    if ($("#pkTeamHolder").length == 1) {
        retrievePKTeam({
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_PK_TEAM_00_V2
            , "CurPKT": coreVariables.GenSelectVars.PK_TEAM
        }).done(setUpPKTeam);

        coreVariables.stepValidator.add(
        {
            "tabName": "PK Team"
            , "validationMethod": pktValidateSave
        });
    }

});
