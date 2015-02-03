define(["jquery", "jqueryui"
    , generalVariablesApp
    , variablesObjectInitiate
    , coreAppURL
    , validationAppURL
], function () {

    retrievePKOfficer({
        "func": "ll"
        , "objAction": "RunReport"
        , "objID": coreVariables.AW_PK_OFFICER_V2_00
        , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        , "inputLabel2": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
    }).done(setUpPKOfficer);

    coreVariables.stepValidator.add(
        {
            "tabName": "PK Officer"
            , "validationMethod": pkoValidateSave
        }
    );
});

function retrievePKOfficer(data) {

    var dfd = new jQuery.Deferred();

    $.ajax({
        url: "/livelink/llisapi.dll"
    , data: data
    , type: "POST"
    , success: function (data) {
        $("#pkOfficerHolder").append(data);
        dfd.resolve();
    }
    , error: function () {
        alert("PK Officer failed to load");
        dfd.reject();
    }
    });

    return dfd.promise();
}

function setUpPKOfficer() {

    var pkOfficerKUAF_ID;

    $('.pkoSaveOfficer').button().button("disable");

    setUpPKOfficerControls();

    // Turn on our validation for the form
    $("#pkoForm").rsValidator();

    // Put up the complete/incomplete message
    pkoCheckComplete();

    $("#assignedPKOContent").show();

    $('.pkoSaveOfficer').button("enable");

    // Send save now to LL in case user exits step without saving -> make sure the value in LL is updated to match Clarity
    if (window.activeWorkflow) {
        pkOfficerKUAF_ID = $("#assignedPKO").attr("KUAF_ID");

        if (pkOfficerKUAF_ID == "" || typeof (pkOfficerKUAF_ID) != undefined || pkOfficerKUAF_ID != null) {
            pkoUpdate($("#assignedPKO").attr("KUAF_ID"));
        }
    }
}

function setUpPKOfficerControls() {

    $(".pkoSaveOfficer").button().button("disable");
    $(".selectPKOfficerAccordion").accordion({ collapsible: true, heightStyle: "content" });

    $(".selPKO.selectPersonIcon").on("click", function () {

        var ctrl, new_pko, new_KUAF_ID, new_CL_ID, orig_KUAF_ID

        $(".awButton,.pkoSaveOfficer").button("disable");

        $('.pkoSaveOfficer').removeClass('ui-state-focus ui-state-hover'); // workaround a jquery bug
        //$('.pkoSaveOfficer').removeClass('ui-state-hover');

        ctrl = $(this);
        new_pko = ctrl.prev().text();
        new_KUAF_ID = ctrl.attr("KUAF_ID");
        new_CL_ID = ctrl.attr("CL_ID");
        orig_KUAF_ID = $("#assignedPKO").attr("KUAF_ID");

        if (new_KUAF_ID != orig_KUAF_ID) {

            $(".selPKO.selectPersonTitle").removeClass("selectPersonSelected"); // remove selectedness from all officers
            ctrl.prev().addClass("selectPersonSelected"); // add selectedness to the selected officer
            $("#assignedPKO").removeClass("awFieldIncomplete invalid personNotSelectedMessage").addClass("personSelectedMessage awFieldComplete").text(new_pko).attr("KUAF_ID", new_KUAF_ID).attr("CL_ID", new_CL_ID);


            $.when(pkoUpdateClarity(), pkoUpdate(new_KUAF_ID))
            .done(function () {

                pkoCheckComplete();
            })
            .always(function () {
                $(".awButton,.pkoSaveOfficer").button("enable");
            });
        }
        else {
            $(".awButton,.pkoSaveOfficer").button("enable");
        }
    });

}

function pkoCheckComplete() {
    var complete = $("#pkoForm").rsValidator('completed');
}

////////////////////////////////////////////////////////////////////////////////////////////
//
// validate/save for pko Tab
//
////////////////////////////////////////////////////////////////////////////////////////////

function pkoValidateSave() {
    var valid;
    var section = $("#pkoForm");

    if (coreVariables.devServer) {
        $("#pkoForm").rsValidator('missingNames');
    }

    return $("#pkoForm").rsValidator("validated");
}

function pkoUpdate(KUAF_ID) {

    var officerData, deferredAjaxResult;

    officerData = {
        "func": "ll"
    , "objAction": "RunReport"
    , "objid": coreVariables.AW_U_RS_ACTION_WF_PK_OFFICER
    , "inputLabel1": coreVariables.workID
    , "inputLabel2": KUAF_ID
    };

    deferredAjaxResult = $.ajax({
        url: "/livelink/llisapi.dll",
        data: officerData,
        type: "POST"
    });

    deferredAjaxResult.done(function (updateReturn) {

        genericAjaxInsUpdDelErrHandling(updateReturn)
        .fail(function (result) {
            alert("Error saving in pkoUpdate");
        })
        .done(function (result) {
            $("#actionWFPK_OFFICER").val(KUAF_ID);
            coreVariables.ActionWFVars.PK_OFFICER = KUAF_ID;
        });
    });

    return deferredAjaxResult;
}

////////////////////////////////////////////////////////////////////////////////////////////
//
// call LL to XOG the new val to clarity and create folders if necessary
//
////////////////////////////////////////////////////////////////////////////////////////////

function pkoUpdateClarity() {

    //return new jQuery.Deferred().resolve().promise();

    var cl_id = $("#assignedPKO").attr("CL_ID");
    var xogUpdate = '{ "award_profile": [{ "code": "' + coreVariables.ActionWFVars.FK_AWARD_PROFILE_CODE + '", "x_parentcodeval_X": "' + coreVariables.ActionWFVars.FK_PROJECT_CODE + '", "afosr_pkoff": "' + $("#assignedPKO").attr("CL_ID") + '" }] }'
    //var xogUpdate = '{ "project": [{ "code": "' + coreVariables.ActionWFVars.FK_PROJECT_CODE + '", "name": "' + coreVariables.ActionWFVars.FK_PROJECT_NAME + '", "afosr_cont_type": "' + $("#ctContractType").val() + '" }] }'

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
            alert("Error saving in pkoUpdateClarity");
            for (n in results) {
                console.log("" + n + ": " + results[n]);
            }
        }
    });
}
