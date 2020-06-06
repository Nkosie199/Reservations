//Functionality to make divs draggable
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev, tabId) {
    checkDroppableDivs();
    ev.dataTransfer.setData("text", ev.target.id);
    currentTabId(tabId);
}

let currentTab = null;
function currentTabId(tabId){
    //sets and stores the current tab id to be styled after being dropped
    currentTab = tabId;
}

function openEvent(evt, functionName) {
    //eg. openEvent(event, 'user_uploads')
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        if (isDescendant(document.getElementById('contentwrapper'), tabcontent[i])) { //if tabcontent[i] is a child of tab
            if (isDescendant(document.getElementById('contentwrapper'), document.getElementById(functionName))) { //and if tabcontent[i] is in the same div as the current function
                //console.log(tabcontent[i], ' is a descendant of contentwrapper and a relative of ', functionName, ' it should close');
                tabcontent[i].style.display = "none";
            }
        }
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(functionName).style.display = "block";
    evt.currentTarget.className += " active";

    var tabId = map2Tab(functionName);
    refreshStyling(tabId, functionName);
}

function refreshStyling(tabId, functionName){
    //if current tab is not a child of its mapped parent, make it a child
    if (!isDescendant(document.getElementById(tabId).parentNode, document.getElementById(functionName))) {
        //console.log(functionName, 'is NOT a child of ', document.getElementById(tabId).parentNode);
        //if parent node is tab, move to contentwrapper instead of tab
        if (isDescendant(document.getElementById('tab'), document.getElementById(tabId))) {
            //console.log('moving ',document.getElementById(functionName), ' to contentwrapper');
            document.getElementById('contentwrapper').appendChild(document.getElementById(functionName)); //move div to contentwrapper
            document.getElementById(tabId).style.width = "auto";//remove the css specifying button width
            resizeContentWrapper(); //resize
        } else {
            //console.log('moving ',document.getElementById(functionName), ' to ', document.getElementById(tabId).parentNode);
            document.getElementById(tabId).parentNode.appendChild(document.getElementById(functionName)); //move div to its association
            document.getElementById(tabId).style.width = "100%"; //set the button width to 100%
            resizeContentWrapper(); //resize
        }
    }
}

function checkDroppableDivs(){
    var a = document.getElementById('leftsidebar');
    var b = document.getElementById('leftsidebar2');
    var c = document.getElementById('lowerleftsidebar');
    var d = document.getElementById('tab');
    var e = document.getElementById('rightsidebar');
    var f = document.getElementById('rightsidebar2');
    //if div has a child element already, mark it as unavailable. Otherwise it is available
    if (a.firstElementChild) { a.style.border = "dashed red"; a.setAttribute("ondragover", null); }
    else { a.style.border = "dashed lawngreen"; a.setAttribute("ondragover", "allowDrop(event)"); }

    if (b.firstElementChild) { b.style.border = "dashed red"; b.setAttribute("ondragover", null); }
    else { b.style.border = "dashed lawngreen"; b.setAttribute("ondragover", "allowDrop(event)"); }

    if (c.firstElementChild) { c.style.border = "dashed red"; c.setAttribute("ondragover", null); }
    else { c.style.border = "dashed lawngreen"; c.setAttribute("ondragover", "allowDrop(event)"); }

    if (d.firstElementChild) { d.style.border = "dashed lawngreen"; }
    else { d.style.border = "dashed lawngreen"; d.setAttribute("ondragover", "allowDrop(event)"); }

    if (e.firstElementChild) { e.style.border = "dashed red"; e.setAttribute("ondragover", null); }
    else { e.style.border = "dashed lawngreen"; e.setAttribute("ondragover", "allowDrop(event)"); }

    if (f.firstElementChild) { f.style.border = "dashed red"; f.setAttribute("ondragover", null); }
    else { f.style.border = "dashed lawngreen"; f.setAttribute("ondragover", "allowDrop(event)"); }
}

function unstyleDroppableDivs() {
    var a = document.getElementById('leftsidebar');
    a.style.border = "none";
    var b = document.getElementById('leftsidebar2');
    b.style.border = "none";
    var c = document.getElementById('lowerleftsidebar');
    c.style.border = "none";
    var d = document.getElementById('tab');
    d.style.border = "none";
    var e = document.getElementById('rightsidebar');
    e.style.border = "none";
    var f = document.getElementById('rightsidebar2');
    f.style.border = "none";
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    //console.log(document.getElementById(data), data);
    try {
        ev.target.appendChild(document.getElementById(data));
    }
    catch(err) {
        //document.getElementById("demo").innerHTML = err.message;
    }
    unstyleDroppableDivs();
    var functionName = map2Div(data);
    refreshStyling(data, functionName);
}

function resizeContentWrapper(){
    //if window width < 1126px (start of large tablet styles) every side div must go inside tab
    if (window.innerWidth < 1126){
        //console.log('put side divs in tab div!!!');
        var i, tablinks;
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            var currentTab = tablinks[i];
            if (!isDescendant(document.getElementById('rightsidebar2'), currentTab)){
                //if tablinks[i] is not a child of tab & tablinks[i] is not status_tab
                if (!isDescendant(document.getElementById('tab'), currentTab)) {
                    //console.log(currentTab,' is not a descendant of tab');
                    var mappedDiv = map2Div(currentTab.id);
                    //console.log(currentTab,' mapped to ',mappedDiv);
                    document.getElementById('tab').appendChild(currentTab); //make tablinks[i] a child of tab
                    currentTab.style.width = "auto"; //remove the css specifying button width
                    //console.log('moved ',currentTab,' to tab div');
                    document.getElementById('contentwrapper').appendChild(document.getElementById(mappedDiv)); //make mappedDiv a child of contentwrapper
                    //console.log('moved ',mappedDiv,' to contentwrapper div');
                }
            }
        }
    }
    //function to adjust width of contentwrapper according to width of leftsidebar2 and rightsidebar
    var leftsidebarwidth = document.getElementById("leftsidebar2").offsetWidth;
    var rightsidebarwidth = document.getElementById("rightsidebar").offsetWidth;
    var offset = 45; //additional width to cater for including padding, margins etc
    var newwidth = window.innerWidth - (leftsidebarwidth+rightsidebarwidth+offset);
    $("#contentwrapper").css("width", newwidth);
    //console.log('contentwrapper width adjusted to', newwidth);
    resizeLeftSidebars();
    resizeRightSidebars();
}

function resizeLeftSidebars(){
    //function to adjust height of leftsidebar2 according to the height of lowerleftsidebar and viceversa
    var lowerleftsidebarheight = document.getElementById("lowerleftsidebar").offsetHeight;
    var offset = 85; //additional width to cater for including padding, margins etc
    var newheight = window.innerHeight - (lowerleftsidebarheight+offset);
    $("#leftsidebar2").css("max-height", newheight);
    //console.log('leftsidebar2 max-height adjusted to', newheight);
}

function resizeRightSidebars(){
    //function to adjust height of rightsidebar according to the height of rightsidebar2 and viceversa
    var rightsidebar2height = document.getElementById("rightsidebar2").offsetHeight;
    var offset = 85; //additional width to cater for including padding, margins etc
    var newheight = window.innerHeight - (rightsidebar2height+offset);
    $("#rightsidebar").css("max-height", newheight);
    //console.log('rightsidebar max-height adjusted to', newheight);
}

function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node !== null) {
        if (node === parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

function map2Tab(div){
    /*current mappings of child div to its proposed parent div...*/
    if (div === 'user_uploads'){
        return 'user_uploads_tab';
    }else if (div === 'live_streaming'){
        return 'live_streaming_tab';
    }else if (div === 'chatwrapper'){
        return 'live_chat_tab';
    }else if (div === 'statusbar'){
        return 'status_tab';
    }
}

function map2Div(tab){
    /*current mappings of child div to its proposed parent div...*/
    if (tab === 'user_uploads_tab'){
        return 'user_uploads';
    }else if (tab === 'live_streaming_tab'){
        return 'live_streaming';
    }else if (tab === 'live_chat_tab'){
        return 'chatwrapper';
    }else if (tab === 'status_tab'){
        return 'statusbar';
    }
}

//This method is used to toggle between different elements in the menuitems div
function toggle_visibility(id) {
    var e = document.getElementById(id);
    var i = '#menuitems > div'; // all divs inside menuitems

    $(i).each(function(){
        this.style.display = 'none';
    });
    e.style.display = 'block';
    $('div').css('opacity', 0.3);
    var menuitems = $('#menuitems');
    menuitems.css('opacity', 1);
    menuitems.find('*').css('opacity', 1);
}

function close_element(id) {
    var e = document.getElementById(id);
    e.style.display = 'none';
    $('body').find('*').css('opacity', 1);
}

//Functionality to toggle the visibility of the various popups.
function popup_visibility(id) {
    var e = document.getElementById(id);
    if (e.style.display === 'block') {
        e.style.display = 'none';
        document.getElementById('body').style.opacity = 1;
    }
    else {
        e.style.display = 'block';
        document.getElementById('body').style.opacity = 0.3;
    }
}

function autoscroll(direction) {
    // where positive direction = down and negative direction = up
    if (direction === 'up') {
        window.scrollBy({
            top: -screen.height, // could be negative value
            behavior: 'smooth'
        });
    }
    else if (direction === 'down') {
        window.scrollBy({
            top: screen.height,
            behavior: 'smooth'
        });
    }
}

function clearText(id) { //Clears the text in the textboxs.
    document.getElementById(id).value = "";
}

function indentUserMsgs() {
    var myuserid = "<?php echo $_SESSION['userid'] ?>";
    var theiruserids = document.getElementsByClassName('sessionid'); //get the message line
    for (var i = 0; i < theiruserids.length; i++) {
        var currentid = theiruserids[i];
        var theiruserid = currentid.innerHTML;
        if (myuserid == theiruserid) {
            var parentEl = currentid.parentElement;
            var parentElClass = parentEl.className;
            parentElClass = 'usermsgln';
        }
    }
}

// Originally from home.php...
$(window).on( "load", function() {
    //console.log("window loaded");
    var newheight = window.innerHeight - 90;
    //$("#chatwrapper").css("height", newheight);
    var newheight2 = newheight - 240;
    $("#chatbox").css("height", newheight2);
    resizeContentWrapper();
});

$(window).resize(function() {
    var newheight = window.innerHeight - 90;
    //$("#chatwrapper").css("height", newheight);
    var newheight2 = newheight - 240; //from -160
    $("#chatbox").css("height", newheight2);
    resizeContentWrapper();
});

// jQuery Document, these are functions pending user interaction
$(function() {
    var request; // Variable to hold request
    $("#uploadcontentform").submit(function(event){
        // Bind to the submit event of our form
        event.preventDefault(); // Prevent default posting of form - put here to work in case of errors
        if (request) {
            request.abort(); // Abort any pending request
        }
        var $form = new FormData(this); // setup some local variables
        // Fire off the request to /form.php
        request = $.ajax({
            url: "./php/uploadfile.php",
            type: "POST",
            data: $form,
            cache: false,
            contentType: false,
            processData: false
        });
        // Callback handler that will be called on success
        request.done(function (response, textStatus, jqXHR){
            // Log a message to the console
            alert(response);
            close_element('uploadcontent');
        });
        // Callback handler that will be called on failure
        request.fail(function (jqXHR, textStatus, errorThrown){
            // Log the error to the console
            console.error("The following error occurred: "+ textStatus, errorThrown);
        });
    });
    //Toggle between menu bar to aid responsiveness
    $(".menu-icon").click(function() {
        $("#leftsidebar").toggleClass('active');
    });
    //If user submits the form
    $("#submitmsg").click(function() { //if user clicks on send
        var clientmsg = $("#usermsg").val(); //get the value of the users message
        $('#chatbox').animate({scrollTop: $('#chatbox').get(0).scrollHeight}, 2000); //scroll to the bottom
        //Now post to wordcloud...
        addToWordCloud(clientmsg);
        //recorder.js calls post.php
        return false;
    });
    //On hover events
    $('.menu-icon')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Toggle menu'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('#search-icon')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Search'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.logout')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Logout'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.home')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Home (Refresh)'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.uploadcontent')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Upload content'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.addchatroom')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Add chatroom'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.popularchatrooms')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Popular chatrooms'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.trendingtopics')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Trending topics'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.scrollup')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Scroll up'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.scrolldown')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Scroll down'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('#submitmsg')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Submit message'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('#sendvoicemsg')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Record voice message'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.underrated')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Underrated'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.rated')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Adequately rated'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.overrated')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Overrated'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.general')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Suitable for all ages'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.PG-13')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Not suitable for children < 13'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
    $('.adults')
        .mouseover(function() { $('#search-input').attr('placeholder', 'Restricted to adults only'); })
        .mouseout(function() { $('#search-input').attr('placeholder', ''); });
});

//Load the file containing the chat log
function loadLog() {
    $.ajax({
        url: "./log.html",
        cache: false,
        success: function(html){
            $("#chatbox").html(html); //Insert chat log into the #chatbox div
            //indentUserMsgs(); //change .usermsgln to .otherusermsgln if the text within <b></b> equals userid
        }
    });
    var oldscrollHeight = $("#chatbox").attr("scrollHeight") - 20; //Scroll height after the request
} //setInterval (loadLog, 10000);	//call the loadLog funtion every 1500 ms

function addToWordCloud(msg) {
    bits = msg.split(/[\s,]+/);
    var arrayLength = bits.length;
    for (var i = 0; i < arrayLength; i++) {
        //console.log(bits[i]);
        //$.post("./post2wordcloud.php", {text: bits[i]}); //post the text to post2wordcloud.php --> database
    }
}