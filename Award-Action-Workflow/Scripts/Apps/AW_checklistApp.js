define(["jquery", "jqueryui", "autoresize"
   , generalVariablesApp
   , variablesObjectInitiate
   , tabManagerAppURL
   , coreAppURL
   , validationAppURL
   , pluggInsAppURL
], function () {

    window.checklistVariables = {
        "clCheckCompleteSave": clCompleteSave()
        , "clCheckValidator": undefined
        , "clKickCompleteSave": clCompleteSave()
        , "clKickValidator": undefined
        , "insert_ID": 0
        , "nextKick_ID": 0
        , "nextKickIter": 0
        , "reload_ID": 0
        , "update_ID": 0
    };

    //RETRIEVE CHECKLIST KICK
    if ($("#checkistKickHolder").length == 1) {

        retrieveChecklist({
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_CHECKLIST_V2_00
            , "inputLabel1": awStepName.substr(4)
            , "inputLabel2": coreVariables.workID
            , "inputLabel3": "Kick"
        }, "Kick").done(setupChecklistFull).done(function () {

            clReload("Kick");

            coreVariables.stepValidator.add(
                {
                    "tabName": "Kick Back Worksheet"
                    , "validationMethod": clValidateSaveKick
                }
            );
            coreVariables.beforeSubmit.add(clSaveKick);
        })
    }

    //RETRIEVE CHECKLIST Check
    if ($("#checkistCheckHolder").length == 1) {

        retrieveChecklist({
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_CHECKLIST_V2_00
            , "inputLabel1": awStepName.substr(4)
            , "inputLabel2": coreVariables.workID
            , "inputLabel3": "Check"
        }, "Check").done(setupChecklistFull).done(function () {

            clReload("Check");

            coreVariables.stepValidator.add(
                {
                    "tabName": "Package Status"
                    , "validationMethod": clValidateSaveCheck
                }
            );
            coreVariables.beforeSubmit.add(clSaveCheck);
        })
    }

})

function retrieveChecklist(data, checklistType) {

    var dfd = new jQuery.Deferred();

    $.ajax({
        url: "/livelink/llisapi.dll"
    , data: data
    , type: "POST"
    , success: function (data) {

        if (checklistType == "Kick") {
            $("#checkistKickHolder").append(data);
            dfd.resolve();
        }

        if (checklistType == "Check") {
            $("#checkistCheckHolder").append(data);
            dfd.resolve();
        }
    }
    , error: function () {
        alert(checklistType + " failed to load");
        dfd.reject();
    }
    });

    return dfd.promise();
}

function setupChecklistFull() {

    setUpChecklist();

}


function setUpChecklist() {

    $.validator.addMethod(
        "noRadioNos"
        , function (value, element, noString) {
            var valid = !$(element).hasClass("required"); // if the field is not required, then it is valid.

            if (!valid) {
                // the field is required, so now check more
                var checked = $(element).closest("tr").find("input:radio:checked");
                //var checked = $("#" + $(element).attr("id") + ":checked");

                // Field is valid only if _something_ is checked, and teh something is not "no"--nothing selected is just as bad as no.
                valid = ((checked.length >= 0) && (checked.val() != noString));
            }
            return valid;
        }
        , ""
    );

    $('.clSaveQuestions').button({ disabled: true });
}

function setUpChecklistUniversal(kOrC) {

    var dfd = new jQuery.Deferred();

    setUpChecklistControls(kOrC);
    setUpHideQuestions(kOrC);

    if (kOrC == "Check") {
        // Turn on our validation for the form
        checklistVariables.clCheckValidator = $("#checklistCheckForm").rsValidator({ completenessChangedFunc: clToggleComplete });

        // disallow unreceived as an answer for validation on the package status ("Check") tab.
        $("#checklistCheckForm input[type='radio']").each(function () {
            $(this).rules("add",
                { noRadioNos: "No" }
            )
        })
        .on(
            "change",
            function (event) {
                checklistVariables.clCheckValidator.element($(event.target));
            }
        )

        checklistVariables.clCheckCompleteSave.items = $("#checklistCheckForm").find(".clQuestion").length;
    }
    else {
        // Turn on our validation for the form
        checklistVariables.clKickValidator = $("#checklistKickForm").rsValidator();

        checklistVariables.clKickCompleteSave.items = $("#checklistKickForm").find(".clQuestion").length;
    }

    // build summaries and system messages at startup
    $("#checklist" + kOrC + "Form input:radio:checked").each(function () {
        // Add message for each "No" checked
        if (this.value == "No") {
            var rbID = $(this).attr("name"); //ANSWER_<groupName>_<groupOrder>_<questionID>
            var msgID = "MESSAGE_" + rbID.substr(7); //MESSAGE_<groupName>_<groupOrder>_<questionID>


            clAddKickbackReason($("#" + msgID).val(), msgID, kOrC);
        }
    });
    $(".clTextArea:not([tabIndex='-1'])").each(function () {
        // Add message for each reason checked
        if (($(this).hasClass("teNormalText")) && ($(this).text() != "")) {
            var rbID = $(this).attr("name"); //ANSWER_<groupName>_<groupOrder>_<questionID>
            var msgID = "MESSAGE_" + rbID.substr(7); //MESSAGE_<groupName>_<groupOrder>_<questionID>


            clAddKickbackReason($("#" + msgID).val(), msgID, kOrC);
        }
    });

    if (kOrC == "Check") {
        clWarnSetMsg(kOrC);
    }
    else {
        // set up to save the kickback history, if the user kicks
        coreVariables.beforeSubmit.add(clSaveKickHistory);

        // set up to save kick complete date if we're at step 8
        if (false && coreVariables.stepNumber == "08") {
            coreVariables.beforeSubmit.add(clSaveKickCompleteDate);
        }
    }


    // Put up the complete/incomplete message
    clCheckComplete(kOrC);

    return dfd.resolve().promise();

}

function setUpHideQuestions(kOrC) {
    var actionType = coreVariables.ActionWFVars.ACTION_TYPE;

    // Get rid of the entire sections that aren't relevant
    $("#checklist" + kOrC + "Form").find(".deleteme").each(function () { $(this).empty().remove(); });

    // Now get individual questions
    if (kOrC == "Kick") {
        if (actionType.search(/additional/i) != -1) {
            // the "Supporting Documents Included" section shows up for Basic or Additional Funding, but the GFE question _only_ shows for Basic
            $("#tr_PO_1_15").empty().remove();
        }
        if (coreVariables.stepNumber == "09") {  // jhn

            if ($.inArray(coreVariables.ActionWFVars.ACTION_TYPE, ["basic", "additional"]) >= 0) {
                // jhn 9/25/2014:  $( "input[value='NA']" ).empty().remove()
                $("input[value='NA']").each(function () {      // jhn 9/25/2014                   
                    if ($(this)[0].id.substring(0, 17) != "ORIG_ANSWER_Buyer" && $(this)[0].id.substring(0, 17) != "RESPONSE_ID_Buyer") {
                        $(this).remove().empty();
                    }
                });
                $("td[title='Not Applicable']").remove().empty();
            }
            if ($.inArray(coreVariables.ActionWFVars.ACTION_TYPE, ["incremental", "option", "admin"]) >= 0) {
                if (coreVariables.ActionWFVars.ACTION_TYPE == "admin") {
                    $("#tr_Buyer_3_4").empty().remove();        // All Funding Documents?
                    $("#tr_Buyer_3_9").empty().remove();         // DD2566 Form?
                    $("#tr_Buyer_3_13").empty().remove();         // Funding Profile?
                    $("#tr_Buyer_3_19").empty().remove();         // Accounting Line?
                    $("#tr_Buyer_3_20").empty().remove();         // DD2566 Input?
                    $("input[value='NA']").each(function () {
                        // jhn 9/25/2014: per Todd do not remove 'RESPONSE_ID_Buyer' to prevent duplicate answers
                        if ($(this)[0].id != "ANSWER_Buyer_3_1_NA" && $(this)[0].id.substring(0, 17) != "ORIG_ANSWER_Buyer" && $(this)[0].id.substring(0, 17) != "RESPONSE_ID_Buyer") {
                            $(this).remove().empty();
                        }
                    });
                }
                else {
                    $("input[value='NA']").empty().remove()
                    $("td[title='Not Applicable']").remove().empty();
                    $("#tr_Buyer_3_1").empty().remove();        // All Proposal Documents?
                }

                $("#tr_Buyer_3_2").empty().remove();            // Cost Evaluation?
                $("#tr_Buyer_3_3").empty().remove();            // Technical Evaluation?
                $("#tr_Buyer_3_7").empty().remove();            // Budget Evaluation?
            }

            if (coreVariables.ActionWFVars.CONTRACT_TYPE != "Grant") {  // it's a contract
                $("#tr_Buyer_3_9").empty().remove();         // DD2566 Form?
                $("#tr_Buyer_3_20").empty().remove();         // DD2566 Input?
            }
            else { // it's a Grant 
                $("#tr_Buyer_3_99").empty().remove();          // FPDS?
            }
        }
    }
    else {
        if (actionType.search(/additional/i) != -1) {
            // the "Supporting Documents Included" section shows up for Basic or Additional Funding, but the GFE question _only_ shows for Basic
            $("#tr_PK_1_15").empty().remove(); // GFE
        }

        // The Package Completeness Check section on the package status tab has several questions that need to be hidden based on Action Type
        if (actionType.search(/basic/i) == -1) {
            $("#tr_PK_1_18").empty().remove(); //delinq
            $("#tr_PK_1_21").empty().remove(); //commercialization
            $("#tr_PK_1_22").empty().remove(); // IP Agree
            $("#tr_PK_1_23").empty().remove(); // Section K
        }

        if ((actionType.search(/basic/i) == -1) && (actionType.search(/additional/i) == -1)) {
            $("#tr_PK_1_17").empty().remove(); // task summaries
            $("#tr_PK_1_19").empty().remove(); // inst registered
            $("#tr_PK_1_20").empty().remove(); // sam correct
        }

        if (actionType.search(/admin/i) != -1) {
            $("#tr_PK_1_16").empty().remove();
        }
    }
}

function setUpChecklistControls(kOrC) {

    $(".clSaveQuestions")
    .off("click.cl") // Remove the click func, since the save button lasts between refreshes
    .on(
        "click.cl"
        , function () {
            var kOrC = $(this).attr("kOrC");

            $(".awButton, .clSaveQuestions").button("disable");

            $('.clSaveQuestions').removeClass('ui-state-focus'); // workaround a jquery bug
            $('.clSaveQuestions').removeClass('ui-state-hover');

            try {
                clSaveBoth(kOrC, "tab");
            }
            catch (e) {
                if (coreVariables.devServer) {
                    alert("Exception during clSave: " + e.message);
                }
            }
        }
    );


    $("#checklist" + kOrC + "Form").find(".clTextArea").ghostText({ ghostText: "Please specify additional information or reasons here.", parent: $("#checklist" + kOrC + "Form") });

    $(".clResponse,.clTextArea:not([tabIndex='-1'])")
    .off(".cl")
    .on(
        'change.cl'
        , function () {
            var rbID = $(this).attr("name"); //ANSWER_<groupName>_<groupOrder>_<questionID>
            var msgID = "MESSAGE_" + rbID.substr(7); //MESSAGE_<groupName>_<groupOrder>_<questionID>
            var checked = $(this).val();
            var kOrC = $(this).closest(".clContent").attr("kOrC");

            if (($(this).is(":radio")) && ($(this).val() == "No")) {
                clAddKickbackReason($("#" + msgID).val(), msgID, kOrC);
                checklistVariables["cl" + kOrC + "Validator"].element($(this)); // Force the validator to see this change
            }
            else if (($(this).is("textarea")) && ($(this).hasClass("teNormalText") && ($(this).text() != ""))) {
                clAddKickbackReason($("#" + msgID).val(), msgID, kOrC);
            }
            else {
                clRemoveKickbackReason(msgID, kOrC);
                checklistVariables["cl" + kOrC + "Validator"].element($(this)); // Force the validator to see this change
            }


            joinCheckAndKick($(this));
        }
    )

    if (kOrC == "Kick") {
        //coreVariables.tabActivatedCallBacks.add( kickTabActivated );
    }

    $("#checklistKickAccordion").accordion({ collapsible: true, active: false, heightStyle: "content" /*, activate:kickBlockToggled */ });

    //    try {
    //        $(".awButton").button("disable");
    //    }
    //    catch (e) {
    //        $(".awButton").button({disabled:true});
    //    }
}

// some questions on the kick tab and check tab are linked (if one is true, the other must be true as well). This is the link
function joinCheckAndKick(clickedRB) {
    var lookUnder;
    var otherChecked;

    var specificAnswer = clickedRB.attr("name");
    var pairs = [
        ["ANSWER_PO_1_1", "ANSWER_PK_1_1"]    // po_01: proposal?
        , ["ANSWER_PO_1_2", "ANSWER_PK_1_2"]  // revised proposal
        , ["ANSWER_PO_1_3", "ANSWER_PK_1_3"]  // budget
        , ["ANSWER_PO_1_4", "ANSWER_PK_1_4"]  // revised budget
        , ["ANSWER_PO_1_5", "ANSWER_PK_1_5"]  // subcontractor budget
        , ["ANSWER_PO_1_6", "ANSWER_PK_1_6"]  // cost eval
        , ["ANSWER_PO_1_7", "ANSWER_PK_1_7"]  // tech eval
        , ["ANSWER_PO_1_8", "ANSWER_PK_1_8"]  // final debrief worksheet
        , ["ANSWER_PO_1_9", "ANSWER_PK_1_9"]  // final tech eval worksheet
        , ["ANSWER_PO_1_10", "ANSWER_PK_1_10"]  // form 14
        , ["ANSWER_PO_1_11", "ANSWER_PK_1_11"]  // GFE
        , ["ANSWER_PO_1_12", "ANSWER_PK_1_12"]  // foreign disc
        , ["ANSWER_PO_1_13", "ANSWER_PK_1_13"]  // form 813
        , ["ANSWER_PO_1_14", "ANSWER_PK_1_14"]  // H&A
        , ["ANSWER_PO_1_15", "ANSWER_PK_1_15"]  // nukular
        , ["ANSWER_PA_2_1", "ANSWER_PK_1_16"]  // Certified PR
        // same list swapped left for right
        , ["ANSWER_PK_1_1", "ANSWER_PO_1_1"]    // po_01: proposal?
        , ["ANSWER_PK_1_2", "ANSWER_PO_1_2"]  // revised proposal
        , ["ANSWER_PK_1_3", "ANSWER_PO_1_3"]  // budget
        , ["ANSWER_PK_1_4", "ANSWER_PO_1_4"]  // revised budget
        , ["ANSWER_PK_1_5", "ANSWER_PO_1_5"]  // subcontractor budget
        , ["ANSWER_PK_1_6", "ANSWER_PO_1_6"]  // cost eval
        , ["ANSWER_PK_1_7", "ANSWER_PO_1_7"]  // tech eval
        , ["ANSWER_PK_1_8", "ANSWER_PO_1_8"]  // final debrief worksheet
        , ["ANSWER_PK_1_9", "ANSWER_PO_1_9"]  // final tech eval worksheet
        , ["ANSWER_PK_1_10", "ANSWER_PO_1_10"]  // form 14
        , ["ANSWER_PK_1_11", "ANSWER_PO_1_11"]  // GFE
        , ["ANSWER_PK_1_12", "ANSWER_PO_1_12"]  // foreign disc
        , ["ANSWER_PK_1_13", "ANSWER_PO_1_13"]  // form 813
        , ["ANSWER_PK_1_14", "ANSWER_PO_1_14"]  // H&A
        , ["ANSWER_PK_1_15", "ANSWER_PO_1_15"]  // nukular
        , ["ANSWER_PK_1_16", "ANSWER_PA_2_1"]  // Certified PR
    ];

    if (($("#" + pairs[0][0] + "_Yes").length > 0) && ($("#" + pairs[0][1] + "_Yes").length > 0)) {
        // okay, both the checklist and the kick back worksheet are displayed. copy data.

        if (clickedRB.closest("form").attr("id") == "checklistKickForm") {
            lookUnder = $("#checklistCheckForm");
        }
        else {
            lookUnder = $("#checklistKickForm");
        }
        $(pairs).each(function () {
            if (specificAnswer == $(this)[0]) {
                var thisChecked = clickedRB.val(); // Yes, No, NA
                var otherChecked = lookUnder.find("input[name*=" + $(this)[1] + "]:checked").val(); //find the current answer for the other RB
                var otherID = $(this)[1] + "_" + thisChecked; // this is the ID for the other RB with the answer we want

                // If the value checked on the other half of the pair isn't the same as the newly checked value
                if (otherChecked != thisChecked) {
                    // make it so and force validation (won't recurse, since values now match)
                    $("#" + otherID).attr('checked', 'checked').trigger("change");
                }
            }
        });
    }
}

function kickTabActivated(ui) {
    var hiddenTab = ui.oldPanel;
    var shownTab = ui.newPanel;
    var blockUI = {
        newHeader: $("#xyzzy") // just need empty jquery objects, so specify an id that doesn't exist
        , newPanel: $("#xyzzy")
        , oldPanel: $("#xyzzy")
        , oldPanel: $("#xyzzy")
    }

    if ((hiddenTab.length > 0) && (hiddenTab.attr("id") == "tab-2") && (coreVariables.stepName = "PK Buyer Works Action")) {
        // tab-2 is the kick back worksheet tab on the PK Buyer Works Action step

        // if the KBW tab on step 8 is being hidden, need to hide kickback buttons
        checklistVariables.kbwTabShowing = false;
        blockUI.oldPanel = $("#evalBlockContent_PO");
        kickBlockToggled(null, blockUI);
        blockUI.oldPanel = $("#evalBlockContent_PA");
        kickBlockToggled(null, blockUI);
    }
    else if ((hiddenTab.length > 0) && (hiddenTab.attr("id") == "tab-3") && (coreVariables.stepName = "PK Officer Reviews and Signs Action")) {  // jhn
        // tab-3 is the kick back worksheet tab on the PK Officer Reviews and Signs Action step	

        // if the KBW tab on step 9 is being hidden, need to hide kickback buttons
        checklistVariables.kbwTabShowing = false;
        blockUI.oldPanel = $("#evalBlockContent_Buyer");
        kickBlockToggled(null, blockUI);
    }
    if ((shownTab.length > 0) && (shownTab.attr("id") == "tab-2") && (coreVariables.stepName = "PK Buyer Works Action")) {
        // if the KBW tab on step 8 is being shown, need to show kickback buttons if one of the two sections is open
        var paShowing = $("#evalBlockContent_PA").is(":visible");
        var poShowing = $("#evalBlockContent_PO").is(":visible");

        if (paShowing) {
            blockUI.newPanel = $("#evalBlockContent_PA");
        }
        else {
            blockUI.oldPanel = $("#evalBlockContent_PA");
        }
        kickBlockToggled(null, blockUI);

        if (poShowing) {
            blockUI.newPanel = $("#evalBlockContent_PO");
        }
        else {
            blockUI.oldPanel = $("#evalBlockContent_PO");
        }
        kickBlockToggled(null, blockUI);
    }
    else if ((shownTab.length > 0) && (shownTab.attr("id") == "tab-3") && (coreVariables.stepName = "PK Officer Reviews and Signs Action")) { // jhn
        var buyerShowing = $("#evalBlockContent_Buyer").is(":visible");

        if (buyerShowing) {
            blockUI.newPanel = $("#evalBlockContent_Buyer");
        }
        else {
            blockUI.oldPanel = $("#evalBlockContent_Buyer");
        }
        kickBlockToggled(null, blockUI);
    }
}

function kickBlockToggled(event, ui) {
    ui.newHeader // empty jquery obj if all panels now closed
    ui.newPanel
    ui.oldHeader // empty jquery obj if all panels were closed
    ui.oldPanel

    if (ui.oldPanel.length > 0) {
        //okay, something closed--hide its button
        //$("#retTo"+ui.oldPanel.attr("name")).hide();
    }

    if (ui.newPanel.length > 0) {
        // something opened--see if it's completed, and if so, show the button.
        var showKickButton = false;

        $(ui.newPanel).find("input:radio:checked").each(function () {

            if (this.value == "No") {
                showKickButton = true;
            }
        });

        $(ui.newPanel).find("textarea:not([tabIndex='-1'])").each(function () {
            if (($(this).hasClass("teNormalText")) && ($(this).text() != "")) {
                showKickButton = true;
            }
        });

        if (showKickButton) {

            //$("#retTo"+ui.newPanel.attr("name")).show().button('enable');
        }
    }
}

function clCheckComplete(kOrC) {
    var complete = $("#checklist" + kOrC + "Form").rsValidator('completed');
}

function clToggleComplete(formComplete) {
    var newDate;
    var dfd;


    if ((coreVariables.GenSelectVars.DATE_PACKAGE_COMPLETE == "") && (formComplete)) {
        newDate = new Date();
        dfd = clSetCompleteDate(formatDateWithTimeForXOG(newDate));
    }
    else if ((coreVariables.GenSelectVars.DATE_PACKAGE_COMPLETE != "") && (!formComplete)) {
        newDate = "";
        dfd = clSetCompleteDate(newDate);
    }

    if (dfd != undefined) {
        dfd
        .done(function () {
            coreVariables.GenSelectVars.DATE_PACKAGE_COMPLETE = newDate;
        });
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
//
// saving/reloading for both tabs
//
////////////////////////////////////////////////////////////////////////////////////////////

function clSaveBoth(kOrC, tabOnly) {
    if ($("#clKickContentHolder").length > 0) {
        // Need to know when to call the clSaveKickCompleteDate function 
        clSave("Kick", tabOnly);
    }
    if ($("#clCheckContentHolder").length > 0) {
        clSave("Check", tabOnly);
    }
}
function clSaveKick(kOrC, tabOnly) {

    var dfd = new jQuery.Deferred();

    clSave("Kick", tabOnly).done(function () {
        dfd.resolve();
    }).fail(function () {
        dfd.reject();
    });

    return dfd.promise();
}

function clSaveCheck(kOrC, tabOnly) {

    var dfd = new jQuery.Deferred();

    clSave("Check", tabOnly).done(function () {
        dfd.resolve();
    }).fail(function () {
        dfd.reject();
    });

    return dfd.promise();
}
// This function should be refactored - too much happenning here - function has become a mess
function clSave(kOrC, tabOnly) {

    var dfd, completer, formToSave, items, insertCheckListItems, updateCheckListItems, CheckListItemsJSON;

    dfd = new jQuery.Deferred();
    items = 0;

    checkListItemsJSONData = { AW_I_RS_CHECKLIST_RESPONSES: [], AW_U_RS_CHECKLIST_RESPONSES_Response: [] };

    if (kOrC == "Check") {
        completer = checklistVariables.clCheckCompleteSave;
        formToSave = $("#checklistCheckForm");
    }
    else {
        completer = checklistVariables.clKickCompleteSave;
        formToSave = $("#checklistKickForm");
    }

    // look for the number of questions (radio button or textbox) whose answer is not the same as the answer when tab was last loaded
    formToSave.find(".clQuestion").each(function () {
        var answerRB = $(this).find('[name*="ANSWER"]:checked');
        var origAnswer = $(this).find('[name*="ORIG_ANSWER"]');
        var curAnswer = "";

        if (answerRB.length > 0) {
            curAnswer = answerRB.val();
        }

        if ((origAnswer.attr("name").substr(-3) == "999")) {
            var checkGroup = origAnswer.attr("name").split("_")[2]; //ORIG_ANSWER_PO_1_999
            var textBox = $("#clKick" + checkGroup + "Explanation");

            if (textBox.hasClass("teGhostText")) {
                curAnswer = "";
            }
            else {
                curAnswer = textBox.text();
            }
        }

        if (curAnswer != origAnswer.val()) {
            items++;
        }
    });

    completer.items = items;

    // no changes, no need to save.
    if (items > 0) {
        if (tabOnly != undefined) {
            // we're just saving this tab...set up to refresh the tab
            clPrepareRefresh(kOrC);
        }
        else {
            // We're saving everything before sending on. No need to refresh after save
            completer.trigger = undefined;
        }

        //for each individual question, see the "Saving a single question" block, below - SJS BUILD STRING HERE
        $("#cl" + kOrC + "Content").find(".clQuestion").each(function () {

            var clQuestion, checkListQuestionArray;

            clQuestion = clExtractQuestion(this);

            if (clQuestion.ORIG_ANSWER != clQuestion.ANSWER) {

                if (clQuestion.RESPONSE_ID != "") {
                    checkListQuestionArray = clBuildDataUpdateArray(clQuestion);
                    checkListItemsJSONData.AW_U_RS_CHECKLIST_RESPONSES_Response.push(checkListQuestionArray);
                }
                else {
                    checkListQuestionArray = clBuildDataInsertArray(clQuestion);
                    checkListItemsJSONData.AW_I_RS_CHECKLIST_RESPONSES.push(checkListQuestionArray);
                }
            }
        });

        return sendCheckList(checkListItemsJSONData).done(function () {

            if (tabOnly == "tab") {
                clSaveKickCompleteDate(kOrC).done(function () { clReload(kOrC) });
            }
            else {
                clSaveKickCompleteDate(kOrC);
            }
            dfd.resolve();

        }).fail(function () {

            if (tabOnly == "tab") {
                clReload(kOrC);
            }
            dfd.reject()
        });
    }
    else if (tabOnly != undefined) { // Only re-enable the buttons if we're doing a tab-only save
        dfd.resolve();
    }
    else {
        dfd.resolve();
    }

    return dfd.promise();
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//Called before Save
function clPrepareRefresh(kOrC) {

    // set up the trigger to reload
    if (kOrC == "Kick") {
        checklistVariables.clKickCompleteSave.trigger = clReloadKick;
    }
    else {
        checklistVariables.clCheckCompleteSave.trigger = clReloadCheck;
    }
    $(".awButton,.clSaveQuestions").button("disable");
    $("#cl" + kOrC + "Content,#cl" + kOrC + "WarningHolder").fadeOut("slow");
    $("#cl" + kOrC + "WarningHolder").text("");
    $(".clTextArea").trigger("focusin");
    $("#cl" + kOrC + "Loading").show();
}

function clReloadKick() {
    // find whether we're kick or check
    var kOrC = "Kick";

    return clReload(kOrC);
}

function clReloadCheck() {
    // find whether we're kick or check
    var kOrC = "Check";

    return clReload(kOrC);
}

function clReload(kOrC) {

    var deferredAjaxResult;
    var resolver;

    var stepName = coreVariables.stepName;

    if (coreVariables.devServer && coreVariables.stepNumber == "01") {
        stepName = "PK Buyer Works Action";
    }

    var clSendData = {
        "func": "ll"
        , "objAction": "RunReport"
        , "objid": coreVariables.AW_CHECKLIST_01
        , "inputLabel1": stepName
        , "inputLabel2": coreVariables.wfID
        , "inputLabel3": kOrC // Either "Kick" or "Check"
        , "workID": coreVariables.workID // to load some wf vars
        , "actionType": coreVariables.ActionWFVars.ACTION_TYPE // Action Type, unsurprisingly
        , "projType": coreVariables.GenSelectVars.PROJECT_TYPE // Project type
        , "stepNum": coreVariables.stepNumber // step number
    };

    $("#cl" + kOrC + "ContentHolder").removeClass("gone");

    deferredAjaxResult = $.ajax({
        url: "/livelink/llisapi.dll",
        data: clSendData,
        type: "POST",
        beforeSend: function () {
            $("#cl" + kOrC + "Content,#cl" + kOrC + "ButtonBar").fadeOut("slow");
            $("#cl" + kOrC + "Loading").show();
            $("#cl" + kOrC + "Content").empty();
            // okay, that form's done with--manually clear the validator so the per-element validation keeps working.
            //coreVariables["checklist" + kOrC + "Form"] = undefined;
            //coreVariables["checklist" + kOrC + "FormvalidatorSettings"] = undefined;
        }
    });

    if (kOrC == "Kick") {
        resolver = clResolveRefreshKick;
    }
    else {
        resolver = clResolveRefreshCheck;
    }

    deferredAjaxResult
    .done(function (refreshData) {

        genericAjaxInsUpdDelErrHandling(refreshData)
        .done(function (refreshData) {

            $("#cl" + kOrC + "Content").append(refreshData);
            enableButtonsAfterSave(kOrC); //?????????????????????????????????????????????????????????????????????????????????????????????????????????
        })
        .fail(function (result) {
            alert("Error saving in clReload: URL: " + coreJSONDataToURLArgs(clSendData));
        })
    })
    .always(resolver);

    return deferredAjaxResult.promise();
}

function clResolveRefreshKick() {
    clResolveRefresh("Kick");
}
function clResolveRefreshCheck() {
    clResolveRefresh("Check");
}
function clResolveRefresh(kOrC) {

    try {
        setUpChecklistUniversal(kOrC).then(function () {
            $("#cl" + kOrC + "Loading").hide();
            enableButtonsAfterSave(kOrC);
            $("#cl" + kOrC + "Content,#cl" + kOrC + "ButtonBar").fadeIn('fast', function () {
                this.style.removeAttribute('filter');
            })
        });
    }
    catch (e) {
        var x = e;
        if (coreVariables.devServer) {
            alert("Exception during setUpChecklistsUniversal: " + e.message);
        }
    }
}

function enableButtonsAfterSave(kOrC) {
    try {
        $(".clSaveQuestions").button("enable");
    }
    catch (e) {
        $(".clSaveQuestions").button({ disabled: false });
    }

    if (window.activeWorkflow) {

        $(".awButton,.clSaveQuestions").button("enable");
    }
}

function clCompleteSave() {

    return {
        "items": "",
        "countSaved": 0,
        "trigger": "",
        "triggerParameters": "",
        "count": function (unique) {
            this.countSaved += 1;

            if (this.countSaved == this.items) {
                this.fire();
            }
        },

        "fire": function () {
            //debugger;
            if (this.trigger != undefined) {
                this.trigger(this.triggerParameters);
            }
            this.countSaved = 0;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
//
// XOG package complete date to Clarity
//
////////////////////////////////////////////////////////////////////////////////////////////

function clSetCompleteDate(packageDate) {

    var dfd;

    var xogUpdate = '{ "award_profile": [{ "code":"' + coreVariables.ActionWFVars.FK_AWARD_PROFILE_CODE + '", "x_parentcodeval_X":"' + coreVariables.ActionWFVars.FK_PROJECT_CODE + '", "afosr_package_date": "' + packageDate + '" }] }'
    //var xogUpdate = '{ "project": [{ "code": "' + coreVariables.ActionWFVars.FK_PROJECT_CODE + '", "name": "' + coreVariables.ActionWFVars.FK_PROJECT_NAME + '", "afosr_cont_type": "' + $("#ctContractType").val() + '" }] }'

    var data = {
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
            console.log("Finished clSetCompleteDate ... ");
            for (n in results) {
                console.log("" + n + ": " + results[n]);
            }
        }
    )
    .fail(
        function (results) {
            console.log("FAILED clSetCompleteDate ... ");
            for (n in results) {
                console.log("" + n + ": " + results[n]);
            }
        }
    );

    return dfd.promise();
}

////////////////////////////////////////////////////////////////////////////////////////////
//
// Saving all questions at one time
//
//////////////////////////////////////////////////////////////////////////////////////////// SJS

function sendCheckList(data) {

    var dfd = new jQuery.Deferred();

    var sendData = {
        "func": "cwewfeventscript.ExecuteLRs"
        , "jsondata": JSON.stringify(data)
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
        , data: sendData
        , type: "POST"
        , jsonp: null
        , jsonpCallback: null
    }).done(function (data) {
        dfd.resolve();
    }).fail(function (data) {
        dfd.reject();
        console.log("sendCheckList() failed - maybe IE aborted request");
    });

    return dfd.promise();
}

function clExtractQuestion(question) {

    var answer = $(question).find('[name*="ANSWER"]:checked');
    var origAnswer = $(question).find('[name*="ORIG_ANSWER"]');
    var clQuestion = {
        QUESTION_ID: $(question).find('[name*="QUESTION_ID"]').val()
        , RESPONSE_ID: $(question).find('[name*="RESPONSE_ID"]').val()
        , KICKBACK_ITERATION: $(question).find('[name*="KICK_ITERATION"]').val()
        , ORIG_ANSWER: origAnswer.val()
        , ANSWER: ""
    };

    // No kickback iteration means these are new iteration answers
    if (clQuestion.KICKBACK_ITERATION == "") {
        clQuestion.KICKBACK_ITERATION = checklistVariables.nextKickIter;
    }

    if (answer.length > 0) {
        clQuestion.ANSWER = answer.val();
    }

    if ((origAnswer.attr("name").substr(-3) == "999")) {
        var checkGroup = origAnswer.attr("name").split("_")[2]; //ORIG_ANSWER_PO_1_999
        var textBox = $("#clKick" + checkGroup + "Explanation");

        if (textBox.hasClass("teGhostText")) {
            clQuestion.ANSWER = "";
        }
        else {
            clQuestion.ANSWER = $("#clKick" + checkGroup + "Explanation").text();
        }
    }

    return clQuestion;
}

function clBuildDataUpdateArray(question) {

    var data = [];

    data.push(question.RESPONSE_ID.toString());  //inputLabel3
    data.push(question.ANSWER.toString());  //inputLabel2
    data.push("");  //inputLabel3

    return data;
}

function clBuildDataInsertArray(question) {

    var data = [];

    data.push(coreVariables.wfID.toString());  //inputLabel1
    data.push(coreVariables.wfID.toString());  //inputLabel2
    data.push(question.QUESTION_ID.toString());  //inputLabel3
    data.push(question.ANSWER.toString());  //inputLabel4
    data.push(question.KICKBACK_ITERATION.toString());  //inputLabel5
    data.push("");  //inputLabel6
    data.push("");  //inputLabel7

    return data;
}

////////////////////////////////////////////////////////////////////////////////////////////
//
// validation for both tabs
//
////////////////////////////////////////////////////////////////////////////////////////////

function clValidateSaveKick() {
    return clValidateSave("Kick");
}
function clValidateSaveCheck() {
    return clValidateSave("Check");
}
function clValidateSave(kOrC) {

    if (coreVariables.devServer) {
        $("#checklist" + kOrC + "Form").rsValidator('missingNames');
    }

    return $("#checklist" + kOrC + "Form").rsValidator("validated");
}

// Function to confirm that, when a kick back button is clicked, kick back is a valid action
function clKickClicked() {
    var msg = "";
    var nOfQuestions = 0;
    var nOfAnswers = 0;
    var buttonText = $(coreVariables.clickedButton).text();

    var kickTo = buttonText.substr(13); // Todd; trim off the "Kick Back to "

    var sectionKickable = ($("#clKick" + kickTo + "Explanation").hasClass("teNormalText") && ($("#clKick" + kickTo + "Explanation").text() != ""));


    $("#evalBlockContent_" + kickTo).find("input:radio").each(function () {
        if ($(this).is(":checked")) {
            nOfAnswers++;
        }
        if (this.value == "No") {
            nOfQuestions++;
            if ($(this).is(":checked")) {
                sectionKickable = true;
            }
        }
    });

    if (nOfQuestions != nOfAnswers) {
        // haven't answered everything
        msg = 'You clicked "' + buttonText + '", but you have not completed the ' + kickTo + ' Kick Back Worksheet.';
    }
    else if (!sectionKickable) {
        // no reason has been specified
        msg = 'You clicked "' + buttonText + '", but no reason has been specified. Please type a reason into the "Additional Information or Reasons for Kick Back" text box.';
    }

    if (msg != "") {
        $("#awErrorText").text(msg);
        if (nOfQuestions != nOfAnswers) {
            $("#awGenericError")
            .on(
                "dialogclose.clkickclicked",
                function (event, ui) {
                    coreVariables.showBangs = true;
                    $("#checklistKickForm").rsValidator('validated');
                    $("#awGenericError").off("dialogclose.clkickclicked");
                }
            );
        }
        $("#awGenericError").dialog("open");
    }

    return (msg == "");
}

////////////////////////////////////////////////////////////////////////////////////////////
//
// Manage the kick back summary and system message for both tabs
//
////////////////////////////////////////////////////////////////////////////////////////////

function clAddKickbackReason(msg, msgID, kOrC, theButton) {

    var section, newListItem;

    section = "_" + msgID.split("_")[1];

    if ($("#" + msgID + "Reason").length == 0) {

        newListItem = $("<li>" + msg + "</li>");
        $(newListItem).attr("id", msgID + "Reason");

        $("#cl" + kOrC + "KickbackReasons" + section).append(newListItem);
    }

    if (kOrC == "Kick") {
        $("#cl" + kOrC + "Messages" + section).show();
    }

    if ($("#evalBlockContent" + section).is(":visible")) {
        switch (section) {
            case "_PO":
                //$("#retToPO").show().button("enable");
                break;

            case "_PA":
                //$("#retToPA").show().button("enable");
                break;
            case "_Buyer": // jhn 6/05/2014
                //$("#retToBuyer").show().button("enable");
                break;
        }
    }

    clWarnSetMsg(kOrC);
}

function clWarnSetMsg(kOrC) {
    var kicks = "";
    var msg = "";
    var allYes = true;

    $("#cl" + kOrC + "Content").find(".evalBlock.cl")
    .each(function () {
        var kickSection = false;

        $(this).find("input:radio:checked").each(function () {

            if ((this.value == "No") || (this.value == "Unreceived")) {
                kickSection = true;
            }
        });

        $(this).find("textArea").each(function () {

            if (($(this).hasClass("teNormalText")) && ($(this).text() != "")) {
                kickSection = true;
            }
        });

        if (kickSection) {
            kicks = clWarnAddSection(kicks, $(this).attr("name"), kOrC);
        }
    });

    if (kOrC == "Kick") {
        // If kicks has a value, some Radiobutton had "No" checked
        if (kicks != "") {
            msg = "The worksheet is recommending you kick back the workflow " + kicks + ". See below for the Kick Back Summar";

            if (kicks.search("and") != -1) {
                msg += "ies.";
            }
            else {
                msg += "y.";
            }
        }
    }
    else if (kOrC == "Check") {
        // If we're in this block, we're in a completeness checklist, not a kickback worksheet

        var nOfRBs = $("#checklist" + kOrC + "Form tr").length - $("#checklist" + kOrC + "Form table").length; // 1 radio group per table row, minus one header row per table
        var nOfCheckedRBs = $("#checklist" + kOrC + "Form input:radio:checked").length;

        if ((nOfRBs == nOfCheckedRBs) && (kicks == "")) {
            // every radio group has something selected and no "Unreceived" values exist
            msg = "The package is now complete.";
            $("#cl" + kOrC + "WarningHolder").attr("style", "color:black;");
        }
        else {
            msg = "Cannot send to PK Officer. The package is not yet complete.";
            $("#cl" + kOrC + "WarningHolder").attr("style", "color:red;");
        }
    }

    if (msg != "") {
        $("#cl" + kOrC + "WarningHolder").text(msg).show();
    }
    else {
        $("#cl" + kOrC + "WarningHolder").fadeOut("slow").text(msg);
    }
}

function clWarnAddSection(msg, section) {
    if (section != "PK") {
        section = "the " + section;
    }

    if (msg == "") {
        msg = " to " + section;
    }
    else {
        msg += " and to " + section;
    }

    return msg;
}

function clRemoveKickbackReason(msgID, kOrC) {

    var pieces = msgID.split("_");
    var section = "_" + msgID.split("_")[1];
    var resetAll = true; // if every answer in every section is yes or NA, hide the kick buttons
    var resetSection = true; // if every answer in this section is yes or NA, clear the messages

    $("#evalBlockContent" + section + " input:radio:checked").each(function () {

        if (this.value == "No") {
            resetSection = false;
        }
    });

    if (resetSection && (kOrC == "Kick")) {
        var textArea = $("#clKick" + section.substr(1) + "Explanation"); // section is "_PA" or "_Buyer"--lose the "_"

        if ((textArea.hasClass("teNormalText")) && (textArea.text() != "")) {
            resetSection = false;
        }
    }

    if (resetSection) {

        $("#cl" + kOrC + "Messages" + section).hide();
        $("#cl" + kOrC + "KickbackReasons" + section).empty();

        switch (section) {
            case "_PO":
                //$("#retToPO").hide();
                break;

            case "_PA":
                //$("#retToPA").hide();
                break;
            case "_Buyer":  // jhn 6/05/2014
                //$("#retToBuyer").hide();
                break;
        }
    }
    else {

        //Take out of reasons for kickback
        if ($("#" + msgID + "Reason").length == 1) {
            $("#" + msgID + "Reason").remove();
        }
    }

    $("#checklist" + kOrC + "Form input:radio:checked").each(function () {

        if (this.value == "No") {
            resetAll = false;
        }
    });

    if (resetAll && (kOrC == "Kick")) {

        // No radio buttons are NO, so check textareas

        $("#checklisKickForm textarea:not([tabIndex='-1'])").each(function () {

            if (($(this).hasClass("teNormalText")) && ($(this).text() != "")) {
                resetAll = false;
            }
        });
    }

    if (resetAll && (kOrC == "Kick")) {
        //$(".kickButton").hide();
    }

    clWarnSetMsg(kOrC);
}

function clSaveKickHistory() {
    var answerRB;
    var btn;
    var dfd;
    var kickHistItems;
    var kickAccord;
    var questionInput;
    var row;
    var textBox;

    dfd = new jQuery.Deferred().resolve();
    kickHistItems = { AW_I_RS_KICKBACK: [] };
    btn = $(coreVariables.clickedButton);
    console.log("running clSaveKickHistory");

    if (btn.text().substr(0, 9) == "Kick Back") {

        kickAccord = $("#evalBlockContent_" + btn.attr("name").match(/[^ -]+/)[0]);

        kickAccord.find(".clQuestion").each(function () {

            answerRB = $(this).find('[name*="ANSWER"]:checked');
            questionInput = $(this).find('[name*="QUESTION_ID_"]');

            if (answerRB.length > 0) {
                if (answerRB.val() == "No") {
                    //add a row for this no
                    row = [];
                    row.push(coreVariables.wfID.toString());  //inputLabel1
                    row.push(coreVariables.loadedAuditSeqValue.toString());  //inputLabel2
                    row.push(questionInput.val().toString());  //inputLabel3
                    row.push("");  //inputLabel4
                    kickHistItems.AW_I_RS_KICKBACK.push(row);
                }
            }
            else if ($(questionInput).attr("name").split("_")[4] == "999") { // Question order, name will be like ORIG_ANSWER_PO_1_999
                //                textBox = $("#clKick"+btn.attr("name").substr(0, 2)+"Explanation");
                textBox = $("#clKick" + btn.attr("name").match(/[^ -]+/)[0] + "Explanation");

                if (!textBox.hasClass("teGhostText")) {
                    row = [];
                    row.push(coreVariables.wfID.toString());  //inputLabel1
                    row.push(coreVariables.loadedAuditSeqValue.toString());  //inputLabel2
                    row.push(questionInput.val().toString());  //inputLabel3
                    row.push(textBox.text());  //inputLabel4
                    kickHistItems.AW_I_RS_KICKBACK.push(row);
                }
            }
        });

        if (kickHistItems.AW_I_RS_KICKBACK.length > 0) {
            dfd = sendCheckList(kickHistItems);
            console.log("Saved in clSaveKickHistory");
        }
    }

    return dfd.promise();
}

function clSaveKickCompleteDate(kOrC) {
    var answerRB;
    var anyChanged;
    var checkGroup
    var curAnswer;
    var data
    var dfd;
    var nOfCheckedRBs;
    var nOfRBs;
    var origAnswer;
    var textBox;
    var xogUpdate;

    anyChanged = false;
    nOfRBs = $("#checklistKickForm tr").length - $("#checklistKickForm table").length - $("#checklistKickForm .clKickOtherText").length; // 1 radio group per table row, minus one header row per table, minus 1 row per "other" textarea
    nOfCheckedRBs = $("#checklistKickForm input:radio:checked").length;

    // Obviously, if the kickback worksheets are not completed, we won't set complete date
    if ((kOrC == "Kick") && (nOfRBs == nOfCheckedRBs)) {

        // look for the number of questions (radio button or textbox) whose answer is not the same as the answer when tab was last loaded
        $("#checklistKickForm").find(".clQuestion").each(function () {
            answerRB = $(this).find('[name*="ANSWER"]:checked');
            origAnswer = $(this).find('[name*="ORIG_ANSWER"]');
            curAnswer = "";

            if (answerRB.length > 0) {
                curAnswer = answerRB.val();
            }

            if ((origAnswer.attr("name").substr(-3) == "999")) {
                checkGroup = origAnswer.attr("name").split("_")[2]; //ORIG_ANSWER_PO_1_999
                textBox = $("#clKick" + checkGroup + "Explanation");

                if (textBox.hasClass("teGhostText")) {
                    curAnswer = "";
                }
                else {
                    curAnswer = textBox.text();
                }
            }

            // Finally, only need to update the complete date if something has changed
            if (curAnswer != origAnswer.val()) {
                anyChanged = true;
            }
        });
    }

    // If we need to save
    if (anyChanged) {

        xogUpdate = '{ "award_profile": [{ "code":"' + coreVariables.ActionWFVars.FK_AWARD_PROFILE_CODE + '", "x_parentcodeval_X":"' +
                         coreVariables.ActionWFVars.FK_PROJECT_CODE + '", "afosr_kickback_date": "' + formatDateWithTimeForXOG(new Date()) + '" }] }'

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
                console.log("Finished clSaveKickCompleteDate ... ");
                for (n in results) {
                    console.log("" + n + ": " + results[n]);
                }
            }
        )
        .fail(
            function (results) {
                console.log("FAILED clSaveKickCompleteDate ... ");
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
