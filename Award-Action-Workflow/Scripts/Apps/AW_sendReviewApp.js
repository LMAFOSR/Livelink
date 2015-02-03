define(["jquery", "jqueryui", pluggInsAppURL, sendReviewText, coreAppURL], function () {

    var reviewDialogOpen, kickBackDialogOpen, reviewClick, hideReviewSelection;

    setUpSFRControls = function () {

        $("#sfrDialog").dialog({
            autoOpen: false
            , modal: true
            , width: 770
            /* , height: "auto" //705 //685 */
            , closeText: "hide"
            , open: function (event, ui) {
                if ($("#sfrShowChecks").val() == "Yes") {
                    reviewDialogOpen();
                }
                else {
                    kickBackDialogOpen();
                }
            }
            , buttons:
                [
                    { text: "Cancel", click: function () { $(this).dialog("close"); $("#sfrErrors").html(""); } }
                    , {
                        text: "Send for Review"
                        , id: "sfrDoneButton"
                        , click: reviewClick
                    }
                ]
            , create: fixDialogUI
        });

        $(".sfrExplain").ghostText({ parent: $("#sfrDialog") });

        return new jQuery.Deferred().resolve().promise();
    };

    reviewDialogOpen = function () {

        $("#sfrChecks").show();
        $("#sfrDialog").prev().children(":first-child").text("Send Project for Review");
        $("#sfrWhyText").text("Explain why this action is being sent for review:");
        $("#sfrDoneButton").button("option", "label", "Send for Review");

    }

    kickBackDialogOpen = function () {

        $("#sfrChecks").hide();
        $("#sfrDialog").prev().children(":first-child").text("Kick Back Workflow");
        $("#sfrWhyText").text("Explain why the action is being kicked back:");
        $("#sfrDoneButton").button("option", "label", "Kick Back");
    }

    reviewClick = function () {

        var anySteps = false, errMsg = "", steps = "";

        if ($("#sfrShowChecks").val() == "Yes") {
            if ($("#checks input[type=checkbox]:checked").length == 0) {
                errMsg = "You must check at least one review checkbox.";
                $("#checks input[type=checkbox]").addClass("invalid");
            }
            else {
                $("#checks input[type=checkbox]").removeClass("invalid");
            }
        }

        if (($("#sfrExpText").text() == "") || $("#sfrExpText").hasClass("teGhostText")) {

            $("#sfrExpText").removeClass("teGhostText").addClass("teNormalText invalid").text("");
            if (errMsg != "") {
                errMsg += "<br />";
            }

            errMsg += "You must explain why the project is being sent for review.";
        }
        else {
            $("#sfrExpText").removeClass("invalid");
        }

        if (errMsg == "") {

            steps = "SFR";

            $(".awButton,.saveTabButton").button("disable");

            if ($("#sfrShowChecks").val() == "Yes") {
                var divCheck = ($("#sfrDivRev:checked").length > 0);
                var lglCheck = ($("#sfrLglRev:checked").length > 0);
                var polCheck = ($("#sfrPolRev:checked").length > 0);


                // set the specified column to the specified value...in this case EVAL_NEXT_STEP to "PK Review - <sender>"
                $("#actionWF" + $("#sfrColToSet").val()).val($("#sfrColValue").val());
                $("#actionWFEVAL_DIVISION_REVIEW").val((divCheck ? "Yes" : ""));
                $("#actionWFEVAL_LEGAL_REVIEW").val((lglCheck ? "Yes" : ""));
                $("#actionWFEVAL_POLICY_REVIEW").val((polCheck ? "Yes" : ""));

                if (divCheck) {
                    steps += "_10";
                    anySteps = true;
                }
                if (polCheck) {
                    steps += "_11";
                    anySteps = true;
                }
                if (lglCheck) {
                    steps += "_12";
                    anySteps = true;
                }
            }
            else {
                $("#actionWF" + $("#sfrColToSet").val()).val($("#sfrColValue").val());
                if ($("#sfrKickeeStepNum").val() != "") {
                    steps = $("#sfrKickeeStepNum").val();
                    anySteps = true;
                }
            }

            if (anySteps) {
                msgInsertMessage(steps, 1, $("#sfrExpText").text(), false);

                coreVariables.beforeSubmit.add(sfrAddKickback);
                $(this).dialog("close");
                $("#sfrErrors").html(""); // Clear any previous error text
                sendStepOn();
            }
            else {
                alert("Unable to locate a step number to which to kick the workflow. Cannot proceed.");
            }
        }
        else {
            $("#sfrErrors").html(errMsg);
        }
    }

    hideReviewSelection = function (stepNumber) {

        if (stepNumber == '18') {
            $("#divisionSection, #policySection").remove();
        }
    }

    if ($("#sendReviewAppHolder").length == 1) {
        $("#sendReviewAppHolder").append(arguments[3]);

        setUpSFRControls();
        hideReviewSelection(coreVariables.stepNumber);
    }

    return { setUpSFRControls: setUpSFRControls, reviewDialogOpen: reviewDialogOpen, kickBackDialogOpen: kickBackDialogOpen, reviewClick: reviewClick, hideReviewSelection: hideReviewSelection };
});


function sfrCheckButton() {
    var enable = true;

    if ($("#sfrShowChecks").val() == "Yes") {
        enable = ($(".sfrReviewRadio:checked[value='Yes']").length > 0); //as long as 1 checkbox is checked, we can submit
    }

    if (enable) {
        enable = ($(".sfrExplain:visible.teGhostText").length == 0) // Except that any visible explanation is required
    }

    if (enable) {
        $("#sfrDoneButton").button("enable");
    }
    else {
        $("#sfrDoneButton").button("disable");
    }
}

function sfrAddKickback() {

    var dfd, kickSendData;

    dfd = jQuery.Deferred();

    kickSendData = {
        "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.kick_insertID
            , "inputLabel1": coreVariables.wfID
            , "inputLabel2": coreVariables.loadedAuditSeqValue
            , "inputLabel3": "-1"
            , "inputLabel4": $("#sfrExpText").text()
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
        , data: kickSendData
        , type: "POST"
        //, async: false
    }).done(function (refreshData) {
        genericAjaxInsUpdDelErrHandling(refreshData).done(function () {
            dfd.resolve();
        }).fail(function (result) {
            dfd.reject();
            alert("Error saving in sfrAddKickback: URL: " + coreJSONDataToURLArgs(kickSendData));
        });
    });

    return dfd.promise();
}
