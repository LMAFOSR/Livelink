define(["jquery"
   , generalVariablesApp
   , variablesObjectInitiate
], function () {

    var pkAwardData, rdCaseFile;

    coreVariables.pkAwardFileIDs = []; //REDO LATER WITH AJAX
    coreVariables.rdCaseFileIDs = []; //REDO LATER WITH AJAX

    if (coreVariables.urlArgs == undefined) { // CONDITION FOR LOADING PAGE OUTSIDE WF
        coreVariables.urlArgs = parseURL();
    }

    coreVariables.nextURL = void 0;

    if (ENVIRONMENT == "BUILD") {

        coreVariables.clarityFlyout = {
            profileURL: "https://grants.build.devebs.afrl.af.mil/niku/nu#action:odf.afors_amendmentProperties&odf_code=afors_amendment&parent_odf_view&ui.page.space=mainnav.work&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
            , projectURL: "https://grants.build.devebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
            , deliverablesURL: "https://grants.build.devebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_view=projectCreate.subObjList.afosr_deliverables&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&parentObjectCode=project&odf_concrete_parent_object_code=project&odf_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_cncrt_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        };

        coreVariables.clarityIcon = "https://grants.build.devebs.afrl.af.mil/niku/nu#action:npt.overview";
        coreVariables.clarityFundingProfileURL = "https://grants.build.devebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&odf_view=projectCreate.subObjList.afosr_funding_prof&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&parentObjectCode=project&odf_concrete_parent_object_code=project&odf_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_cncrt_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID;

        coreVariables.homeIcon = "https://livelink.build.devebs.afrl.af.mil/livelink/llisapi.dll?func=ll&objId=18449400&objAction=browse&sort=name#";
        coreVariables.clarityRelative = "https://grants.build.devebs.afrl.af.mil/";
    }

    if (ENVIRONMENT == "INT") {

        coreVariables.clarityFlyout = {
            profileURL: "https://grants.int.devebs.afrl.af.mil/niku/nu#action:odf.afors_amendmentProperties&odf_code=afors_amendment&parent_odf_view&ui.page.space=mainnav.work&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
            , projectURL: "https://grants.int.devebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
            , deliverablesURL: "https://grants.int.devebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_view=projectCreate.subObjList.afosr_deliverables&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&parentObjectCode=project&odf_concrete_parent_object_code=project&odf_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_cncrt_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        };

        coreVariables.clarityIcon = "https://grants.int.devebs.afrl.af.mil/niku/nu#action:npt.overview";
        coreVariables.clarityFundingProfileURL = "https://grants.int.devebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&odf_view=projectCreate.subObjList.afosr_funding_prof&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&parentObjectCode=project&odf_concrete_parent_object_code=project&odf_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_cncrt_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID;

        coreVariables.homeIcon = "https://livelink.int.devebs.afrl.af.mil/livelink/llisapi.dll/fetch/2000/210703/210766/Custom_View.html?func=ll&objId=210766&objAction=browse&sort=name#";
        coreVariables.clarityRelative = "https://grants.int.devebs.afrl.af.mil/";
    }

    if (ENVIRONMENT == "PREP") {

        coreVariables.clarityFlyout = {
            profileURL: "https://grants.prepebs.afrl.af.mil/niku/nu#action:odf.afors_amendmentProperties&odf_code=afors_amendment&parent_odf_view&ui.page.space=mainnav.work&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
            , projectURL: "https://grants.prepebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
            , deliverablesURL: "https://grants.prepebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_view=projectCreate.subObjList.afosr_deliverables&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&parentObjectCode=project&odf_concrete_parent_object_code=project&odf_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_cncrt_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        };

        coreVariables.clarityIcon = "https://grants.prepebs.afrl.af.mil/niku/nu#action:npt.overview";
        coreVariables.clarityFundingProfileURL = "https://grants.prepebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&odf_view=projectCreate.subObjList.afosr_funding_prof&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&parentObjectCode=project&odf_concrete_parent_object_code=project&odf_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_cncrt_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID;

        coreVariables.homeIcon = "https://livelink.prepebs.afrl.af.mil/livelink/llisapi.dll/fetch/2000/210703/210766/Custom_View.html?func=ll&objId=210766&objAction=browse&sort=name#";
        coreVariables.clarityRelative = "https://grants.prepebs.afrl.af.mil/";
    }

    if (ENVIRONMENT == "PROD") {

        coreVariables.clarityFlyout = {
            profileURL: "https://grants.ebs.afrl.af.mil/niku/nu#action:odf.afors_amendmentProperties&odf_code=afors_amendment&parent_odf_view&ui.page.space=mainnav.work&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
            , projectURL: "https://grants.ebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
            , deliverablesURL: "https://grants.ebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_view=projectCreate.subObjList.afosr_deliverables&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&parentObjectCode=project&odf_concrete_parent_object_code=project&odf_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_cncrt_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID
        };

        coreVariables.clarityIcon = "https://grants.ebs.afrl.af.mil/niku/nu#action:npt.overview";
        coreVariables.clarityFundingProfileURL = "https://grants.ebs.afrl.af.mil/niku/nu#action:projmgr.projectProperties&odf_view=projectCreate.subObjList.afosr_funding_prof&id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_pk=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&parentObjectCode=project&odf_concrete_parent_object_code=project&odf_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&odf_cncrt_parent_id=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID;

        coreVariables.homeIcon = "https://livelink.ebs.afrl.af.mil/livelink/llisapi.dll/fetch/2000/210703/210766/Custom_View.html?func=ll&objId=210766&objAction=browse&sort=name#";
        coreVariables.clarityRelative = "https://livelink.ebs.afrl.af.mil/";
    }

    coreVariables.sharepointIcon = "https://org2.eis.afmc.af.mil/sites/afosr/default.aspx";

    coreVariables.formFlyout = {
        "taskSumURLAddition": "&objID=" + coreVariables.AW_TASK_SUMMARY_01 + "&inputLabel1=" + coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID
        , "techEvalURLAddition": "&objId=" + coreVariables.AW_TECH_EVAL_REPORT_00 + "&inputLabel1=" + coreVariables.ActionWFVars.RS_ACTION_WF_ID
        , "costEvalURLAddition": "&objId=" + coreVariables.AW_COST_EVAL_REPORT_00 + "&inputLabel1=" + coreVariables.ActionWFVars.RS_ACTION_WF_ID
        , "form1URLAddition": "&objID=" + coreVariables.AW_AFRL_FORM1_01 + "&inputLabel1=&inputLabel2=&inputLabel3=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + ""
        , "recCoordURLAddition": "&objID=" + coreVariables.AW_RECORD_OF_COORDINATION_00 + "&inputLabel1=" + coreVariables.ActionWFVars.RS_ACTION_WF_ID
        , "attachmentsURLAddition": coreVariables.baseURL + "?func=work.frametaskright&workid=" + coreVariables.workID + "&subworkid=" + coreVariables.subWorkID + "&taskid=" + coreVariables.taskID + "&paneindex=3&nextURL=a&objAction=Browse&sort=name"
        , "pkAwardURLAddition": coreVariables.baseURL + "?func=ll&nextURL=a&objAction=Browse&sort=name&objID=" + coreVariables.pkAwardFileIDs[0]
        , "rdCaseURLAddition": coreVariables.baseURL + "?func=ll&nextURL=a&objAction=Browse&sort=name&objID=" + coreVariables.rdCaseFileIDs[0]
    };

    coreVariables.folderFlyout = {
        "placeholder": "placeholder"
    }

    // plug the NextURL in the ll sendOn form to be what came in from the request        
    $("#LLSendOnNextURL").val(coreVariables.urlArgs.nexturl);

})

function parseURL() {
    var arg, equal, args = {}, disectedURL, i, disectedURL = document.location.href.split("&");

    for (i = 0; i < disectedURL.length; i++) {
        arg = disectedURL[i];
        if (i == 0) {
            arg = arg.split("?")[1];
        }

        if (arg != undefined) {
            equal = arg.search(/=/);
            if (equal != -1) {
                if (arg.substr(0, equal).search(/^nexturl/i) != -1) {
                    args.nexturl = unescape(arg.substring(equal + 1));
                }
                else {
                    args[arg.substr(0, equal)] = arg.substring(equal + 1);
                }
            }
        }
    }
    return args;
}
