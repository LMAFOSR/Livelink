define(["jquery"
    , generalVariablesApp
], function () {

    if (coreVariables.stepNumber == "01") {

        // Kick back to PO remove button
        if (coreVariables.ActionWFVars.OFFICE == "IOA") {
            $("#sendOnScheduler").remove();
        }
        else {
            $("#sendOnPA").remove();
        }

        if (coreVariables.ActionWFVars.ACTION_TYPE == "non_contracting") {
            $("#tab-2, #tab-3").remove();
            $("[href='#tab-2'], [href='#tab-3']").parent().remove();
        }
    }

    if (coreVariables.stepNumber == "03") {

        // Kick back to PO remove button
        if (coreVariables.ActionWFVars.ACTION_TYPE != "basic" && coreVariables.ActionWFVars.ACTION_TYPE != "additional" && coreVariables.ActionWFVars.ACTION_TYPE != "non_contracting") {
            $("#retToPO").remove();
        }

        if (coreVariables.ActionWFVars.ACTION_TYPE == "non_contracting") {
            $("#tab-2").remove();
            $("[href='#tab-2']").parent().remove();
        }
    }

    if (coreVariables.stepNumber == "04") {

        // Kick back to PO remove button
        if (coreVariables.ActionWFVars.ACTION_TYPE == "admin") {
            $("#retToPO").remove();
        }
    }

    if (coreVariables.stepNumber == "06") {

        //COST/TECH EVALUATIONS 
        if (coreVariables.ActionWFVars.ACTION_TYPE != "basic" && coreVariables.ActionWFVars.ACTION_TYPE != "additional") {
            $("#tab-2, #tab-3").remove();
            $("[href='#tab-2'], [href='#tab-3']").parent().remove();
        }
    }

    if (coreVariables.stepNumber == "07") {

        //CONTRACT TYPE TAB
        if (coreVariables.ActionWFVars.ACTION_TYPE != "basic") {
            $("#tab-5").remove();
            $("[href='#tab-5']").parent().remove();
        }

        // Kick back to PO remove button
        if (coreVariables.ActionWFVars.ACTION_TYPE == "admin") {
            $("#retToPO, #retToPA").remove();
        }
    }

    if (coreVariables.stepNumber == "08") {

        //CONTRACT TYPE TAB
        if (coreVariables.ActionWFVars.ACTION_TYPE != "basic") {
            $("#tab-4").remove();
            $("[href='#tab-4']").parent().remove();
        }

        //Kick Back Worksheet
        if (coreVariables.ActionWFVars.ACTION_TYPE == "admin") {
            $("#tab-2").remove();
            $("[href='#tab-2']").parent().remove();
        }

        //Package Status
        if (coreVariables.ActionWFVars.ACTION_TYPE != "basic" && coreVariables.ActionWFVars.ACTION_TYPE != "additional") {
            $("#tab-3").remove();
            $("[href='#tab-3']").parent().remove();
        }

        // Kick back to PO remove button
        if (coreVariables.ActionWFVars.ACTION_TYPE == "admin") {
            $("#retToPO, #retToPA").remove();
        }

    }

    if (coreVariables.stepNumber == "09") {

        // Kick back to PO remove button
        if (coreVariables.ActionWFVars.ACTION_TYPE == "admin") {
            $("#retToPO, #retToPA").remove();
        }
    }

    if (coreVariables.stepNumber == "13") {

        //COST/TECH EVALUATIONS & KickBack Report Checklist
        if (coreVariables.ActionWFVars.ACTION_TYPE != "basic" && coreVariables.ActionWFVars.ACTION_TYPE != "additional") {
            $("#tab-2, #tab-3").remove();
            $("[href='#tab-2'], [href='#tab-3']").parent().remove();

            $("#kickBackReport").remove();
        }
    }

     if (coreVariables.stepNumber == "16") { // jhm
       
        if (coreVariables.ActionWFVars.ACTION_TYPE != "basic" && coreVariables.ActionWFVars.ACTION_TYPE != "additional") {
             $("#retToPO").remove();
        }
    }

    if (coreVariables.stepNumber == "17") {

        //CONTRACT TYPE TAB
        if (coreVariables.ActionWFVars.ACTION_TYPE != "basic") {
            $("#tab-2").remove();
            $("[href='#tab-2']").parent().remove();
        }
		
		 if (coreVariables.ActionWFVars.ACTION_TYPE != "basic" && coreVariables.ActionWFVars.ACTION_TYPE != "additional") { // jhn
		     $("#retToPO").remove();
		 }
    }

    return { tabManagerAppComplete: true };
})
