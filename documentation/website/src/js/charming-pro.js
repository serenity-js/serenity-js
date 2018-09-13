/*
 * Charming-Pro - A front end framework built on top of Bootstrap 4 and jQuery 3.
 * Version v1.1.1
 * Copyright 2016 - 2018 Alexander Rechsteiner
 * http://hackerthemes.com
 */
function webNavIsMobile() {
    return $('#web-nav-mobile-indicator').is(':visible');
}

$( document ).ready(function() {
  $(".dash-nav-toggler").click(function() {
    $("#dash-nav").toggleClass("show");
  });

  $(".dash-nav-dropdown .dash-nav-dropdown-toggle").click(function () {
    $(this).parent().toggleClass("show");
    $(this).parent().siblings().removeClass("show");
    $(this).parent().find(".dash-nav-dropdown").removeClass("show");
  });

  $(".web-nav-dropdown .web-nav-dropdown-toggle").click(function () {
    // if (webNavIsMobile()){
      $(this).parent().toggleClass("show");
      $(this).parent().siblings().removeClass("show");
      $(this).parent().find(".web-nav-dropdown").removeClass("show");
    // }
  });

  $(".web-nav-toggler").click(function(){
    $(this).toggleClass("open");
    $("#web-nav").toggleClass("show");
  });

  $(".web-nav-dropdown").hover(function () {
    if(webNavIsMobile() === false) {
      $(this).addClass("show");
    }
  }, function () { // on hover out
    if(webNavIsMobile() === false) {
      $(this).removeClass("show");
    }
  });

  //position
  $(".web-nav-list > .web-nav-dropdown").hover(function(){ // on hover in
    if(!webNavIsMobile()) {
      var thisRef = $(this);
      var thisPop = $(this).children(".web-nav-dropdown-menu");

      var popperPlacement = 'bottom-start';

      // switch popper alignemnt for last item
      if ($(this).is(":last-child")) {
        popperPlacement = 'bottom-end';
      }


      $(this).data('itemPopper', new Popper(
        thisRef,
        thisPop,
        {
          placement: popperPlacement
        }
      ));

    }

  }, function(){ // on hover out
    if (typeof $(this).data('itemPopper') !== 'undefined') {
      $(this).data('itemPopper').destroy();
    }
  });

  $(".web-nav-dropdown-menu > .web-nav-dropdown").hover(function () { //on hover in
    if(webNavIsMobile() === false) {
      var thisRef = $(this);
      var thisPop = $(this).children(".web-nav-dropdown-menu");

      if(navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        if (typeof $(this).data('itemPopper') == 'undefined') {
          $(thisPop).css("opacity", 0);
        }
      }

      $(this).data('itemPopper', new Popper(
        thisRef,
        thisPop,
        {
          placement: 'right-start'
        }
      ));

      setTimeout(function() {
        $(thisPop).css("opacity", 1);
      }, 10);

    }
  }, function () { // on hover out
    if (typeof $(this).data('itemPopper') !== 'undefined') {
      // $(this).data('itemPopper').destroy();
    }
  });
});


