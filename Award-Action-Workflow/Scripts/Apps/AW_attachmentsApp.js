define(["jquery"], function () {

    window.attachmentsVariables = {};

    attachmentsVariables.attachURL =  coreVariables.baseURL + "?func=work.frametaskright&workid=" + coreVariables.workID + "&subworkid=" + coreVariables.subworkid + "&taskid=" + coreVariables.taskid + "&paneindex=3&nextURL=a&objAction=Browse&sort=name";

    $(".openAttachmentsWindow").on('click.attachmentWindow', function () {
        window.open(attachmentsVariables.attachURL, '', 'width=1000,height=700,scrollbars=yes,toolbar=yes,menubar=yes', false);
    });

})
