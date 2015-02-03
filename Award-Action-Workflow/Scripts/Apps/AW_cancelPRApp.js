define(["jquery",
    generalVariablesApp
    , variablesObjectInitiate], function () {

        window.cancelPRVariables = {
            "cancellable": false
            , "cancelled": false
        };


        function displayCancelPR() {

            var dfd, stepNumber = coreVariables.stepNumber;

            if (stepNumber === "07" || stepNumber === "08" || stepNumber === "09") {
                dfd = testStep5Completion(coreVariables.workID, coreVariables.ActionWFVars.RS_ACTION_WF_ID)
            }
            else {
                dfd = new jQuery.Deferred().resolve().promise();
            }

            cancelPRSetup();

            return dfd;
        }

        function testStep5Completion(workID, WF_ID) {

            var dfd = new jQuery.Deferred();

            completionData = {
                "func": "ll"
                , "objAction": "RunReport"
                , "objID": coreVariables.AW_SEL_RS_WF_AUDIT_LOG_BY_WF_STEP
                , "inputLabel1": workID
                , "inputLabel2": WF_ID
                , "inputLabel3": "PA Uploads Certified Funding Documents"
            };

            $.ajax({
                url: "/livelink/llisapi.dll"
                , data: completionData
                , type: "POST"
                , async: true
                , dataType: 'json'
                , jsonp: null
                , jsonpCallback: null
            }).done(function (resultData) {

                if (resultData.nothing == "noResults") {
                    $("#cancelPR").hide();
                }
                else if (resultData.myRows.length >= 1) {
                    if (resultData.myRows[0].BUTTON_NAME.search("Certified") == 0) {
                        $("#cancelPR").hide();
                    }
                    else {
                        cancelPRVariables.cancellable = true;
                    }
                }

                dfd.resolve();

            }).fail(function (resultData) {
                console.log("FAILED from testStep5Completion");
                dfd.resolve();
            });

            return dfd.promise();
        }

        return { displayCancelPR: displayCancelPR, testStep5Completion: testStep5Completion };
    })

function cancelPRSetup() {

    $("#cancelPR").button();

    // if this ghost text changes, change it down in function cancelPRSend()
    $("#cancelPR_Reason").ghostText({ ghostText: "Please enter the text of the PK cancellation memo", autoExpand: false })

    $("#cancelPRDialog").dialog({
        autoOpen: false
        , modal: true
        , resizable: false
        , width: 860
        , buttons: [
              { text: "Cancel", click: cancelPRCancel, id: "cancelPRCancelButton" }
              , { text: "Send Cancellation", click: cancelPRSend, id: "cancelPRSendButton" }]
        , create: fixDialogUI
        , close: cancelPRCancel
    });

    // if user clicks cancel button, pop the dialog
    $("#cancelPR")
    .on(
        "click"
        , function () {
            // set dialog values to initial state
            $("#cancelPR_pnum").html(coreVariables.GenSelectVars.AWARD_PROPOSAL_NBR)
            $("#cancelPR_anum").html(coreVariables.GenSelectVars.AWARD_NUMBER);
            $("#cancelPR_title").html(coreVariables.GenSelectVars.AWARD_TITLE);
            $("#cancelPR_inst").html(coreVariables.GenSelectVars.INST_NAME);
            $("#cancelPR_PI").html(coreVariables.GenSelectVars.PI);
            $("#cancelPR_Reason").text("");
            $("#cancelPR_Reason").trigger('focusout'); // preload the ghostText
            $("#versionFile").val("");

            //open it
            $("#cancelPRDialog").dialog("open");
        });
}

function cancelPRCancel() {
    $("#cancelPRDialog").dialog("close");
}

function cancelPRSend() {
    var why = $("#cancelPR_Reason").text();
    var email = $("#versionFile").val();

    $(".awButton,.saveTabButton,#cancelPRCancelButton,#cancelPRSendButton").button("disable");

    // don't let ghost text count as text.
    if (why == "Please enter the text of the PK cancellation memo") {
        why = "";
    }

    if ((why.length > 0) && (email.length > 0)) {

        coreVariables.description = why; //OH WHY OH WHY AM I NAMED WHY

        $.when(cancelPRGeneratePDF(), cancelPRSendEmail(), cancelPRPushDoc())
        .done(function () {

            var cancelledValue = $("#cancelPR").attr("name"); //MAP I NEED TO KNOW WHO SENT THE STEP

            alert("Please make any required changes to the Clarity Project and Award Profile at this time.");
            coreVariables.clickedButton = $("#cancelPR");
            cancelPRVariables.cancelled = true;
            coreVariables.ActionWFVars.EVAL_NEXT_STEP = cancelledValue;
            $("#actionWFEVAL_NEXT_STEP").val(cancelledValue);

            $("#cancelPRDialog").dialog("close");
            // all our hooks are in place...let's go!
            sendStepOn();
        })
        .fail(function () {

            alert("Errors prevented the cancellation of the PR. Please contact the help desk.")
            $(".awButton,.saveTabButton,#cancelPRCancelButton,#cancelPRSendButton").button("enable");
        });
    }
    else if ((why.length == 0) && (email.length == 0)) {
        alert("Please specify a reason for cancellation, and add the email from the PO requesting cancellation.");
        $(".awButton,.saveTabButton,#cancelPRCancelButton,#cancelPRSendButton").button("enable");
    }
    else if ((why.length == 0) && (email.length > 0)) {
        alert("Please specify a reason for cancellation.");
        $(".awButton,.saveTabButton,#cancelPRCancelButton,#cancelPRSendButton").button("enable");
    }
    else if ((why.length > 0) && (email.length == 0)) {
        alert("Please add the email from the PO requesting cancellation.");
        $(".awButton,.saveTabButton,#cancelPRCancelButton,#cancelPRSendButton").button("enable");
    }
}

function cancelPRGeneratePDF() {

    var rDFD = new jQuery.Deferred();
    var now = new Date();
    var ts = "" + now.getFullYear() +
            ((now.getMonth() < 9) ? "0" + (now.getMonth() + 1) : now.getMonth() + 1) +
            ((now.getDate() < 10) ? "0" + (now.getDate()) : now.getDate()) +
            ((now.getHours() < 10) ? "0" + (now.getHours()) : now.getHours()) +
            ((now.getMinutes() < 10) ? "0" + (now.getMinutes()) : now.getMinutes());
    var seqSendData = {
        "func": "cwewfeventscript.jrPDFfromLRToAttachmentsFolder"
            , "workid": coreVariables.workID
            , "subworkid": coreVariables.subWorkID
			, "lrnick": "Select_Email_PR_Cancelled"
            , "templatenick": "AW_CANCEL_PR_jasper"
            , "PDFOutputName": "PR Cancellation Memo " + ts + ".pdf"
            , "folfiltertype": "STARTS"
            , "folfilterval": "Correspondence"
            , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
            , "inputLabel2": $("#cancelPR_Reason").text()
            , "inputLabel3": coreVariables.currentUserName
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
        , data: seqSendData
        , type: "POST"
    })
    .done(function (result) {

        if (result.Ok) {
            console.log("cancelPRGeneratePDF() Generated into attachments folder.");
            rDFD.resolve();
        }
        else {
            console.log("Arg, cancelPRGeneratePDF failed: " + result.ErrMsg);
            rDFD.reject();
        }
    })
    .fail(function (refreshData) {

        alert("huh? ajax call in cancelPRGeneratePDF failed??: " + stringify(seqSendData));
        rDFD.reject();
    });

    return rDFD.promise();
}

function cancelPRPushDoc() {

    $("#cancelPRUploadForm").submit();

    return new jQuery.Deferred().resolve().promise();
}

var cprEntityMap = {
    "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': '&quot;'
    , "'": '&#39;'
    , "/": '&#x2F;'
	, "\n": '<br />'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]|[\n]/g, function (s) {
        return cprEntityMap[s];
    });
}

function cancelPRSendEmail(sendOn) {

    var dfd;
    var emailData;
    var reasonText;

    dfd = new jQuery.Deferred();
    reasonText = $("#cancelPR_Reason").text();

    emailData = {
        "func": "ll"
        , "objAction": "RunReport"
        , "objID": coreVariables.AW_EMAIL_PR_CANCELLED_GENERATOR
        , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
        , "inputLabel2": escapeHtml(reasonText)
        , "inputLabel3": coreVariables.currentUserName
    };

    dfd = $.ajax({
        url: "/livelink/llisapi.dll"
        , data: emailData
        , type: "POST"
        , done: function (data) {
            dfd.resolve();
        }
        , fail: function () {
            alert("Failure sending message that PR is cancelled");
            dfd.reject();
        }
    });

    return dfd.promise();
}
