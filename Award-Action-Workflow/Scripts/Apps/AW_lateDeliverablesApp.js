define(["angular"
    , "jsonURLConverter"
    , generalVariablesApp
    , variablesObjectInitiate
    , validationAppURL
], function () {

    window.lateDeliverablesVariables = (function (stepName) {

        var stepID;

        stepName = stepName.substr(0,2)

        if (stepName == "07") { stepID = 10 }
        if (stepName == "08") { stepID = 11 }
        if (stepName == "09") { stepID = 12 }

        return { stepID: stepID };

    })(awStepName);

    retrieveLateDeliverablesContent().done(function () {

        activateAngularLateDeliverables()

        coreVariables.tabActivatedCallBacks.add(checkLateDeliverables);

        coreVariables.stepValidator.add({
            tabName: "Late Deliverables"
            , validationMethod: validateLateDeliverables
        });

        setUpLateDeliverables();

    });

})

function activateAngularLateDeliverables() {

    window.lateDeliverablesModule = angular.module("lateDeliverablesModule", []);
    window.lateDeliverablesModule.config(['$httpProvider', function ($httpProvider) {
        jsonURLConverter($httpProvider);
    }]);

    function LateDeliverablesDataServer($http, $q) {
        var lateDeliverablesData = {
            func: "ll"
            , objAction: "RunReport"
            , objID: coreVariables.AW_LATE_DELIVERABLES
            , inputLabel1: produceClarityID()
        };

        return {
            retrieveData: function () {

                var deliverableDeferred = $q.defer();

                $http.post("/livelink/llisapi.dll", lateDeliverablesData).success(function (data) {

                    var standardLate = [], holdLate = [];

                    if (data.nothing == "noResults") {
                        deliverableDeferred.resolve({ standard: [], hold: [] });
                    }
                    else {

                        if (data.myRows.length > 0) {

                            for (var deliverable = 0; deliverable < data.myRows.length; deliverable++) {

                                if (holdFunding(data.myRows[deliverable])) {
                                    holdLate.push(data.myRows[deliverable]);
                                }
                                else {
                                    standardLate.push(data.myRows[deliverable]);
                                }
                            }

                            deliverableDeferred.resolve({ standard: standardLate, hold: holdLate });
                        }
                    }
                });

                return deliverableDeferred.promise;
            }
        };
    }
    LateDeliverablesDataServer.$inject = ['$http', '$q'];
    window.lateDeliverablesModule.factory('LateDeliverablesDataServer', LateDeliverablesDataServer);


    function deliverableController($scope, LateDeliverablesDataServer) {
        LateDeliverablesDataServer.retrieveData().then(function (data) {
            rebuildData(data);
        });

        $scope.refreshLateDeliverables = function () {
            LateDeliverablesDataServer.retrieveData().then(function (data) {
                rebuildData(data);
            });
        };

        function rebuildData(data) {

            $scope.standardLateDeliverables = data.standard;
            $scope.holdLateDeliverables = data.hold;

            if ($scope.standardLateDeliverables.length == 0) {
                $scope.standardMessageEmpty = true;
                $scope.showStandardList = false;
            }
            else {
                $scope.standardMessageEmpty = false;
                $scope.showStandardList = true;
            }

            if ($scope.holdLateDeliverables.length == 0) {
                $scope.holdMessageEmpty = true;
                $scope.showHoldList = false;
            }
            else {
                $scope.holdMessageEmpty = false;
                $scope.showHoldList = true;
            }
        }

        $scope.predicateHold = "DAYSLATE";
        $scope.reverseHold = false;

        $scope.predicateStandard = "DAYSLATE";
        $scope.reverseStandard = false;

    }
    deliverableController.$inject = ['$scope', 'LateDeliverablesDataServer'];
    window.lateDeliverablesController = lateDeliverablesModule.controller('deliverableController', deliverableController);

    //BOOTSTRAP ANGULAR HERE
    angular.bootstrap(angular.element("#lateDeliverables")[0], ['lateDeliverablesModule']);

}

function retrieveLateDeliverablesContent() {

    var contractTypeData, dfd = new jQuery.Deferred();

    contractTypeData = {
        "func": "ll"
        , "objAction": "RunReport"
        , "objID": coreVariables.AW_LATE_DELIVERABLES_V2_00
    };

    $.ajax({
        url: "/livelink/llisapi.dll"
    , data: contractTypeData
    , type: "POST"
    , success: function (data) {
        $("#lateDeliverablesHolder").append(data);
        dfd.resolve();
    }
    , error: function () {
        alert("Workflow map failed to load");
        dfd.reject();
    }
    });

    return dfd.promise();

    //return new jQuery.Deferred().resolve().promise();
}

function setUpLateDeliverables() {
    $("#lateDeliverables [type=button]").button();

    if (lateDeliverablesCompletion()) {
        checkLateDeliverablesValidated(lateDeliverablesVariables.stepID, coreVariables.wfID).then(function (data) {  // ADD STEPID

            if (data[0].hasOwnProperty("myRows")) {

                if (data[0].myRows.length > 0) {
                    $("#deliverablesCompleteHolder").addClass("awCompleteBadge");
                }
            }
        });
    }
}

function checkLateDeliverablesValidated(stepID, wfID) {

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

function checkLateDeliverables(ui) {

    if (lateDeliverablesCompletion()) {
        if (ui.newTab[0].textContent == "Late Deliverables") {

            if ($("#deliverablesCompleteHolder").hasClass("awCompleteBadge")) {
                return;
            }
            else {

                if ($("#deliverablesCompleteHolder").hasClass("awIncompleteBadge")) {
                    $("#deliverablesCompleteHolder").removeClass("awIncompleteBadge");
                }

                $("#deliverablesCompleteHolder").addClass("awCompleteBadge");
                saveLateDeliverablesValidation(lateDeliverablesVariables.stepID);
            }
        }
    }
}

function validateLateDeliverables() {

    if (lateDeliverablesValidateStep()) {
        if ($("#deliverablesCompleteHolder").hasClass("awCompleteBadge")) {
            return true;
        }
        else {
            $("#deliverablesCompleteHolder").addClass("awIncompleteBadge");
            return false;
        }
    }
    else {
        return true;
    }
}

function saveLateDeliverablesValidation(stepID) {

    var updateLateDeliverablesValidationData;

    updateLateDeliverablesValidationData = {
        func: "ll"
        , objAction: "RunReport"
        , objid: coreVariables.AW_I_RS_TAB_COMPLETION
        , inputLabel1: (coreVariables.wfID || "")
        , inputLabel2: stepID
        , inputLabel3: "late deliverables validation"
    };

    return $.ajax({
        url: "/livelink/llisapi.dll"
        , data: updateLateDeliverablesValidationData
        , type: "POST"
    });
}

//Adding layer of seperation
function produceClarityID(FK_CLARITY_PROJECT_ID) {
    return FK_CLARITY_PROJECT_ID || coreVariables.ActionWFVars.FK_CLARITY_PROJECT_ID;
}

function lateDeliverablesCompletion() {

    var validStep = false;

    if (typeof (coreVariables.stepName) == "undefined") {
        validStep = true;
    }

    if (coreVariables.stepNumber == "07") { validStep = true; }
    if (coreVariables.stepNumber == "08") { validStep = true; }
    if (coreVariables.stepNumber == "09") { validStep = true; }

    return validStep;
}

//Adding layer of separation
function lateDeliverablesValidateStep() {

    var validStep = false;

    if (typeof (coreVariables.stepName) == "undefined") {
        validStep = true;
    }

    if (coreVariables.stepNumber == "08") { validStep = true; }

    return validStep;
}

// Angular JS stuff ends here

function holdFunding(deliverable) {

    var deliverableHoldingRules, hold = false;

    var deliverableHoldingRules = {
        rules: [{ name: "Annual Patent", holdingDays: 30 },
            { name: "Annual Performance", holdingDays: 30 },
            { name: "Conference Summary", holdingDays: 90 },
            { name: "Equipment Report", holdingDays: 90 },
            { name: "Final Fiscal", holdingDays: 90 },
            { name: "Final Patent", holdingDays: 90 },
            { name: "Final Performance", holdingDays: 90 },
            { name: "Hardware Deliverable", holdingDays: 90 },
            { name: "Other", holdingDays: 90 }
        ]
    };

    for (var rule = 0; rule < deliverableHoldingRules.rules.length; rule++) {

        if (deliverableHoldingRules.rules[rule].name == deliverable.DELIVERABLE_TYPE) {

            if (deliverable.DAYSLATE > deliverableHoldingRules.rules[rule].holdingDays) {
                hold = true;
            }
        }
    }
    return hold;
}
