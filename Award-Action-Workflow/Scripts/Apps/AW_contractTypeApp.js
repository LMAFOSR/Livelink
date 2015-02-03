define(["jquery", "jqueryui"
    , generalVariablesApp
    , variablesObjectInitiate
    , coreAppURL
    , validationAppURL
    , tabManagerAppURL
], function () {

    window.ctVariables = {
        updateContractTypeID: undefined
        , step07: "1"
        , step09: "2"
    };

    if ($("#ctContent").length == 1) {

        retrieveContractType().done(setUpContractType);

        coreVariables.tabActivatedCallBacks.add(checkContractType);

        coreVariables.stepValidator.add(
            {
                tabName: "Contract Type"
                , validationMethod: ctValidateSave
            }
        );
    }

    function setUpContractType() {

        //setUpContractTypeVariables();
        setUpContractTypeControls();
        setUpContractTypeSelectionMessage();

        //  TURN ON LATER - VIEW COMPLETENESS ONLY 07 AND 09
        setUpContractTypeCompleteness(awStepName);
        // -----------------------------

        setUpContractTypeShowFolders();
        setUpContractTypeLinkFolders()

        setUpContractTypeValidation(awStepName);
        setUpGlobalVariables();
    }

    // Setup 1 ----------------------
    function setUpContractTypeControls() {

        //Initialize the "do we need to update folders" value
        $("#ctContractType").attr("folderStructure", $("#ctContractType option:selected").attr("folderType"))
        $("#ctContractType").on("change", ctContractTypeChange).on("change", $("#ctCheckCompleteHolder"), ctContractTypeChangeValidation);
    }

    // Setup 2
    function setUpContractTypeSelectionMessage() {

        if ($("#ctContractType").val() == "") {
            $("#contractTypeSelectionMessage").text("Select Contract Type (Value will also be updated in Clarity)");
        }
        else {
            $("#contractTypeSelectionMessage").text("Review the contract type selected and change if necessary");
        }
    }

    // Setup 3
    function setUpContractTypeShowFolders() {

        if ($("#ctContractType option:selected").attr("folderType") == "grant") {
            $(".standardFolders, #grantFolders, #headerFolders, #linkWorkflowFolders").show();
        }

        if ($("#ctContractType option:selected").attr("folderType") == "contract") {
            $(".standardFolders, #contractFolders, #headerFolders, #linkWorkflowFolders").show();
        }
    }

    // Setup 4
    function setUpContractTypeCompleteness(stepName) {

        var validateTab, dfd;

        dfd = new jQuery.Deferred();

        validateTab = checkContractTypeStepComplete(stepName);

        if (validateTab > 0) {
            checkContractCompleted(validateTab.toString(), coreVariables.wfID).then(function (data) {

                if (data[0].hasOwnProperty("myRows")) {
                    if (data[0].myRows.length > 0) {
                        $("#ctCheckCompleteHolder").addClass("awCompleteBadge");
                    }
                }

                dfd.resolve();
            });
        }
        else {
            dfd.resolve();
        }

        return dfd.promise();
    }

    // Setup 4.5
    function setUpContractTypeLinkFolders() {

        $("#folderLinkContracts").attr("href", "/livelink/llisapi.dll?func=work.frametaskright&workid=" + coreVariables.workID + "&taskid=" + coreVariables.taskID + "&paneindex=3&nextURL=a&objAction=Browse&sort=name");

        $("#folderLinkContracts").on("click", function () {
            window.open("/livelink/llisapi.dll?func=work.frametaskright&workid=" + coreVariables.workID + "&subworkid=" + coreVariables.subWorkID + "&taskid=" + coreVariables.taskID + "&paneindex=3&nextURL=a&objAction=Browse&sort=name", '_blank', 'scrollbars=1,resizable=1'); return false;
        });

    }

    // Setup 5 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function setUpContractTypeValidation(stepName) {

        // STEP 08 & STEP 17
        toggleCompletionContractType(stepName);
    }

    // Setup 6 ---------------------------------------------------------------------------------------------------
    function setUpGlobalVariables() {
        var ctType = $("#ctContractType option:selected").text();

        coreVariables.ActionWFVars.CONTRACT_TYPE = ctType;
        coreVariables.GenSelectVars.CONTRACT_TYPE = ctType;
    }

    function retrieveContractType() {

        var contractTypeData, dfd = new jQuery.Deferred();

        contractTypeData = {
            func: "ll"
        , objAction: "RunReport"
        , objID: coreVariables.AW_CONTRACT_TYPE_V3_00
        , inputLabel1: coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        , inputLabel2: coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
        };

        $.ajax({
            url: "/livelink/llisapi.dll"
        , data: contractTypeData
        , type: "POST"
        , success: function (data) {
            $("#ctLoading").hide();
            $("#ctContent").append(data);
            dfd.resolve();
        }
    , error: function () {
        alert("Workflow map failed to load");
        dfd.reject();
    }
        });

        return dfd.promise();
    }

    function checkContractCompleted(stepID, wfID) {

        var findLateDeliverablesValidationData, dfd;

        dfd = new jQuery.Deferred();

        findLateDeliverablesValidationData = {
            func: "ll"
            , objAction: "RunReport"
            , objid: coreVariables.AW_TAB_COMPLETION_VERIFICATION
            , inputLabel1: (wfID || "")
            , inputLabel2: stepID
        };

        $.ajax({
            url: "/livelink/llisapi.dll"
            , data: findLateDeliverablesValidationData
            , type: "POST"
            , dataType: 'json'
            , success: function (data) {
                dfd.resolve([data]);
            }
        });

        return dfd.promise();
    }

    // THESE ARE STEPS WHERE IT IS NECESSARY TO VIEW THE TAB ONLY - OPEN ACTIVATES CHECK
    function checkContractTypeStepComplete(stepName) {

        //  TURN ON LATER
        if (coreVariables.stepNumber == "07") {
            return 1;
        }

        if (coreVariables.stepNumber == "09") {
            return 2;
        }
        // -----------------------------

        return -1;
    }

    //RUN ON THE EVENT TABS SWITCH - LOOKING AT THE TAB GIVES THE GREEN CHECKMARK
    function checkContractType(ui) {

        if (ui.newTab[0].textContent == "Assign Contract Type") {

            if ($("#ctCheckCompleteHolder").hasClass("awCompleteBadge")) {
                return;
            }
            else {
                //  TURN ON LATER
                if (coreVariables.stepNumber == "07") {
                    $("#ctCheckCompleteHolder").addClass("awCompleteBadge");
                    saveContractTypeValidation(ctVariables.step07)
                }

                if (coreVariables.stepNumber == "09") {
                    $("#ctCheckCompleteHolder").addClass("awCompleteBadge");
                    saveContractTypeValidation(ctVariables.step09)
                }
                // -----------------------------
            }
        }
    }

    function ctContractTypeChange() { // coreVariables.ActionWFVars.CONTRACT_TYPE set somehow

        var ctContractType = this;

        //I put this in a when because if i run on complete then it gets executed multiple times
        $.when($("#headerFolders, #contractFolders, #grantFolders, .standardFolders, #linkWorkflowFolders").fadeOut("quick")).then(function () {

            if ($("#ctContractType option:selected").attr("folderType") != $("#ctContractType").attr("folderStructure")) {
                $.when(ctContractType, updateFoldersLivelink(), ctUpdateClarity(), ctUpdate($("#ctContractType option:selected").text(), $("#actionWFRS_ACTION_WF_ID").val())).done(ctContractTypeDone).done(setUpGlobalVariables); //ctContractType is passed in as parameter for done
            }
            else {
                $.when(ctContractType, ctUpdateClarity(), ctUpdate($("#ctContractType option:selected").text(), $("#actionWFRS_ACTION_WF_ID").val())).done(ctContractTypeDone).done(setUpGlobalVariables); //ctContractType is passed in as parameter for done
            }
        });

        toggleContractTypeMessage();
        toggleSubmissionButtons();
    }

    function toggleContractTypeMessage() {

        var currentText = $("#contractTypeSelectionMessage").text();

        if (currentText == "Review the contract type selected and change if necessary" || currentText == "Select Contract Type (Value will also be updated in Clarity)") {
            $("#contractTypeSelectionMessage").text("Generating folders based on selected contract type...");
        }
        else {
            $("#contractTypeSelectionMessage").text("Review the contract type selected and change if necessary");
        }
    }

    function toggleSubmissionButtons() {

        if ($(".awButton").hasClass("ui-state-disabled")) {
            $(".awButton").button("enable");
        }
        else {
            $(".awButton").button("disable");
        }
    }

    function ctContractTypeChangeValidation(event) {

        if ($(this).hasClass("invalid")) {
            if ($(this).val().length > 0) {
                $(this).removeClass("invalid");
                $(event.data).removeClass("awIncompleteBadge");
            }
        }

        if ($(this).val().length == 0) { $(event.data).removeClass("awCompleteBadge"); }
    }

    function ctContractTypeDone(contractType) {

        if ($(contractType).val().length > 0) {
            $("#headerFolders").show();
        }

        setUpContractTypeSelectionMessage();
        setUpContractTypeShowFolders();
        setUpContractTypeValidation(awStepName); // awStepName = global variable
        setUpGlobalVariables();

        $(contractType).attr("folderStructure", $(contractType).children("option:selected").attr("folderType"));

        toggleSubmissionButtons();
    }

    function toggleCompletionContractType(stepName) {

        if (coreVariables.stepNumber == "08") {

            if ($("#ctContractType").val() == "") {
                $("#ctCheckCompleteHolder").removeClass("awCompleteBadge");
            }
            else {
                $("#ctCheckCompleteHolder").removeClass("awIncompleteBadge").addClass("awCompleteBadge");
            }
        }

        if (coreVariables.stepNumber == "17") {

            if ($("#ctContractType").val() == "") {
                $("#ctCheckCompleteHolder").removeClass("awCompleteBadge");
            }
            else {
                $("#ctCheckCompleteHolder").removeClass("awIncompleteBadge").addClass("awCompleteBadge");
            }
        }
    }

    function saveContractTypeValidation(stepID) {

        var updateLateDeliverablesValidationData;

        updateLateDeliverablesValidationData = {
            func: "ll"
            , objAction: "RunReport"
            , objid: coreVariables.AW_I_RS_TAB_COMPLETION
            , inputLabel1: (coreVariables.wfID || "")
            , inputLabel2: stepID
            , inputLabel3: "contract type validation"
        };

        return $.ajax({
            url: "/livelink/llisapi.dll"
            , data: updateLateDeliverablesValidationData
            , type: "POST"
        });
    }


    ////////////////////////////////////////////////////////////////////////////////////////////
    //
    // validate/save for CT Tab
    //
    ////////////////////////////////////////////////////////////////////////////////////////////

    function ctValidateSave() {

        //only check at step 8

        var validated = true;

        if (coreVariables.stepNumber == "08") {

            if ($("#ctContractType").val() == "") {
                validated == false;
                $("#ctContractType").addClass("invalid");
                $("#ctCheckCompleteHolder").addClass("awIncompleteBadge");
            }
        }

        if (coreVariables.stepNumber == "17") {

            if ($("#ctContractType").val() == "") {
                validated == false;
                $("#ctContractType").addClass("invalid");
                $("#ctCheckCompleteHolder").addClass("awIncompleteBadge");
            }
        }

        return validated;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////
    //
    // call LL to XOG the new val to clarity and create folders if necessary
    //
    ////////////////////////////////////////////////////////////////////////////////////////////

    function ctUpdateClarity() {

        var xogUpdateJSON, xogUpdate, data;

        xogUpdateJSON = {
            project: [{
                code: coreVariables.ActionWFVars.FK_PROJECT_CODE
            , X_PROJNAME_X: coreVariables.ActionWFVars.FK_PROJECT_NAME
            , afosr_cont_type: $("#ctContractType").val()
            }]
        };

        xogUpdate = JSON.stringify(xogUpdateJSON);

        data = {
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
            console.log("Finished ctSave ... ");
            for (n in results) {
                console.log("" + n + ": " + results[n]);
            }
        }
        , fail: function (results) {
            console.log("FAILED ctSave ... ");
            for (n in results) {
                console.log("" + n + ": " + results[n]);
            }
        }
        });
    }

    function updateFoldersLivelink() {

        var dfd, folderUpdate;

        dfd = new jQuery.Deferred();

        folderUpdate = {
            "func": "cwewfeventscript.AddActionWFAttachmentFolders"
        , "workID": coreVariables.workID
        , "subWorkID": coreVariables.subWorkID
        , "contractType": $("#ctContractType option:selected").text().replace("<Select>", "")
        };

        if ($("#ctContractType").attr("folderStructure") != $("#ctContractType option:selected").attr("folderType")) {
            folderUpdate.deleteCurrent = "true";
        }

        $.ajax({
            url: "/livelink/llisapi.dll"
            , type: "POST"
            , data: folderUpdate
            , success: function (results) {

                console.log("Finished updateFolders ... ");
                for (n in results) {
                    console.log("" + n + ": " + results[n]);
                }
                dfd.resolve();
            }
            , fail: function (results) {

                console.log("FAILED updateFolders ... ");
                for (n in results) {
                    console.log("" + n + ": " + results[n]);
                }

                dfd.reject();
            }
        });

        return dfd.promise();
    }

    function ctUpdate(contractType, WF_ID) {

        var dfd;

        var ctData = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objid": coreVariables.updateContractTypeID
            , "inputLabel1": WF_ID
            , "inputLabel2": contractType
        };

        dfd = $.ajax({
            url: "/livelink/llisapi.dll",
            data: ctData,
            type: "POST"
        });

        dfd.done(function (updateReturn) {

            genericAjaxInsUpdDelErrHandling(updateReturn).fail(function (result) {
                alert("Error saving in ctUpdate");
            });
        });

        return dfd;
    }

    return {
        setUpContractType: setUpContractType,
        retrieveContractType: retrieveContractType,
        checkContractCompleted: checkContractCompleted,
        checkContractTypeStepComplete: checkContractTypeStepComplete,
        checkContractType: checkContractType,
        ctContractTypeChange: ctContractTypeChange,
        ctContractTypeChangeValidation: ctContractTypeChangeValidation,
        saveContractTypeValidation: saveContractTypeValidation,
        ctUpdateClarity: ctUpdateClarity,
        updateFoldersLivelink: updateFoldersLivelink,
        ctUpdate: ctUpdate
    };

})
