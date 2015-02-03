define(["jquery", "jqueryui"
   , generalVariablesApp
   , variablesObjectInitiate
   , variablesURLAppURL
   , pluggInsAppURL
   , coreAppURL], function () {

       coreVariables.stepValidator = validateStep();

       validateOutSidePageSetup();

       coreVariables.stepValidator.onSuccess = validateOutSidePage;
       coreVariables.stepValidator.onFail = validationFail;

       return { stepValidator: coreVariables.stepValidator };
   });

function validateStep() {

    var validateStack = new Array();
    var invalidTabs;
    var processValidation = function () {
        var valid = true;
        invalidTabs = new Array();
        for (var i = 0; i < validateStack.length; i++) {
            if (!validateStack[i].validationMethod()) {
                invalidTabs.push(validateStack[i].tabName);
                valid = false;
            }
        }
        return valid;
    };
    return {
        // Expects JSON {"tabName","validationMethod"}
        // validationFunction either return true or false
        add: function (tabValidation) {
            validateStack.push(tabValidation);
        },
        onSuccess: function () {
            var dfd = new jQuery.Deferred();
            return dfd.resolve().promise();
        },
        onFail: function () {
            var dfd = new jQuery.Deferred();
            return dfd.resolve().promise();
        },

        validateStep: function () {
            var valid = processValidation();
            if (valid) {
                this.onSuccess();
            }
            else {
                this.onFail(invalidTabs);
            }
            return valid;
        }
    };
}

function validateOutSidePageSetup() {

    $("#awOutsideWFError").dialog({
        autoOpen: false
        , modal: true
        , resizable: false
        , width: 560
        , buttons: [
              { text: "OK", click: validateOutSidePageOk }]
        , create: fixDialogUI
        , close: validateOutSidePageClose
    });
}

function validateOutSidePageClose() {

    $(".awButton,.saveTabButton").button("enable");
    $("#awOutsideWFMessageContainerClarity, #awOutsideWFMessageContainerDocuments").empty();
}

function validateOutSidePageOk() {

    $(this).dialog("close");
}

function validateOutSidePage() {

    $.when(validateFolders(), validateClarity(), validateClarityFundingProfile(), validateClarityDeliverables(), validateStepCompletion(), validatePlannedFunding()).done(testSuccess).fail(function () {
        $("#awOutsideWFError").dialog("open");
    });
}

function testSuccess() {

    var argumentCount = 0;

    for (; argumentCount < arguments.length; argumentCount++) {

        if (arguments[argumentCount] == "failure") {
            $("#awOutsideWFError").dialog("open");
            break;
        }
    }

    if (arguments.length == argumentCount) {
        validationSuccess();
    }
}

function validationSuccess() {
    var sendNow = true;
    var btn = $(coreVariables.clickedButton);

    switch (coreVariables.stepNumber) {

        case "01":
            if (coreVariables.ActionWFVars.OFFICE == "IOA") {
                $("#actionWFEVAL_NEXT_STEP").val("AOARD");
            }
            else {
                $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
                if ((coreVariables.ActionWFVars.ACTION_TYPE == "additional")
                     && (coreVariables.ActionWFVars.HA_USE == "Yes")
                     && (coreVariables.step2Completed)) {

                    // this must be a kick to 1 in an AF, since step 2 is already completed
                    $("#actionWFEVAL_NEXT_STEP").val("Scheduler");
                }
                else if ((coreVariables.ActionWFVars.HA_USE == "Yes") && (!coreVariables.step2Completed)) {
                    $("#actionWFEVAL_NEXT_STEP").val("Risk Manager");
                }
            }
            break;

        case "02":
            $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
            break;

        case "03":

            $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));

            if (coreVariables.ActionWFVars.OFFICE == "IOA") {
                $("#actionWFEVAL_NEXT_STEP").val("AOARD");
            }

            if (coreVariables.ActionWFVars.ACTION_TYPE == "non_contracting") {
                $("#actionWFEVAL_NEXT_STEP").val("Outgoing MFD");
            }

            break;

        case "04":
            $("#actionWFEVAL_PA_KICKBACK_TO_PO").val("No");
            break;

        case "05":
        case "06":
            // Step 5 and 6 also don't set ENS
            break;

        case "07":
        case "09":
            if (btn.text() == "Send to Distribution") {
                sendNow = false;
                $("#distConfirm").dialog("open");
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

            if (sendNow) {
                $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
            }
            break;

        case "10":
            if (btn.attr("name") == "Sender") {
                // we're all good, just send on
            }
            else {
                // this is the first of the parallel steps to complete...normal processing here.
                $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
            }
            $("#actionWFEVAL_DIVISION_REVIEW").val("");
            break;
        case "11":
            if (btn.attr("name") == "Sender") {
                // we're all good, just send on
            }
            else {
                // this is the first of the parallel steps to complete...normal processing here.
                $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
            }
            $("#actionWFEVAL_POLICY_REVIEW").val("");

            break;
        case "12":

            // The name attribute should be either the new value of EVAL_NEXT_STEP or "Sender". If it is "Sender" it's because
            // one of the parallel review steps has already completed and properly set EVAL_NEXT_STEP. 
            if (btn.attr("name") == "Sender") {
                // we're all good, just send on
            }
            else {
                // this is the first of the parallel steps to complete...normal processing here.
                $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
            }
            $("#actionWFEVAL_LEGAL_REVIEW").val("");
            break;

        case "13":
        case "14":

            // The name attribute should be the new value of EVAL_NEXT_STEP. If it was never changed from the default or set to "", we're hosed.
            if ((btn.attr("name") == "Sender") || (btn.attr("name") == "") || (btn.attr("name") == undefined)) {
                sendNow = false;
                alert("Please call the help desk and inform them that you are getting an 'invalid return to' error at step " +
                    coreVariables.stepNumber + ".");
            }
            else {
                $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
            }
            break;
        case "18":

            if (btn.attr("name") == "MFD Review Complete") {
                $("#actionWFEVAL_NEXT_STEP").val(btn.attr("name"));
            }
            break;
        default:

            // Using the button "name" attr as eval_next_step is a hack just for simple testing of the workflow map flow
            $("#actionWFEVAL_NEXT_STEP").val(btn.attr('name'));
            break;
    }

    if (sendNow) {

        sendStepOn();

    }
    else if (btn.attr('name') == "Distribution") {
        // Send on for Distribution is handled by the confirmation dialog...
    }
    else {
        // user is hosed. unlock the buttons so they can save and exit
        $(".awButton,.saveTabButton").button("enable");
    }

    return new jQuery.Deferred().resolve().promise();
}

function validationFail(badTabs) {

    var msg = "Before you can send this step on, you must correct issues in the following tab"

    if (badTabs.length == 1) {
        msg += ":";
    }
    else {
        msg += "s:";
    }

    for (i = 0; i < badTabs.length; i++) {
        if (i > 0) {
            msg += ",";
        }
        msg += " " + badTabs[i];
    }

    $(".awButton,.saveTabButton").button("enable");
    $("#awStepErrorsText").text(msg);
    $("#awStepErrors").dialog("open");

    return new jQuery.Deferred().resolve().promise();
}

function validatePlannedFunding() {

    var dfd, sendData;

    dfd = new jQuery.Deferred();

    sendData = {
        func: "ll"
        , objAction: "RunReport"
        , objID: coreVariables.AW_VALIDATE_PLANNED_FUNDING
        , inputLabel1: coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
    };

    if (coreVariables.stepNumber == "08" || coreVariables.stepNumber == "16")  { // jhn jan 2015 added "16"

        $.ajax({
            url: "/livelink/llisapi.dll"
            , data: sendData
            , type: "POST"
            , dataType: 'json'
            , success: function (data) {

                var newMessage, wrongActionCount, wrongAction, wrongActionHolder, wrongActionLink, currentProfileID, errorText, fundingText, wordingHolder;
                var clarityFundingProfileLink, clarityAwardProfileLink, textLink, finalText;

                if (typeof (data.nothing) != "undefined") {
                    dfd.resolve();
                }
                else {
                    newMessage = $("<div>").css({ "margin-bottom": "8px" });

                    clarityAwardProfileLink = $("<span>",{text:"Clarity Award Profile"}).css({ "text-decoration": "underline" }).addClass("blockHeader");

                    $(clarityAwardProfileLink).bind("click",function(){
                        window.open(coreVariables.clarityRelative + "niku/nu#action:projmgr.projectProperties&odf_view=projectCreate.subObjList.afors_amendment&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
                    });

                    textLink = $("<span>",{text:" & "});
                    clarityFundingProfileLink = $("<span>",{text:"Clarity Funding Profile"}).css({ "text-decoration": "underline" }).addClass("blockHeader");

                    $(clarityFundingProfileLink).bind("click",function(){
                        window.open(coreVariables.clarityFundingProfileURL, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
                    });

                    finalText = $("<span>",{text:": Please make sure that the Action Planned Amount in each Award Profile equals the sum of all amounts in the corresponding Funding Profile(s)."})

                    $(newMessage).append(clarityAwardProfileLink).append(textLink).append(clarityFundingProfileLink).append(finalText);

                    $("#awOutsideWFMessageContainerClarity").append(newMessage);

                    dfd.resolve("failure");
                }
            }
        });
    }
    else {
        dfd.resolve();
    }

    return dfd.promise();
}

function validateStepCompletion() {

    var sendData;
    var mydfd;

    var dfd = new jQuery.Deferred();


    if (coreVariables.stepNumber == "04" && (coreVariables.ActionWFVars.ACTION_TYPE == "non_contracting")) {

        // This select statement looks at the data in the LL Table WSubWorkTask
        // It works well for any step that is NOT in one of the trees of choices, like a Milestone.
        // It does NOT work for steps in a tree, like 1-3 or 7-15 or 18
        sendData = {
            "func": "cwewfeventscript.ExecuteLR"
            , "lrnick": "Select_Date_Workflow_Step_Completed"
            , "inputLabel1": coreVariables.subWorkID
            , "inputLabel2": "Milestone - 06"
        };

        mydfd = $.ajax({
            url: "/livelink/llisapi.dll"
            , data: sendData
            , type: "POST"
            , jsonp: null
            , jsonpCallback: null
        });

        mydfd.done(function (results) {
            if (results.contents == undefined || results.contents.length < 1 || results.contents[0].SUBWORKTASK_DATEDONE == undefined) {
                var newMessage = $("<div>").css({ "margin-bottom": "8px" });

                newMessage.append($("<span>", { text: 'Please coordinate with PK to complete the review of the Outgoing MFD.' }).css({ "margin-left": "5px" }));

                $("#awOutsideWFMessageContainerDocuments").append(newMessage);

                //dfd.reject();
                dfd.resolve("failure");
            }
            else {
                dfd.resolve();
            }
        }).fail(function (data) {
            dfd.reject();
            console.log("validateStepCompletion() failed - maybe IE aborted request");
        });
    }
    else if (coreVariables.stepNumber == "01") {

        // This select statement looks at the data in the LL table RS_WF_AUDIT_LOG
        // It works well for any step that is completed by the user clicking a button.
        sendData = {
            func: "ll"
            , objAction: "RunReport"
            , objID: coreVariables.AW_SEL_RS_WF_AUDIT_LOG_BY_WF_STEP
            , inputLabel1: ""
            , inputLabel2: coreVariables.ActionWFVars.RS_ACTION_WF_ID
            , inputLabel3: "Risk Manager"
        };

        coreVariables.step2Completed = false;

        mydfd = $.ajax({
            url: "/livelink/llisapi.dll"
            , data: sendData
            , type: "POST"
            , async: true
            , dataType: 'json'
            , jsonp: null
            , jsonpCallback: null
        });

        mydfd.done(function (resultData) {
            coreVariables.step2Completed = false;
            if (resultData.nothing == "noResults") {
                // step 2 has not yet completed
            }
            else if (resultData.myRows.length >= 1) {
                if ((resultData.myRows[0].STEP_FILTER.toUpperCase().indexOf("RI") == 0) && (resultData.myRows[0].BUTTON_NAME == "Documents Complete")) {
                    coreVariables.step2Completed = true;
                }
            }
            dfd.resolve();
        }).fail(function (resultData) {
            //dfd.reject();
            dfd.resolve("failure");
            console.log("validateStepCompletion() failed during check for step 2 - maybe IE aborted request");
        });
    }
    else {
        dfd.resolve();
    }

    return dfd.promise();
}

function validateFolders() {

    var dfd = new jQuery.Deferred();
    var cnt = 0;
    var stepInformation = validateFolderLookUp(coreVariables.stepNumber);


    if (stepInformation.length > 0) {
        var n;
        var pair;

        var multi = outsideValidateMulti(dfd, stepInformation.length);

        for (n in stepInformation) {
            pair = stepInformation[n]
            var validateDocumentsData = {
                func: "cwewfeventscript.ListAttachmentContents"
                , workID: $("#workid").val()
                , subworkID: $("#subworkid").val()
                , FolFilterType: "STARTS"
                , FolFilterVal: pair.folFilterVal
                , FolCount: pair.folderCount
            };

            {
                $.ajax({
                    url: "/livelink/llisapi.dll"
                    , data: validateDocumentsData
                    , type: "POST"
                    , dataType: 'json'
                    , async: false
                })
                .done(function (result) {
                    if (!result.Ok) {
                        $("#awOutsideWFMessageContainerDocuments").text('Livelink error locating folder.');
                        //multi.oneFail();
                        multi.oneDone(true);
                    }
                    else {
                        if (result.Ok) {
                            if (pair.folderCount != undefined) {

                                cnt = result.Result.length;

                                var newMessage = $("<div>").css({ "margin-bottm": "8px" });

                                if (cnt == pair.folderCount) {
                                    newMessage
	                                .append($("<a>", { href: coreVariables.formFlyout.attachmentsURLAddition, text: "Attachments:", "class": "awLink otherLink" }).on("click", function () {
	                                    window.open(coreVariables.formFlyout.attachmentsURLAddition, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
	                                    return false;
	                                }))
	                                .append($("<span>", { text: pair.folderError }).css({ "margin-left": "5px" }));

                                    $("#awOutsideWFMessageContainerDocuments").append(newMessage);
                                    //multi.oneFail();
                                    multi.oneDone(true);
                                }

                                multi.oneDone();

                            }
                            else if (result.Result.length == 0) {  // result.Result is the list of documents in any folder that passes the filter

                                var newMessage = $("<div>").css({ "margin-bottom": "8px" });

                                if ((pair.folderError != undefined) && (pair.folderError.search(/05/) == -1)) {
                                    newMessage
	                                .append($("<a>", { href: coreVariables.formFlyout.attachmentsURLAddition, text: "Attachments:", "class": "awLink otherLink" }).on("click", function () {
	                                    window.open(coreVariables.formFlyout.attachmentsURLAddition, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
	                                    return false;
	                                }))
	                                .append($("<span>", { text: pair.folderError }).css({ "margin-left": "5px" }));
                                }
                                else {
                                    newMessage
                                    .append($("<span>", { text: pair.folderError }));
                                }

                                $("#awOutsideWFMessageContainerDocuments").append(newMessage);

                                //multi.oneFail();
                                multi.oneDone(true);

                            }

                            else {
                                //Dcoument exists - so resolve
                                multi.oneDone();
                            }
                        }

                    }
                })
                .fail(function (result) {
                    var newMessage = $("<div>").css({ "margin-bottom": "8px" });

                    $(newMessage).text("Unable to validate documents. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.");
                    $("#awOutsideWFMessageContainerDocuments").append(newMessage);

                    multi.oneFail();
                });
            } (pair)
        }
    }
    else {
        dfd.resolve();
    }

    return dfd.promise();
}

function validateFolderLookUp(stepName) {

    var stepInformation = new Array();

    switch (stepName) {
        case "01":
            // These checks are duplicated to step 3 for when the PO step is removed from the WF
            stepInformation[0] = { "folFilterVal": "01.", "folderError": 'Please upload the Proposal into the "01. Proposal" folder.' };
            stepInformation[1] = { "folFilterVal": "05.", "folderError": 'The Task Summary Sheet is missing from the "05. Task Summary Sheet" folder. Please contact the Service Desk to resolve this issue.' };
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) {
                // Basics must have a Form 14
                stepInformation[2] = { "folFilterVal": "07.", "folderError": 'Please upload the AFMC Form 14 into the "07. AFMC Form 14" folder.' };

                if (coreVariables.GenSelectVars.CONTRACT_TYPE.search(/grant/i) == -1) {
                    // Research Summary is now generated at WF end
                    //stepInformation[3] = { "folFilterVal": "04.", "folderError": 'The Research Summary is missing from the "04. Research Summary" folder. Please contact the Service Desk to resolve this issue.' };
                }
            }
            break;

        case "02":
            stepInformation[0] = { "folFilterVal": "10.", "folderError": 'Please upload the Risk Management Documents into the "10. Risk Management Documents" folder.' };
            break;

        case "03":

            //These checks duplicated from step 1 for when the PO step is removed from the WF
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) {
                stepInformation.push({ "folFilterVal": "01.", "folderError": 'Please upload the Proposal into the "01. Proposal" folder.' });
            }
            //Folder validations check for Outgoing MFD type
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/non_contracting/i) != -1) {
                stepInformation.push({ "folFilterVal": "01.", "folderError": 'Please upload the Proposal into the "01. Proposal" folder.' });
            }

            stepInformation.push({ "folFilterVal": "05.", "folderError": 'The Task Summary Sheet is missing from the "05. Task Summary Sheet" folder. Please contact the Service Desk to resolve this issue.' });

            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) {
                // Basics must have a Form 14
                stepInformation.push({ "folFilterVal": "07.", "folderError": 'Please upload the AFMC Form 14 into the "07. AFMC Form 14" folder.' });

                if (coreVariables.GenSelectVars.CONTRACT_TYPE.search(/grant/i) == -1) {
                    // Research Summary is now generate at WF end
                    //stepInformation.push({ "folFilterVal": "04.", "folderError": 'The Research Summary is missing from the "04. Research Summary" folder. Please contact the Service Desk to resolve this issue.' });
                }
            }

            //Folder validations check for Outgoing MFD type
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/non_contracting/i) != -1) {
                stepInformation.push({ "folFilterVal": "27.", "folderError": 'Please upload the DD1144/MOA/MOU into the "27. DD1144/MOA/MOU" folder.' });
            }
            break;

        case "05":
            stepInformation[0] = { "folFilterVal": "03.", "folderError": 'Please upload the Purchase Request into the "03. Funding Documents" folder.' };
            break;

        case "08":
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) != -1) {
                // Admin has Task Summary PDF
                stepInformation.push({ "folFilterVal": "05.", "folderError": 'The Task Summary Sheet is missing from the "05. Task Summary Sheet" folder. Please contact the Service Desk to resolve this issue.' });
            }
            stepInformation[0] = { "folFilterVal": "12.", "folderError": 'Please upload the CIR document into the "12. Contractor/Institution Responsibility" folder.' };
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1) {
                // anything other than Admin has Price negotiation memo folder
                stepInformation.push({ "folFilterVal": "13.", "folderError": 'Please upload the Price Negotiation Memo into the "13. Price Negotiation Memo" folder.' });
            }
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) != -1) {
                // Admin has Admin Memo folder
                stepInformation.push({ "folFilterVal": "13.", "folderError": 'Please upload the Administrative Memo into the "13. Administrative Memo" folder.' });
            }
            //All Grants with the exception of Admin actions must be checked
            if ((coreVariables.GenSelectVars.CONTRACT_TYPE.search(/grant/i) == 0) && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {
                stepInformation.push({ "folFilterVal": "18.", "folderError": 'Please upload the DD Form 2566 into the "18. DD Form 2566" folder.' });
            }
            if (coreVariables.GenSelectVars.CONTRACT_TYPE.search(/grant/i) == -1 && (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) == 0)) {
                // Grants need things in 19 and 20
                //stepInformation.push({ "folFilterVal": "19.", "folderError": 'Please upload the Acquisition Plan into the "19. Acquisition Plan" folder.' });
                stepInformation.push({ "folFilterVal": "20.", "folderError": 'Please upload the Certifications and Representations into the "20. Certifications & Representations " folder.' });
            }
            break;

        case "09":
            break;

        case "15":
            //SJS: Left this in - doesn't hurt because it will have been uploaded already at Step 8.  Easily could be removed
            if ((coreVariables.GenSelectVars.CONTRACT_TYPE.search(/grant/i) != -1) && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {
                stepInformation.push({ "folFilterVal": "18.", "folderError": 'Please upload the DD Form 2566 into the "18. DD Form 2566" folder.' });
            }
            if (coreVariables.GenSelectVars.CONTRACT_TYPE.search(/grant/i) == -1) {
                stepInformation.push({ "folFilterVal": "24.", "folderError": 'Please upload the FPDS into the "24. FPDS" folder.' });
            }
            stepInformation.push({ "folFilterVal": "25.", "folderError": 'Please upload the Letter of Award into the "25. Letter of Award to Institution" folder.' });
            stepInformation.push({ "folFilterVal": "26.", "folderError": 'Please upload the Award Document into the "26. Award Documents" folder.' });
            break;

        case "16":
            //These checks duplicated from step 1 for when the PO step is removed from the WF
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) {
                stepInformation.push({ "folFilterVal": "01.", "folderError": 'Please upload the Proposal into the "01. Proposal" folder.' }); 
            }

            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1) {
                stepInformation.push({ "folFilterVal": "03.", "folderError": 'Please upload the Purchase Request into the "03. Funding Documents" folder.' }); // jhn jan 2015: added 
                stepInformation.push({ "folFilterVal": "05.", "folderError": 'The Task Summary Sheet is missing from the "05. Task Summary Sheet" folder. Please contact the Service Desk to resolve this issue.' });
            }
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) {
            // Basics must have a Form 14	
                stepInformation.push({ "folFilterVal": "07.", "folderError": 'Please upload the AFMC Form 14 into the "07. AFMC Form 14" folder.' });
                if (coreVariables.GenSelectVars.CONTRACT_TYPE.search(/grant/i) == -1) {
                    // Research Summary is now generate at WF end
                    //stepInformation.push({ "folFilterVal": "04.", "folderError": 'The Research Summary is missing from the "04. Research Summary" folder. Please contact the Service Desk to resolve this issue.' });
                }
            }
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1) {
                stepInformation.push({ "folFilterVal": "11.", "folderError": 'Please upload the Foreign Disclosure Memo into the "11. Foreign Disclosure Meno" folder.' }); // jhn jan 2015: added 
            }
            break;

        case "17":
            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) {
                stepInformation.push({ "folFilterVal": "01.", "folderError": 'Please upload the Proposal into the "01. Proposal" folder.' });
                // jhn 1/26/2015: stepInformation.push({ "folFilterVal": "03.", "folderError": 'Please upload the Purchase Request into the "03. Funding Documents" folder.' });
                stepInformation.push({ "folFilterVal": "05.", "folderError": 'The Task Summary Sheet is missing from the "05. Task Summary Sheet" folder. Please contact the Service Desk to resolve this issue. ' });
                stepInformation.push({ "folFilterVal": "07.", "folderError": 'Please upload the AFMC Form 14 into the "07. AFMC Form 14" folder.' });
                stepInformation.push({ "folFilterVal": "12.", "folderError": 'Please upload the CIR document into the "12. Contractor/Institution Responsibility" folder.' });
                stepInformation.push({ "folFilterVal": "13.", "folderError": 'Please upload the Price Negotiation Memo into the "13. Price Negotiation Memo" folder.' });
                if (coreVariables.ActionWFVars.CONTRACT_TYPE == "Grant") {
                    stepInformation.push({ "folFilterVal": "18.", "folderError": 'Please upload the DD Form 2566 into the "18. DD Form 2566" folder.' });
                }
                stepInformation.push({ "folFilterVal": "26.", "folderError": 'Please upload the Award Document into the "26. Award Documents" folder.' });
            }

            if ((coreVariables.ActionWFVars.ACTION_TYPE.search(/option/i) != -1) || (coreVariables.ActionWFVars.ACTION_TYPE.search(/increment/i) != -1)) {
                // jhn 1/26/2015: stepInformation.push({ "folFilterVal": "03.", "folderError": 'Please upload the Purchase Request into the "03. Funding Documents" folder.' });
                stepInformation.push({ "folFilterVal": "05.", "folderError": 'The Task Summary Sheet is missing from the "05. Task Summary Sheet" folder. Please contact the Service Desk to resolve this issue. ' });
                stepInformation.push({ "folFilterVal": "12.", "folderError": 'Please upload the CIR document into the "12. Contractor/Institution Responsibility" folder.' });
                stepInformation.push({ "folFilterVal": "13.", "folderError": 'Please upload the Price Negotiation Memo into the "13. Price Negotiation Memo" folder.' });
                if (coreVariables.ActionWFVars.CONTRACT_TYPE == "Grant") {
                    stepInformation.push({ "folFilterVal": "18.", "folderError": 'Please upload the DD Form 2566 into the "18. DD Form 2566" folder.' });
                }
                stepInformation.push({ "folFilterVal": "26.", "folderError": 'Please upload the Award Document into the "26. Award Documents" folder.' });
            }
            break;

        case "19":
            //Folder validations check for Outgoing MFD type
            var msg;

            if (coreVariables.ActionWFVars.ACTION_TYPE.search(/non_contracting/i) != -1) {


                msg = 'Please upload the MFD Receipt into the "03. Funding Documents" folder.';
                stepInformation.push({ "folFilterVal": "03.", "folderError": msg, "folderCount": 1 });

                msg = 'Please upload the Purchase Request and MFD Receipt into the "03. Funding Documents" folder';
                stepInformation.push({ "folFilterVal": "03.", "folderError": msg, "folderCount": 0 });

            }
            break;
    }

    return stepInformation;
}

function outsideValidateMulti(dfd, total) {

    return {
        "totalCount": total
        , "anyFails": false
        , "owningDeferred": dfd
        , "countDone": 0
        , "failure": void 0
        , "oneDone": function (failure) {
            this.countDone += 1;

            if (failure) {
                this.failure = "failure";
            }

            this.complete();
        }
        , "oneFail": function () {
            this.countDone += 1;
            this.anyFails = true;

            this.complete();
        }
        , "complete": function () {
            if (this.countDone == this.totalCount) {
                if (this.anyFails) {
                    this.owningDeferred.reject();
                }
                else {
                    this.owningDeferred.resolve(this.failure);
                }
            }
        }
    };
}

function validateClarity() {

    var rejected = false;
    var dfd = new jQuery.Deferred();

    var stepInformation = validateClarityLookUp(coreVariables.stepNumber, coreVariables.ActionWFVars.ACTION_TYPE);

    if (stepInformation.objID != "empty") {

        var validateClarityData = {
            "func": "ll"
                , "objAction": "RunReport"
                , "objID": stepInformation.objID
                , "inputLabel1": stepInformation.inputLabel1
                , "inputLabel2": stepInformation.inputLabel2
        };

        $.ajax({
            url: "/livelink/llisapi.dll"
            , data: validateClarityData
            , type: "POST"
            , dataType: 'json'
            , async: false
            , success: function (result) {

                if (!result.hasOwnProperty("myRows")) { //Just in case LL craps out
                    $("#awOutsideWFMessageContainerClarity").text(stepInformation.errorText).css({ "text-decoration": "underline", "margin-bottom": "8px" });
                    //dfd.reject();
                    dfd.resolve("failure");
                }
                else {

                    if (!processClarityStatus(result.myRows)) {
                        //dfd.reject();
                        rejected = true;
                    }

                    if (!processClarityMustBeNull(result.myRows)) {
                        //rejected = true;
                        dfd.reject();
                    }

                    if (!processClarityMatchesStatus(result.myRows)) {
                        //rejected = true;
                        dfd.reject();
                    }

                    if (!rejected) {
                        dfd.resolve();
                    }
                    else {
                        dfd.resolve("failure");
                    }
                }
            }
        });
    }
    else {
        dfd.resolve();
    }

    return dfd.promise();
}

function validateClarityLookUp(stepName, ACTION_TYPE) {

    var stepInformation = { "objID": "empty", "inputLabel1": "empty", "inputLabel2": "empty", "errorText": "empty" }

    switch (stepName) {
        case "03":
            if (ACTION_TYPE != "non_contracting") {
                stepInformation.errorText = 'Error finding "PK Team" in Clarity. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.';
            }
            break;
        case "04":
            stepInformation.errorText = 'Error finding "Program Analyst" in Clarity. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.';
            break;
        case "05":
            stepInformation.errorText = 'Error finding "Committed Date" in Clarity. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.';
            break;
        case "07":
            stepInformation.errorText = 'Error finding "PK Buyer" in Clarity. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.';
            break;
        case "08":
            stepInformation.errorText = 'Error finding "Committed Date" in Clarity. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.';
            break;
        case "09":
            stepInformation.errorText = 'Error finding "Date Signed" in Clarity. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.';
            break;
        case "15":
            stepInformation.errorText = 'Error finding "Date PK Obligated" in Clarity. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.';
            break;
        case "16": // jhn 1/26/2015: added
            stepInformation.errorText = 'Error finding "Award Number" in Clarity. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.';
            break;
        case "17":
            stepInformation.errorText = 'Error finding "Award Number" in Clarity. Please refresh this page. If errors persist, please contact the Service Desk to resolve this issue.';
            break;
    }

    if (stepInformation.errorText != "empty") {
        stepInformation.objID = coreVariables.valdiateOutsideStepClarity;
        stepInformation.inputLabel1 = coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID;
        stepInformation.inputLabel2 = coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID;
    }

    return stepInformation;
}

function validateClarityFundingProfile() {

    var dfd = new jQuery.Deferred();
    var colName = "";
	var cols = []; // jhn jan 2015: added

	if ((coreVariables.stepNumber == "03") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {
		cols = ["PROPOSAL_NUMBER"];
	}
	else if ((coreVariables.stepNumber == "04") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {   
		cols = ["BPN"];
	}
	else if ((coreVariables.stepNumber == "05") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {  
		cols = ["COMMITTED_DATE"];
	}
	else if ((coreVariables.stepNumber == "08") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) { 
		cols = ["ACRN"];
	}
	else if  ((coreVariables.stepNumber == "16") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {   // jhn jan 2015: added "16"	
	    cols= ["BPN","ACRN","COMMITTED_DATE"];	
	}
	if (cols.length != 0) {
		for (var i= 0; i < cols.length; i++) {  // jhn jan 2015: added for loop for multiple column checks in step 16
			if (cols[i] != "") {
				colName = cols[i];
				var validateClarityData = {
					"func": "ll"
						, "objAction": "RunReport"
						, "objID": coreVariables.valdiateOutsideStepClarityBPN
						, "inputLabel1": coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
				};
		
				$.ajax({
					url: "/livelink/llisapi.dll"
					, data: validateClarityData
					, type: "POST"
					, dataType: 'json'
					, async: false
					, success: function (result) {
		
						if (processClarityStatusFundingProfile(colName, result.myRows)) {
							dfd.resolve();
						}
						else {
							//dfd.reject();
							dfd.resolve("failure");
						}
					}
				});
			}
			else {
			  dfd.resolve();
			}
		}
	}
	else {
        dfd.resolve();
    }
	
	return dfd.promise();
}


function validateClarityDeliverables() {

    //SJS - ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ for Basic actions only
    var dfd = new jQuery.Deferred();

    if (((coreVariables.stepNumber == "08") || (coreVariables.stepNumber == "17")) && (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) == 0)) {

        var validateDeliverablesData = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.validateDeliverablesClarity
            , "inputLabel1": $("#actionWFFK_CLARITY_PROJECT_ID").val()
        };

        $.ajax({
            url: "/livelink/llisapi.dll"
            , data: validateDeliverablesData
            , type: "POST"
            , dataType: 'json'
            , async: false
        }).done(function (data) {

            if (data.hasOwnProperty("nothing") && data.nothing == "noResults") {  // Double check for no deliverables - data.nothing == "noResults" probably unneccessary

                var newMessage = $("<div>").css({ "margin-bottom": "8px" });

                newMessage.append($("<a>", { href: coreVariables.clarityFlyout.deliverablesURL, text: "Clarity Deliverables:", class: "awLink otherLink" }).on("click", function () {
                    window.open(coreVariables.clarityFlyout.deliverablesURL, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
                    return false;
                }))
                    .append($("<span>", { text: 'Please create deliverables for this project in Clarity.' }).css({ "margin-left": "5px" }));

                $("#awOutsideWFMessageContainerDocuments").append(newMessage);

                //dfd.reject();
                dfd.resolve("failure");
            }
            else {
                dfd.resolve();
            }

        }).fail(function () {
            dfd.reject();
        });
    }
    else {
        dfd.resolve();
    }

    return dfd.promise();
}

function processClarityStatusFundingProfile(colName, myRows) {

    var fundingProfilePresent = false;
    var validFundingProfile = true;
    var nMissing = 0;
    var plural = "";

    if (myRows != null) {
        for (var rowNumber = 0; rowNumber < myRows.length; rowNumber++) {

            if (myRows[rowNumber][colName] == "" || myRows[rowNumber][colName] == null) {
                validFundingProfile = false;
                nMissing++;
            }

            fundingProfilePresent = true
        }

        if (nMissing > 1) {
            plural = "s";
        }

        if (colName == "COMMITTED_DATE") {
            colName = "Committed Date";
        }
    }
    else {
        var newMessage = $("<div>").css({ "margin-bottom": "8px" });

        newMessage
        .append($("<a>", { href: coreVariables.clarityFundingProfileURL, text: "Clarity Funding Profile:", class: "awLink otherLink" }).on("click", function () {
            window.open(coreVariables.clarityFundingProfileURL, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
            return false;
        }))
        .append($("<span>", { text: "There is no funding profile for this action. Please create at least one funding line for this project in Clarity." }).css({ "margin-left": "5px" }));

        $("#awOutsideWFMessageContainerDocuments").append(newMessage);
    }

    if (!validFundingProfile) {
        var newMessage = $("<div>").css({ "margin-bottom": "8px" });

        newMessage
        .append($("<a>", { href: coreVariables.clarityFundingProfileURL, text: "Clarity Funding Profile:", class: "awLink otherLink" }).on("click", function () {
            window.open(coreVariables.clarityFundingProfileURL, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
            return false;
        }))
        .append($("<span>", { text: 'is missing ' + nMissing + ' ' + colName + plural + '. Please enter value(s) for ' + colName + plural + ' in Clarity.' }).css({ "margin-left": "5px" }));

        $("#awOutsideWFMessageContainerDocuments").append(newMessage);
    }

    return validFundingProfile && fundingProfilePresent;
}

function processClarityStatus(myRows) {

    var singularError = "Please enter a value for <> in Clarity.";
    var pluralError = "Please enter values for <> in Clarity.";
    var singularError2 = "Please ensure that the value for <> starts with either a number or a letter in Clarity.";
    var pluralError2 = "Please ensure that the values for <> start with either a number or a letter in Clarity.";


    if ((coreVariables.stepNumber == "03") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {

        return ClarityStatusErrors([{ "type": "missing", "val": myRows[0].PK_TEAM, "name": "PK Team" }], singularError, pluralError, coreVariables.clarityFlyout.projectURL);
    }

    if (coreVariables.stepNumber == "04") {

        return ClarityStatusErrors([{ "type": "missing", "val": myRows[0].PA, "name": "Program Analyst" }], singularError, pluralError, coreVariables.clarityFlyout.profileURL);
    }

    else if ((coreVariables.stepNumber == "07") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {
        return ClarityStatusErrors([{ "type": "missing", "val": myRows[0].BUYER, "name": "PK Buyer" }, { "type": "missing", "val": myRows[0].PK_OFFICER, "name": "PK Officer" }], singularError, pluralError, coreVariables.clarityFlyout.profileURL);
    }

    else if (coreVariables.stepNumber == "08") {
        var prjChecks = new Array();
        var profChecks = new Array();
        var retVal = true;

        profChecks.push({ "type": "missing", "val": myRows[0].MOD_NUMBER, "name": "Modification Number" });
        profChecks.push({ "type": "missing", "val": myRows[0].PACKAGE_COMPLETE, "name": "Date Package Complete" });
        profChecks.push({ "type": "missing", "val": myRows[0].PK_OFFICER, "name": "PK Officer" });

        prjChecks.push({ "type": "missing", "val": myRows[0].CONTRACT_TYPE_DISPLAY, "name": "Contract Type" });
        prjChecks.push({ "type": "missing", "val": myRows[0].DIST_EMAIL, "name": "Distribution Email" });

        if (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) {
            prjChecks.push({ "type": "missing", "val": myRows[0].AWARD_NBR, "name": "Award Number" });
            prjChecks.push({ "type": "missing", "val": myRows[0].PERFORMANCE_METHOD, "name": "Performance Method" });
            prjChecks.push({ "type": "missing", "val": myRows[0].ACTUAL_EXP_DATE, "name": "Award Actual Expiration Date" });
        }
        if (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1) {
            profChecks.push({ "type": "missing", "val": myRows[0].AP_FUNDING_PERIOD_START, "name": "Funding Period Start" });
            profChecks.push({ "type": "missing", "val": myRows[0].AP_FUNDING_PERIOD_END, "name": "Funding Period End" });
            profChecks.push({ "type": "missing", "val": myRows[0].AP_PLANNED_AMOUNT, "name": "Action Planned Amount" });
        }
        if ((coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) || (coreVariables.ActionWFVars.ACTION_TYPE.search(/option/i) != -1)) {
            profChecks.push({ "type": "missing", "val": myRows[0].AP_AWARD_AMOUNT, "name": "Action Award Amount" });
        }

        if (!ClarityStatusErrors(prjChecks, singularError, pluralError, coreVariables.clarityFlyout.projectURL)) {
            retVal = false;
        }

        if (!ClarityStatusErrors(profChecks, singularError, pluralError, coreVariables.clarityFlyout.profileURL)) {
            retVal = false;
        }
        return retVal;
    }

    else if ((coreVariables.stepNumber == "09") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {
        var profChecks = new Array();

        profChecks.push({ "type": "missing", "val": myRows[0].AP_DATE_SIGNED, "name": "Date Signed" });
        profChecks.push({ "type": "missing", "val": myRows[0].AP_FUNDING_DURATION, "name": "Action Funding Duration" });

        return ClarityStatusErrors(profChecks, singularError, pluralError, coreVariables.clarityFlyout.profileURL);
    }

    else if ((coreVariables.stepNumber == "15") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {
        return ClarityStatusErrors([{ "type": "missing", "val": myRows[0].AP_DATE_PK_OBLIGATED, "name": "Date PK Obligated" }], singularError, pluralError, coreVariables.clarityFlyout.profileURL);
    }
    else if (coreVariables.stepNumber == "16") { // jhn jan 2015: added 16
        var prjChecks = new Array();   
        var profChecks = new Array();    
        var retVal = true;
		
        prjChecks.push({ "type": "missing", "val": myRows[0].FUNDING_ACCOUNT_TYPE, "name": "Funding Account Type" }); 
        prjChecks.push({ "type": "missing", "val": myRows[0].AWARD_PURPOSE, "name": "Award Purpose" }); 
        prjChecks.push({ "type": "missing", "val": myRows[0].PK_TEAM, "name": "PK Team" }); 
        prjChecks.push({ "type": "missing", "val": myRows[0].PROGRAM_ID, "name": "Program" }); 
        prjChecks.push({ "type": "missing", "val": myRows[0].SUB_RESEARCH_AREA, "name": "Sub-Research Area" });
		
       
        if (!ClarityStatusErrors(prjChecks, singularError, pluralError, coreVariables.clarityFlyout.projectURL)) {
            retVal = false;
		}
		
        if (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1) {
            profChecks.push({ "type": "missing", "val": myRows[0].PA, "name": "Program Analyst" });
            profChecks.push({ "type": "missing", "val": myRows[0].AP_PLANNED_AMOUNT, "name": "Action Planned Amount" });
			
            if (!ClarityStatusErrors(profChecks, singularError, pluralError, coreVariables.clarityFlyout.profileURL)) {
                retVal = false;
            }
         }
			
			
        return retVal;
    }
    else if (coreVariables.stepNumber == "17") {
        var prjChecks = new Array();
        var profChecks = new Array(); // jhn jan 2015
        var alnumChecks = new Array();
        var retVal = true;

        if (coreVariables.ActionWFVars.ACTION_TYPE.search(/basic/i) != -1) {
            prjChecks.push({ "type": "missing", "val": myRows[0].CONTRACT_TYPE_DISPLAY, "name": "Contract Type" });
            prjChecks.push({ "type": "missing", "val": myRows[0].AWARD_NBR, "name": "Award Number" });
            prjChecks.push({ "type": "missing", "val": myRows[0].PERFORMANCE_METHOD, "name": "Performance Method" });

            if (!ClarityStatusErrors(prjChecks, singularError, pluralError, coreVariables.clarityFlyout.projectURL)) {
                retVal = false;
            }

            alnumChecks.push({ "type": "firstCharAlnum", "val": myRows[0].AWARD_SHORT_TITLE, "name": "Short Title" });
            alnumChecks.push({ "type": "firstCharAlnum", "val": myRows[0].AWARD_LONG_TITLE, "name": "Long Title" });

            if (!ClarityStatusErrors(alnumChecks, singularError2, pluralError2, coreVariables.clarityFlyout.projectURL)) {
                retVal = false;
            }
        }
        
		 profChecks.push({ "type": "missing", "val": myRows[0].MOD_NUMBER, "name": "Modification Number" });
		 profChecks.push({ "type": "missing", "val": myRows[0].BUYER, "name": "PK Buyer" });
		 profChecks.push({ "type": "missing", "val": myRows[0].PK_OFFICER, "name": "PK Officer" });		 
		 profChecks.push({ "type": "missing", "val": myRows[0].AP_DATE_SIGNED , "name": "Date Signed" });
		 profChecks.push({ "type": "missing", "val": myRows[0].AP_DATE_PK_OBLIGATED, "name": "Date PK Obligated" });
		 profChecks.push({ "type": "missing", "val": myRows[0].AP_AWARD_AMOUNT, "name": "Action Award Amount" });
		 profChecks.push({ "type": "missing", "val": myRows[0].AP_ACTION_PERIOD_START, "name": "Action Period Start" });
		 profChecks.push({ "type": "missing", "val": myRows[0].AP_ACTION_PERIOD_END, "name": "Action Period End" });
		 profChecks.push({ "type": "missing", "val": myRows[0].AP_AWARD_DURATION, "name": "Action Award Duration" });
         if (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1) {
			 profChecks.push({ "type": "missing", "val": myRows[0].AP_FUNDING_PERIOD_START, "name": "Funding Period Start" });
			 profChecks.push({ "type": "missing", "val": myRows[0].AP_FUNDING_PERIOD_END, "name": "Funding Period End" });
			 profChecks.push({ "type": "missing", "val": myRows[0].AP_FUNDING_DURATION, "name": "Action Funding Duration" });
		 }
		 if (!ClarityStatusErrors(profChecks, singularError, pluralError, coreVariables.clarityFlyout.profileURL)) {
                retVal = false;
         }
		 
        return retVal;
    }

    return true;
}

function processClarityMustBeNull(myRows) {

    var singularError = "Please remove the <> value in Clarity.";
    var pluralError = "Please remove the <> values in Clarity.";


    if ((coreVariables.stepNumber == "09") && (coreVariables.ActionWFVars.ACTION_TYPE.search(/admin/i) == -1)) {
        var profChecks = new Array();

        profChecks.push({ "type": "null", "val": myRows[0].AP_DATE_PK_OBLIGATED, "name": "Date PK Obligated" });

        return ClarityStatusErrors(profChecks, singularError, pluralError, coreVariables.clarityFlyout.profileURL);
    }

    return true;
}

function processClarityMatchesStatus(myRows) {
    var pluralError;
    var prjChecks;
    var profChecks;
    var retVal;
    var singularError;

    singularError = "The value in Livelink for <> does not match the value in Clarity. Please update the value in Clarity to match what is in Livelink.";
    pluralError = "The values in Livelink for <> do not match the values in Clarity. Please update the values in Clarity to match what is in Livelink.";
    retVal = true;
    prjChecks = new Array();
    profChecks = new Array();

    if (coreVariables.stepNumber == "03") {
        return ClarityStatusErrors([{ "type": "match", "clval": myRows[0].PK_TEAM, "llval": $("#assignedPKT").attr("TEAM"), "name": "PK Team" }], singularError, pluralError, coreVariables.clarityFlyout.projectURL);
    }
    else if (coreVariables.stepNumber == "07") {

        prjChecks.push({ "type": "match", "clval": myRows[0].PK_TEAM, "llval": $("#assignedPKT").attr("TEAM"), "name": "PK Team" });

        profChecks.push({ "type": "match", "clval": myRows[0].BUYER_LL, "llval": $("#actionWFBUYER").val(), "name": "PK Buyer" });
        profChecks.push({ "type": "match", "clval": myRows[0].PK_OFFICER_LL, "llval": $("#assignedPKO").attr("KUAF_ID"), "name": "PK Officer" });

        if (!ClarityStatusErrors(profChecks, singularError, pluralError, coreVariables.clarityFlyout.profileURL)) {
            retVal = false;
        }

        if (!ClarityStatusErrors(prjChecks, singularError, pluralError, coreVariables.clarityFlyout.projectURL)) {
            retVal = false;
        }

        return retVal;
    }

    else if (coreVariables.stepNumber == "08") {

        prjChecks.push({ "type": "match", "clval": myRows[0].CONTRACT_TYPE_DISPLAY, "llval": coreVariables.ActionWFVars.CONTRACT_TYPE, "name": "Contract Type" });
        profChecks.push({ "type": "match", "clval": myRows[0].PK_OFFICER_LL, "llval": $("#assignedPKO").attr("KUAF_ID"), "name": "PK Officer" });

        if (!ClarityStatusErrors(profChecks, singularError, pluralError, coreVariables.clarityFlyout.profileURL)) {
            retVal = false;
        }

        if (!ClarityStatusErrors(prjChecks, singularError, pluralError, coreVariables.clarityFlyout.projectURL)) {
            retVal = false;
        }

        return retVal;
    }
    else if (coreVariables.stepNumber == "17") {  // jhn 12/29/2015 

        prjChecks.push({ "type": "match", "clval": myRows[0].CONTRACT_TYPE_DISPLAY, "llval": coreVariables.ActionWFVars.CONTRACT_TYPE, "name": "Contract Type" });

        if (!ClarityStatusErrors(prjChecks, singularError, pluralError, coreVariables.clarityFlyout.projectURL)) {
            retVal = false;
        }



        return retVal;
    }


    return true;
}

function ClarityStatusErrors(checks, singularError, pluralError, url) {
    var check;
    var msg;
    var n;
    var newMessage;
    var urlText;

    var bad = "";
    var result = true;


    for (n in checks) {
        if (checks[n].type == "missing" && (checks[n].val == null || checks[n].val == "")) {

            bad += checks[n].name + ", "
        }
        else if (checks[n].type == "null" && (checks[n].val != null && checks[n].val != "")) {

            bad += checks[n].name + ", "
        }
        else if (checks[n].type == "firstCharAlnum" && (checks[n].val != null && checks[n].val != "" && checks[n].val.charAt(0).search(/^[A-Za-z0-9]/) != 0)) {

            bad += checks[n].name + ", "
        }
        else if ((checks[n].type == "match") && (checks[n].clval != null) && (checks[n].llval != checks[n].clval)) {

            bad += checks[n].name + ", "
        }
    }

    if (bad != "") {

        bad = bad.substring(0, bad.length - 2); // remove the trailing ', '

        if (bad.search(/,/) == -1) {
            msg = singularError.replace("<>", bad);
        }
        else {
            msg = pluralError.replace("<>", bad);
        }

        if (url == coreVariables.clarityFlyout.projectURL) {
            urlText = "Clarity Research Project:";
        }
        else {
            urlText = "Clarity Award Profile:";
        }

        newMessage = $("<div>").css({ "margin-bottom": "8px" });

        if (url != undefined) {
            newMessage.append($("<a>", { href: url, text: urlText, class: "awLink otherLink" }).on("click", function () {
                window.open(url, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);
                return false;
            }));
        }

        newMessage.append($("<span>", { text: msg }).css({ "margin-left": "5px" }));

        $("#awOutsideWFMessageContainerDocuments").append(newMessage);

        result = false;
    }

    return result;
}
