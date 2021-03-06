//= require gko/gko.galleria
//= require jquery.easing.1.3.js
//= require jquery.ba-hashchange.js
var animationSpeed = 400;
var animationEasing = "easeOutCubic";
var navBarWidth = 220;
var rightPadding = navBarWidth;
var mainPadding = 0;
var loaded = false;
var $container;
var $mainRow;
var isUnderBreakPoint = false;
var wasUnderBreakPoint = false;
var subnavigationEnabled = false;
var ie8 = false;
var $window,$body, $navbar, aspectRatio, isMobile;
var hasCarousel = false;
var Site = {
	
	init: function() {
		$body = $("body"),
		$window = $(window);
		$navbar = $('.navbar:first');
		$container = $('#main-container');
		$mainRow = $('#main');
		navBarWidth = $navbar.width();
		rightPadding = navBarWidth;
		mainPadding = parseInt($mainRow .css('padding-left')) * 2;
		if($.browser.version.substr(0, 1) == "8") {
			ie8 = true;
		}
		Carousel.addTheme();
		Carousel.init();
		$window.on("throttledresize", Site.onResize );
		$window.on("hashchange", Site.onHashChange );
		Navigation.init();
		Site.onResize();
		if(isUnderBreakPoint) {
			Navigation.attachEvents();
		}
		loaded = true;	
	},
	onResize: function() {
		wasUnderBreakPoint = isUnderBreakPoint;
		isUnderBreakPoint = ($window.width() < 980);

		if(isUnderBreakPoint) {

			Navigation.restore();
			$container.css({
				maxWidth: "none",
				width: "auto"
			});
		} else {
			
			if(wasUnderBreakPoint || !loaded) {
				
				navBarWidth = $navbar.width();
				Navigation.create();
				var activeLink = $(".subnav li.active:first");
				if(activeLink.length > 0) {
					rightPadding = activeLink.parent().outerWidth(true) + navBarWidth;
					Navigation.show(activeLink.parent());
				}
				$container.css({left : rightPadding});
			}
			
			var h = $window.height();
			var maxCarouselHeight = $('.galleria').length ? h - $('.galleria').position().top : h;
		//	console.log("h " + h + ' top ' + $('.galleria').position().top);
			$container.css({
				maxWidth: maxCarouselHeight * 1.15,
				width: maxCarouselHeight * 1.15
			});
		}

		$body.animate({
			opacity : 1
		}, animationSpeed / 3, animationEasing, function() {
			$navbar.animate({
				left : 0
			}, animationSpeed / 1.5, animationEasing, function() {
				if(!loaded) {
					
					var url = window.location.href;
					var path = (url.split('#')[1]);
					
					if(path != undefined) {
						path = path.replace('&', '&amp;');
					
						$('a[href="/' + path + '"]').click();
						setTimeout(function() {
							$('.subnav a[href$=' + path.split('/')[1] + ']').click()
						}, animationSpeed * 2)
					}
				}
			})
		})
		
	},
	onHashChange: function() {
		var hash = location.hash;
 		// Set the page title based on the hash.
		// document.title = 'The hash is ' + ( hash.replace( /^#/, '' ) || 'blank' ) + '.';
	}
}

var Page = {

	onLoad: function(result) {
		$mainRow.html("");
		result.appendTo($mainRow);
		Site.onResize();
		Carousel.init();
		$('input.ghost').hide();
		Page.show(false);
	},
	
	close: function(noAnimation, func) {
		
		$container.find("embed").hide().remove();
		
		if(hasCarousel) {
			$('.galleria').data('galleria').destroy();
		}
		

		var css = {
			left : -$window.width()
		}
		if(noAnimation || $container.is(":hidden")) {
			$container.hide().css(css);
			if( typeof func == "function") {
				$(func)
			}
		} else {
			$container.stop().animate(css, animationSpeed * 2, animationEasing, function() {
				$(this).hide();
				if( typeof func == "function") {
					$(func)
				}
			})
		}
	},
	
	show: function(full, noDelay) {
		$container.stop().show().css({
			left : rightPadding
		});
		setTimeout(function() {
			if(noDelay || ie8) {
				$container.css({
					left : rightPadding
				})
			} else {
				$container.animate({
					left : rightPadding
				}, animationSpeed, animationEasing, function() {
					$container.find("embed").each(function(){
						var original = $(this);
						var embed = original.clone();
						embed.attr("src",original.attr("original"));
						embed.removeAttr("original");
						embed.addClass("new");
						original.replaceWith(embed);
					});


				})
			}
		}, 1)
	}
}

var Navigation = {
	
	init: function() {

		$('ul.nav-menu>li>a').attr('data-remote', true)
		.on('ajax:beforeSend', function(event, xhr, settings) {
			var link = $(this),
				li = link.parent(),
				subnav = $('ul.nav-menu-' + li.attr('id'));
			if(!li.hasClass('active')) {
				$('ul.nav-menu li').removeClass('active');
				li.addClass('active');
				Page.close();
				
				if(subnav.length > 0) {
					Navigation.show(subnav);
				} else {
					rightPadding = navBarWidth;
					Navigation.close();
				}
			}

			// Google Analytics support
			if (typeof _gaq !== "undefined" && _gaq !== null) {
		      _gaq.push(['_trackPageview', settings.url]);
		    }
			var hash = settings.url;
			window.location.replace("#" + settings.url.substring(1));
			
			if($('.navbar .nav-collapse').hasClass('in')) {
				$('a.btn-navbar').trigger('click');
			}
			
		})
		.on('ajax:success', function(evt, xhr, status) {
			Page.onLoad(eval(xhr));
	    })

		
		$('ul.nav-menu ul.dropdown-menu a').attr('data-remote', true)
		.on('ajax:beforeSend', function(event, xhr, settings) {
			var link = $(this),
				parent = link.parent();
			if(!parent.hasClass('active')) {
				parent.addClass('active');
				parent.siblings().removeClass('active');
				Page.close(false);
				rightPadding = parent.parent().outerWidth(true) + navBarWidth;
			}
			
			
			if($('.navbar .nav-collapse').hasClass('in')) {
				$('a.btn-navbar').trigger('click');
			}
		})
		.on('ajax:success',
	    function(evt, xhr, status) {
			Page.onLoad(eval(xhr));
	    })

	},
	
	close: function(noAnimation) {
		if(!subnavigationEnabled) {
			return;
		}
		subnavs = $('.subnav');
		subnav = $('.subnav:visible');
		var css = {
			left : 0
		}

		$('.subnav li.active').removeClass('active');
		if(noAnimation) {
			subnavs.hide().css(css);
		} else {
			subnav.stop().animate(css, animationSpeed, animationEasing, function() {
				$(this).hide();
			})
		}
		
	},
	
	attachEvents: function() {

		
	},
	
	create: function() {
		if(subnavigationEnabled) { return; }
		
		$('ul.nav-menu ul.dropdown-menu').each(function() {
			var subnav = $(this),
				link = subnav.parent();
			if(subnav.length > 0) {
				subnav.addClass('subnav').addClass('nav-menu-' + link.attr('id')).appendTo('body');
				subnav.css({'display': 'none', 'left' : '0'});
			}
		});	
		
		rightPadding = navBarWidth;
		subnavigationEnabled = true;
	},
	
	restore: function() {
		if(!subnavigationEnabled) {
			return;
		}
		$('ul.nav-menu>li').each(function() {
			var link = $(this),
				linkId = link.attr('id'),
				subnav = $('ul.nav-menu-' + linkId);
			if(subnav.length > 0) {
				subnav.removeClass('subnav').removeClass('nav-menu-' + linkId).appendTo(link);
				subnav.css({'display': 'block', 'left' : 'auto'});
			}
		});
		rightPadding = navBarWidth;
		subnavigationEnabled = false;
	},
	
	show: function(target) {
		if(target.is(":hidden")) {
			rightPadding = target.outerWidth(true) + $navbar.outerWidth(true);
			target.show().delay(animationSpeed).animate({
				left : navBarWidth
			}, animationSpeed, animationEasing)
		}
	}
}


var Carousel = {
	init: function() {
		hasCarousel = $(".galleria").length > 0;
		
		if(hasCarousel) {
			$(".galleria").galleria({
				debug: false,
				autoplay: true,
				responsive: true,
				height: .85,
				imageCrop: 'landscape',
				transition: 'slide',
				thumbMargin: 10,
				showCounter: false,
				showInfo: false,
				thumbnails: $(".galleria").children().length > 1
			})
		}
	},
	addTheme: function() {

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
		            this.addElement('bar','fullscreen', 'info-link', 'info-close');
		            this.append({
		                'info':['info-link', 'info-close'],
						container: ["bar"],
						'bar':['fullscreen']
		            });

		            // cache some stuff
		            var info = this.$('info-link,info-close,info-text'),
						fullscreen = this.$("fullscreen"),
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
	} 
}


$(document).ready(function() {
	Site.init();
});