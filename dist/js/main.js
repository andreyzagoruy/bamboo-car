(function ($) {

var $window = $(window),
		winWidth = $window.width(),
		winHeight = $window.height(),
		animationPrefix = (function () {
			var t,
			el = document.createElement("fakeelement");
			var transitions = {
				"WebkitTransition": "webkitAnimationEnd",
				"OTransition": "oAnimationEnd",
				"MozTransition": "animationend",
				"transition": "animationend"
			};
			for (t in transitions) {

				if (el.style[t] !== undefined) {

					return transitions[t];

				}

			}
		})(),
		transitionPrefix = (function () {
			var t,
			el = document.createElement("fakeelement");
			var transitions = {
				"WebkitTransition": "webkitTransitionEnd",
				"transition": "transitionend",
				"OTransition": "oTransitionEnd",
				"MozTransition": "transitionend"
			};
			for (t in transitions) {

				if (el.style[t] !== undefined) {

					return transitions[t];

				}

			}
		})(),
		requestAnimFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function( callback ){
			window.setTimeout( callback, 17 );
		},
		bodyOverflow = (function () {
			var $body = $('body'),
				scrollPosition,
				$mainNavigation = $('.main-navigation');
			return {
				fixBody: function () {
					this.getScrollWidth();
					scrollPosition = $body.scrollTop();
					$body.addClass('fixed')
								.css({
									'top': -1 * scrollPosition
								});

				},
				getScrollWidth: function () {
					if (typeof this.scrollWidth === 'number') return this.scrollWidth;
					var inner = document.createElement('p');
				  inner.style.width = "100%";
				  inner.style.height = "200px";

				  var outer = document.createElement('div');
				  outer.style.position = "absolute";
				  outer.style.top = "0px";
				  outer.style.left = "0px";
				  outer.style.visibility = "hidden";
				  outer.style.width = "200px";
				  outer.style.height = "150px";
				  outer.style.overflow = "hidden";
				  outer.appendChild (inner);

				  document.body.appendChild (outer);
				  var w1 = inner.offsetWidth;
				  outer.style.overflow = 'scroll';
				  var w2 = inner.offsetWidth;
				  if (w1 == w2) w2 = outer.clientWidth;

				  document.body.removeChild (outer);
					this.scrollWidth = (w1 - w2);
					this.generateClassStyles(this.scrollWidth);
				  return this.scrollWidth;
				},
				generateClassStyles: function (scrollWidth) {
					var styles,
						$style = $('<style>');
					styles = 'body.fixed, body.fixed .header-top {' +
						'right:' + scrollWidth + 'px;' +
					'}'
					$style.html(styles);
					$style.appendTo($body);
				},
				unfixBody: function () {

					$body
						.removeClass('fixed')
						.scrollTop(scrollPosition);

				},
				resize: function () {

					this.unfixBody();

				}.bind(this)
			};
		})(),
		goUp = (function () {

			var $el = $('#to-top'),
				state = false,
				speed = 900,
				paused = false,
				plg = {
					up: function () {

						paused = true;
						state = true;

						$("html, body").stop().animate({scrollTop:0}, speed, 'swing', function () {

							paused = false;

						}).one('touchstart mousewheel DOMMouseScroll wheel', function () {

							$(this).stop(false, false).off('touchstart mousewheel DOMMouseScroll wheel');
							paused = false;

						});

						plg.hide();

					},
					show: function () {

						if (!state && !paused) {

							$el.addClass('opened');

							state = true;

						}

					},
					hide: function () {

						if (state) {

							$el.removeClass('opened');

							state = false;

						}

					},
					$el: $el
				};

			$el.on('click', function () {

				plg.up();

			});

			return plg;

		})();


$('.sections-pagination').find('.pagination-link').on('click', function (e) {
	e.preventDefault();
	$(this)
		.addClass('pagination-active')
		.siblings()
		.removeClass('pagination-active');
	var $target = $( $( this ).attr('href') );
	if ($target.length) {
		$("html, body").stop().animate({scrollTop:$target.offset().top}, 600);
	}
});

		// modals
		var modals = (function () {

			var plg;
			$('[data-modal]').on('click', function (e) {
				e.preventDefault();


				var $self = $(this),
					target = $self.attr('data-modal'),
					$target = $(target);

				if ( $self.hasClass('active') ) return;

				if ($target.length) {
					modals.openModal($target);
				} else {
					console.warn('Ошибка в элементе:');
					console.log(this);
					console.warn('Не найдены элементы с селектором ' + target);
				}

			});

			$('[data-close]').on('click', function (e) {

				e.preventDefault();

				var $self = $(this),
					target = $self.attr('data-close'),
					$target;

				if (target) {

					$target = $(target);

					if ($target.length) {

						modals.closeModal( $target );

					}

				} else {

					modals.closeModal( $self.closest('.opened') );

				}

			});

			$('.modal-holder').on('click', function (e) {

				if (e.target === this) {

					modals.closeModal( $(this) );

				}

			});

			$window.on('keyup', function (e) {

				// esc pressed
				if (e.keyCode == '27') {

					modals.closeModal();

				}

			});
			plg = {
				opened: [],
				openModal: function ( $modal ) {

					if (!$modal.data('modal-ununique') && this.opened.length > 0) {
						modals.closeModal( this.opened[this.opened.length - 1], true );
					}
					this.opened.push( $modal );
					// $modal.addClass('opened').one( transitionPrefix, bodyOverflow.fixBody );

					$modal.off( transitionPrefix ).addClass('opened');
					bodyOverflow.fixBody();

					this.$cross = $('<div>').addClass('cross-top-fixed animated ' + $modal.attr('data-cross') ).one('click', function () {

						modals.closeModal();

					}).one(animationPrefix, function () {

						$(this).removeClass( 'animated' );

					}).appendTo('body');

				},
				closeModal: function ($modal, alt) {

					if ( this.opened.length === 0 && !$modal ) {

						return;

					} else if ( this.opened.length > 0 && !$modal ) {

						for ( var y = 0; y < this.opened.length; y++ ) {

							this.closeModal( this.opened[y] );

						}

						return;

					} else if ( $modal && !($modal instanceof jQuery) ) {

						$modal = $( $modal );

					} else if ( $modal === undefined ) {

						throw 'something went wrong';

					}

					try {

						$modal.removeClass('opened');

						// stop YouTube modal video
						if( $modal.attr('id') === 'main-video-modal' && getleaf.video) getleaf.video.pauseVideo();

					} catch (e) {

						console.error(e);

						this.closeModal();

						return;

					}

					this.opened.pop();

					if (!alt) {

						$modal.one( transitionPrefix, bodyOverflow.unfixBody );

						try {

							this.$cross.addClass('fadeOut').one(animationPrefix, function () {

								$(this).remove();

							});

						} catch (e) {

							console.error(e);

						}

					} else {

						this.$cross.remove();

					}

				}

			};

			return plg;
		})();



$.fn.doubleSlider = function (opt) {

	// options
	if (!opt) {
		opt = {};
	}
	opt = $.extend({
		'transitionSpeed': 1000,
		'transitionClass': 'transiting',
		'animationInClass': 'fadeIn',
		'animationOutClass': 'fadeOut',
		'paginationHolderClass': 'pagination',
		'nextSlideClass': 'next-slide',
		'prevSlideClass': 'prev-slide',
		'pageSlideClass': 'slide-page',
		'nextSlideHtml': '>',
		'prevSlideHtml': '<',
		'pageSlideHtml': false,
		'slideClass': 'slide',
		'activeClass': 'active',
		'hiddenClass': 'hidden',
		'startSlide': 0,
		'pagination': true
	}, opt);

	var plugin = function () {
		var $slider, slides, currentSlide, DOM, _, public, slidesLength, transitionTime, locked;
		$slider = $(this);
		DOM = {};
		slides = [];

		_ = {
			defineSlides: function () {
				var $el, exist = true;
				slidesLength = 0;
				while (exist) {
					$el = $slider.find('[data-id="' + slidesLength + '"]');
					if ($el.length) {
						$el.addClass(opt.slideClass);
						_.pushSlide($el, slidesLength);
						slidesLength++;
					} else {
						exist = false;
					}
				}
			},
			pushSlide: function ($el, id) {
				var slide = {
					$el: $el,
					id: id
				};
				slides.push(slide);
			},
			bindEvents: function () {
				$slider
					.off()
					.on('click', function (event) {
						var $target = $(event.target), storage;
						if ( $target.hasClass(opt.pageSlideClass) ) {
							storage = parseInt($target.attr('data-page'));
							public.toSlide(storage);
						} else if ( $target.hasClass(opt.prevSlideClass) ) {
							public.prevSlide();
						} else if ( $target.hasClass(opt.nextSlideClass) ) {
							public.nextSlide();
						}
					});
			},
			createPagination: function () {
				var $pagesList;

				if (DOM.$pagination) {
					DOM.$pagination.empty();
					DOM.$pagination.detach();
				} else {
					DOM.$pagination = $('<div>').addClass( opt.paginationHolderClass );
				}

				$('<span>')
					.addClass( opt.prevSlideClass )
					.html(opt.prevSlideHtml)
					.appendTo( DOM.$pagination );

				$pagesList = $('<ul>')
					.addClass( opt.lablesHolderClass )
					.appendTo( DOM.$pagination );

				for (var i = 0; i < slidesLength; i++) {
					$('<li>')
						.addClass(opt.pageSlideClass)
						.html( opt.pageSlideHtml ? opt.pageSlideHtml : i + 1 )
						.attr( 'data-page', i )
						.appendTo( $pagesList );
				}

				$('<span>')
					.addClass( opt.nextSlideClass )
					.html(opt.nextSlideHtml)
					.appendTo( DOM.$pagination );
				DOM.$pagination.appendTo($slider);
			},
			getTransitionDuration: function($el) {
				// check the main transition duration property
				if($el.css('transition-duration')) {
					return Math.round(parseFloat($el.css('transition-duration')) * 1000);
				}
				else {
					// check the vendor transition duration properties
					if($el.css('-webkit-transtion-duration')) return Math.round(parseFloat($el.css('-webkit-transtion-duration')) * 1000);
					if($el.css('-moz-transtion-duration')) return Math.round(parseFloat($el.css('-moz-transtion-duration')) * 1000);
					if($el.css('-ms-transtion-duration')) return Math.round(parseFloat($el.css('-ms-transtion-duration')) * 1000);
					if($el.css('-o-transtion-duration')) return Math.round(parseFloat($el.css('-ms-transtion-duration')) * 1000);
				}
				// if we're here, then no transition duration was found, return 0
				return 0;
			},
			getTransitionDelay: function($el) {
				// check the main transition duration property
				if($el.css('transition-delay')) {
					return Math.round(parseFloat($el.css('transition-delay')) * 1000);
				}
				else {
					// check the vendor transition duration properties
					if($el.css('-webkit-transtion-delay')) return Math.round(parseFloat($el.css('-webkit-transtion-delay')) * 1000);
					if($el.css('-moz-transtion-delay')) return Math.round(parseFloat($el.css('-moz-transtion-delay')) * 1000);
					if($el.css('-ms-transtion-delay')) return Math.round(parseFloat($el.css('-ms-transtion-delay')) * 1000);
					if($el.css('-o-transtion-delay')) return Math.round(parseFloat($el.css('-ms-transtion-delay')) * 1000);
				}
				// if we're here, then no transition duration was found, return 0
				return 0;
			},
			getAnimationDuration: function($el) {
				// check the main animation duration property
				if($el.css('animation-duration')) {
					return Math.round(parseFloat($el.css('animation-duration')) * 1000);
				}
				else {
					// check the vendor animation duration properties
					if($el.css('-webkit-animation-duration')) return Math.round(parseFloat($el.css('-webkit-animation-duration')) * 1000);
					if($el.css('-moz-animation-duration')) return Math.round(parseFloat($el.css('-moz-animation-duration')) * 1000);
					if($el.css('-ms-animation-duration')) return Math.round(parseFloat($el.css('-ms-animation-duration')) * 1000);
					if($el.css('-o-animation-duration')) return Math.round(parseFloat($el.css('-ms-animation-duration')) * 1000);
				}
				// if we're here, then no animation duration was found, return 0
				return 0;
			},
			getAnimationDelay: function($el) {
				// check the main animation duration property
				if($el.css('animation-delay')) {
					return Math.round(parseFloat($el.css('animation-delay')) * 1000);
				}
				else {
					// check the vendor animation duration properties
					if($el.css('-webkit-animation-delay')) return Math.round(parseFloat($el.css('-webkit-animation-delay')) * 1000);
					if($el.css('-moz-animation-delay')) return Math.round(parseFloat($el.css('-moz-animation-delay')) * 1000);
					if($el.css('-ms-animation-delay')) return Math.round(parseFloat($el.css('-ms-animation-delay')) * 1000);
					if($el.css('-o-animation-delay')) return Math.round(parseFloat($el.css('-ms-animation-delay')) * 1000);
				}
				// if we're here, then no animation duration was found, return 0
				return 0;
			},
			getAnimationTime: function ($el) {
				var duration, delay;
				duration = _.getAnimationDuration($el);
				delay = _.getAnimationDelay($el);
				// console.log(duration);
				// console.log(delay);
				return delay + duration;
			},
			filterSlides: function (id) {
				var i = 0,
					found = false,
					result = [];
				for (i; i < slides.length; i++) {
					if (slides[i].id === id) {
						result.push(slides[i].$el);
						found = true;
					} else {
						if (found) break;
					}
				}
				return result;
			},
			activeSlides: function (id) {
				if (typeof id !== "number") return;
				var i,
					elements = _.filterSlides(id);
				for (i = 0; i < elements.length; i++) {
					elements[i]
						.addClass(opt.activeClass)
						.addClass(opt.animationInClass);
					setTimeout((function ($el) {
						return function () {
							$el
								.removeClass(opt.animationInClass);
							locked = false;
						}
					})(elements[i]), _.getAnimationTime(elements[i]) );
				}
			},
			deactiveSlides: function (id) {
				if (typeof id !== "number") return;
				var i,
					elements = _.filterSlides(id);
				for (i = 0; i < elements.length; i++) {
					elements[i].addClass(opt.animationOutClass);
					setTimeout((function ($el) {
						return function () {
							$el
								.removeClass(opt.activeClass)
								.removeClass(opt.animationOutClass);
						}
					})(elements[i]), _.getAnimationTime(elements[i]) );
				}
			}
		};
		public = {
			init: function () {
				_.defineSlides();
				if (opt.pagination) _.createPagination();
				_.bindEvents();
				public.toSlide(opt.startSlide);
			},
			toSlide: function (id) {
				if (locked) return
				if (typeof id !== "number" || id < 0 || slidesLength < id ) return;
				if (id === currentSlide) return;
				locked = true;
				$slider.addClass(opt.transitionClass);
				_.deactiveSlides(currentSlide);
				_.activeSlides(id);
				currentSlide = id;
				// console.log(id);
			},
			prevSlide: function () {
				var id = currentSlide - 1;
				if (id < 0) {
					return;
				}
				public.toSlide(id);
			},
			nextSlide: function () {
				var id = currentSlide + 1;
				if (id >= slidesLength) {
					return;
				}
				public.toSlide(id);
			}
		};
		public.init();
		return public;
	};

	if (this.length > 1) {
		return this.map(plugin);
	} else if (this.length === 1) {
		return plugin.call(this[0]);
	}
};


	$.fn.landingNavigation = function (opt) {
		var winHeightHalf;
		this.each(function (i) {

			var DOM = {},
				state = {},
				array = [],
				$self = $(this),
				$toTop = $('.to-top-link');

			// options
			if (!opt) {
				opt = {
					'linkClass': 'pagination-link'
				};
			}
			opt = $.extend({
			}, opt);

			// methods
			var plg = {
				init: function () {
					DOM.$lnks = $self.find('.' + opt.linkClass);
					plg.resize();
				},
				scroll: function (top) {
					for (var y = 0; y < array.length; y++) {
						if (top < array[y].val && y) {
							plg.avtive(array[y - 1].$elem);
							return;
						} else if (y == array.length - 1) {
							plg.avtive(array[y].$elem);
						}
					}
				},
				avtive: function ($el) {
					if ($el !== state.$active) {
						DOM.$lnks.removeClass('pagination-active');
						$el.addClass('pagination-active');
						state.$active = $el;
					}
					if ($el !== array[0].$elem) {
						$toTop.addClass('arrow-visible');
					}
					if ($el == array[0].$elem) {
						$toTop.removeClass('arrow-visible');
					}
				},
				resize: function () {
					winHeightHalf = $(window).height() / 2;
					DOM.$lnks.each(function (i, elem) {
							array[i] = {};
							array[i].$elem = $(elem);
							array[i].trg = $(elem).attr('href') || $(elem).data('target');
							array[i].val = $(array[i].trg).offset().top;
						});
				}
			};

			plg.init();
			$(window).on('scroll', function () {
				setTimeout(function () {
					plg.scroll($(this).scrollTop() + winHeightHalf);
				}, 500);
			}).on('resize load', function () {
				plg.resize();
			});

			return plg;
		});
	};


})(jQuery);
$('.double-slider').doubleSlider();
$('.sections-pagination').landingNavigation();
