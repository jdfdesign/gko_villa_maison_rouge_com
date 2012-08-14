//= require gko/gko.galleria
//= require vertical/javascripts/jquery.easing.1.3.js
var animationSpeed = 400;
var animationEasing = "easeOutCubic";
var rightPadding = 220;
var loaded = false;
var leftScroll = 0;
var ie = false;
var ie6 = false;
var ie7 = false;
var ie8 = false;
var ie9 = false;
var content;
var subnavigationEnabled = false;
$(function() {
	content = $('#main-container');
	detectIe();
	setEvents();
	//setSubnavigation();
});
$(document).scroll(function() {
	leftScroll = $("html").position().left;
	$('body>header').css('left', leftScroll);
	$('.subnav:visible').css('left', leftScroll + 180);
	$('#closesubnav').css('left', leftScroll + 294)
});
function detectIe() {
	if($.browser.msie) {
		ie = true;
		$('html').addClass('ie');
		if($.browser.version.substr(0, 1) == "6") {
			ie6 = true;
			$('html').addClass('ie6')
		}
		if($.browser.version.substr(0, 1) == "7") {
			ie7 = true;
			$('html').addClass('ie7')
		}
		if($.browser.version.substr(0, 1) == "8") {
			ie8 = true;
			$('html').addClass('ie8')
		}
		if($.browser.version.substr(0, 1) == "9") {
			ie9 = true;
			$('html').addClass('ie9')
		}
	} else {
		$('html').addClass('no-ie')
	}
}


function closeSubnavigation(noAnimation) {
	if(!subnavigationEnabled) {
		return;
	}
	subnavs = $('.subnav');
	subnav = $('.subnav:visible');
	var css = {
		left : 35
	}
	$('.subnav a.active').removeClass('active');
	if(noAnimation) {
		subnavs.hide().css(css);
		$('#closesubnav').fadeTo(0, 0)
	} else {
		$('#closesubnav').fadeTo(animationSpeed / 8, 0);
		subnav.stop().animate(css, animationSpeed, animationEasing, function() {
			$(this).hide()
		})
	}
}

function closeContent(noAnimation, func) {

	
	content.find("embed").hide().remove();
	
	var css = {
		left : (0 - (684 + rightPadding))
	}
	if(noAnimation || content.is(":hidden")) {
		content.hide().css(css);
		$('#closecontent').css({
			opacity : 0
		});
		if( typeof func == "function") {
			$(func)
		}
	} else {
		$('#closecontent').animate({
			opacity : 0
		}, animationSpeed / 8);
		content.stop().animate(css, animationSpeed * 2, animationEasing, function() {
			$(this).hide();
			if( typeof func == "function") {
				$(func)
			}
		})
	}
}

function showContent(full, noDelay) {
	var left = (0 - (440));
	content.stop().show().css({
		left : left
	});
	setTimeout(function() {
		if(noDelay || ie8) {
			content.css({
				left : rightPadding
			})
			$('.snake').stop().fadeOut('fast').remove();
			$('.overall').remove();
			$('#closecontent').css({
				opacity : 1
			})
		} else {
			content.animate({
				left : rightPadding
			}, animationSpeed, animationEasing, function() {
				$('.snake').stop().fadeOut('fast').remove();
				$('.overall').remove();
				$('#closecontent').animate({
					opacity : 1
				}, 'fast');
				
				
				content.find("embed").each(function(){
	
					//console.log($(this))
	
					var original = $(this);
					var embed = original.clone();
					embed.attr("src",original.attr("original"));
					embed.removeAttr("original");
					embed.addClass("new");
					
					original.replaceWith(embed);
					
					//console.log(embed)
					
				});
				
				
			})
		}
	}, 1)
	setGallery();
}

function onLoadContent(result) {
	$('#main').html("");
	result.appendTo("#main");
	$(window).resize();
	$(window).trigger('resize');
	showContent(false);
}
function restoreSubnavigation() {
	if(!subnavigationEnabled) {
		return;
	}
	console.log('restoreSubnavigation')
	$('#primary-menu ul.nav>li').each(function() {
		var link = $(this),
			linkId = link.attr('id'),
			subnav = $('ul.nav-' + linkId);
		if(subnav.length > 0) {
			subnav.removeClass('subnav').removeClass('nav-' + linkId).appendTo(link);
		}
	});
	
	$('#closecontent').remove();
	$('#closesubnav').remove();
	
	subnavigationEnabled = false;
}
function setSubnavigation() {
	if(subnavigationEnabled) {
		return;
	}
	console.log('setSubnavigation')
	$('#primary-menu ul.nav>li').each(function() {
		var link = $(this),
			subnav = link.find('ul'),
			number = 'nav-' + link.attr('id');
		if(subnav.length > 0) {
			subnav.addClass('subnav').addClass(number).appendTo('body');
		}
	});

	$('#primary-menu ul a').attr('data-remote', true)
	.on('ajax:beforeSend', function(event, xhr, settings) {
		var link = $(this),
			parent = link.parent(),
			subnav = $('ul.nav-' + parent.attr('id'));
		if(!parent.hasClass('active')) {
			parent.addClass('active');
			parent.siblings().removeClass('active');
			closeContent();
			if(subnav.length > 0 && subnav.is(":hidden")) {
				rightPadding = subnav.width() + $('.navbar').width();
				closeSubnavigation();
				subnav.show().delay(animationSpeed).animate({
					left : 180
				}, animationSpeed, animationEasing, function() {
					$('#closesubnav').animate({
						opacity : 1
						}, 'fast')
					})
			} else {
				rightPadding = $('.navbar').width();
				closeSubnavigation();
			}
		}
	})
	.on('ajax:success',
    function(evt, xhr, status) {
		onLoadContent(eval(xhr));
    })

	
	$('ul.subnav a').attr('data-remote', true)
	.on('ajax:beforeSend', function(event, xhr, settings) {
		var link = $(this),
			parent = link.parent();
		if(!parent.hasClass('active')) {
			parent.addClass('active');
			parent.siblings().removeClass('active');
			closeContent(false);
			rightPadding = parent.parent().width() + $('.navbar').width();
		}
	})
	.on('ajax:success',
    function(evt, xhr, status) {
		onLoadContent(eval(xhr));
    })
	if(!loaded) {
		loaded = true;
		closeSubnavigation(true);
		closeContent(true);
	}
	$('body').append('<div id="closecontent"></div>');
	$('body').append('<div id="closesubnav"></div>');
	subnavigationEnabled = true;
}
function setEvents() {
	$('body').on('click', '#closecontent', function() {
		closeContent();
		$('.subnav li.active').removeClass('active')
	});
	$('body').on('click', '#closesubnav', function() {
		closeContent();
		closeSubnavigation();
		$('#primary-menu li.active').removeClass('active')
	})
}
function setGallery() {

	 Galleria.addTheme({
	        name:'classic',
	        author:'Galleria',
	        css:'galleria.classic.css',
	        defaults:{
	            transition:'slide',
	            thumbCrop:'height',

	            // set this to false if you want to show the caption all the time:
	            _toggleInfo:false
	        },
	        init:function (options) {

	            // add some elements
	            this.addElement('info-link', 'info-close');
	            this.append({
	                'info':['info-link', 'info-close']
	            });

	            // cache some stuff
	            var info = this.$('info-link,info-close,info-text'),
	                touch = Galleria.TOUCH,
	                click = touch ? 'touchstart' : 'click';

	            // show loader & counter with opacity
	            this.$('loader,counter').show().css('opacity', 0.4);

	            // some stuff for non-touch browsers
	            if (!touch) {
	                this.addIdleState(this.get('image-nav-left'), { left:-50 });
	                this.addIdleState(this.get('image-nav-right'), { right:-50 });
	                this.addIdleState(this.get('counter'), { opacity:0 });
	            }

	            // toggle info
	            if (options._toggleInfo === true) {
	                info.bind(click, function () {
	                    info.toggle();
	                });
	            } else {
	                info.show();
	                this.$('info-link, info-close').hide();
	            }

	            // bind some stuff
	            this.bind('thumbnail', function (e) {

	                if (!touch) {
	                    // fade thumbnails
	                    $(e.thumbTarget).css('opacity', 0.6).parent().hover(function () {
	                        $(this).not('.active').children().stop().fadeTo(100, 1);
	                    }, function () {
	                        $(this).not('.active').children().stop().fadeTo(400, 0.6);
	                    });

	                    if (e.index === this.getIndex()) {
	                        $(e.thumbTarget).css('opacity', 1);
	                    }
	                } else {
	                    $(e.thumbTarget).css('opacity', this.getIndex() ? 1 : 0.6);
	                }
	            });

	            this.bind('loadstart', function (e) {
	                if (!e.cached) {
	                    this.$('loader').show().fadeTo(200, 0.4);
	                }

	                this.$('info').toggle(this.hasInfo());

	                $(e.thumbTarget).css('opacity', 1).parent().siblings().children().css('opacity', 0.6);
	            });

	            this.bind('loadfinish', function (e) {
	                this.$('loader').fadeOut(200);
	            });
	        }
	    });
	
		if($(".galleria").length > 0) {
			$(".galleria").galleria({
				autoplay: true,
				responsive: true,
				height: .85,
				imageCrop: 'landscape',
				transition: 'slide',
				thumbMargin: 10,
				showCounter: false,
				showInfo: false,
				thumbnails: true,
				debug: false
			})

			Galleria.on('ready', function(e) {

			});
		}
}
$(window).load(function() {
	var theWindow = $(window), $bg = $("#bg"), aspectRatio = $bg.width() / $bg.height();
	function resizeBg() {
		if((theWindow.width() / theWindow.height()) < aspectRatio) {
			$bg.removeClass().addClass('bgheight');
			var newLeft = 0 - ($bg.width() - theWindow.width()) / 2;
			$bg.css({
				left : newLeft,
				top : 0
			})
		} else {
			$bg.removeClass().addClass('bgwidth');
			var newTop = 0 - ($bg.height() - theWindow.height()) / 2;
			$bg.css({
				left : 0,
				top : newTop
			})
		}

		$('#bg').animate({
			opacity : 1
		}, animationSpeed / 3, animationEasing, function() {
			$('body,html').css('background-color', '#212121');
			$('body>header').animate({
				left : 0
			}, animationSpeed / 1.5, animationEasing, function() {
				if(!loaded) {
					loaded = true;
					var url = window.location.href;
					var path = (url.split('#')[1]);
					if(path != undefined) {
						path = path.replace('&', '&amp;');
						$('#nav a[href=#' + path.split('/')[0] + ']').click();
						setTimeout(function() {
							$('.subnav a[href$=' + path.split('/')[1] + ']').click()
						}, animationSpeed * 2)
					}
				}
			})
		})
	}
	theWindow.resize(function() {
		resizeBg()
		console.log(theWindow.width())
		if(theWindow.width() < 980) {
			restoreSubnavigation()
		} else if(!subnavigationEnabled) {
			setSubnavigation()
		}
	}).trigger("resize")
});