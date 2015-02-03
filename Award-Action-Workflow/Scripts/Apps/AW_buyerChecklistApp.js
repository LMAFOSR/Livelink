define(["jquery"
    , variablesObjectInitiate
], function () {

    if ($("#buyerChecklistHolder").length == 1) {

        retrieveBuyerChecklist({
            func: "ll"
            , objAction: "RunReport"
            , objID: coreVariables.AW_CHECKLIST_SUMMARY_BUYER
            , inputLabel1: coreVariables.wfID
        });
    }

    function retrieveBuyerChecklist(buyerChecklistData) {

        var dfd = new jQuery.Deferred();

        $.ajax({
            url: "/livelink/llisapi.dll"
            , data: buyerChecklistData
            , type: "POST"
            , success: function (data) {
                $("#buyerChecklistHolder").append(data);  
				$("#kickbackAccordion").accordion({ collapsible: true, heightStyle: "content" });
				$('.clsReasonDetail')[$('.clsReasonDetail').length-1].innerHTML = $('.clsReasonDetail')[$('.clsReasonDetail').length-1].innerHTML.replace(/\n/g,'<br />');  // jhn
                dfd.resolve();
            }
            , error: function () {
                alert("Buyer Checklist failed to load");
                dfd.reject();
            }
        });

        return dfd.promise();
    }

})
