define(["jquery", "jqueryui", "validator"
   , tabManagerAppURL
   , generalVariablesApp
   , variablesObjectInitiate
   , variablesURLAppURL
   , pluggInsAppURL
   , AW_cancelPRApp
], function ($) {

    coreVariables.globalCallBacksSetup = partialCallBacks();
    coreVariables.outsidePageValidator = partialCallBacks();
    coreVariables.tabActivatedCallBacks = partialCallBacks();
    coreVariables.tabsCallBacksSetup = partialCallBacks();
    coreVariables.afterLoad = partialCallBacks();
    coreVariables.beforeSubmit = partialCallBacks();

    coreVariables.globalCallBacksSetup.add(setUpGlobalCallBacksSetupASYNCH);

    coreVariables.tabsCallBacksSetup.add(setUpInitjQueryUI);
    coreVariables.tabsCallBacksSetup.add(setUpStepButtons);
    coreVariables.tabsCallBacksSetup.add(setUpIconsMenus);
    coreVariables.tabsCallBacksSetup.add(setUpCoreDisplay);
    coreVariables.tabsCallBacksSetup.add(require(AW_cancelPRApp).displayCancelPR);


    coreVariables.globalCallBacksSetup.fire(coreVariables.ActionWFVars).done(function () {
        tabSetup().done(displayPage);
    });

    // 2014-05-14 Todd; to be able to fill out cost & tech eval from an Idea, rather than a workflow, some stuff needs to be disabled if we're not in a workflow
    if (!isNaN(parseInt(coreVariables.stepNumber))) {
        // set up to automatically save RS_ACTION_WF values and audit the button click
        coreVariables.beforeSubmit.add(saveRS_ACTION_WF);
        coreVariables.beforeSubmit.add(saveRS_WF_AUDIT_LOG);
        coreVariables.beforeSubmit.add(confirmFoldersAtStep7);
        coreVariables.beforeSubmit.add(sendEmailCertifiedPR);
        coreVariables.beforeSubmit.add(sendMFDComplete);
        coreVariables.beforeSubmit.add(sendDecommit);
		
    }

    jQuery.validator.messages.required = "";
});

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}
String.prototype.ltrim = function () {
    return this.replace(/^\s+/, "");
}
String.prototype.rtrim = function () {
    return this.replace(/\s+$/, "");
}

//Remove everything from a string that is not a number, decimal, or hyphen
String.prototype.numberfy = function () {
    return this.match(/\d|[-]|[\.]/g).join('');
}

function partialCallBacks() {

    var callBackList = new Array();
    var stepCount = 0;

    return {
        // Add a function to the queue - each function in the queue must return the deferred.promise() object
        add: function (observer) {

            callBackList.push(observer);
        }
        // Trigger each function however do it with a when() to fire an event after 
        , fire: function (args) {

            var deferredList = new Array();

            for (var n = 0; n < callBackList.length; n++) {
                deferredList.push(callBackList[n](args))
            }

            return $.when.apply($, deferredList)
        }
        //Step through functions in the callBack list
        , step: function (args) {

            callBackList[stepCount](args);

            stepCount < callBackList.length ? stepCount++ : stepCount = 0; a
        }
    };
}

function setUpGlobalCallBacksSetupASYNCH() {

    // 2014-05-14 Todd; to be able to fill out cost & tech eval from an Idea, rather than a workflow, some stuff needs to be disabled if we're not in a workflow
    if (!isNaN(parseInt(coreVariables.stepNumber))) {
        preLoadAuditSeq();
        setUpFlyOuts();
    }

    return new jQuery.Deferred().resolve().promise();
}

function tabSetup(data) {

    return coreVariables.tabsCallBacksSetup.fire(coreVariables.ActionWFVars);
}

function setUpInitjQueryUI() {

    $("#tabs").tabs({
        active: 0
        , activate: function (event, ui) {
            coreTabActivated(event, ui);
        }
    });

    $("#messagesAccordion").accordion({ collapsible: true, heightStyle: "content" });
    $("#stepDeetsAccordion").accordion({ collapsible: true, heightStyle: "content", active: false });

    $.validator.addMethod(
        "noGhostText",
        function (value, element, ghostClass) {
            var valid = !$(element).hasClass("required"); // if the field is not required, then it is valid.

            if (!valid) {
                //the field is required, so now check more
                if ((ghostClass == "") || (ghostClass == undefined)) {
                    ghostClass = "teGhostText";
                }

                if ($(element).hasClass(ghostClass) || ($(element).text().length == 0)) {
                    var usingInvalid = coreVariables[$(element).closest("form").attr("id") + "validatorSettings"].usingInvalid;

                    if (usingInvalid) {
                        //we can't leave the ghost text there, because it looks terrible with invalid
                        $(element).text("");
                        $(element).removeClass(ghostClass);
                    }

                    valid = false;
                }
                else {
                    valid = true;
                }
            }

            return valid;
        }
        , ""
    );

    //DETERMINE WHETEHER OR NOT STEP IS WORKFLOW AMD DISABLE
    if (window.activeWorkflow) {
        $(".awButton").button();
    }
    else {
        $(".awButton").button({ disabled: true });
    }

    $("#distConfirm").dialog({
        autoOpen: false
        , modal: true
        , resizable: false
        , buttons: [
            { text: "Cancel", click: function () { $(this).dialog("close"); $(".awButton").button("enable"); } }
            , { text: "OK", click: function () { $("#actionWFEVAL_NEXT_STEP").val(coreVariables.clickedButton.attr('name')); $(this).dialog("close"); sendStepOn(); } }]
        , create: fixDialogUI
    });

    $("#awStepErrors").dialog({
        autoOpen: false
        , modal: true
        , height: "auto"
        , resizable: false
        , closeText: "hide"
        , buttons: [
            { text: "OK", click: function () { $(this).dialog("close"); } }
        ]
        , create: fixDialogUI
    });

    $("#awGenericError").dialog({
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

    $(".infoButton")
    .on(
        "mouseenter"
        , function (ctrl) {
            $(ctrl.target).removeClass('helpInactive');
            $(ctrl.target).addClass('helpHover');
        }
    )
    .on(
        "mousedown"
        , function (ctrl) {
            $(ctrl.target).removeClass('helpHover');
            $(ctrl.target).addClass('helpActive');
        }
    )
    .on(
        "mouseleave"
        , function (ctrl) {
            $(ctrl.target).removeClass('helpHover helpActive');
            $(ctrl.target).addClass('helpInactive');
        }
    );

    return new jQuery.Deferred().resolve().promise();
}

function coreTabActivated(event, ui) {
    coreVariables.tabActivatedCallBacks.fire(ui);
}

function tabsAllLoaded() {

    var tabsAllLoaded = true;

    $(".awLoadingMessage").each(function () {
        //console.log($(this).css("display"));
        if ($(this).css("display") == "block") {
            tabsAllLoaded = false;
        }
    });

    return tabsAllLoaded;
}

function startSubmission() {

    var currentButton = this;

    if (tabsAllLoaded()) {

        coreVariables.clickedButton = $(this);
        $(".awButton,.saveTabButton").button("disable");

        //SJS - Added this here to ensure button is disabled before submission
        setTimeout(function () {

            if ($(currentButton).hasClass("exitButton")) {
                // save & exit, cancel & exit should not alter eval_next_step
                sendStepOn($(currentButton), coreVariables.stepNumber);
            }
            else if ($(currentButton).hasClass("kickButton")) {
                // Kickback can be clicked without page passing validation.
                kickButtonClicked($(currentButton), coreVariables.stepNumber);
            }
            else {
                coreVariables.showBangs = true;
                // validateStep will either call validationFail() or validationSuccess()
                coreVariables.stepValidator.validateStep();
            }

        }, 250);
    }
    else {
        // Buttons do nothing until every tab, even if post-loaded, is completely loaded
    }
}

//Submission starts here
function setUpStepButtons() {

    var sender, pieces;

    $(".awButton:not(.cancelPRButton)").on("click", startSubmission);

    if ($("#RetToSender").length > 0) {
        // there's a return to sender button on this page, so let's fix it up

        if (typeof ($("#actionWFEVAL_NEXT_STEP").val()) == "undefined") {
            pieces = "EVAL_NEXT_STEP";
        }
        else {
            pieces = $("#actionWFEVAL_NEXT_STEP").val().split("-")
        }

        if (pieces.length < 2) {
            // uh-oh--we must be in a review step _after_ a different review step has already completed and cleared the "-" out of eval_next_step
            sender = $("#actionWFEVAL_NEXT_STEP").val();
        }
        else {
            sender = pieces[1].substr(1);
        }

        if (coreVariables.ActionWFVars.ACTION_TYPE === 'non_contracting') {
            $("#RetToSender .ui-button-text").text("Return to PK Review");
        }
		else if (sender.search(/AOARD/) != -1) { // jhn if returns to either 16 or 17 button, shows 'Return to PA'
		  $("#RetToSender .ui-button-text").text("Return to PA");
		}
        else {
            $("#RetToSender .ui-button-text").text("Return to " + sender);
        }

        $("#RetToSender").attr("name", sender);
    }

    return new jQuery.Deferred().resolve().promise();
}

function kickButtonClicked(submissionButton, stepNumber) {

    var kickeeStep, btn, kickee, sendNow;

    btn = submissionButton;
    kickee = btn.attr("name").substr(0, 2);
    sendNow = true;

    switch (coreVariables.stepNumber) {

        case "03":
            if (btn.text() == "Kick Back to PO") {

                // Direct to the correct kickee step, and get a message to display
                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val("PO");
                $("#sfrKickeeStepNum").val("01");
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
                coreVariables.beforeSubmit.add(sendPOKickEmail);
            }
            break;

        case "04":
            // Step 4 needs special processing, it doesn't use EVAL_NEXT_STEP, since that's being used in the PK Branch
            if (btn.text() == "Kick Back to PO") {
                $("#actionWFEVAL_PA_KICKBACK_TO_PO").val("Yes");
                coreVariables.beforeSubmit.add(sendPOKickEmail);

                sendNow = false;
                $("#sfrColToSet").val("EVAL_PA_KICKBACK_TO_PO");
                $("#sfrColValue").val("Yes");
                $("#sfrKickeeStepNum").val("06");
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
            }
            break;

        case "07": //STEP 7 handler is STEP 9
        case "09":
            if (btn.text() == "Kick Back to Team Lead") {  // jhn
                // Direct to the correct kickee step, and get a message to display
                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val("Team Lead");
                $("#sfrKickeeStepNum").val("07");
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
            }
            else if (btn.text().substr(0, 9) == "Kick Back") {
                if (kickee == "PO") {
                    coreVariables.beforeSubmit.add(sendPOKickEmail);
                }

                if ($.inArray(kickee, ["PA", "PO"]) >= 0) { // jhn
                    // Direct to the correct kickee step, and get a message to display
                    sendNow = false;
                    $("#sfrColToSet").val("EVAL_NEXT_STEP");
                    $("#sfrColValue").val(btn.attr("name"));
                    if (kickee == "PA") {
                        kickeeStep = "14";
                    }
                    else if (kickee == "PO") {
                        kickeeStep = "13";
                    }
                    $("#sfrKickeeStepNum").val(kickeeStep);
                    $("#sfrShowChecks").val("No");
                    $("#sfrDialog").dialog("open");
                }
                else if (kickee == "Bu") {
                    if ((clKickClicked != undefined) && (clKickClicked())) {
                        $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
                        sendNow = true;
                    }
                    else {
                        // Direct to the correct kickee step, and get a message to display
                        sendNow = false;
                    }
                }
            }
            else if (btn.text() == "Send for Review") {

                // Find out which reviewers will receive
                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val(btn.attr("name"));
                $("#sfrKickeeStepNum").val("");
                $("#sfrShowChecks").val("Yes");
                $("#sfrDialog").dialog("open");
            }
            break;

        case "08":
            // Step 8 has kick buttons always enabled
            // If we're kicking to the PO when the wf didn't already com through a PO step

            // TEGTEGTEG REMOVE THE CHECK FOR NOT BASIC WHEN BASIC WF SKIPS PO!
            if ((btn.text() == "Kick Back to PO") && ((coreVariables.ActionWFVars.ACTION_TYPE != 'basic') && (coreVariables.ActionWFVars.ACTION_TYPE != 'additional'))) {
                // Direct to the PO Reworks step, and get a message to display

                sendNow = false;
                coreVariables.beforeSubmit.add(sendPOKickEmail);
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val(btn.attr("name"));
                $("#sfrKickeeStepNum").val("13");
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
            }

            else if (btn.text() == "Kick Back to Team Lead") { // jhn
                // Direct to the correct kickee step, and get a message to display

                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val("Team Lead");
                $("#sfrKickeeStepNum").val("07");
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
            }
                //if the checklist is displayed, call the checklist and see if we should kick
            else if ((clKickClicked != undefined) && (clKickClicked())) {

                $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
                if (btn.text() == "Kick Back to PO") {
                    coreVariables.beforeSubmit.add(sendPOKickEmail);
                }
                sendNow = true;
            }
            else {
                sendNow = false;
            }
            break;

        case "15":
            if (btn.text() == "Kick Back to Buyer") {

                // Direct to the correct kickee step, and get a message to display

                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val("Buyer");
                $("#sfrKickeeStepNum").val("08");
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
            }
            else if (btn.text() == "Kick Back to PKO") {

                // Direct to the correct kickee step, and get a message to display

                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val("PK Officer");
                $("#sfrKickeeStepNum").val("09");
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
            }
            break;
        case "16": // jhn
		    if (btn.text() == "Kick Back to PO") {  // jhn
				
                // Direct to the correct kickee step, and get a message to display
				
                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val(btn.attr("name"));
                $("#sfrKickeeStepNum").val("21");
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
				coreVariables.beforeSubmit.add(sendPOKickEmail); // jhn 1/21/2015
            }
			break;
		case "17": // jhn
		    if (btn.text() == "Kick Back to PO") {  // jhn
			
                // Direct to the correct kickee step, and get a message to display
				
                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
				$("#sfrColValue").val(btn.attr("name"));
                $("#sfrKickeeStepNum").val("21");
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
    			coreVariables.beforeSubmit.add(sendPOKickEmail); // jhn 1/21/2015
            }
			break;
        case "18":

            if (btn.text() == "Send for Review") {

                // Find out which reviewers will receive
                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val(btn.attr("name"));
                $("#sfrKickeeStepNum").val("");
                $("#sfrShowChecks").val("Yes");
                $("#sfrDialog").dialog("open");
            }

            if (btn.text().substr(0, 9) == "Kick Back") {

                sendNow = false;
                $("#sfrColToSet").val("EVAL_NEXT_STEP");
                $("#sfrColValue").val(btn.attr("name"));

                if (kickee == "PO") {
                    kickeeStep = "13";
                }

                $("#sfrKickeeStepNum").val(kickeeStep);
                $("#sfrShowChecks").val("No");
                $("#sfrDialog").dialog("open");
            }

            break;
        default:

            if (coreVariables.devServer) {
                alert("How did we get into the kickback function without having clicked a kickback button? Button is '" + btn.attr('name') + "'.");
            }
            break;
    }

    if (sendNow) {
        sendStepOn(submissionButton, stepNumber);
    }
    else {
        // not sending, unlock the buttons
        $(".awButton,.saveTabButton").button("enable");
    }

    return new jQuery.Deferred().resolve().promise();
}

function sendStepOn(submissionButton, stepNumber) {

    if (coreVariables.clickedButton.attr('id') != 'cancel') {

        $(".awButton,.saveTabButton").button("disable");

        setTimeout(function () {
            // var processStep8;  // jhn 2/2/2015 : changed var processStep8 to processStep to make it generic for all steps
            var processStep;  // TRIGGER IN CLARITY THAT SCREWS UP THE ACTION STATUS
            var cancelled = ((cancelPRVariables != undefined) ? cancelPRVariables.cancelled : false);

            if ((coreVariables.stepNumber == "08") && (!cancelled)) {
                processStep = require(step8AppURL).step8SetBuyerCompleteDate;
            }
			else if ((coreVariables.stepNumber == "16") && (!cancelled)) { // jhn 2/2/2015: added AOARD Xog
			    processStep = require(stepAoardAppURL).stepAoardSetDates;
			}
            else {
                processStep = function () { return new jQuery.Deferred().resolve().promise(); }
            }

            processStep().done(function () {

                coreSetActionStatus().always(function () {

                    coreVariables.beforeSubmit.fire({ button: coreVariables.clickedButton, stepNumber: coreVariables.stepNumber, ENVIRONMENT: window.ENVIRONMENT }).done(function () {

                        // pdf generation needs to wait until AFTER all the saving....
                        if (!isNaN(parseInt(coreVariables.stepNumber))) {
                            generatePDFs();
                        }

                        // when all the saving is done, if it's save & exit
                        if (coreVariables.clickedButton.hasClass('exitButton')) {
                            // just return to assignments
                            if (coreVariables.urlArgs.nexturl != undefined) {
                                document.location = coreVariables.urlArgs.nexturl;
                            }
                            else {
                                $("#cancelStep")[0].submit();
                            }
                        }
                        else {
                            // if it's any action button, send on the step SJS - commented out
                            var doSubmitReally = true;

                            if (doSubmitReally) {
                                $("#myForm")[0].submit();
                            }
                        }
                    }).fail(function () {

                        // re-enable the buttons
                        $(".awButton,.saveTabButton").button("enable");
                    });
                });
            });
        }, 250);
    }
    else {
        // but the cancel & exit button just goes back to assignments
        if (coreVariables.urlArgs.nexturl != undefined) {
            document.location = coreVariables.urlArgs.nexturl;
        }
        else {
            $("#cancelStep")[0].submit();
        }
    }
}

function coreSetActionStatus() {
    var dfdPromise = new jQuery.Deferred().resolve().promise();

    if (typeof runProcessActionStatus == 'function') {
        dfdPromise = runProcessActionStatus();
    }

    return dfdPromise;
}

function sendPOKickEmail() {
    var toStepName;
    var data;

    var dfd = new jQuery.Deferred().resolve();
    var sendEmail = ($(coreVariables.clickedButton).text() == "Kick Back to PO");


    if (sendEmail) {
        switch (coreVariables.stepNumber) {
            case "03":
                sendEmail = true;
                toStepName = "01. PO Fills Out Cost & Tech Evaluation"
                break;

            case "04":
                sendEmail = true;
                toStepName = "06. PO Reworks Package for RPF"
                break;

            case "07":
            case "08":
            case "09":
                sendEmail = true;
                toStepName = "13. PO Reworks Package for PK"
                break;
			case "16":
                sendEmail = true;
                toStepName = "21. PO Reworks Package for AOARD RPF"
                break;
        	case "17":
                sendEmail = true;
                toStepName = "21. PO Reworks Package for AOARD RPF"
                break;			
            default:
                sendEmail = false;
                break;
        }
    }

    if (sendEmail) {
        data = {
            "func": "cwewfeventscript.SendPOKickbackEmail"
			, "SubWorkID": coreVariables.subWorkID
			, "ProjectID": coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
			, "StepName": toStepName
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
			    console.log("Finished sendPOKickEmail ... ");
			}
		)
		.fail(
			function (results) {
			    console.log("FAILED sendPOKickEmail ... ");
			    for (n in results) {
			        console.log("" + n + ": " + results[n]);
			    }
			}
		);
    }

    return dfd.promise();
}

function fixDialogUI() {

    $(this).parent().attr('style', 'display:none;background: #ffffff url(/support/afrl/AFOSR/awardAction/graphics/ui-bg_flat_75_ffffff_40x100.png) 50% 50% repeat-x; color: #222222;');
    $(this).parent().find(".ui-widget-header").attr('style', 'border: 1px solid #aaaaaa; background: #cccccc url(/support/afrl/AFOSR/awardAction/graphics/ui-bg_highlight-soft_75_cccccc_1x100.png) 50% 50% repeat-x; color: #222222; font-weight: bold;');
}

function displayPage() {

    //This was $("#tabs").removeClass("gone");
    $("#content").removeClass("gone");

    coreVariables.afterLoad.fire(coreVariables.ActionWFVars).done(function () {
        $(".standardDialog").dialog({
            autoOpen: false
        , modal: true
        , resizable: false
        , closeText: "hide" //To do: what does this do? not what I had hoped
        , buttons: { "Ok": function () { $(this).dialog("close"); } }
        , close: function (event, ui) { }
        , create: fixDialogUI
        })
    });
}

function setUpIconsMenus() {
    setUpTopIcons();
    // 2014-05-14 Todd; to be able to fill out cost & tech eval from an Idea, rather than a workflow, some stuff needs to be disabled if we're not in a workflow
    if (!isNaN(parseInt(coreVariables.stepNumber))) {
        setUpButtonMenus();
    }
}

function setUpTopIcons() {

    $("#quickLinksHeader").on("click", function (icon) {

        if (icon.target.id == "home2") {
            window.open(coreVariables.homeIcon, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
        }

        if (icon.target.id == "help2") {
            window.open("https://livelink.ebs.afrl.af.mil/livelink/llisapi.dll?func=ll&objId=27408695&objAction=browse&viewType=1", "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
        }

        if (icon.target.id == "clarity2") {
            window.open(coreVariables.clarityIcon, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
        }

        if (icon.target.id == "sharepoint2") {
            window.open(coreVariables.sharepointIcon, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
        }
    });
}

//?????????????????????????????????????????????????????????????????????????????????
function retrieveFoldersNodeIds() {

    var basicRegex, isBasic, dfd;

    dfd = new jQuery.Deferred();
    basicRegex = /\bbasic\b/i;
    isBasic = basicRegex.test(coreVariables.ActionWFVars.ACTION_TYPE);

    if (isBasic) {
        dfd.resolve({ noValue: true });
    }
    else {
        $.when(rdCaseFile(), pkAwardFile()).done(function (rdCaseFileID, pkAwardFileID) {
            dfd.resolve({ rdCaseFileID: rdCaseFileID[0], pkAwardFileID: pkAwardFileID[0] });
        })
    }

    return dfd.promise();

    function rdCaseFile() {

        var rdCaseFile = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_FIND_RD_CASE_FILE
            , "inputLabel1": coreVariables.GenSelectVars.AWARD_NBR2
        };

        return $.ajax({
            url: "/livelink/llisapi.dll"
            , data: rdCaseFile
            , type: "POST"
            , success: function (data) {
                coreVariables.rdCaseFileID = data;
            }
        });
    }

    function pkAwardFile() {

        var pkAwardData = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_FIND_PK_AWARD_FILE
            , "inputLabel1": coreVariables.GenSelectVars.AWARD_NBR2
        };

        return $.ajax({
            url: "/livelink/llisapi.dll"
            , data: pkAwardData
            , type: "POST"
            , success: function (data) {
                coreVariables.pkAwardFileID = data;
            }
        });
    }
}

function setUpButtonMenus() {

    var basicRegex, additRegex, adminRegex, mfdRegex;
    var isBasic, isAddFund, isAdmin, isMFD;
    var autoGeneratedDocuments, attachmentsItems, attachmentsAwardFilesToolTip, clarityToolTip, autoDocsStepBarToolTip, newInstructionToolTip;
    var clarityMenuList;

    basicRegex = /\bbasic\b/i;
    additRegex = /\baddit/i;
    adminRegex = /\badmin\b/i;
    mfdRegex = /\bnon_contracting\b/i;


    isBasic = basicRegex.test(coreVariables.ActionWFVars.ACTION_TYPE);
    isAddFund = additRegex.test(coreVariables.ActionWFVars.ACTION_TYPE);
    isAdmin = adminRegex.test(coreVariables.ActionWFVars.ACTION_TYPE);
    isMFD = mfdRegex.test(coreVariables.ActionWFVars.ACTION_TYPE);

    retrieveFoldersNodeIds().done(function (outsideFolders) {

        attachmentsItems = [{ menuName: "Attachments", menuURL: coreVariables.formFlyout.attachmentsURLAddition }];

        if (parseInt(outsideFolders.rdCaseFileID) > 0) {
            attachmentsItems.push({ menuName: "R&D Case File", menuURL: coreVariables.baseURL + "?func=ll&nextURL=a&objAction=Browse&sort=name&objID=" + outsideFolders.rdCaseFileID });
        }

        if (parseInt(outsideFolders.pkAwardFileID) > 0) {
            attachmentsItems.push({ menuName: "PK Award File", menuURL: coreVariables.baseURL + "?func=ll&nextURL=a&objAction=Browse&sort=name&objID=" + outsideFolders.pkAwardFileID });
        }

        $("#attachmentsStepBar").buttonDropDown({ menuButtonActive: "dropDown button active", menuList: attachmentsItems });
    });

    clarityMenuList = [{ menuName: "Research Project", menuURL: coreVariables.clarityFlyout.projectURL }
    , { menuName: "Award Profile", menuURL: coreVariables.clarityFlyout.profileURL }
    , { menuName: "Funding Profile", menuURL: coreVariables.clarityFundingProfileURL }
    , { menuName: "Deliverables", menuURL: coreVariables.clarityFlyout.deliverablesURL }];

    //Clarity DropDown
    $("#caStepBar").buttonDropDown({
        menuButtonActive: "dropDown button active", menuList: clarityMenuList
    });

    //Auto-Generated Documents -> this dropdown is different based on the step and the type of action
    autoGeneratedDocuments = [];
    if (!isAdmin) {
        autoGeneratedDocuments.push({ menuName: "Task Summary", menuURL: "/livelink/llisapi.dll?func=ll&objAction=RunReport" + coreVariables.formFlyout.taskSumURLAddition });
    }
    if (isBasic || isAddFund) {
        autoGeneratedDocuments.push({ menuName: "Technical Evaluation", menuURL: "/livelink/llisapi.dll?func=ll&objAction=RunReport" + coreVariables.formFlyout.techEvalURLAddition });
        autoGeneratedDocuments.push({ menuName: "Cost Evaluation", menuURL: "/livelink/llisapi.dll?func=ll&objAction=RunReport" + coreVariables.formFlyout.costEvalURLAddition });
    }
    if (isBasic) {
        autoGeneratedDocuments.push({ menuName: "AFRL Form 1", menuURL: "/livelink/llisapi.dll?func=ll&objAction=RunReport" + coreVariables.formFlyout.form1URLAddition });
    }
    if ((coreVariables.stepName == "PK Team Lead Assigns Action"
        || coreVariables.stepName == "PK Buyer Works Action"
        || coreVariables.stepName == "PK Officer Reviews and Signs Action"
        || coreVariables.stepName == "PO Reworks Package for PK"
        || coreVariables.stepName == "PA Reworks PR for PK"
        || coreVariables.stepName == "Distribution of Award Action"
        || coreVariables.stepName == "PK Division Review"
        || coreVariables.stepName == "PK Policy Review"
        || coreVariables.stepName == "JA Legal Review"
        || coreVariables.stepName == "RPF Decommits Funding") && !isMFD) {

        autoGeneratedDocuments.push({ menuName: "Record of Coordination", menuURL: "/livelink/llisapi.dll?func=ll&objAction=RunReport" + coreVariables.formFlyout.recCoordURLAddition });
    }

    if (ENVIRONMENT != "PROD") {
        autoGeneratedDocuments.push({ menuName: "Workflow Status", menuURL: "/livelink/llisapi.dll?func=ll&objAction=RunReport&objID=" + coreVariables.AW_WORKFLOW_STATUS + "&WF_ID=" + coreVariables.ActionWFVars.RS_ACTION_WF_ID + "&FK_CLARITY_PROFILE_ID=" + coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID });
    }

    $("#autoDocsStepBar").buttonDropDown({ menuButtonActive: "dropDown button active", menuList: autoGeneratedDocuments });

    //Tool Tip for the New Instruction button - I know the users will be confused
    attachmentsAwardFilesToolTip = "Find Workflow folders and attachments.";
    clarityToolTip = "Find the action in Clarity."
    newInstructionToolTip = "Provide special instructions to steps later in the workflow.";
    autoDocsStepBarToolTip = "Documents and Evaluations generated by the workflow.";

    $("#attachmentsStepBar").attr("title", attachmentsAwardFilesToolTip);
    $("#caStepBar").attr("title", clarityToolTip);
    $("#autoDocsStepBar").attr("title", autoDocsStepBarToolTip);
    $("#newInstructionStepBar").attr("title", newInstructionToolTip);

    $("#newInstructionStepBar").on("click", function () {
        msgNewMessage();
    });
}

function setUpCoreDisplay() {
    var idString = "";

    $('title').html(coreVariables.stepName);
    $("#stepName2").html(coreVariables.stepName);

    // 2014-05-14 Todd; to be able to fill out cost & tech eval from an Idea, rather than a workflow, some stuff needs to be disabled if we're not in a workflow
    if (!isNaN(parseInt(coreVariables.stepNumber))) {
        // Set the displayed values in the step header. If this is the basic, use proposal number and the action type
        if (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) {
            idString = coreVariables.GenSelectVars.AWARD_PROPOSAL_NBR + " Basic (";
        }
        else {
            //any other action, use the award number and the action type
            idString = coreVariables.GenSelectVars.AWARD_NBR2 + " " + coreVariables.GenSelectVars.AP_MOD_NAME + " (";
        }

        // PI name is correctly cased in the DB--faking camel case actually makes it worse
        idString += coreVariables.GenSelectVars.INST_P_LASTNAME + ")";

        $("#projectTitle").text(idString);
        $("#projectTitle").attr("title", coreVariables.GenSelectVars.AWARD_TITLE);
    }

    return new jQuery.Deferred().resolve().promise();
}

// preload the next value from the audit sequence
function preLoadAuditSeq() {

    var seqSendData = {
        "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.auditWF_loadSeqID
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
        , data: seqSendData
        , type: "POST"
        , dataType: 'json'
        , jsonp: null
        , jsonpCallback: null
    })
    .done(function (result) {
        coreVariables.loadedAuditSeqValue = result.myRows[0].RS_WF_AUDIT_LOG_ID;
    })
    .fail(function (result) {

        if (coreVariables.devServer) {
            alert("How did preLoadAuditSeq fail????");
        }
    });

    // This call can complete asynchronously, so return a resolved deferred for this callback.
    return new jQuery.Deferred().resolve().promise();
}

// Prepare the flyouts for clicking +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function setUpFlyOuts() {
    var dfd = new jQuery.Deferred();

    var actionFlyOutParameters = {
        "func": "ll"
        , "objAction": "RunReport"
        , "objID": coreVariables.retrieveActionInformation
        , "inputLabel1": ""
        , "inputLabel2": ""
        , "inputLabel3": ""
        , "inputLabel4": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
    };

    var awardFlyOutParameters = {
        "func": "ll"
        , "objAction": "RunReport"
        , "objID": coreVariables.retrieveAwardInformation
        , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        , "inputLabel2": ""
        , "inputLabel3": ""
        , "inputLabel4": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
    };

    var piFlyOutParameters = {
        "func": "ll"
        , "objAction": "RunReport"
        , "objID": coreVariables.retrievePI
        , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        , "inputLabel2": ""
        , "inputLabel3": ""
    };

    var institutionFlyOutParameters = {
        "func": "ll"
        , "objAction": "RunReport"
        , "objID": coreVariables.retrieveInstitution
        , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        , "inputLabel2": ""
        , "inputLabel3": ""
    };

    $("#actionFlyOut").flyOut({ "width": "640", "retrieveMessageParameters": actionFlyOutParameters, "retrieveMessage": retrieveFlyOut });
    $("#awardFlyOut").flyOut({ "width": "640", "retrieveMessageParameters": awardFlyOutParameters, "retrieveMessage": retrieveFlyOut });
    $("#piFlyOut").flyOut({ "width": "240", "retrieveMessageParameters": piFlyOutParameters, "retrieveMessage": retrieveFlyOut });
    $("#institutionFlyOut").flyOut({ "width": "300", "retrieveMessageParameters": institutionFlyOutParameters, "retrieveMessage": retrieveFlyOut });

    return dfd.resolve().promise();
}

//
// Load data/html for the three main flyouts
//
function retrieveFlyOut(retrieveMessageParameters, flyOut) {

    var deferredAjaxResult, dfd = new jQuery.Deferred();

    deferredAjaxResult = $.ajax({
        url: "/livelink/llisapi.dll"
        , data: retrieveMessageParameters
        , type: "POST"
        , beforeSend: function () { $(flyOut).find(".flyOutContent").empty(); }
    });

    deferredAjaxResult
    .done(function (results) {
        genericAjaxInsUpdDelErrHandling(results)
        .fail(function (result) {
            dfd.fail("Error in retrieveInstitutionData: URL: " + coreJSONDataToURLArgs(retrieveMessageParameters));
        }).done(function (result) {
            dfd.resolve(result);
        });
    });

    return dfd.promise();
}

////////////////////////////////////////////////////////////////////////////////////////////
//
//                           SAVING FUNCTIONS
//
////////////////////////////////////////////////////////////////////////////////////////////

function saveRS_ACTION_WF(theButton) {

    var dfd, actionSendData;

    dfd = jQuery.Deferred();

    actionSendData = $("#actionForm").serialize();

    $.ajax({
        url: "/livelink/llisapi.dll"
        , data: actionSendData
        , type: "POST"
        , async: false
    }).done(function (refreshData) {
        genericAjaxInsUpdDelErrHandling(refreshData).done(function () {
            dfd.resolve();
        }).fail(function (result) {
            alert("Error saving in saveRS_ACTION_WF: URL: " + actionSendData);
        });
    }).fail(function (refreshData) {
        dfd.reject();
        alert("huh? the deferredAjaxResult of RS_ACTION_WF failed??: " + actionSendData);
    });

    return dfd.promise();
}

//SJS - remove asynch
function saveRS_WF_AUDIT_LOG(theButton) {

    var dfd, auditSendData;

    dfd = jQuery.Deferred();

    auditSendData = {
        "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_I_RS_WF_AUDIT_LOG_DESCRIPTION//coreVariables.auditWF_insertID
            , "inputLabel1": coreVariables.loadedAuditSeqValue
            , "inputLabel2": coreVariables.wfID
            , "inputLabel3": coreVariables.stepName.replace("&amp;", "&")
            , "inputLabel4": coreVariables.currentUserID
            , "inputLabel5": coreVariables.clickedButton.text() // Button
            , "inputLabel6": coreVariables.daysAtStep
            , "inputLabel7": coreVariables.description
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
        , data: auditSendData
        , type: "POST"
        //, async: false
    }).done(function (refreshData) {
        genericAjaxInsUpdDelErrHandling(refreshData).done(function () {
            dfd.resolve();
        }).fail(function (result) {
            dfd.reject();
            alert("Error saving in saveRS_WF_AUDIT_LOG: URL: " + coreJSONDataToURLArgs(auditSendData));
        });
    });

    return dfd.promise();
}

function confirmFoldersAtStep7(theButton) {

    var dfd, confirmSendData;

    dfd = jQuery.Deferred();

    // no folder changes until sending on
    if (!$(coreVariables.clickedButton).hasClass("exitButton") && !$(coreVariables.clickedButton).hasClass("kickButton")) {

        if ((coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1)
             && (
                    (coreVariables.stepNumber == "03") // Initially "07" -> New Step is Scheduler
                    || ((coreVariables.stepNumber == "16") && (coreVariables.ActionWFVars.OFFICE == "IOA"))
                )
           ) {
            confirmSendData = {
                "func": "cwewfeventscript.AddActionWFAttachmentFolders"
                    , "workID": coreVariables.workID
                    , "subWorkID": coreVariables.subWorkID
                    , "contractType": coreVariables.GenSelectVars.CONTRACT_TYPE
            };

            $.ajax({
                url: "/livelink/llisapi.dll"
                , data: confirmSendData
                , jsonp: null
                , jsonpCallback: null
                , type: "POST"
                //, async: false
            }).done(function (result) {
                if (!result.Ok) {
                    dfd.reject();
                    alert("Error saving in confirmFoldersAtStep7, ErrMsg: " + result.ErrMsg + " URL: " + coreJSONDataToURLArgs(confirmSendData));
                }
                else {
                    dfd.resolve();
                }
            })
            .fail(function (refreshData) {
                dfd.reject();
                alert("huh? the deferredAjaxResult of confirmFoldersAtStep7 failed??: " + coreJSONDataToURLArgs(confirmSendData));
            });
        }
        else {
            dfd.resolve();
        }
    }
    else {
        dfd.resolve();
    }

    return dfd.promise();
}

function generatePDFs() {

    var genPDFRequest;

    var deferred = new jQuery.Deferred();

    if (((coreVariables.stepNumber == "01") || (coreVariables.stepNumber == "06") || (coreVariables.stepNumber == "13")) && (coreVariables.GenSelectVars.PROJECT_TYPE != "Outgoing MFD")) {

        genPDFRequest = {
            "func": "cwewfeventscript.JRPDFFromLRToAttachmentsFolder"
            , "workid": coreVariables.workID
            , "subworkid": coreVariables.subWorkID
            , "lrnick": "SelectCostEvaluationsforCostEvalJ"
            , "templatenick": "AW_COST_EVALUATION_JASPER"
            , "PDFOutputName": "Cost Evaluation.pdf"
            , "folfiltertype": "STARTS"
            , "folfilterval": "02"
            , "inputLabel1": coreVariables.wfID
            , "inputLabel2": coreVariables.GenSelectVars.IDEA_ID
        };

        var pdf1Result = $.ajax({
            url: "/livelink/llisapi.dll"
            , data: genPDFRequest
            , type: "POST"
        });

        pdf1Result
        .done(function (results) {
            console.log("genCostEvalPDF completed ... ");
            for (n in results) {
                console.log("" + n + ": " + results[n]);
            }
        });

        genPDFRequest = {
            "func": "cwewfeventscript.JRPDFFromLRToAttachmentsFolder"
            , "workid": coreVariables.workID
            , "subworkid": coreVariables.subWorkID
            , "lrnick": "SelectTechEvaluationsforTechEvalJ"
            , "templatenick": "AW_TECH_EVALUATION_JASPER"
            , "PDFOutputName": "Tech Evaluation.pdf"
            , "folfiltertype": "STARTS"
            , "folfilterval": "02"
		    , "inputLabel1": coreVariables.ActionWFVars.BAA
		    , "inputLabel2": coreVariables.wfID
		    , "inputLabel3": coreVariables.GenSelectVars.IDEA_ID
        };

        var pdf2Result = $.ajax({
            url: "/livelink/llisapi.dll"
            , data: genPDFRequest
            , type: "POST"
        });

        pdf2Result
        .done(function (results) {
            console.log("genTechEvalPDF completed ... ");
            for (n in results) {
                console.log("" + n + ": " + results[n]);
            }
        });

        return $.when(pdf1Result, pdf2Result);
    }

    return deferred.resolve().promise();
}

function sendEmailCertifiedPR(sendOn) {

    var dfd, emailData;

    dfd = new jQuery.Deferred();

    if (sendOn.stepNumber == "05" && $(sendOn.button[0]).attr("name") == "CertPR") {
        emailData = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_EMAIL_PR_CERTIFIED_GENERATOR
            , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
            , "ENVIRONMENT": sendOn.ENVIRONMENT
        };

        $.ajax({
            url: "/livelink/llisapi.dll"
            , data: emailData
            , type: "POST"
            , success: function (data) {
                dfd.resolve();
            }
            , fail: function () {
                alert("Failure sending message that PR is ready to PK");
                dfd.reject();
            }
        });
    }
    else {
        dfd.resolve();
    }

    return dfd.promise();
}

function sendMFDComplete(sendOn) {

    var dfd, emailData;

    dfd = new jQuery.Deferred();

    if (sendOn.stepNumber == "19" && $(sendOn.button[0]).attr("name") == "Finance Complete") {
        emailData = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_EMAIL_MFD_COMPLETE_GENERATOR
            , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
        };

        $.ajax({
            url: "/livelink/llisapi.dll"
            , data: emailData
            , type: "POST"
            , success: function (data) {
                dfd.resolve();
            }
            , fail: function () {
                alert("Failure sending message that PR is ready to PK");
                dfd.reject();
            }
        });
    }
    else {
        dfd.resolve();
    }
}

function sendDecommit(sendOn) {

    var dfd, emailData;

    dfd = new jQuery.Deferred();

    if (sendOn.stepNumber == "20" && $(sendOn.button[0]).attr("name") == "Decommitted") {
        emailData = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_EMAIL_DECOMMIT_GENERATOR
            , "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
        };

        $.ajax({
            url: "/livelink/llisapi.dll"
            , data: emailData
            , type: "POST"
            , success: function (data) {
                dfd.resolve();
            }
            , fail: function () {
                alert("Failure sending message regarding decommit");
                dfd.reject();
            }
        });
    }
    else {
        dfd.resolve();
    }

}

////////////////////////////////////////////////////////////////////////////////////////////
//
//                           UTILITY FUNCTIONS
//
////////////////////////////////////////////////////////////////////////////////////////////

// This is a generic error checking function that _every_ insert, update, or delete ajax call should use
// It will find the most common errors and more importantly report them back to us so that we can catch
// them early
// You should look at ams\aaw\WR\05\LR_TEST for an example of the correct way to use this function
function genericAjaxInsUpdDelErrHandling(result, textStatus, thePromise) {
    var dfd = new jQuery.Deferred();

    if (result.match("&nbsp;No results found</TD></TR>") != null) {
        // success
        dfd.resolve(result);
    }
    else if (result.match('<FORM NAME="ReportPrompts"') != null) {
        // This should call a common function to properly handle the error (email and pop an error message to the user)

        // After that, it has to inform the caller that the fail occurred
        if (coreVariables.devServer) {
            alert("The LiveReport is missing inputs");
        }
        dfd.reject("Arg! Missing input values!");
    }
    else if (result.match('<TITLE>Content Server - Error</TITLE>') != null) {
        // This could be an oracle error on execution, or any number of Livelink errors...permissions,
        // object not found, error connecting to db, etc etc

        // This should call a common function to properly handle the error (email and pop an error message to the user)

        // After that, it has to inform the caller that the fail occurred
        if (coreVariables.devServer) {
            alert("The LiveReport had an error");
        }
        dfd.reject("uh-oh...SERIOUS problem!");
    }
    else {
        // Ending up here would be reasonable if this handler is called for a select...but just 
        // in case, this should email someone so they can search for a new kind of error

        dfd.resolve(result);
    }

    return dfd.promise();
}

function coreJSONDataToURLArgs(jsonData) {
    var url = "?";

    for (n in jsonData) {
        val = jsonData[n];
        if (url.length > 1) {
            url += "&";
        }
        url += n + "=" + jsonData[n];
    }

    return url;
}

function coreCleanTextField(field) {
    field = field.replace(/\$/g, "%24");
    field = field.replace(/\&/g, "%26");
    field = field.replace(/\+/g, "%2B");
    field = field.replace(/,/g, "%2C");
    //field = field.replace(////g,"%2F");
    field = field.replace(/:/g, "%3A");
    field = field.replace(/;/g, "%3B");
    field = field.replace(/=/g, "%3D");
    field = field.replace(/\?/g, "%3F");
    field = field.replace(/@/g, "%40");
    field = field.replace(/ /g, "+");

    return field;
}

function coreCleanTextarea(textarea) {
    var field = $(textarea).val();


    if ($(textarea).hasClass("teGhostText")) {
        field = "";
    }
    else {
        field = field.replace(/\$/g, "%24");
        field = field.replace(/\&/g, "%26");
        field = field.replace(/\+/g, "%2B");
        field = field.replace(/,/g, "%2C");
        //field = field.replace(////g,"%2F");
        field = field.replace(/:/g, "%3A");
        field = field.replace(/;/g, "%3B");
        field = field.replace(/=/g, "%3D");
        field = field.replace(/\?/g, "%3F");
        field = field.replace(/@/g, "%40");
        field = field.replace(/ /g, "+");
    }

    return field;
}

//
// Convert a javascript Date into a string "MM/DD/YYYY" for submission to LL
//
function formatDate(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) month = "0" + month; if (day < 10) day = "0" + day;
    return month + "/" + day + "/" + date.getUTCFullYear();
}

//
// Convert a javascript Date into a string "MM/DD/YYYY:HH:MI:SS" for submission to LL
//
function formatDateWithTime(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) month = "0" + month; if (day < 10) day = "0" + day;
    return month + "/" + day + "/" + date.getUTCFullYear() + ":" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

//
// Convert a javascript Date into a string "YYYY-MM-DDTHH:MI:SS" for submission to Clarity
//
function formatDateForXOG(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) month = "0" + month; if (day < 10) day = "0" + day;
    return date.getUTCFullYear() + "-" + month + "-" + day + "T08:00:00";
}

//
// Convert a javascript Date into a string "MM/DD/YYYY:HH:MI:SS" for submission to LL
//
function formatDateWithTimeForXOG(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var sec = date.getSeconds();
    if (month < 10) month = "0" + month; if (day < 10) day = "0" + day;
    if (hour < 10) hour = "0" + hour; if (mins < 10) mins = "0" + mins; if (sec < 10) sec = "0" + sec;
    return date.getUTCFullYear() + "-" + month + "-" + day + "T" + hour + ":" + mins + ":" + sec;
}
