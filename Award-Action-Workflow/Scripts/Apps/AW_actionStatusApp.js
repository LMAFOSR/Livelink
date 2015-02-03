define(["jquery", "jqueryui"
    , generalVariablesApp
    , variablesObjectInitiate], function () {

        setUpActionStatus(window.activeWorkflow);
    });

function setUpActionStatus(activeWorkflow) {

    var AP_MOD_TYPE;

    // OPENNING A STEP OUTSIDE WORKFLOW - DON'T UPDATE CLARITY ACTION STATUS
    if ((!activeWorkflow) || isNaN(parseInt(coreVariables.stepNumber))) {
        return;
    }

    if (coreVariables.GenSelectVars.AP_MOD_TYPE == "admin") { AP_MOD_TYPE = "admin" }
    else { AP_MOD_TYPE = void 0 }

    onLoadSetActionStatus(coreVariables.stepNumber, AP_MOD_TYPE)().executeUpdate(coreVariables.ActionWFVars.FK_PROJECT_CODE, coreVariables.ActionWFVars.FK_AWARD_PROFILE_CODE);
}

function onLoadSetActionStatus(stepName, AP_MOD_TYPE) {

    //stepName, AP_MOD_TYPE
    return function () {

        var holdActionStatus;

        if (stepName == "01" && typeof (AP_MOD_TYPE) == "undefined") { holdActionStatus = "in_progress_po"; }
        if (stepName == "03" && typeof (AP_MOD_TYPE) == "undefined") { holdActionStatus = "in_progress_scheduler"; }
        if (stepName == "08" && AP_MOD_TYPE == "admin") { holdActionStatus = "in_progress_buyer"; }
        if (stepName == "16" && typeof (AP_MOD_TYPE) == "undefined") { holdActionStatus = "in_progress_rpf_wait_for_cert"; }
        if (stepName == "16" && AP_MOD_TYPE == "admin") { holdActionStatus = "in_progress_buyer"; }

        if (typeof (holdActionStatus) == "string") {
            return {
                actionStatus: holdActionStatus
                , executeUpdate: function wrapUdate(FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID) {
                    return UpdateActionStatus(holdActionStatus, FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID)
                }
            };
        }
        else {
            return { actionStatus: void 0, executeUpdate: function () { dfd = new jQuery.Deferred(); return dfd.resolve().promise(); } };
        }
    }
}

function runProcessActionStatus() {
    // 2014-05-14 Todd; to be able to fill out cost & tech eval from an Idea, rather than a workflow, some stuff needs to be disabled if we're not in a workflow

    var dfd;
    var EVAL_NEXT_STEP;

    // If we're not in a wf, no need to set Status
    if (!isNaN(parseInt(coreVariables.stepNumber))) {
        EVAL_NEXT_STEP = coreVariables.ActionWFVars.EVAL_NEXT_STEP.replace("PK Review - ", "").replace("PO - ", "").replace("PA - ", "")

        dfd = processActionStatus(coreVariables.stepNumber, $(coreVariables.clickedButton).text(), coreVariables.ActionWFVars.FK_PROJECT_CODE, coreVariables.ActionWFVars.FK_AWARD_PROFILE_CODE, coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID, coreVariables.workID, EVAL_NEXT_STEP, coreVariables.ActionWFVars.ACTION_TYPE);
    }
    else {
        dfd = new jQuery.Deferred().resolve().promise();
    }

    return dfd;
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 1. processActionStatus is called with all the parameters injected
// 2. Call when 
//   2.A.  1st parameter is the projectID and the programID that will be used for executeUpdate = argument[0]
//   2.B.  Rest of the parameters are differenet methods for determining ActionStatus value - all of them will be called only one will be applicable to the step and button
//     2.B.A.  The function that will be applicable will return a JSON object with the ActionStatus value and a function executeUpdate
//     2.B.B.  executeUpdate must return a deferred.promise()
//     2.B.C   For all but step 2 executeUpdate will wrap UpdateActionStatus(newActionStatus, FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID)
//   2.C.  when is resolved loops through each of the arguments passed in to run executeUpdates
//     2.C.A. executeUpdates is run and the final deferred is resolved so exit function

function processActionStatus(stepNum, buttonText, FK_PROJECT_CODE, FK_AWARD_PROFILE_CODE, FK_CLARITY_PROFILE_ID, VOLUMEID, EVAL_NEXT_STEP, ACTION_TYPE) {

    var dfd = new jQuery.Deferred();

    $.when({ FK_PROJECT_CODE: FK_PROJECT_CODE, FK_AWARD_PROFILE_CODE: FK_AWARD_PROFILE_CODE }
        , onSaveUpdateActionTypePK(stepNum, buttonText, FK_CLARITY_PROFILE_ID)
        , onSaveNoStatusChange(stepNum)
        , onSaveUpdateActionTypeStep5(stepNum, VOLUMEID, ACTION_TYPE)
        , onSaveUpdateActionTypeReviewStep(stepNum, EVAL_NEXT_STEP, FK_CLARITY_PROFILE_ID, VOLUMEID)
        , onSaveUpdateActionStandardStep(stepNum, buttonText)).then(function (results) {

            var updateParameters, indexArguments = 1, execution = false;

            updateParameters = arguments[0];

            for (; indexArguments < arguments.length; indexArguments++) {

                if (arguments[indexArguments].hasOwnProperty("executeUpdate")) {
                    arguments[indexArguments].executeUpdate(arguments[0].FK_PROJECT_CODE, arguments[0].FK_AWARD_PROFILE_CODE).done(function (data) { dfd.resolve(); });
                    execution = true;
                }
            }

            if (!execution) {
                alert("Action Status failed to have an executeUpdate() after finishing process.  Check conditions");
            }
        });

    return dfd.promise();
}

function onSaveNoStatusChange(stepName) {

    var dfd, executeUpdate;

    dfd = new jQuery.Deferred();

    if (stepName == "02" || stepName == "18" || stepName == "19") {

        executeUpdate = { actionStatus: "NO STATUS", executeUpdate: function wrapUdate(FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID) { var dfd = new jQuery.Deferred(); return dfd.resolve().promise(); } };
    }
    else {
        executeUpdate = { actionStatus: void 0 }; // I think this will cause a problem may need above solution
    }

    return dfd.resolve(executeUpdate).promise();
}

function onSaveUpdateActionTypePK(stepName, buttonText, FK_CLARITY_PROFILE_ID) {

    var dfd, dfdFinal, stepNameFull = stepName, buttonTextFull = buttonText, FK_CLARITY_PROFILE_ID_FULL = FK_CLARITY_PROFILE_ID;

    dfd = new jQuery.Deferred();
    dfdFinal = new jQuery.Deferred();

    if (checkPKStep(stepNameFull)) {

        if (buttonTextFull == "File Award") { // No need to check to determine WF is still in FM
            dfd.resolve();
        }
        else {

            retrieveCurrentActionStatus(FK_CLARITY_PROFILE_ID_FULL).done(function (data) {

                if (changeActionStatus(data)) {
                    dfd.resolve();
                }
                else { dfd.reject(); }
            });
        }

        dfd.promise().then(function () {

            var newActionStatus = actionStatusValue(stepNameFull, buttonTextFull);

            var executeUpdate = {
                actionStatus: newActionStatus
            , executeUpdate: function wrapUdate(FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID) {
                return UpdateActionStatus(newActionStatus, FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID);
            }
            , processedBy: "onSaveUpdateActionTypePK"
            };

            dfdFinal.resolve(executeUpdate);

        }).fail(function () {
            dfdFinal.resolve({ actionStatus: void 0, executeUpdate: function () { dfd = new jQuery.Deferred(); return dfd.resolve().promise(); } });
        });
    }
    else {
        return dfdFinal.resolve({ actionStatus: void 0 }); // I think this will cause a problem may need above solution
    }

    return dfdFinal.promise();
}

function onSaveUpdateActionTypeStep5(stepName, VOLUMEID, ACTION_TYPE) {

    var dfd, dfdFinal, executeUpdate;

    dfd = new jQuery.Deferred();

    if (stepName == "05") {

        if (ACTION_TYPE === "non_contracting") {

            executeUpdate = {
                actionStatus: "in_progress"
            , executeUpdate: function wrapUdate(FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID) {
                return UpdateActionStatus("in_progress", FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID);
            }
            };

            dfd.resolve(executeUpdate);
        }
        else {
            retrievePKStep(VOLUMEID).then(function (data) {

                var executeUpdate = {
                    actionStatus: data
                , executeUpdate: function wrapUdate(FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID) {
                    return UpdateActionStatus(data, FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID);
                }
                };

                dfd.resolve(executeUpdate);
            }).fail(function () {
                dfd.resolve({ actionStatus: void 0 });
            });
        }
    }
    else {
        dfd.resolve({ actionStatus: void 0 });
    }

    return dfd.promise();
}

function onSaveUpdateActionTypeReviewStep(stepName, EVAL_NEXT_STEP, FK_CLARITY_PROFILE_ID, VOLUMEID) {

    var dfd, actionStatus, executeUpdate, dfdFinal;

    dfd = new jQuery.Deferred();
    dfdFinal = new jQuery.Deferred();

    if (checkReviewStep(stepName)) {

        if (EVAL_NEXT_STEP == "Team Lead") { actionStatus = "in_progress_team_lead" }
        if (EVAL_NEXT_STEP == "Buyer") { actionStatus = "in_progress_buyer" }
        if (EVAL_NEXT_STEP == "PK Officer") { actionStatus = "in_progress_pk_officer" }

        retrieveCurrentActionStatus(FK_CLARITY_PROFILE_ID).done(function (data) {

            if (changeActionStatus(data)) {

                if (stepName == "10" || stepName == "11" || stepName == "12") {

                    retrieveReviewStatus(VOLUMEID).done(function (data) {

                        var keepStatus = 0;

                        if (data.EVAL_DIVISION_REVIEW == "Yes") { keepStatus += 1; }
                        if (data.EVAL_LEGAL_REVIEW == "Yes") { keepStatus += 1; }
                        if (data.EVAL_POLICY_REVIEW == "Yes") { keepStatus += 1; }

                        if (keepStatus < 2) { dfd.resolve(); }
                        else { dfd.reject(); }
                    });
                }
                else {
                    dfd.resolve();
                }
            }
            else { dfd.reject(); }
        });

        dfd.promise().then(function () {

            var executeUpdate = {
                actionStatus: actionStatus
            , executeUpdate: function wrapUdate(FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID) {
                return UpdateActionStatus(actionStatus, FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID);
            }
            };

            dfdFinal.resolve(executeUpdate);

        }).fail(function () {
            dfdFinal.resolve({ actionStatus: void 0, executeUpdate: function () { dfd = new jQuery.Deferred(); return dfd.resolve().promise(); } });
        });
    }
    else {
        dfdFinal.resolve({ actionStatus: void 0 });
    }

    return dfdFinal.promise();
}

function onSaveUpdateActionStandardStep(stepName, buttonText) {

    var dfd, actionStatus, executeUpdate;

    dfd = new jQuery.Deferred();

    if (checkStandardStep(stepName)) {

        actionStatus = actionStatusValue(stepName, buttonText);

        executeUpdate = {
            actionStatus: actionStatus
            , executeUpdate: function wrapUdate(FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID) {
                return UpdateActionStatus(actionStatus, FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID);
            }
        };

        return dfd.resolve(executeUpdate);
    }
    else {
        dfd.resolve({ actionStatus: void 0 });
    }

    return dfd.promise();
}

function retrieveReviewStatus(VOLUMEID) {

    var dfd;

    dfd = new jQuery.Deferred();

    statusData = {
        func: "ll"
        , objAction: "RunReport"
        , objid: coreVariables.AW_REVIEW_STEPS_COMPLETE
        , inputLabel1: VOLUMEID
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
        , data: statusData
        , type: "POST"
        , dataType: 'json'
        , success: function (data) {
            if (data.hasOwnProperty("myRows")) {
                dfd.resolve(data.myRows[0]);
            }
            if (data.hasOwnProperty("nothing")) {
                dfd.resolve(data);
            }
        }
        , fail: function (data) {
            dfd.fail(data);
        }
    });

    return dfd.promise();
}

function retrievePKStep(VOLUMEID) {

    var dfd;

    dfd = new jQuery.Deferred();

    statusData = {
        func: "ll"
        , objAction: "RunReport"
        , objid: coreVariables.AW_CURRENT_PK_STEP
        , inputLabel1: VOLUMEID
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
        , data: statusData
        , type: "POST"
        , dataType: 'json'
        , success: function (data) {
            if (data.hasOwnProperty("myRows")) {
                dfd.resolve(data.myRows[0].CURRENT_STEP);
            }
            if (data.hasOwnProperty("nothing")) {
                dfd.resolve(data);
            }
        }
        , fail: function (data) {
            dfd.fail(data);
        }
    });

    return dfd.promise();
}

function retrieveCurrentActionStatus(FK_CLARITY_PROFILE_ID) {

    var dfd, statusData;

    dfd = new jQuery.Deferred();

    statusData = {
        func: "ll"
        , objAction: "RunReport"
        , objid: coreVariables.AW_CLARITY_ACTION_STATUS
        , inputLabel1: FK_CLARITY_PROFILE_ID
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
        , data: statusData
        , type: "POST"
        , dataType: 'json'
        , success: function (data) {
            if (data.hasOwnProperty("myRows")) {
                dfd.resolve(data.myRows[0].AFOSR_AMD_STAT);
            }
            else {
                dfd.fail(data);
            }
        }
        , fail: function (data) {
            dfd.fail(data);
        }
    });

    return dfd.promise();
}

// need to get from WF table current step
function UpdateActionStatus(actionStatus, FK_PROJECT_CODE, FK_CLARITY_PROFILE_ID) {

    var xogUpdate, data, dfd;

    dfd = new jQuery.Deferred();

    xogUpdate = {
        award_profile: [{
            code: FK_CLARITY_PROFILE_ID.toString()
            , x_parentcodeval_X: FK_PROJECT_CODE.toString()
            , afosr_amd_stat: actionStatus
        }]
    };

    data = {
        "func": "cwewfeventscript.xogwrite"
        , "jsondata": JSON.stringify(xogUpdate)
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
        , type: "POST"
        , data: data
        , success: function (results) {
            console.log("Finished setAwardStatus ... ");
            for (n in results) {
                console.log("" + n + ": " + results[n]);
            }
            dfd.resolve();
        }
        , fail: function (results) {
            dfd.fail();
        }
    });

    return dfd.promise();
}

// onSaveUpdateActionType - member
function checkPKStep(stepName, buttonText) {

    var checkStatus;

    if (buttonText == "File Award") {
        return false;
    }

    switch (stepName) {
        case "07":
            checkStatus = true;
            break;
        case "08":
            checkStatus = true;
            break;
        case "09":
            checkStatus = true;
            break;
        case "15":
            checkStatus = true;
            break;
        default:
            checkStatus = false;
    };

    return checkStatus;
}

function checkReviewStep(stepName) {

    var checkStatus;

    switch (stepName) {
        case "10":
            checkStatus = true;
            break;
        case "11":
            checkStatus = true;
            break;
        case "12":
            checkStatus = true;
            break;
        case "13":
            checkStatus = true;
            break;
        case "14":
            checkStatus = true;
            break;
        default:
            checkStatus = false;
    };

    return checkStatus;
}

function checkStandardStep(stepName) {

    var checkStatus;

    switch (stepName) {
        case "01":
            checkStatus = true;
            break;
        case "03":
            checkStatus = true;
            break;
        case "04":
            checkStatus = true;
            break;
        case "06":
            checkStatus = true;
            break;
        case "16":
            checkStatus = true;
            break;
        case "17":
            checkStatus = true;
            break;
        case "19":
            checkStatus = true;
            break;
        case "20":
            checkStatus = true;
            break;
        case "21":  // jhn
            checkStatus = true;
            break;			
        default:
            checkStatus = false;
    };

    return checkStatus;
}

// onSaveUpdateActionType - member
function changeActionStatus(currentActionStatus) {

    if (currentActionStatus == "in_progress_rpf_wait_for_cert") {
        return false;
    }

    if (currentActionStatus == "in_progress_rpf_creating_pr") {
        return false;
    }
    return true;
}

function actionStatusValue(stepName, buttonText) {

    if (stepName == "01") {

        if (buttonText.toUpperCase() == "Send to Scheduler".toUpperCase()) {
            return "in_progress_scheduler";
        }

        if (buttonText.toUpperCase() == "Send to PA".toUpperCase()) {
            return "in_progress_rpf_wait_for_cert";
        }
    }

    if (stepName == "03") {

        if (buttonText.toUpperCase() == "Send to RPF/PK".toUpperCase()) {
            return "in_progress_rpf_creating_pr";
        }

        if (buttonText.toUpperCase() == "Kick Back to PO".toUpperCase()) {
            return "in_progress_po";
        }
    }

    if (stepName == "04") {

        if (buttonText.toUpperCase() == "Send for Certification".toUpperCase()) {
            return "in_progress_rpf_wait_for_cert";
        }

        if (buttonText.toUpperCase() == "Kick Back to PO".toUpperCase()) {
            return "in_progress_returned_to_po";
        }
    }

    if (stepName == "06") {

        if (buttonText.toUpperCase() == "Return to PA".toUpperCase()) {
            return "in_progress_rpf_creating_pr";
        }
    }

    if (stepName == "07") {

        if (buttonText == "Send to Buyer") {
            return "in_progress_buyer";
        }

        if (buttonText == "Send for Review") {
            return "in_progress_div_policy_legal";
        }

        if (buttonText == "Kick Back to PO") {
            return "in_progress_returned_to_po";
        }

        if (buttonText == "Kick Back to PA") {
            return "in_progress_returned_to_pa";
        }
    }

    if (stepName == "08") {

        if (buttonText == "Send to PK Officer") {
            return "in_progress_pk_officer";
        }

        if (buttonText == "Kick Back to PO") {
            return "in_progress_returned_to_po";
        }

        if (buttonText == "Kick Back to PA") {
            return "in_progress_returned_to_pa";
        }
    }

    if (stepName == "09") {

        if (buttonText == "Send to Distribution") {
            return "in_progress_distribution";
        }

        if (buttonText == "Send for Review") {
            return "in_progress_div_policy_legal";
        }

        if (buttonText == "Kick Back to Buyer") {
            return "in_progress_buyer";
        }

        if (buttonText == "Kick Back to PO") {
            return "in_progress_returned_to_po";
        }

        if (buttonText == "Kick Back to PA") {
            return "in_progress_returned_to_pa";
        }
    }

    if (stepName == "15") {

        if (buttonText == "File Award") {
            return "executed";
        }

        if (buttonText == "Kick Back to Buyer") {
            return "in_progress_buyer";
        }

        if (buttonText == "Kick Back to PKO") {
            return "in_progress_pk_officer";
        }
    }

    if (stepName == "16") {

        if (buttonText.toUpperCase() == "Send for Certification".toUpperCase()) {
            return "in_progress_distribution";
        }
    }

    if (stepName == "17") {

        if (buttonText.toUpperCase() == "PR is Certified".toUpperCase()) {
            return "executed";
        }
    }

    if (stepName == "19") {

        if (buttonText.toUpperCase() == "File Documents".toUpperCase()) {
            return "executed";
        }
    }

    if (stepName == "20") {

        if (buttonText.toUpperCase() == "Funding Decommitted".toUpperCase()) {
            return "cancelled";
        }
    }
	
	if (stepName == "21") { // jhn

        if (buttonText.toUpperCase() == "Return to PA".toUpperCase()) {
			$("#actionWFEVAL_PA_KICKBACK_TO_PO").val(""); 
            return "in_progress_rpf_creating_pr";
        }
    }
}
