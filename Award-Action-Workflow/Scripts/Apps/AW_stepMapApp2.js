define(["jquery", "jqueryui", pluggInsAppURL, "support/text!/livelink/llisapi.dll/open/AW_WF_MAP2_TEXT"], function () {

    var wfMap2Text = arguments[3], dfd = new jQuery.Deferred(), dfdFinal = new jQuery.Deferred();

    if (wfMap2Text != undefined) {
        $("#wfMapHolder").append(wfMap2Text);
        preProcessText(wfMap2Text);

        dfd.resolve();
    }

    dfd.promise().done(mapSetUp).fail(function () { dfdFinal.resolve(); });

    return dfdFinal.promise();

})

function preProcessText(wfMap2Text) {

    if (coreVariables.stepNumber != "02") {
        $("#wfMapHolder").find(".step2").remove();
    }


    if (coreVariables.stepNumber != "06") {
        if (coreVariables.stepNumber == "01" && coreVariables.ActionWFVars.ACTION_TYPE == "non_contracting") {
            $("#arrow4to6").remove();
            $("#Step6Label").children(":first-child").attr('x', '0').text("PO Fills Out Cost").next().attr('x', '-6').text('& Tech Evaluation');
        }
        else {
            $("#wfMapHolder").find(".step6").remove();
        }
    }

    if (coreVariables.ActionWFVars.ACTION_TYPE.search(/non_contracting/i) != -1) {
        $("#wfMapHolder").find(".nonMFD").remove();
        $("#wfMapHolder").find(".Step1").remove();
        $(".multiBarBline").attr('x2', '650')
        $("#multiBarC").remove();
        $("#multiBarD").remove();
        $("#multiBarE").remove();
        $("#wfMapHolder").find(".Step1MFD").hide();
        if (coreVariables.stepNumber == "01") {
            $(".Step1MFD").show();
        }
    }
    else {
        $("#wfMapHolder").find(".MFD").remove();
        $("#wfMapHolder").find(".Step1MFD").remove();
        $("#wfMapHolder").find(".Step7Label1").attr('x', '2').text("PK Team Lead");
        $("#wfMapHolder").find(".Step7Label2").text("'Assigns Action");

    }

}

function mapSetUp() {
    var mapStep;
    var mapStepName;

    var mapStepNum = parseInt(awStepName.slice(0, 2), 10);//coreVariables.stepNumber;
    var mapStepColor = '#87F8A4';

    switch (mapStepNum) {
        case 1:
            mapStep = 'Step1';
            break;
        case 2:
            mapStep = 'Step2';
            break;
        case 3:
            mapStep = 'Step3';
            break;
        case 4:
            mapStep = 'Step4';
            break;
        case 5:
            mapStep = 'Step5';
            break;
        case 6:
            mapStep = 'Step6';
            break;
        case 7:
            mapStep = 'Step7';
            break;
        case 8:
            mapStep = 'Step8';
            break;
        case 9:
            mapStep = 'Step9';
            break;
        case 10:
            //show review steps
            //determine what other reviews are happening--set labels, show boxes, arrows, and multiBar as appropriate
            mapStep = 'Step10';
            stepName = "PK Division";
            mapReview(stepName);
            break;
        case 11:
            //show review steps
            //determine what other reviews are happening--set labels, show boxes, arrows, and multiBar as appropriate
            mapStep = 'Step11';
            stepName = "PK Policy";
            mapReview(stepName);
            break;
        case 12:
            //show review steps
            //determine what other reviews are happening--set labels, show boxes, arrows, and multiBar as appropriate
            mapStep = 'Step12';
            stepName = "JA Legal";
            mapReview(stepName);
            break;
        case 13:
            //show kickback
            // determine from what step, label and place kick and arrows appropriately
            stepName = ["PO Reworks", "Package for PK"];
            mapStep = mapKick(stepName);
            break;
        case 14:
            //show kickback
            // determine from what step, label and place kick and arrows appropriately
            stepName = ["PA Reworks", "PR for PK"];
            mapStep = mapKick(stepName);
            break;
        case 15:
            mapStep = 'Step15';
            break;
        case 18:
            mapStep = 'Step7';
            break;
        case 19:
            mapStep = 'Step19';
            break;
        case 20:
            stepName = ["RPF Decommits","Funding"];
            mapStep = mapKick(stepName);
            break;
        default:
            // default statements
    }

    if (mapStep != undefined) {
        if (mapStep == "Step1" && coreVariables.ActionWFVars.ACTION_TYPE == "non_contracting") {
            $('#Step6').attr('stroke', mapStepColor); // box shared with Step6
            $('#Step6').attr('stroke-width', '4');
        }
        else {
            $('#' + mapStep).attr('stroke', mapStepColor);
            $('#' + mapStep).attr('stroke-width', '4');
        }
    }
};

function mapKick(stepName) {
    var kickFromStep = "";
    var kickFrom = coreVariables.ActionWFVars.EVAL_NEXT_STEP.split(" - ");


    if (kickFrom.length < 2) {

        if (window.activeWorkflow) {
            alert('uh-oh, Map cannot find kicker from |[LL_REPTAG_&workid WFFORM:"RS_ACTION_WF":EVAL_NEXT_STEP:DISPLAY /]|');
        }
    }
    else {
        switch (kickFrom[1]) {

            case "Scheduler":
                kickFromStep = "3";  // test kick back to PO from Scheduler for non_contracting action type
                break;

            case "Team Lead":
                kickFromStep = "7";
                break;

            case "Buyer":
                kickFromStep = "8";
                break;

            case "PK Officer":
                kickFromStep = "9";
                break;

            case "Outgoing MFD":
                kickFromStep = "7";
                break;

            default:
                alert("Map cannot determine kicker from " + kickFrom[1]);

                break;
        }

        if (kickFromStep != "") {
            $("#arrow" + kickFromStep + "ToBelow" + kickFromStep).show();
            $("#StepBelow" + kickFromStep).show();
            if (stepName.length == 2) {
                var showLabel = "StepBelow" + kickFromStep + "Label2Line";
                var hideLabel = "StepBelow" + kickFromStep + "Label3Line";
                if (coreVariables.stepNumber == "13" ) {
                    $("#" + showLabel).children(":first-child").text(stepName[0]).attr("x", "0").next().text(stepName[1]).attr("x", "-9");
                }
                else if (coreVariables.stepNumber == "20"){
                    $("#" + showLabel).children(":first-child").text(stepName[0]).attr("x", "-9").next().text(stepName[1]).attr("x", "5");
                }
                else {
                    $("#" + showLabel).children(":first-child").text(stepName[0]).attr("x", "0").next().text(stepName[1]).attr("x", "5");
                }
                $("#" + showLabel).show();
                $("#" + hideLabel).hide();
            }
            else {
                var hideLabel = "StepBelow" + kickFromStep + "Label2Line";
                var showLabel = "StepBelow" + kickFromStep + "Label3Line";

                $("#" + showLabel).children(":first-child").text(stepName[0]).next().text(stepName[1]).next().text(stepName[2]);
                $("#" + showLabel).show();
                $("#" + hideLabel).hide();
            }
        }
    }

    // tell which stepbox to highlight
    return "StepBelow" + kickFromStep;
}

function mapReview(stepName) {
    var ok = true;
    var revFromStep = "";

    var divReview = (coreVariables.ActionWFVars.EVAL_DIVISION_REVIEW == 'Yes');
    var lglReview = (coreVariables.ActionWFVars.EVAL_LEGAL_REVIEW == 'Yes');
    var polReview = (coreVariables.ActionWFVars.EVAL_POLICY_REVIEW == 'Yes');
    var revFrom = coreVariables.ActionWFVars.EVAL_NEXT_STEP.split(" - ");
    var revFrom2 = coreVariables.ActionWFVars.EVAL_NEXT_STEP;
    var tripleReview = ((divReview) && (lglReview) && (polReview));
    var doubleReview = (((divReview) && (lglReview)) ||
                            ((divReview) && (polReview)) ||
                            ((lglReview) && (polReview)));
    var singleReview = (!tripleReview && !doubleReview);

    if (revFrom.length < 2) {
        switch (revFrom2) {

            case "Team Lead":
                revFromStep = "7";
                break;

            case "PK Officer":
                revFromStep = "9";
                break;

            case "Outgoing MFD":
                revFromStep = "7";
                break;

            default:
                alert('uh-oh, Map cannot find review requester from |[LL_REPTAG_&workid WFFORM:"RS_ACTION_WF":EVAL_NEXT_STEP:DISPLAY /]|');
                ok = false;
                break;
        }
    }
    else {
        switch (revFrom[1]) {

            case "Team Lead":
                revFromStep = "7";
                break;

            case "PK Officer":
                revFromStep = "9";
                break;

            case "Outgoing MFD":
                revFromStep = "7";
                break;

            default:
                alert("Map cannot determine review requester from " + revFrom[1]);
                ok = false;
                break;
        }
    }
    if (ok) {
        if ((revFromStep != "") && singleReview) {
            var stepXOffset = 0;
            switch (stepName) {
                case "PK Division":
                    stepXOffset = '2.5';
                    break;
                case "PK Policy":
                    stepXOffset = '6';
                    break;
                case "JA Legal":
                    stepXOffset = '6.5';
                    break;
            }
            $("#arrow" + revFromStep + "ToBelow" + revFromStep).show();
            $("#StepBelow" + revFromStep).show();
            $("#StepBelow" + revFromStep + "Label2Line").children(":first-child").attr('x', stepXOffset).text(stepName).next().attr('x', '9').text('Review');
            $("#StepBelow" + revFromStep + "Label2Line").show();
            $("#StepBelow" + revFromStep + "Label3Line").hide();
            $("#StepBelow" + revFromStep).attr('stroke', '#87F8A4');
            $("#StepBelow" + revFromStep).attr('stroke-width', '4');
        }
        else if ((revFromStep != "") && tripleReview) {
            // show full multibar, all three below boxes, and all half arrows.
            // set label in all three below boxes.

            $("#arrowDownToBelow7").show();
            $("#multiBarA").show();
            if (revFromStep == "7") {
                $("#arrowUpTo7").show();
            }
            $("#multiBarB").show();
            $("#multiBarC").show();
            $("#arrowDownToBelow8").show();
            $("#multiBarD").show();
            if (revFromStep == "9") {
                $("#arrowUpTo9").show();
            }
            $("#multiBarE").show();
            $("#arrowDownToBelow9").show();

            $("#StepBelow7").show();
            $("#StepBelow7Label2Line").children(":first-child").attr('x', '6.5').text("JA Legal").next().attr('x', '9').text('Review');
            $("#StepBelow7Label2Line").show();
            $("#StepBelow7Label3Line").hide();

            $("#StepBelow8").show();
            $("#StepBelow8Label2Line").children(":first-child").attr('x', '2.5').text("PK Division").next().attr('x', '9').text('Review');
            $("#StepBelow8Label2Line").show();
            $("#StepBelow8Label3Line").hide();

            $("#StepBelow9").show();
            $("#StepBelow9Label2Line").children(":first-child").attr('x', '6').text("PK Policy").next().attr('x', '9').text('Review');
            $("#StepBelow9Label2Line").show();
            $("#StepBelow9Label3Line").hide();

            $("#StepBelow7,#StepBelow8,#StepBelow9").attr('stroke', '#87F8A4');
            $("#StepBelow7,#StepBelow8,#StepBelow9").attr('stroke-width', '4');

        }
        else if ((revFromStep != "") && doubleReview) {

            var firstDone = false;
            var firstLabel = "";
            var secondLabel = "";


            // show either the left two or the right two, depending upon whether from is 7 or 9
            if (revFromStep == "7") {
                $("#arrowDownToBelow7").show();
                $("#multiBarA").show();
                $("#arrowUpTo7").show();
                $("#multiBarB").show();
                $("#multiBarC").show();


                $("#StepBelow7").show();
                $("#StepBelow7Label2Line").children(":last-child").attr('x', '9').text('Review');
                $("#StepBelow7Label2Line").show();
                $("#StepBelow7Label3Line").hide();

                firstLabel = "StepBelow7Label2Line";
                secondLabel = "StepBelow8Label2Line";

                $("#StepBelow7,#StepBelow8").attr('stroke', '#87F8A4');
                $("#StepBelow7,#StepBelow8").attr('stroke-width', '4');
            }

            $("#arrowDownToBelow8").show();
            $("#StepBelow8").show();
            $("#StepBelow8Label2Line").children(":last-child").attr('x', '9').text('Review');
            $("#StepBelow8Label2Line").show();
            $("#StepBelow8Label3Line").hide();

            if (revFromStep == "9") {

                $("#multiBarD").show();
                $("#arrowUpTo9").show();
                $("#multiBarE").show();
                $("#arrowDownToBelow9").show();

                $("#StepBelow9").show();
                $("#StepBelow9Label2Line").children(":last-child").attr('x', '9').text('Review');
                $("#StepBelow9Label2Line").show();
                $("#StepBelow9Label3Line").hide();

                firstLabel = "StepBelow8Label2Line";
                secondLabel = "StepBelow9Label2Line";

                $("#StepBelow8,#StepBelow9").attr('stroke', '#87F8A4');
                $("#StepBelow8,#StepBelow9").attr('stroke-width', '4');
            }

            if (lglReview) {
                firstDone = true;
                $("#" + firstLabel).children(":first-child").attr('x', '6.5').text("JA Legal");
            }

            if (divReview) {
                if (!firstDone) {
                    firstDone = true;
                    $("#" + firstLabel).children(":first-child").attr('x', '2.5').text("PK Division");
                }
                else {
                    $("#" + secondLabel).children(":first-child").attr('x', '2.5').text("PK Division");
                }
            }

            if (polReview) {
                $("#" + secondLabel).children(":first-child").attr('x', '6').text("PK Policy");
            }
        }
    }
}
