require.config(
   {
       paths: {
           jquery: ["/support/afrl/AFOSR/scripts/jquery-1.9.1.min"]
           , jqueryui: "/support/afrl/AFOSR/scripts/jquery-ui-1.9.2.custom.min"
           , migrate: "/support/afrl/AFOSR/awardAction/scripts/jquery-migrate-1.1.1.min"
           , validator: "/support/afrl/AFOSR/scripts/jquery.validate10.0"
           , angular: "/support/afrl/AFOSR/scripts/angular.min"
           , jsonURLConverter: "/support/afrl/AFOSR/scripts/jsonURLConverterMinApp"
           , autoresize: "/support/afrl/AFOSR/awardAction/scripts/autoresize.jquery"
           , support: "/support/afrl/AFOSR/scripts/" //ADDED THIS FOR TEXT - support/text! problem occurs because GET vs POST get command prompt not data
       },
       text: {},
       shim: {
           jqueryui: {
               deps: ["jquery"],
               init: function ($) {
               }
           },
           migrate: {
               deps: ["jquery"],
               init: function ($) {
               }
           },
           validator: {
               deps: ["jquery", "migrate"],
               init: function ($) {
               }
           },
           autoresize: {
               deps: ["jquery", "migrate"],
               init: function ($) {
               }
           },
           jsonURLConverter: {
               deps: ["angular"],
               init: function () {
               }
           }
       }
   });

var uglyScripts = false; //Sets Loads Minified version of JS files

var objID = {
    generalVariables: "20504729"
    , variablesObjectInitiate: "20505276"
    , variablesObjectSecondary: "20519001"
};

var tabManagerAppURL = "/livelink/llisapi.dll/open/AW_tabManagerApp";
var variablesObjectInitiate = "/livelink/llisapi.dll?func=ll&objId=" + objID.variablesObjectInitiate + "&objAction=RunReport";
var variablesObjectSecondary = "/livelink/llisapi.dll?func=ll&objId=" + objID.variablesObjectSecondary + "&objAction=RunReport";
var variablesURLAppURL = "/livelink/llisapi.dll/open/AW_variablesURLApp";
var AW_cancelPRApp = "/livelink/llisapi.dll/open/AW_cancelPRApp";
var attachmentsURL = "/livelink/llisapi.dll/open/AW_attachmentsApp";
var pluggInsAppURL = "/livelink/llisapi.dll/open/AW_pluggInsApp";
var coreAppURL = "/livelink/llisapi.dll/open/AW_coreApp";
var instructionAppURL = "/livelink/llisapi.dll/open/AW_instructionApp";
var stepMapAppURL = "/livelink/llisapi.dll/open/AW_stepMapApp2";
var validationAppURL = "/livelink/llisapi.dll/open/AW_validationApp";
var actionStatusAppURL = "/livelink/llisapi.dll/open/AW_actionStatusApp";
var contractTypeApp2URL = "/livelink/llisapi.dll/open/AW_contractTypeApp";
var pkTeamAppURL = "/livelink/llisapi.dll/open/AW_pkTeamApp";
var pkOfficerAppURL = "/livelink/llisapi.dll/open/AW_pkOfficerApp";
var pkBuyerAppURL = "/livelink/llisapi.dll/open/AW_pkBuyerApp";
var lateDeliverablesAppURL = "/livelink/llisapi.dll/open/AW_lateDeliverablesApp";
var step8AppURL = "/livelink/llisapi.dll/open/AW_step8App2";
var stepAoardAppURL = "/livelink/llisapi.dll/open/AW_stepAoardApp"; // jhn 2/2/2015
var buyerChecklistAppURL = "/livelink/llisapi.dll/open/AW_buyerChecklistApp";
var checklistAppURL = "/livelink/llisapi.dll/open/AW_checklistApp";
var kickBackReportAppURL = "/livelink/llisapi.dll/open/AW_kickBackReportApp";
//var techEvalCommonAppURL = "/livelink/llisapi.dll/open/AW_techEvalCommonApp";
//var techEvalWFAppURL = "/livelink/llisapi.dll/open/AW_techEvalWFApp";
//var techEvalIdeaAppURL = "/livelink/llisapi.dll/open/AW_techEvalIdeaApp";
var technicalEvaluationAppURL = "/livelink/llisapi.dll/open/AW_technicalEvaluationApp";
var costEvaluationAppURL = "/livelink/llisapi.dll/open/AW_costEvaluationApp";
//var costEvalCommonAppURL = "/livelink/llisapi.dll/open/AW_costEvalCommonApp";
//var costEvalWFAppURL = "/livelink/llisapi.dll/open/AW_costEvalWFApp";
var ideaCTDataAppURL = "/livelink/llisapi.dll?func=ll&objId=20580103&objAction=RunReport&inputLabel1=" + ((typeof ideaCTID == "string") ? ideaCTID : ""); // this var is set in the PO Fills out... WR in ams\aaw\WR\06
var sendReviewApp = "/livelink/llisapi.dll/open/AW_sendReviewApp";
var sendReviewText = "support/text!/livelink/llisapi.dll/open/AW_SEND_FOR_REVIEW_TEXT"; //LITTLE DIFFERNT SINCE THIS IS JUST TEXT
var generalVariablesApp = "/livelink/llisapi.dll?func=ll&objId=" + objID.generalVariables + "&objAction=RunReport&inputLabel1=" + coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID + "&inputLabel2=" + coreVariables.ActionWFVars.FK_CLARITY_PROFILE_ID + "&subworkid=" + coreVariables.subWorkID + "&taskid=" + coreVariables.taskID + "&inputLabel3=";

if (uglyScripts) {
    tabManagerAppURL = "/livelink/llisapi.dll/open/tabManagerMinApp";
    variablesObjectInitiate = "/livelink/llisapi.dll/open/AW_VARIABLES_OBJECT_ID_INITIATE_MIN_APP";
    variablesObjectSecondary = "/livelink/llisapi.dll/open/AW_VARIABLES_OBJECT_ID_SECOND_MIN_APP"
    variablesURLAppURL = "/livelink/llisapi.dll/open/variablesURLMinApp";
    attachmentsURL = "/livelink/llisapi.dll/open/attachmentsMinApp";
    pluggInsAppURL = "/livelink/llisapi.dll/open/pluggInsMinApp";
    coreAppURL = "/livelink/llisapi.dll/open/coreMinApp";
    instructionAppURL = "/livelink/llisapi.dll/open/instructionMinApp";
    stepMapAppURL = "/livelink/llisapi.dll/open/stepMapMinApp";
    validationAppURL = "/livelink/llisapi.dll/open/validationMinApp";
    actionStatusAppURL = "/livelink/llisapi.dll/open/actionStatusMinApp";
    contractTypeApp2URL = "/livelink/llisapi.dll/open/contractTypeMinApp2";
    pkTeamAppURL = "/livelink/llisapi.dll/open/pkTeamMinApp";
    pkOfficerAppURL = "/livelink/llisapi.dll/open/pkOfficerMinApp";
    pkBuyerAppURL = "/livelink/llisapi.dll/open/pkBuyerMinApp";
    lateDeliverablesAppURL = "/livelink/llisapi.dll/open/AW_lateDeliverablesMinApp";
    jsonURLConverterAppURL = "/livelink/llisapi.dll/open/jsonURLConverterMinApp";
    step8AppURL = "/livelink/llisapi.dll/open/step8MinApp";
	stepAoardAppURL = "/livelink/llisapi.dll/open/AW_stepAoardApp";
    buyerChecklistAppURL = "/livelink/llisapi.dll/open/AW_buyerChecklistMinApp"; // jhn 2/2/2015
    checklistAppURL = "/livelink/llisapi.dll/open/AW_checklistMinApp";
    kickBackReportAppURL = "/livelink/llisapi.dll/open/AW_kickBackReportMinApp";
    //techEvalCommonAppURL = "/livelink/llisapi.dll/open/AW_techEvalCommonMinApp";
    //techEvalWFAppURL = "/livelink/llisapi.dll/open/AW_techEvalWFMinApp";
    //techEvalIdeaAppURL = "/livelink/llisapi.dll/open/AW_techEvalIdeaMinApp";
    technicalEvaluationAppURL = "livelink/llisapi.dll/open/AW_technicalEvaluationApp";
    costEvaluationAppURL = "/livelink/llisapi.dll/open/AW_costEvaluationApp";
    //costEvalCommonAppURL = "/livelink/llisapi.dll/open/AW_costEvalCommonMinApp";
    //costEvalWFAppURL = "/livelink/llisapi.dll/open/AW_costEvalWFMinApp";
    //costEvalIdeaAppURL = "/livelink/llisapi.dll/open/AW_costEvalIdeaMinApp";
}

var loadScripts = [generalVariablesApp
    , tabManagerAppURL // loads before everything else - removes srcipt tags that manage whether or not tabs appear for standalone
    , variablesObjectInitiate
    , variablesURLAppURL
    , attachmentsURL
    , pluggInsAppURL
    , coreAppURL
    , instructionAppURL
    , stepMapAppURL
    , variablesObjectSecondary
    , validationAppURL
    , actionStatusAppURL
];

(function () {

    if (coreVariables.stepNumber == "01") {
        loadScripts.push(technicalEvaluationAppURL);
        loadScripts.push(costEvaluationAppURL);
    }

    if (coreVariables.stepNumber == "03") {
        loadScripts.push(pkTeamAppURL);
        loadScripts.push(sendReviewApp);
    }

    if (coreVariables.stepNumber == "04") {
        loadScripts.push(sendReviewText)
        loadScripts.push(sendReviewApp);
    }

    if (coreVariables.stepNumber == "06") {
        loadScripts.push(technicalEvaluationAppURL);
        loadScripts.push(costEvaluationAppURL);
    }

    if (coreVariables.stepNumber == "07") {
        loadScripts.push(contractTypeApp2URL);
        loadScripts.push(pkTeamAppURL);
        loadScripts.push(pkOfficerAppURL);
        loadScripts.push(pkBuyerAppURL);
        loadScripts.push(lateDeliverablesAppURL);
        loadScripts.push(sendReviewText)
        loadScripts.push(sendReviewApp);
    }

    if (coreVariables.stepNumber == "08") {
        loadScripts.push(contractTypeApp2URL);
        loadScripts.push(step8AppURL);
        loadScripts.push(pkOfficerAppURL);
        loadScripts.push(lateDeliverablesAppURL);
        loadScripts.push(buyerChecklistAppURL);
        loadScripts.push(checklistAppURL);
        loadScripts.push(sendReviewApp);
    }

    if (coreVariables.stepNumber == "09") {
        loadScripts.push(contractTypeApp2URL);
        loadScripts.push(lateDeliverablesAppURL);
        loadScripts.push(checklistAppURL);
        loadScripts.push(sendReviewText);
        loadScripts.push(sendReviewApp);
    }

    if (coreVariables.stepNumber == "13") {
        loadScripts.push(kickBackReportAppURL);
        loadScripts.push(technicalEvaluationAppURL);
        loadScripts.push(costEvaluationAppURL);
    }

    if (coreVariables.stepNumber == "14") {
        loadScripts.push(kickBackReportAppURL);
    }

    if (coreVariables.stepNumber == "15") {
        loadScripts.push(sendReviewText);
        loadScripts.push(sendReviewApp);
    }


    if (coreVariables.stepNumber == "16") { // jhn
        loadScripts.push(stepAoardAppURL); // jhn 2/2/2015
        loadScripts.push(sendReviewText);
        loadScripts.push(sendReviewApp);
    }

    if (coreVariables.stepNumber == "17") {
        loadScripts.push(contractTypeApp2URL);
        loadScripts.push(sendReviewText)  // jhn
        loadScripts.push(sendReviewApp);  // jhn
    }

    if (coreVariables.stepNumber == "18") {
        loadScripts.push(sendReviewText);
        loadScripts.push(sendReviewApp);
    }

    if (coreVariables.stepNumber == "21") {
        loadScripts.push(technicalEvaluationAppURL);
        loadScripts.push(costEvaluationAppURL);
    }
})()

require(loadScripts, function () {

});
