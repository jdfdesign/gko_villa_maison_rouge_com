var animationSpeed = 400;
var animationEasing = "easeOutCubic";
var rightPadding = 30;
var loaded = false;
var sbWidth = 155;
var leftScroll = 0;
var ie = false;
var ie6 = false;
var ie7 = false;
var ie8 = false;
var ie9 = false;
$(function() {
	detectIe();
	setSubnavigation();
	generalLayout()
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

function generalLayout() {
	$('td').each(function() {
		var cell = $(this);
		var bgc = cell.css('background-color');
		var nr = "c" + parseInt(bgc.replace('rgba', '').replace('rgb', '').replace('(', '').replace(')', '').replace(/\,/g, '').replace(/\./g, '').replace(/ /g, ''));
		if(bgc != "undefined" && bgc != "transparent" && bgc != "" && bgc != "white" && bgc != "#ffffff" && bgc != "rgb(0,0,0)" && bgc != "rgb(0, 0, 0)" && bgc != "rgba(0,0,0,0)" && bgc != "rgba(0, 0, 0, 0)" && bgc != "rgb(255,255,255)" && bgc != "rgb(255, 255, 255)" && bgc != "rgba(255,255,255,0)" && bgc != "rgba(255, 255, 255, 0)") {
			cell.addClass('colored');
			cell.addClass(nr);
			cell.addClass('onorm')
		}
		cell.hover(function() {
			if(cell.hasClass('colored')) {
				$('td.colored:not(.' + nr + ')').removeClass('onorm').addClass('olow');
				$('td.' + nr).removeClass('onorm').addClass('ohigh')
			}
		}, function() {
			if(cell.hasClass('colored')) {
				$('td.colored').removeClass('ohigh').removeClass('olow').addClass('onorm')
			}
		})
	});
	$('td:has(strong)').each(function() {
		var cell = $(this);
		var number = (cell.html().replace('<strong>', '').replace('</strong>', '').replace('<STRONG>', '').replace('</STRONG>', '').replace(/ /g, '').replace(/[\f\n\r\t\v]*/g, "") + 1);
		if(number > 1) {
			cell.append("<img src='" + site_url + "images/site/corner.gif' class='corner'/>")
		}
	});
	$('h1').click(function() {
		closeSubnavigation();
		closeContent()
	})
}

function closeSubnavigation(noAnimation) {
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
	content = $('#main');
	
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
	var content = $('#main');
	var left = (0 - (684 + rightPadding));
	content.stop().show().css({
		left : left
	});
	setTimeout(function() {
		var left = 335;
		if(full) {
			left -= sbWidth
		}
		if(noDelay || ie8) {
			content.css({
				left : left
			})
			$('.snake').stop().fadeOut('fast').remove();
			$('.overall').remove();
			$('#closecontent').css({
				opacity : 1
			})
		} else {
			content.animate({
				left : left
			}, animationSpeed, animationEasing, function() {
				$('.snake').stop().fadeOut('fast').remove();
				$('.overall').remove();
				$('#closecontent').animate({
					opacity : 1
				}, 'fast');
				
				
				$("#main embed").each(function(){
	
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
	generalLayout()
}

function loadContent(href, full) {
	$('body').append('<div class="snake"></div>');
	$('body').append('<div class="overall" style="z-index: 99999;position:fixed;top:0;right:0;bottom:0;left:0;"></div>');
	if(full) {
		$('.snake').css('left', 180)
	}
	$('.snake').hide().fadeIn('fast');
	if(full) {
		var thaPage = 'full/' + href.split('#')[1]
	} else {
		var thaPage = 'not-full/' + href.split('/')[1]
	}
	var fullUrl = site_url + lang + "/index.php/site/content/" + thaPage;
	_gaq.push(['_trackPageview', '/' + lang + '/#' + thaPage]);
	$('#languages a').each(function() {
		$(this).attr('href', site_url + $(this).html() + '/' + href)
	});
	$.ajax({
		url : fullUrl,
		success : function(data) {
		
			theData = $(data);
			theData.find("embed").each(function(){
				var embed = $(this);
				embed.attr("original",embed.attr("src"));
				embed.removeAttr("src");
			});
			
			//console.log(theData);
		
			$('#main').html("");
			theData.appendTo("#main");
			
			if(full) {
				$('#main').addClass('full');
				var newHTML = '<small>' + $('#nav a.active:first small').html() + '</small>';
				$('#main h2').html(newHTML)
			} else {
				$('#main').removeClass('full');
				$('#main h2').html($('#nav a.active:first').html() + "&nbsp;/&nbsp;")
			}
			$(window).resize();
			$(window).trigger('resize');
			showContent(full)
		}
	})
}

function setSubnavigation() {
	$('#nav>li').each(function() {
		var link = $(this);
		var subnav = link.find('ul');
		var number = 'nav' + parseInt(link.find('small:first').text());
		link.addClass(number);
		subnav.addClass('subnav').addClass(number);
		subnav.appendTo('body')
	});
	closeSubnavigation(true);
	closeContent(true);
	if(staticPage) {
		$('#main').addClass('full');
		showContent(true, true);
		setTimeout(function() {
			window.location = site_url + lang
		}, 4000)
	}
	$('#nav>li a').each(function() {
		$(this).click(function() {
			var link = $(this);
			if(!link.hasClass('active')) {
				link.addClass('active');
				link.parent().siblings().find('a').removeClass('active');
				var subnav = $('ul.' + link.parent().attr('class').replace(' ', '').replace('slvzr-first-child', ''));
				if(subnav.find('a').length == 0) {
					subnav.remove();
					closeContent(false, function() {
						loadContent(link.attr('href'), true)
					});
					closeSubnavigation()
				} else {
					closeContent();
					closeSubnavigation();
					subnav.show().delay(animationSpeed).animate({
						left : 180
					}, animationSpeed, animationEasing, function() {
						$('#closesubnav').animate({
							opacity : 1
						}, 'fast')
					})
				}
			}
		})
	});
	$('.subnav a').each(function() {
		$(this).click(function() {
			var link = $(this);
			if(!link.hasClass('active')) {
				link.addClass('active');
				link.parent().siblings().find('a').removeClass('active');
				closeContent(false, function() {
					loadContent(link.attr('href'))
				})
			}
		})
	});
	$('body').append('<div id="closecontent"></div>');
	$('#closecontent').click(function() {
		closeContent();
		$('.subnav a.active').removeClass('active')
	});
	$('body').append('<div id="closesubnav"></div>');
	$('#closesubnav').click(function() {
		closeContent();
		closeSubnavigation();
		$('#nav a.active').removeClass('active')
	})
}

function setGallery() {
	if($('#galleria li').length == 0) {
		$('#galleria').remove()
	} else {
		if(ie8) {
			Galleria.addTheme({
				name : 'gents',
				author : 'Diederik Van Hoorebeke, http://gents.be',
				defaults : {
					initialTransition : 'slide',
					width : 684,
					height : 607,
					transition : 'slide',
					showInfo : false,
					imagePan : false
				},
				init : function(options) {
				}
			});
			$('#galleria').galleria()
		} else {
			Galleria.addTheme({
				name : 'gents',
				author : 'Diederik Van Hoorebeke, http://gents.be',
				defaults : {
					initialTransition : 'fade',
					width : 684,
					height : 607,
					transition : 'slide',
					showInfo : false,
					imagePan : false
				},
				init : function(options) {
				}
			});
			$('#galleria li').hide();
			$('#galleria').galleria();
		}
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
		if(theWindow.width() > 1079) {
			rightPadding = (theWindow.width() - 1049)
		} else {
			rightPadding = 30
		}
		if($('#main').hasClass('full')) {
			rightPadding += sbWidth
		}
		$("#main").css('padding-right', rightPadding);
		if(staticPage) {
			$('#bg,#main').css({
				opacity : 1
			});
			$('body,html').css('background-color', '#212121');
			$('body>header').css({
				left : 0
			})
		}
		$('#main').addClass('fullopacity');
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
	}).trigger("resize")
});