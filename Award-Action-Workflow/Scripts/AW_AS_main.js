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

var stepNumber, loadScripts = [], stepInformation;

var stepNumber = (function (stepNumber) {
    return window.opener.document.getElementById("stepNumber").value;
})()

stepInformation = intializeScripts(stepNumber);
loadScripts = initializeScriptArray(stepInformation);

function intializeScripts(stepNumber) {

    var stepView, stepApp;

    if (stepNumber === '01') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_01_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_01_RULES_APP";
    }

    if (stepNumber === '02') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_02_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_02_RULES_APP";
    }

    if (stepNumber === '03') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_03_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_03_RULES_APP";
    }

    if (stepNumber === '04') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_04_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_05_RULES_APP";
    }

    if (stepNumber === '05') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_05_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_05_RULES_APP";
    }

    if (stepNumber === '06') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_06_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_06_RULES_APP";
    }

    if (stepNumber === '07') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_07_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_07_RULES_APP";
    }

    if (stepNumber === '08') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_08_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_08_RULES_APP";
    }

    if (stepNumber === '09') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_09_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_09_RULES_APP";
    }

    if (stepNumber === '10') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_10_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_08_RULES_APP";
    }

    if (stepNumber === '11') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_11_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_11_RULES_APP";
    }

    if (stepNumber === '12') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_12_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_12_RULES_APP";
    }

    if (stepNumber === '13') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_13_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_13_RULES_APP";
    }

    if (stepNumber === '14') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_14_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_14_RULES_APP";
    }

    if (stepNumber === '15') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_15_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_15_RULES_APP";
    }

    if (stepNumber === '16') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_16_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_16_RULES_APP";
    }

    if (stepNumber === '17') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_17_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_17_RULES_APP";
    }

    if (stepNumber === '18') {
        stepView = "support/text!/livelink/llisapi.dll/open/AW_18_RULES_VIEW";
        stepApp = "/livelink/llisapi.dll/open/AW_18_RULES_APP";
    }

    return { stepView: stepView, stepApp: stepApp }
}

function initializeScriptArray(stepInformation) {

    var loadScripts = [];

    loadScripts.push(stepInformation.stepView);
    loadScripts.push(stepInformation.stepApp);

    return loadScripts;
}

require(loadScripts, function () { });
