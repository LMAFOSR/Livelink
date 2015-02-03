define(["jquery", "jqueryui", "migrate", "autoresize"
  , variablesURLAppURL
], function () {

    validator($);
    flyOut($);
    buttonDropDown($);
    ghostText($);
    expandContract($);

    function validator($) {

        var validatorMethods = {
            init: function (options) {

                //This is by definition a jquery object at this point, no need for $(this)

                if (!this.is("form")) {
                    throw "rsValidator() - 'this' is not a form"
                }

                var thisValidatorSettings =
                    $.extend(
                        {
                            "okToSetBadges": true
                            , "usingInvalid": false
                            , "additionalValidationFunc": undefined
                            , "completenessChangedFunc": undefined
                            , "completenessState": undefined
                        }
                        , options
                    );

                coreVariables[this.attr("id") + "validatorSettings"] = thisValidatorSettings
                coreVariables[this.attr("id")] = this.validate({
                    //errorLabelContainer: "#testValidationErrorContainer"
                    //,wrapper: "div"
                    onkeyup: false
                    , errorClass: "invalid"
                    , highlight: function (element, errorClass) {
                        var mySettings = coreVariables[$(element).closest("form").attr("id") + "validatorSettings"];

                        $(element).addClass("awFieldIncomplete").removeClass("awFieldComplete");
                        if (mySettings.usingInvalid) {
                            $(element).addClass("invalid");
                        }

                        if ($(element).attr('type') == 'radio') {
                            var radioGroup = $(element).parent().parent().find("[name='" + $(element).attr('name') + "']");

                            radioGroup.addClass("awFieldIncomplete").removeClass("awFieldComplete");
                            if (mySettings.usingInvalid) {
                                radioGroup.addClass("invalid");
                            }
                        }

                        // completeness checks can now trigger validation, so we need to prevent recursion
                        if (mySettings.okToSetBadges) {
                            $(element).closest("form").rsValidator('setCompleteBadges');
                        }
                    }
                    , unhighlight: function (element, errorClass, validClass) {

                        var mySettings = coreVariables[$(element).closest("form").attr("id") + "validatorSettings"];

                        $(element).removeClass("invalid awFieldIncomplete").addClass("awFieldComplete");

                        if ($(element).attr('type') == 'radio') {
                            $(element).parent().parent().find("[name='" + $(element).attr('name') + "']").removeClass("invalid awFieldIncomplete").addClass("awFieldComplete");
                        }

                        // completeness checks can now trigger validation, so we need to prevent recursion
                        if (mySettings.okToSetBadges) {
                            $(element).closest("form").rsValidator('setCompleteBadges');
                        }
                    }
                    , ignore: ""
                });

                if (false && !coreVariables.errorDialogDone) {
                    coreVariables.errorDialogDone = true;

                    $("#errorContainer").dialog({
                        autoOpen: false
                        , modal: true
                        , resizable: false
                        , closeText: "hide"
                        , minWidth: 600
                        , buttons: {
                            "Ok": function () {
                                $(this).dialog("close");
                            }
                        }
                        , close: function () {
                            $("#errorList").empty();
                        }
                        , open: function () {
                            $("#errorList li").each(function () {
                                if ($("#" + $(this).attr("class")).hasClass("valid")) {
                                    $("#errorList ." + $(this).attr("class")).remove();
                                }
                            });
                        }
                    });
                }

                return coreVariables[this.attr("id")];

            }
        , completed: function (options) {
            var validator = coreVariables[this.attr("id")];
            var validatorSettings = coreVariables[this.attr("id") + "validatorSettings"];
            var allCompleted = true;

            if (!this.is("form")) {
                throw "rsValidator( 'completed' ...) - 'this' is not a form."
            }

            validatorSettings.okToSetBadges = false;
            allCompleted = $(this).valid();
            if (validatorSettings.additionalValidationFunc != undefined) {
                allCompleted &= (validatorSettings.additionalValidationFunc)(validatorSettings);
            }
            validatorSettings.okToSetBadges = true;

            this.rsValidator("setCompleteBadges");

            return allCompleted;
        }
        , validated: function (options) {
            var validator = coreVariables[this.attr("id")];
            var validatorSettings = coreVariables[this.attr("id") + "validatorSettings"];
            var allCompleted = true;

            if (!this.is("form")) {
                throw "rsValidator( 'completed' ...) - 'this' is not a form."
            }

            validatorSettings.usingInvalid = true;
            validatorSettings.okToSetBadges = false;
            allCompleted = $(this).valid();
            if (validatorSettings.additionalValidationFunc != undefined) {
                allCompleted &= (validatorSettings.additionalValidationFunc)(validatorSettings);
            }
            validatorSettings.okToSetBadges = true;

            this.rsValidator("setCompleteBadges");

            return allCompleted;
        }
        , validating: function () {
            var validatorSettings = coreVariables[this.attr("id") + "validatorSettings"];

            validatorSettings.usingInvalid = true;

        }
        , setCompleteBadges: function () {
            if (!this.is("form")) {
                throw "rsValidator( 'completed' ...) - 'this' is not a form"
            }

            // set Expando badges
            this.rsValidator("setExpandoBadges");
            this.rsValidator("setTabBadges");

        }
        , setExpandoBadges: function () {
            if (!this.is("form")) {
                throw "rsValidator( 'completed' ...) - 'this' is not a form"
            }

            var usingInvalid = coreVariables[this.attr("id") + "validatorSettings"].usingInvalid;

            //This should be called after a call to completed() or after a call to justValidate()

            // set Expando badges
            this
            .find(".evalBlock")
            .each(
                function () {
                    var badgeHolder = $(this).find(".awCompleteBadgeHolderBlock");
                    var invalids = 0;


                    if ($(badgeHolder).length == 0) {
                        // didn't find the badgeHolder as a child of the block, see if we're in an accordion
                        if (($(this).parent().hasClass('ui-accordion')) && ($(this).prev().hasClass('ui-accordion-header'))) {
                            // in an accordion, the badge is a child of the header.
                            badgeHolder = $(this).prev().find(".awCompleteBadgeHolderBlock");
                        }
                    }

                    // validator automatically assigns the label for an invalid element the error class ("invalid"), so 
                    // if we're not doing invalid yet, need to ignore labels with class invalid
                    // except ".invalid:not([type='label'])" stopped working, so how about ".invalid:visible"

                    $(this).find(".invalid:visible").each(function () { if ($(this)[0].nodeName != "LABEL") { invalids++; } });

                    if (($(this).find(".awFieldIncomplete").length == 0) && (invalids == 0)) {

                        $(badgeHolder).removeClass("awIncompleteBadge").addClass("awCompleteBadge");
                    }
                    else {
                        $(badgeHolder).removeClass("awCompleteBadge");
                        if (coreVariables.showBangs) {
                            $(badgeHolder).addClass("awIncompleteBadge");
                        }
                    }
                }
            )
        }
        , setTabBadges: function (options) {
            if (!this.is("form")) {
                throw "rsValidator( 'completed' ...) - 'this' is not a form"
            }

            var validatorSettings = coreVariables[this.attr("id") + "validatorSettings"];
            var tab = "#" + this.closest("div [id|='tab']").attr("id");
            var allCompleted = (this.find(".awFieldIncomplete").length == 0);
            var allValid = false;
            var invalids = 0;

            $(this).find(".invalid:visible").each(function () { if ($(this)[0].nodeName != "LABEL") { invalids++; } });

            allValid = (invalids == 0);

            // set the tab
            if (allCompleted && allValid) {
                $("[href='" + tab + "']").next("div").removeClass("awIncompleteBadge awIncompleteBadgeHolderTab").addClass("awCompleteBadge awCompleteBadgeHolderTab");
                if (validatorSettings.completenessState != true) {
                    validatorSettings.completenessState = true;
                    if (validatorSettings.completenessChangedFunc != undefined) {
                        (validatorSettings.completenessChangedFunc)(true);
                    }
                }
            }
            else {
                $("[href='" + tab + "']").next("div").removeClass("awCompleteBadge awIncompleteBadge awIncompleteBadgeHolderTab").addClass("awCompleteBadgeHolderTab");
                if (coreVariables.showBangs) {
                    $("[href='" + tab + "']").next("div").addClass("awIncompleteBadge awIncompleteBadgeHolderTab");
                }
                if (validatorSettings.completenessState != false) {
                    validatorSettings.completenessState = false;
                    if (validatorSettings.completenessChangedFunc != undefined) {
                        (validatorSettings.completenessChangedFunc)(false);
                    }
                }
            }

            return allCompleted && allValid;
        }
        , partial: function (elementsList) {
            var validator = coreVariables[this.attr("id")];
            var allValid = true;


            if (!this.is("form")) {
                throw "rsValidator( 'partial' ...) - 'this' is not a form"
            }

            $(elementsList).each(function () {
                allValid &= validator.element($(this));
            });

            return allValid;
        }
        , missingNames: function () {

            var noNames = new Array();

            if (!this.is("form")) {
                throw "rsValidator( 'missingNames' ...) - 'this' is not a form"
            }

            {
                // re tabIndex on textAreas...autoResize clones all textAreas and sets their tabIndex to -1. Those clones have no names,so filter 'em out
                this.find("input:not([name]):not([type='button']):not([type='hidden']):not([type='submit']), select:not([name]), textarea:not([name]):not([tabIndex='-1'])").each(function () {
                    noNames.push($(this).attr("id"));
                });
            } (noNames)

            if (noNames.length > 0) {

                noNames.sort();

                if (coreVariables.devServer) {
                    alert("The following fields do not have names defined: " + noNames.toString());
                }
            }

            return noNames.toString();
        }
        };

        $.fn.rsValidator = function (method) {

            // Method calling logic
            if (validatorMethods[method]) {
                return validatorMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return validatorMethods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.afosrValidator');
            }

        };
    }

    function flyOut($) {

        var methods = {
            init: function (options) {

                //I have declare this in the global namespace - AJAX is giving me problems that I can open two flyouts at once
                var settings;

                flyOut = {
                    "closeFlyOut": null
                    , "openFlyOut": null
                    , acceptClickFlyOut: true
                };

                settings = $.extend({
                    "width": "420"
                        , "retrieveMessageParameters": ""
                        , "retrieveMessage": function () {

                            var dfd = new jQuery.Deferred();
                            return dfd.resolve().promise();
                        }
                }, options);

                //Open the flyOut
                flyOut.openFlyOut = function (source) {

                    var outerWidth = parseFloat($(source).outerWidth(true)) - 1;

                    $(source).removeClass("keepBorderTop").addClass("selectedActionSubTitle2");
                    $(source).parent().find(".flyOutMessageTopBorder").css({ "margin-left": outerWidth });
                    //$(source).parent().find(".flyOutMessage2").width(settings.width).show();  
                    $(source).parent().find(".flyOutMessage2").show();
                };

                //Close the flyOut
                flyOut.closeFlyOut = function (source) {
                    $(source).find(".flyOutMessage2").hide();
                    $(source).find(".openFlyOut2").removeClass("selectedActionSubTitle2").addClass("keepBorderTop");
                };

                //Initial setUp
                $(this).addClass("parentFlyOut");
                $(this).find(".flyOutMessage2").width(settings.width);

                // Open flyOut
                $(this).find(".openFlyOut2").on("click", function (eventObject) {

                    if (!flyOut.acceptClickFlyOut) { // Must include this - double click will duplicate contents
                        return;
                    }

                    //Stop everything - only one flyOut at a time - delay because LL server sucks
                    flyOut.acceptClickFlyOut = false;

                    //Already open so exit
                    if ($(eventObject.srcElement).hasClass("selectedActionSubTitle")) {
                        flyOut.acceptClickFlyOut = true;
                        return;
                    }

                    //If something else is open in the group then close it
                    $("[flyOutGroup='titles']").each(function () {

                        if ($(this).find(".flyOutMessage2").is(":not(:hidden)")) {
                            flyOut.closeFlyOut(this);
                        }
                    });

                    {
                        //settings.retrieveMessage(settings.retrieveMessageParameters, $(eventObject.srcElement).parent().parent()).done(function (results) {
                        settings.retrieveMessage(settings.retrieveMessageParameters, $(eventObject.target).parent().parent()).done(function (results) {
                            //$(eventObject.srcElement).parent().parent().find(".flyOutContent").append(results);
                            //$(eventObject.srcElement).parent().parent().find(".ui-icon-closethick").attr("title", "Close");

                            $(eventObject.target).parent().parent().find(".flyOutContent").append(results);
                            $(eventObject.target).parent().parent().find(".ui-icon-closethick").attr("title", "Close");

                        }).fail(function (errorMessage) { alert(errorMessage); }).always(function () {

                            //flyOut.openFlyOut(eventObject.srcElement);
                            flyOut.openFlyOut(eventObject.target);
                            flyOut.acceptClickFlyOut = true;
                        });
                    } (eventObject)
                });

                // click the X and make the flyOut close
                $(this).find(".close").on("click", function (eventObject) {

                    //var holder = $(eventObject.currentTarget).parents(".parentFlyOut");
                    var holder = $(eventObject.target).parents(".parentFlyOut");

                    if ($(holder).find(".flyOutMessage2").is(":not(:hidden)")) {
                        flyOut.closeFlyOut(holder);
                    }
                });
            }
        };  // End of methods JSON

        // Added from jQuery
        $.fn.flyOut = function (method) {

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on AFOSR Flyout');
            }
        };
    }

    function buttonDropDown($) {

        var methods = {
            init: function (options, callback) {

                //set up clicking on page closing dropdowns
                //            if (typeof ($(document).attr("buttonDropDownPageListener")) == "undefined") {
                //                $(document).on("click.buttonDropDown", function (event) {

                //                    if ($(event.target).closest(".dropDownButton").length == 0) {
                //                        //console.log("Click registered");
                //                    }

                //                });

                //                $(document).attr("buttonDropDownPageListener", "onClick");
                //            }

                var settings = $.extend({
                    menuList: options.menuList
                }, options);

                var menu = $("<ul>");

                for (var menuItem = 0; menuItem < settings.menuList.length; menuItem++) {

                    var item = $("<li>");

                    $(item).text(settings.menuList[menuItem].menuName);
                    $(item).attr("url", settings.menuList[menuItem].menuURL);
                    $(menu).append(item);
                }

                this.each(function () {

                    var button = this, menuHolder;

                    $(button).addClass("dropDownButton");

                    menuHolder = $("<div>");
                    $(menuHolder).addClass("buttonMenu");
                    $(menuHolder).append(menu);

                    $(menuHolder).css({ display: "none", position: "absolute" });
                    $(button).after(menuHolder);

                    $(menuHolder).on("click", function (event) {

                        if (event.target.localName == "li") {

                            var newWindowTarget = $(event.target).attr("url");
                            window.open(newWindowTarget, "", "resizable=1,scrollbars=1,menubar=1,toolbar=1,location=1", false);

                            //Close menu now
                            $(".buttonMenu").hide().css("left", 0).css("top", 0);
                            $(".dropDownButton").removeClass(settings.menuButtonActive);
                        }
                    });
                });

                this.on("click", function (menuHolder) {

                    var button = this;
                    var menuHolder = $(button).next(".buttonMenu");

                    if (menuHolder.is(":hidden")) {

                        //close all existing
                        $(".buttonMenu").hide().css("left", 0).css("top", 0);
                        $(".dropDownButton").removeClass(settings.menuButtonActive);

                        //Take into account right border
                        menuHolder.css("top", function () {
                            //return $(button).offset().top + $(button).height();
                            return $(button).position().top + $(button).height();
                        });

                        menuHolder.css("left", function () {
                            //return $(button).offset().left
                            return $(button).position().left + parseInt($(button).css("margin-left").replace("px", ""));
                        });

                        menuHolder.show();
                        $(button).addClass(settings.menuButtonActive);
                    }
                    else {
                        menuHolder.hide();
                        menuHolder.css("left", 0).css("top", 0); //Necessary to reset things
                        $(button).removeClass(settings.menuButtonActive);
                    }
                });
            }
        };

        // Added from jQuery
        $.fn.buttonDropDown = function (method) {

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on AFOSR Flyout');
            }
        };

    }

    function ghostText($) {

        var methods = {
            init: function (options) {

                var settings = $.extend({
                    ghostText: "Please enter response here."
                    , normalClass: "teNormalText"
                    , ghostClass: "teGhostText"
                    , autoExpand: true
                    , parent: undefined
                }, options);

                this.each(function () {

                    $(this)
                    .on(
                        'focusin'
                        , function () {
                            if ($(this).hasClass(settings.ghostClass)) {
                                $(this).removeClass(settings.ghostClass);
                                $(this).addClass(settings.normalClass);
                                $(this).text("");
                            }
                        }
                    )
                    .on(
                        'focusout'
                        , function () {
                            if (($(this).text() == "") && (!$(this).hasClass("invalid"))) {  // ghost text looks terrible inside invalid
                                $(this).removeClass(settings.normalClass).addClass(settings.ghostClass).text(settings.ghostText);
                            }
                            else {
                                $(this).addClass(settings.normalClass); // .removeClass( "invalid" );
                            }
                        }
                    )
                    .each(
                        function () {
                            if (($(this).text() == "") || ($(this).text() == settings.ghostText)) {
                                $(this).removeClass(settings.normalClass).addClass(settings.ghostClass).text(settings.ghostText);
                            }
                            else {
                                $(this).removeClass(settings.ghostClass).addClass(settings.normalClass);
                            }
                        }
                    );

                    if (settings.autoExpand) {
                        $(this).autoResize({ extraSpace: 0 });
                    }
                });

                //autoresize makes a non-visible clone for each textarea. find them and remove the required, else validation fails invisibly
                if (settings.parent != undefined) {
                    $(settings.parent).find("textArea[tabIndex=-1].required").removeClass("required");
                }

                return $(this);
            }
        };

        // Added from jQuery
        $.fn.ghostText = function (method) {

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on the ghostText plugin');
            }
        };
    }

    function expandContract($) {

        var methods = {
            init: function (options, callback) {

                var settings = $.extend({
                    active: false
                    , beforeOpen: function () { var dfd = jQuery.Deferred(); return dfd.resolve().promise(); }
                    , beforeClose: function () { var dfd = jQuery.Deferred(); return dfd.resolve().promise(); }
                    , onlyOneOpen: false
                    , toggleFunc: callback
                }, options);

                this.each(function () {

                    if ((settings.active) || (settings.active == "first")) {
                        $(this).find(".ui-icon").removeClass("ui-icon-plus").addClass("ui-icon-minus");
                        $(this).find(".expandContract.ecContent").slideDown();
                        if (settings.active == "first") {
                            settings.active = false;
                        }
                    }
                    else {
                        $(this).find(".ui-icon").removeClass("ui-icon-minus").addClass("ui-icon-plus");
                        $(this).find(".expandContract.ecContent").slideUp();
                    }

                    $(this).find(".expandContract.ecIcon, .expandContract.ecTitle").on("click", function () {

                        var eventInitiator = this;

                        var closed = new Array();
                        var opened = new Array();
                        var expando = $(eventInitiator).parent().parent();

                        if (expando.find(".expandContract.ecContent").is(":hidden")) {

                            settings.beforeOpen(eventInitiator).then(function () {

                                if (settings.onlyOneOpen) {
                                    //close any open expando
                                    expando.parent().find(".expandContract.ecContainer:not(#" + $(expando).attr("id") + ")").each(function () {
                                        $(eventInitiator).expandContract("close");
                                        closed.push($(eventInitiator));
                                    });
                                }

                                expando.expandContract("open");
                                opened.push(expando);

                            });
                        }
                        else {

                            settings.beforeClose(eventInitiator).then(function () {

                                expando.expandContract("close");
                                closed.push($(eventInitiator));
                            });
                        }

                        if (settings.toggleFunc != undefined) {
                            (toggleFunc)(closed, opened);
                        }
                    });

                });

            },
            open: function () {
                $(this).find(".ui-icon").removeClass("ui-icon-plus").addClass("ui-icon-minus");
                $(this).find(".expandContract.ecContent").show();
            },
            close: function () {
                $(this).find(".ui-icon").removeClass("ui-icon-minus").addClass("ui-icon-plus");
                $(this).find(".expandContract.ecContent").hide();
            }
        };

        // Added from jQuery
        $.fn.expandContract = function (method) {

            if (methods[method]) {
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on AFOSR Flyout');
            }
        };

    }

})
