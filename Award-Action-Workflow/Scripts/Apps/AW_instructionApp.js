define(["jquery", "jqueryui"
    , generalVariablesApp
    , variablesObjectInitiate
    , pluggInsAppURL], function () {

        window.instructionVariables = {
            "step2Completed": false
            , "step3Kicked": false
        };

        retrieveInstructions().done(function () {
            setUpMsgControls();
        });

        function retrieveInstructions() {

            var dfd = new jQuery.Deferred();

            $.when(retrieveInstruction("1"), retrieveInstruction("2"), retrieveInstruction("3")).done(function () {
                dfd.resolve();

                var reqData = {
                    func: "ll"
                    , objAction: "RunReport"
                    , objID: coreVariables.AW_SEL_RS_WF_AUDIT_LOG_BY_WF_STEP
                    , inputLabel1: ""
                    , inputLabel2: coreVariables.ActionWFVars.RS_ACTION_WF_ID
                    , inputLabel3: "Risk Manager"
                };

                $.ajax({
                    url: "/livelink/llisapi.dll"
                    , data: reqData
                    , type: "POST"
                    , async: true
                    , dataType: 'json'
                    , jsonp: null
                    , jsonpCallback: null
                })
                .done(function (resultData) {
                    if (resultData.nothing == "noResults") {
                        // step 2 has not yet completed
                    }
                    else if (resultData.myRows.length >= 1) {
                        if (resultData.myRows[0].BUTTON_NAME == "Documents Complete") {
                            instructionVariables.step2Completed = true;
                        }
                    }
                })
                .fail(function (resultData) {
                    console.log("FAILED from req");
                });

                reqData = {
                    func: "ll"
                    , objAction: "RunReport"
                    , objID: coreVariables.AW_SEL_RS_WF_AUDIT_LOG_BY_WF_STEP
                    , inputLabel1: ""
                    , inputLabel2: coreVariables.ActionWFVars.RS_ACTION_WF_ID
                    , inputLabel3: "Scheduler"
                };

                $.ajax({
                    url: "/livelink/llisapi.dll"
                    , data: reqData
                    , type: "POST"
                    , async: true
                    , dataType: 'json'
                    , jsonp: null
                    , jsonpCallback: null
                })
                .done(function (resultData) {
                    if (resultData.nothing == "noResults") {
                        // step 3 has not kicked
                    }
                    else if (resultData.myRows.length >= 1) {
                        if (resultData.myRows[0].BUTTON_NAME == "Kick Back to PO") {
                            instructionVariables.step3Kicked = true;
                        }
                    }
                })
                .fail(function (resultData) {
                    console.log("FAILED from req");
                });
            });

            return dfd.promise();
        }

        function retrieveInstruction(instructionType) {

            var instructionData, dfd = new jQuery.Deferred();

            if ($("#instruction" + instructionType).length == 1) {
                instructionData = {
                    func: "ll"
                    , objAction: "RunReport"
                    , objID: coreVariables.AW_SEL_RS_WF_MESSAGES
                    , inputLabel1: coreVariables.ActionWFVars.RS_ACTION_WF_ID
                    , inputLabel2: awStepName.slice(0, 2)
                    , inputLabel3: instructionType
                    , inputLabel4: "asc"
                };

                $.ajax({
                    url: "/livelink/llisapi.dll"
                    , data: instructionData
                    , type: "POST"
                    , success: function (data) {
                        $("#instruction" + instructionType).append(data);
                        dfd.resolve();
                    }
                    , error: function () {
                        alert("Step instruction " + instructionType + " failed to load");
                        dfd.resolve()
                    }
                });
            }
            else {
                dfd.resolve();
            }

            return dfd.promise();
        }
    })

//****************************************************************************************************************
// initialize the various controls

function setUpMsgControls() {
    var dfd = new jQuery.Deferred();

    $("#msgThreadDialog").dialog({
        autoOpen: false
        , modal: true
        , width: 1035
        , height: "auto"
        , closeText: "hide"
        , buttons: [{ text: "Done", click: function () { $(this).dialog("close"); } }]
        , create: fixDialogUI
    });

    $("#msgConfirmDeleteNew").dialog({
        autoOpen: false
        , modal: true
        , width: 550
        , height: "auto"
        , closeText: "hide"
        , buttons: [
            { text: "Cancel", click: function () { $(this).dialog("close"); } }
            , {
                text: "OK", click: function () {
                    var delIcon = $("#msgConfirmDeleteNewContent").data("target");
                    var topContainer = $("#msgConfirmDeleteNewContent").data("topContainer");
                    var msgID = $(delIcon).data("msgID");

                    //delete it
                    {
                        msgDeleteMessage(msgID, "").done(function () {
                            $(topContainer).empty();
                            $(topContainer).remove();
                        });
                    } (delIcon);

                    $(this).dialog("close");
                }
            }]
        , create: fixDialogUI
    });

    $("#msgNewDialog").dialog({
        autoOpen: false
        , modal: true
        , width: 1035
        , height: "auto"
        , resizable: false
        , closeText: "hide"
        , close: function () { $(".msgNewMessage").removeClass('newMessageActive'); $(".msgNewMessage").addClass('newMessageInactive'); msgVariables.newMessageButtonActive = false; }
        , buttons: [
            { text: "Cancel", click: function () { $(this).dialog("close"); } }
            , { text: "Save", click: function () { if (msgSendMessage($("#msgThreadDialog"))) { $(this).dialog("close"); } } }
        ]
        , create: fixDialogUI
    });

    $("#msgNewErrDialog").dialog({
        autoOpen: false
        , modal: true
        , width: 550
        , height: "auto"
        , resizable: false
        , closeText: "hide"
        , buttons: [
            { text: "OK", click: function () { $(this).dialog("close"); } }
        ]
        , create: fixDialogUI
    });

    $(".msgNewMessage").on("click", function (ctrl) {
        msgNewMessage(ctrl);
    });

    $(".msgNewMessage").on(
        "mouseenter"
        , function (ctrl) {
            if (!msgVariables.newMessageButtonActive) {
                $(ctrl.target).removeClass('newMessageInactive');
                $(ctrl.target).addClass('newMessageHover');
            }
        }
    ).on(
        "mousedown"
        , function (ctrl) {
            if (!msgVariables.newMessageButtonActive) {
                $(ctrl.target).removeClass('newMessageHover');
                $(ctrl.target).addClass('newMessageActive');
            }
        }
    ).on(
        "mouseleave"
        , function (ctrl) {
            if (!msgVariables.newMessageButtonActive) {
                $(ctrl.target).removeClass('newMessageHover newMessageActive');
                $(ctrl.target).addClass('newMessageInactive');
            }
        }
    );

    $("#msgNewText")
    .ghostText({
        parent: $("#msgNewDialog")
        , ghostText: "Enter instructions here."
        , normalClass: "msgNewText"
        , ghostClass: "msgNewTextEmpty"
        , autoExpand: false
    })
    /*    .on( 
    'focusin'
    , function () {
    if ( $("#msgNewText").hasClass( "msgNewTextEmpty" ) ) {
    $("#msgNewText").removeClass( "msgNewTextEmpty" );
    $("#msgNewText").addClass( "msgNewText" );
    $("#msgNewText").text( "" );
    }
    }
    ).on( 
    'focusout'
    , function () {
    if ( $("#msgNewText").text() == "" ) {
    $("#msgNewText").text( "Enter instructions here." ); // This string must match the string in AW_Messages.js in the on focusout function msgNewMessage
    $("#msgNewText").removeClass( "msgNewText" );
    $("#msgNewText").addClass( "msgNewTextEmpty" );
    }
    else {
    $("#msgNewText").removeClass( 'invalid' );
    }
    }
    );
    */

    $("#msgNewTarget")
    .on(
        'change'
        , function () {
            if ($("#msgNewTarget").val() != "") {
                $("#msgNewTarget").removeClass("invalid");
            }
        }
    );

    $(".messagesSubHead").on('click', function (evt) {
        var targetID = $(evt.target).attr("id");
        var whichBlock = targetID.substr(-1);

        if (whichBlock != "1") {
            if ($("#messagesContent" + whichBlock).is(":visible")) {
                $("#messagesContent" + whichBlock).slideUp();
                $("#messagesSubHeadToggle" + whichBlock + " .ui-icon").removeClass('ui-icon-minus').addClass('ui-icon-plus');

                //$("#messagesSubHeadToggle" + whichBlock).removeClass( "messagesSubHeadContractable" );
                //$("#messagesSubHeadToggle" + whichBlock).addClass( "messagesSubHeadExpandable" );
                //$("#messagesSubHeadToggle" + whichBlock).empty();
                //$("#messagesSubHeadToggle" + whichBlock).append( $("<img>",{"src":"/support/det-search_down-arrow.gif","alt":"See Messages","title":"See Messages"}));
                //$("#messagesSubHeadToggle" + whichBlock).removeClass( "ui-icon ui-icon-triangle-1-n" );
                //$("#messagesSubHeadToggle" + whichBlock).addClass( "ui-icon ui-icon-triangle-1-s" );
            }
            else {
                $("#messagesContent" + whichBlock).slideDown();
                msgMarkMessagesSeen($("#messagesSubHeadUnread" + whichBlock).data("unread"));
                $("#messagesSubHeadToggle" + whichBlock + " .ui-icon").removeClass('ui-icon-plus').addClass('ui-icon-minus');
                $("#messagesSubHeadUnread" + whichBlock).removeClass('unreadMsgsCircle');
                //$("#messagesSubHeadToggle" + whichBlock).removeClass( "messagesSubHeadExpandable" );
                //$("#messagesSubHeadToggle" + whichBlock).addClass( "messagesSubHeadContractable" );
                //$("#messagesSubHeadToggle" + whichBlock).empty();
                //$("#messagesSubHeadToggle" + whichBlock).append( $("<img>",{"src":"/support/det-search_up-arrow.gif","alt":"Hide Messages","title":"Hide Messages"}));
                //$("#messagesSubHeadToggle" + whichBlock).removeClass( "ui-icon ui-icon-triangle-1-s" );
                //$("#messagesSubHeadToggle" + whichBlock).addClass( "ui-icon ui-icon-triangle-1-n" );
            }
        }

        return false;
    });

    var unreadIDs = $("#messagesSubHeadUnread1").data("unread");

    if ((unreadIDs != "") && (unreadIDs != null)) {
        msgMarkMessagesSeen($("#messagesSubHeadUnread1").data("unread"));
    }

    return dfd.resolve().promise();
}

//****************************************************************************************************************
// Load all instructions of a certain priority and display them in a dialog.

function msgPopThread(priority) {


    if (priority == 1) {
        return;
    }

    var loadThreadData = {
        func: "ll"
        , objAction: "RunReport"
        , objid: msgVariables.loadThread_ID
        , inputLabel1: 10
        , inputLabel2: ""
        , inputLabel3: priority
        , inputLabel4: "asc"
    };
    var deferredAjaxResult = $.ajax({
        url: "/livelink/llisapi.dll",
        data: loadThreadData,
        type: "POST",
        beforeSend: function () { $("#msgThreadDialogContent").empty(); }
    });

    deferredAjaxResult
    .done(function (refreshData) {

        genericAjaxInsUpdDelErrHandling(refreshData)
        .done(function (refreshData) {

            $("#msgThreadDialogContent").append(refreshData)
            $("#msgThreadDialog").dialog("open");
        })
        .fail(function (result) {
            alert("Error loading in msgPopThread: URL: " + coreJSONDataToURLArgs(loadThreadData));
        })
    })
    .fail(function (result) {
        alert("Error dispatching ajax??? in msgPopThread(): URL: " + coreJSONDataToURLArgs(loadThreadData));
    })

    return deferredAjaxResult;
}

//****************************************************************************************************************
// Someone clicked a new instruction button. show the dialog

function msgNewMessage(ctrl) {
    var lastPKStep = 15;
    var lastRPFStep = 5;
    var lastWFStep = 15;
    var steps;
    var currStep = parseInt(coreVariables.stepNumber, 10);
    var hasRisk = (coreVariables.ActionWFVars.HA_USE == "Yes");
    var isAOARD = (coreVariables.ActionWFVars.OFFICE == "IOA");
    var isCanceledPR = (coreVariables.ActionWFVars.EVAL_NEXT_STEP.substr(0,9) == "Cancelled")
    var isMFD = (((coreVariables.GenSelectVars != undefined) && (coreVariables.GenSelectVars.PROJECT_TYPE == "Outgoing MFD")) && (coreVariables.ActionWFVars.ACTION_TYPE == "non_contracting"));
    var showStepsFrom = currStep
    var step = currStep;
    var targetList = $("#msgNewTarget");

    if (isMFD) {
        lastPKStep = 18;
        lastRPFStep = 19;
        lastWFStep = 19;

        steps = {
            3: "Scheduler Assigns Action"
            , 4: "PA Creates Funding Documents"
            , 5: "PA Uploads Certified Funding Documents"
            , 19: "RPF Financial Analyst Uploads MFD Receipt"
        };

        if (hasRisk) {
            steps["2"] = "Risk Manager Creates Required Documents";
        }

        // RPF cannot send to PK, so only add 18 if we're at 18
        if ((currStep <= 3) || (currStep == 12) || (currStep == 13) || (currStep == 18)) {
            steps["18"] = "PK Reviews Outgoing MFD";
        }
    }
    else if (isAOARD) {
        steps = {
            1: "PO Fills Out Cost & Tech Evaluation"
            , 16: "AOARD - PA Uploads PR"
            , 17: "AOARD - PO Uploads Award"
        };

        lastWFStep = 17;
    }
    else if (isCanceledPR) {
        steps = {
            20: "RPF Decommits Funding"
        };

        lastWFStep = 20;
    }
    else {
        lastPKStep = 15;
        lastRPFStep = 5;
        lastWFStep = 15;

        steps = {
            3: "Scheduler Assigns Action"
            , 4: "PA Creates Funding Documents"
            , 5: "PA Uploads Certified Funding Documents"
            , 7: "PK Team Lead Assigns Action"
            , 8: "PK Buyer Works Action"
            , 9: "PK Officer Reviews and Signs Action"
            , 15: "Distribution of Award Action"
        };

        if (coreVariables.ActionWFVars.ACTION_TYPE == "additional" && !instructionVariables.step3Kicked) {
            steps["1"] = "PO Fills Out Cost & Tech Evaluation";
        }

        if (hasRisk && !instructionVariables.step2Completed) {
            steps["2"] = "Risk Manager Creates Required Documents";
        }
    }

    msgVariables.newMessageButtonActive = true;

    if (typeof ctrl !== "undefined") {
        $(ctrl.target).removeClass('newMessageInactive newMessageHover');
        $(ctrl.target).addClass('newMessageActive');
    }

    $("#msgNewTarget").val("");

    // Build the target popup--first empty it and add the select
    targetList.empty().append($("<option>", { "value": "", "text": "<Select>" }));

    // add entire workflow, if there's anything left in the workflow
    if (currStep < lastWFStep) {
        targetList.append($("<option>", { "value": "Universal", "text": "Every step in the workflow" }));
    }

    if (!isAOARD) {
        if (!isMFD && (currStep < lastPKStep)) {
            targetList.append($("<option>", { "value": "PK Branch_07_08_09_10_11_12_13_14_15_18", "text": "All PK steps in the workflow", "title": "The instruction would display at all PK steps, at minimum steps 07, 08, 09, and 15" }));
        }

        // add the RPF group if we can still get to it
        if (false /* && (currStep < 7) this condition doesn't work now that RPF branch is after PK branch for an MFD*/) {
            targetList.append($("<option>", { "value": "RPF Branch_04_05_06_19", "text": "All RPF steps in the workflow" }));
        }

        if (isMFD && ((currStep < lastRPFStep))) {
            targetList.append($("<option>", { "value": "RPF Branch_04_05_06_19", "text": "All RPF steps in the workflow" }));
        }

        if ((currStep == 1) && ((coreVariables.ActionWFVars.ACTION_TYPE != "additional") || (instructionVariables.step3Kicked))) {
            // this is a kickback to 1, so don't show 1 or 2
            showStepsFrom = 3;
        }
        else if ((currStep == 6) || (currStep == 18)) {
            showStepsFrom = 4;
        }
        else if (currStep >= 10 && currStep <= 15) {
            var ens = coreVariables.ActionWFVars.EVAL_NEXT_STEP;

            if (ens.indexOf("-") != -1) {
                ens = ens.substr(ens.indexOf("-") + 2);
            }

            if (ens == "Team Lead") {
                showStepsFrom = 7;
            }
            else if (ens == "Buyer") {
                showStepsFrom = 8;
            }
            else if (ens == "PK Officer") {
                showStepsFrom = 9;
            }
            else if (ens == "Outgoing MFD") {
                showStepsFrom = 4;
            }
        }

        // -- This might go away; crappy way of adding this
        if (currStep == "9") {
            targetList.append($("<option>", { "value": "08", "text": steps[8] }));
        }

        // then add the still accessible steps including the current step
        for (step in steps) {
            var stepName = steps[step];
            var stepID = ((step < 10) ? "0" + step : "" + step);

            if (parseInt(step, 10) == currStep) {
                stepName += " (Current Step)";
            }

            if (step >= showStepsFrom) {
                targetList.append($("<option>", { "value": stepID, "text": stepName }));
            }
        }
    }
    else {
        if (currStep <= 17) {
            for (step in steps) {
                var stepName = steps[step];
                var stepID = ((step < 10) ? "0" + step : "" + step);


                if (parseInt(step, 10) == currStep) {
                    stepName += " (Current Step)";
                }

                if (step >= showStepsFrom) {
                    targetList.append($("<option>", { "value": stepID, "text": stepName }));
                }
            }
        }
    }

    $("#msgNewDialog").dialog("open");

    $("#msgNewText").removeClass("msgNewText").addClass("msgNewTextEmpty").text("Enter instructions here.");
    //    $("#msgNewText").addClass("msgNewTextEmpty");
    //    $("#msgNewText").text("Enter instructions here."); // This string must match the string in AW_Messages.html in the $("#msgNewText").on( 'focusout' function in setUpMsgVariables

    $("#msgNewDialog").parent().find(".ui-icon-closethick").attr("title", "Close");

    // this is handled when the dialog comes down...
    //$("#msgNewMessage").removeClass( 'newMessageActive' );
    //$("#msgNewMessage").addClass( 'newMessageInactive' );

    return true;
}


//****************************************************************************************************************
// Store a new instruction from the new instruction dialog.

function msgSendMessage() {

    var deferredAjaxResult;
    var insertMessageData;
    var priority;

    var errMsg = "";
    var target = $("#msgNewTarget").val();
    var humanTarget = $("#msgNewTarget option:selected").text();
    var msg = $("#msgNewText").text();
    var ok = true;

    if (target == "") {
        errMsg = "You must select a target. ";
        $("#msgNewTarget").addClass("invalid");
        ok = false;
    }
    else {
        $("#msgNewTarget").removeClass("invalid");
        switch (target.substr(0, 1)) {
            case "0":
            case "1":
            case "2":
                priority = 1;
                humanTarget = "step " + humanTarget + ".";
                break;
            case "P":
                priority = 2;
                humanTarget = "all PK branch steps.";
                break;
            case "R":
                priority = 2;
                humanTarget = "all RPF branch steps.";
                break;
            case "U":
                priority = 3;
                humanTarget = "all workflow steps.";
                break;
        }
    }

    if ((msg == "") || (msg == "Enter instructions here.")) {
        errMsg += "You must enter a message.";
        $("#msgNewText").addClass("invalid");
        $("#msgNewText").text("")
        ok = false;
    }
    else {
        $("#msgNewText").removeClass("invalid");
    }

    if (ok) {
        msgInsertMessage(target, priority, msg, true, humanTarget);
    }
    else {
        $("#msgNewErrDialogContent").text(errMsg);
        $("#msgNewErrDialog").dialog("open");
    }

    return ok;
}

function msgInsertMessage(target, priority, msg, showMessage, humanTarget) {

    if (showMessage == null) {
        showMessage = true;
    }
    var insertMessageData = {
        func: "ll"
        , objAction: "RunReport"
        , objid: msgVariables.insertMessage_ID
        , inputLabel1: coreVariables.ActionWFVars.RS_ACTION_WF_ID
        , inputLabel2: formatDateWithTime(new Date())
        , inputLabel3: coreVariables.currentUserID
        , inputLabel4: coreVariables.stepName
        , inputLabel5: target
        , inputLabel6: priority
        , inputLabel7: coreVariables.stepNumber
        , inputLabel8: msg
        , inputLabel9: "bogus"
    };
    var deferredAjaxResult = $.ajax({
        url: "/livelink/llisapi.dll"
        , data: insertMessageData
        , type: "POST"
    });

    //alert( "placeholder message for Saving instructions..." );

    {
        deferredAjaxResult
        .done(function (refreshData) {

            genericAjaxInsUpdDelErrHandling(refreshData)
            .done(function (result) {

                if (showMessage) {
                    var deferredRetrievalResult;

                    var findLastMessageData = {
                        "func": "ll"
                                , objAction: "RunReport"
                                , objid: msgVariables.retrieveLastMessage_ID
                                , inputLabel1: coreVariables.ActionWFVars.RS_ACTION_WF_ID
                                , inputLabel2: coreVariables.currentUserID
                                , inputLabel3: coreVariables.stepName
                    }

                    // Now we need to find the id of the message we just inserted.
                    deferredRetrievalResult = $.ajax({
                        async: true,
                        type: "POST",
                        url: $("body").data("ll_reptag_urlprefix"),
                        data: findLastMessageData,
                        dataType: 'json',
                        jsonp: null,
                        jsonpCallback: null
                    });

                    deferredRetrievalResult
                    .done(function (resultData) {

                        if (resultData.nothing == "noResults") {
                            alert("how come I couldn't find the just inserted instruction?: " + coreJSONDataToURLArgs(findLastMessageData));
                        }
                        else if (resultData.myRows.length >= 1) {
                            var newMsgBlock = $("#newMsgsBlock");
                            var confDiv = $("<div>");
                            var confirmation = $("<span>", { "text": "New instruction added for " + humanTarget, "style": "font-size:80%;font-style:italic;" });
                            //var deleteHolder = $("<div>", { "style": "margin-left:12px;display:inline-block;position:relative;top:3px;", "id": "deleteHolder_" + resultData.myRows[0].RS_WF_MESSAGES_ID, "class": "deleteNewMsg" });
                            //var deleteIcon = $("<div>", { "class": "msgDelete ui-icon ui-icon-circle-close", "id": "deleteIcon_" + resultData.myRows[0].RS_WF_MESSAGES_ID, "title": "Delete Instruction" });
                            //deleteHolder.append(deleteIcon);
                            //deleteIcon.data("msgID", resultData.myRows[0].RS_WF_MESSAGES_ID);
                            //$(deleteIcon).on(
                            //    "click"
                            //    , function (ctrl) {
                            //        var which = ctrl.target.id;
                            //        $("#msgConfirmDeleteNewContent").data("target", ctrl.target);
                            //        $("#msgConfirmDeleteNewContent").data("topContainer", confDiv);
                            //        $("#msgConfirmDeleteNew").dialog("open");
                            //    }
                            //);
                            var deleteHolder = $("<div>", { "style": "margin-left:12px;display:inline-block;font-size: 80%; font-style: italic;" });
                            var deleteLink = $("<a>", { href: "deleteInstruction", text: "Cancel Special Instruction", "class": "awLink otherLink" });

                            deleteLink
                            .on(
                                "click",
                                function () {
                                    $("#msgConfirmDeleteNewContent").data("target", $(this));
                                    $("#msgConfirmDeleteNewContent").data("topContainer", confDiv);
                                    $("#msgConfirmDeleteNew").dialog("open");
                                    return false;
                                }
                            )
                            .data("msgID", resultData.myRows[0].RS_WF_MESSAGES_ID);
                            deleteHolder.append($("<span>", { "text": "[" }).append(deleteLink).append($("<span>", { "text": "]" })));

                            confDiv.append(confirmation).append(deleteHolder);
                            if (newMsgBlock.length == 0) {
                                newMsgBlock = $("<div>", { "id": "newMsgBlock" });

                                $("#messagesContent").prepend(newMsgBlock);
                            }

                            newMsgBlock.append(confDiv);

                        }
                        else {
                            alert("how come, when looking for the just inserted instruction, I found " + resultData.myRows.length + "?: " + coreJSONDataToURLArgs(findLastMessageData));
                        }
                    })
                    .fail(function (result) {
                        alert("Error dispatching ajax??? to retrieve just inserted in msgSendMessage(): URL: " + coreJSONDataToURLArgs(findLastMessageData));
                    });
                }
            })
            .fail(function (result) {
                alert("Error inserting message in msgSendMessage(): URL: " + coreJSONDataToURLArgs(insertMessageData));
            });
        })
        .fail(function (result) {
            alert("Error dispatching ajax??? to insert in msgSendMessage(): URL: " + coreJSONDataToURLArgs(insertMessageData));
        });
    } (showMessage, humanTarget);
}

// Passing "",wfID deletes all messages for a wfID
// Passing msgID,"" deletes any message with RS_WF_MESSAGES_ID=msgID (which should be just one message)
// Passing msgID,wfid deletes any message with RS_WF_MESSAGES_ID=msgID and WF_ID=wfID ( which will be either one or zero messages)
function msgDeleteMessage(msgID, wfID) {

    var deleteMessageData = {
        func: "ll"
        , objAction: "RunReport"
        , objid: msgVariables.deleteMessage_ID
        , inputLabel1: wfID
        , inputLabel2: msgID
    };
    var deferredAjaxResult = $.ajax({
        url: "/livelink/llisapi.dll"
        , data: deleteMessageData
        , type: "POST"
    });

    deferredAjaxResult
    .done(function (refreshData) {

        genericAjaxInsUpdDelErrHandling(refreshData)
        .done(function (result) {
            // yay
        })
        .fail(function (result) {
            alert("Error deleting message in msgSendMessage(): URL: " + coreJSONDataToURLArgs(deleteMessageData));
        })
    })
    .fail(function (result) {
        alert("Error dispatching ajax??? in msgDeleteMessage(): URL: " + coreJSONDataToURLArgs(deleteMessageData));
    })

    return deferredAjaxResult;
}

function msgMarkMessagesSeen(unreadIDsString) {
    var deferredAjaxResult;

    if ((unreadIDsString != undefined) && (unreadIDsString.length > 0)) {

        var msgIDs = unreadIDsString.substr(1).replace(/_/g, ",");
        var updateMessageData = {
            func: "ll"
            , objAction: "RunReport"
            , objid: msgVariables.markMessagesRead_ID
            , inputLabel1: coreVariables.stepNumber
            , inputLabel2: msgIDs
        };

        deferredAjaxResult = $.ajax({
            url: "/livelink/llisapi.dll"
            , data: updateMessageData
            , type: "POST"
        });

        deferredAjaxResult
        .done(function (refreshData) {

            genericAjaxInsUpdDelErrHandling(refreshData)
            .done(function (result) {
                // yay
            })
            .fail(function (result) {
                alert("Error updating messages in msgMarkMessagesSeen(): URL: " + coreJSONDataToURLArgs(updateMessageData));
            })
        })
        .fail(function (result) {
            alert("Error dispatching ajax??? in msgMarkMessagesSeen(): URL: " + coreJSONDataToURLArgs(updateMessageData));
        })
    }
    else {
        deferredAjaxResult = new jQuery.Deferred().resolve().promise()
    }

    return deferredAjaxResult;
}
