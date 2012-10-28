//= require gko/gko.galleria
//= require jquery.throttledresize.js
//= require jquery.mousewheel.3.0.6
//= require jquery.jscrollpane
var $window,$body,contentApi, isOverBreakPoint, mainHeight = 390//must match css;

var Site = {
	
	init: function() {
		
		$body = $("body"),
		$window = $(window);
		
		$("#secondary-menu a").attr('data-remote', true)
		.on('ajax:beforeSend', function(event, xhr, settings) {

		})
		.on('ajax:complete',
        function(evt, xhr, status) {
			Site.onPageLoad(eval(xhr.responseText).html())
        })
		
		$("#left_sidebar").attr('data-height', $("#left_sidebar").height());
		Carousel.addTheme();
		Carousel.init();
		$window.bind( "throttledresize", Site.onResize );
		Site.onResize();	
	},
	onResize: function() {
		isOverBreakPoint = (Site.getScreenWidth() > 979 && $(".galleria").length > 0);
		console.log(Site.getScreenWidth())
		if(isOverBreakPoint) {
			$("#main-column").addClass('fixed');
			$("#page-text").addClass('fixed');
			if(contentApi != undefined) {
				contentApi.data('jsp').reinitialise();
			} else {
				contentApi = $("#page-text.fixed").jScrollPane({animateScroll: true, animateDuration: 700}).data.jsp;
			}
		} else {
			$("#main-column").removeClass('fixed');
			$("#page-text").removeClass('fixed');
			if(contentApi != undefined) {
				contentApi.data('jsp').destroy();
			}
		}
		$("#left-sidebar").css('height', Math.max($("#main-column").height(), mainHeight));
	},
	onPageLoad: function(content) {
		$("#main-column").html(content);
		Site.onResize;
		Carousel.init();
	},
	getScreenHeight: function() {
		return $window.height();
	},
	getScreenWidth: function() {
		return $window.width();
	}
}

var Carousel = {
	init: function() {
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
				thumbnails: true
			})

			Galleria.on('ready', function(e) {
			    Site.onResize();
			});
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
	} 
}

$(document).ready(function() {
	Site.init();
});