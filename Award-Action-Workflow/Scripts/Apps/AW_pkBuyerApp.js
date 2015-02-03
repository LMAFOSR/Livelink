define(["jquery", "jqueryui"
   , generalVariablesApp
   , variablesObjectInitiate
   , coreAppURL
   , validationAppURL
], function () {

    var retrievePKBuyer, buildPKTeams, retrievePKTeams, setUpAssignBuyer, assignBuyerControls, buyerBeforeOpen, buyerBeforeClose, chooseBuyer, highlightBuyer, validateTeamLeadStep, confirmBuyerSelected, updateBuyer, updateClarityBuyer;

    retrievePKBuyer = function (data) {

        var dfd = new jQuery.Deferred();

        $.ajax({
            url: "/livelink/llisapi.dll"
        , data: data
        , type: "POST"
        , success: function (data) {
            $("#pkBuyerHolder").append(data);
            //NOW SET OFF REACTION FOR TEAMS
            dfd.resolve();
        }
        , error: function () {
            alert("PK Buyer failed to load");
            dfd.reject();
        }
        });

        return dfd.promise();
    };

    buildPKTeams = function () {

        return $.when(retrievePKTeams("PK1"), retrievePKTeams("PK2"), retrievePKTeams("PK3"));
    };

    retrievePKTeams = function (PK_TEAM) {

        var dfd, pkTeamData;

        dfd = new jQuery.Deferred();

        pkTeamData = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_ASSIGN_BUYER_02
            , "PK_TEAM": PK_TEAM
        };

        $.ajax({
            url: "/livelink/llisapi.dll"
        , data: pkTeamData
        , type: "POST"
        , success: function (data) {
            $('[teamHolder="' + PK_TEAM + '"]').append(data)
            dfd.resolve();
        }
        , error: function () {
            alert("PK Team failed to load");
            dfd.reject();
        }
        });

        return dfd.promise();
    };

    setUpAssignBuyer = function () {

        $("#assignBuyerForm").rsValidator({ additionalValidationFunc: confirmBuyerSelected });
        assignBuyerControls();
        chooseBuyer();
        highlightBuyer();

        $("#buyerLoading").hide();
        $("#assignedBuyerContent, #buyerContent").show();

        if ($("#assignedBuyer").text() != "[Click the icon to next to the name to assign a buyer.]") {
            $("#abCompleteHolder").addClass("awCompleteBadge");
        }

        //update the buyer in LL on load because value is derived from Clarity only in workflow
        if (window.activeWorkflow) {
            updateBuyer($("#assignedBuyer").attr("selectedKUAF_ID"));
        }
    };

    assignBuyerControls = function () {

        $(".selectBuyerAccordion").accordion({ collapsible: true, heightStyle: "content" });

        //Before open must determine whether or not to trigger event to get buyer's actions
        $(".buyer.expandContract.ecContainer").expandContract({
            beforeOpen: buyerBeforeOpen
            , beforeClose: buyerBeforeClose
        });
    };

    buyerBeforeOpen = function (eventInitiator) {

        var dfd, buyerActionsData

        dfd = jQuery.Deferred();

        buyerActionsData = {
            "func": "ll"
        , "objAction": "RunReport"
        , "objid": coreVariables.AW_ASSIGN_BUYER_04
        , "inputLabel1": $(eventInitiator).parent().parent().find(".expandContract.buyer.selectPersonIcon").attr("KUAF_ID")
        };

        deferredAjaxResult = $.ajax({
            url: "/livelink/llisapi.dll"
            , data: buyerActionsData
            , type: "POST"
            , success: function (data) {

                $(eventInitiator).parent().parent().find(".ecContent").append(data);
                dfd.resolve();
            }
        });

        return dfd.promise();
    };

    buyerBeforeClose = function (eventInitiator) {

        dfd = jQuery.Deferred();
        $(eventInitiator).parent().parent().find(".expandContract.ecContent").empty();

        return dfd.resolve().promise();
    };

    chooseBuyer = function () {

        $(".buyer.selectPersonIcon").on("click", function () {

            //retrieve content first - send AJAX to get actions requires KUAF_ID

            var control = $(this).parent().find(".expandContract.ecTitle");
            var buyer = $(this).parent().find(".expandContract.ecTitle").text();
            var KUAF_ID = $(this).attr("KUAF_ID");
            var CL_ID = $(this).attr("CL_ID");
            var deferredList = [];

            $(".awButton").button("disable");

            deferredList.push(updateBuyer(KUAF_ID));
            deferredList.push(updateClarityBuyer(CL_ID)); //-- This is on hold

            $("#assignedBuyer").removeClass("personNotSelectedMessage awFieldIncomplete invalid").addClass("personSelectedMessage awFieldComplete").text(buyer).attr("KUAF_ID", KUAF_ID).attr("CL_ID", CL_ID);
            $("div.buyer.selectPersonTitle").removeClass("selectPersonSelected");
            $(control).addClass("selectPersonSelected");

            $.when.apply($, deferredList).done(function () {

                $(".awButton").button("enable");

                $("#assignBuyerForm").rsValidator("completed");
            });
        });
    };

    highlightBuyer = function () {

        var selectedKUAF_ID = $("#assignedBuyer").attr("selectedKUAF_ID");

        $("#buyerContent [KUAF_ID=" + selectedKUAF_ID + "]").parent().find(".selectPersonTitle").addClass("selectPersonSelected");
    };

    validateTeamLeadStep = function () {

        return $("#assignBuyerForm").rsValidator("validated");
    };

    confirmBuyerSelected = function (validatorSettings) {

        if ($("#assignedBuyer").text() == "[Click the icon to next to the name to assign a buyer.]" || $("#assignedBuyer").text().length == 0) {
            $("#assignedBuyer").addClass("awFieldIncomplete").removeClass("awFieldComplete");
            if (validatorSettings.usingInvalid) {
                $("#assignedBuyer").addClass("invalid");
            }
            return false;
        }
        else {
            $("#assignedBuyer").addClass("awFieldComplete").removeClass("awFieldIncomplete invalid");
            return true;
        }
    };

    updateBuyer = function (KUAF_ID) {

        var buyerData, deferredAjaxResult;

        buyerData = {
            "func": "ll"
        , "objAction": "RunReport"
        , "objid": coreVariables.AW_U_RS_ACTION_WF_Buyer ////I NEED TO BE UPDATED
        , "inputLabel1": $("#actionWFRS_ACTION_WF_ID").val()
        , "inputLabel2": KUAF_ID
        };

        deferredAjaxResult = $.ajax({
            url: "/livelink/llisapi.dll",
            data: buyerData,
            type: "POST"
        });

        deferredAjaxResult.done(function (updateReturn) {

            genericAjaxInsUpdDelErrHandling(updateReturn).fail(function (result) {
                alert("Error saving in updateBuyer");
            });
            $("#actionWFBUYER").val(KUAF_ID);
            coreVariables.ActionWFVars.BUYER = KUAF_ID;
        });

        return deferredAjaxResult;
    };

    updateClarityBuyer = function (CL_ID) {

        var xogUpdate = '{ "award_profile": [{ "code": "' + coreVariables.ActionWFVars.FK_AWARD_PROFILE_CODE + '", "x_parentcodeval_X": "' + coreVariables.ActionWFVars.FK_PROJECT_CODE + '", "afosr_pk_buyer": "' + CL_ID + '" }] }'

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
                for (n in results) {
                    console.log("" + n + ": " + results[n]);
                }
            }
            , fail: function (results) {
                console.log("FAILED updateClarityBuyer ... ");
                for (n in results) {
                    console.log("" + n + ": " + results[n]);
                }
            }
        });
    };

    //START APPLICATION HERE!!!!
    retrievePKBuyer({
        "func": "ll"
        , "objAction": "RunReport"
        , "objID": coreVariables.AW_ASSIGN_BUYER_V2_00
        , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        , "inputLabel2": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
    }).done(function () {
        buildPKTeams().done(setUpAssignBuyer);
    });

    // Register to validate tab on send-on
    coreVariables.stepValidator.add(
    {
        "tabName": "Assign Buyer"
        , "validationMethod": validateTeamLeadStep
    });
});
