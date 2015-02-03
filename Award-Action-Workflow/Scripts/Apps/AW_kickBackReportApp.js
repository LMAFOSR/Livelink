define(["jquery"
    , generalVariablesApp
    , variablesObjectInitiate
], function () {

    if ($("#kickBackReport").length == 1) {

        var kickFrom, kickData;

        switch (coreVariables.ActionWFVars.EVAL_NEXT_STEP.substring(5)) {
            case "Team Lead":
                kickFrom = "PK Team Lead Assigns Action";
                break;
            case "PK Officer":
                kickFrom = "PK Officer Reviews and Signs Action";
                break;
            case "Buyer":
                kickFrom = "PK Buyer Works Action";
                break;
            default:
                ""
        }

        kickData = {
            "func": "ll"
            , "objAction": "RunReport"
            , "objID": coreVariables.AW_CHECKLIST_SUMMARY_00
            , "inputLabel1": kickFrom
            , "inputLabel2": coreVariables.ActionWFVars.RS_ACTION_WF_ID
            , "inputLabel3": "Kick"
            , "inputLabel4": $("#kickBackReport").attr("inputLabel4")
            , "inputLabel5": $("#kickBackReport").attr("inputLabel5")
        };

        $.ajax({
            url: "/livelink/llisapi.dll"
            , data: kickData
            , type: "POST"
            , success: function (data) {
                $("#kickBackReport").append(data);
                $("#kickbackAccordion").accordion({ collapsible: true, heightStyle: "content" });
				$('.clsReasonDetail')[$('.clsReasonDetail').length-1].innerHTML = $('.clsReasonDetail')[$('.clsReasonDetail').length-1].innerHTML.replace(/\n/g,'<br />');  
            }
            , error: function () {
                alert("kickBack Report failed to load");
            }
        });
    }
})

