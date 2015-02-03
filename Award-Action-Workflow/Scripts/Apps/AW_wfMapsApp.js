define(["jquery", "jqueryui", pluggInsAppURL, "support/text!/livelink/llisapi.dll/open/AW_WF_MAP2_TEXT"], function () {

    if ($("#wfMapHolder").length == 1) {
        $("#wfMapHolder").append(arguments[3]);

        setUpWFMapControls();
    }

})

function setUpWFMapControls() {

    $(".Step1").hide();
    $(".Step2").hide();
    $(".Step3").hide();
    $(".Step4").hide();
    $(".Step5").hide();
    $(".Step6").hide();
    $(".Step7").hide();
    $(".Step8").hide();
    $(".Step9").hide();

    if (coreVariables.stepNumber == "01") {

        $(".Step1").show();
    }


    if (coreVariables.stepNumber == "02") {

        $(".Step2").show();
    }


    if (coreVariables.stepNumber == "06") {

        $(".Step6").show();

    }

    return new jQuery.Deferred().resolve().promise();
}




